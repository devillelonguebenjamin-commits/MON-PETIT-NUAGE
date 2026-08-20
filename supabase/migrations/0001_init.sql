-- =============================================================================
-- Mon Petit Nuage — schéma initial
-- Conforme à la note de cadrage §1. Montants en centimes, jamais en flottant.
-- Aucune écriture client directe : le front lit le catalogue via la clé anon,
-- toute écriture passe par les Route Handlers Next.js en service_role.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ----------------------------------------------------------------------------
-- Types énumérés
-- ----------------------------------------------------------------------------
create type product_kind as enum ('coffret', 'urne', 'option');
create type weight_class as enum ('lt_5', '5_15', '15_30', 'gt_30');
create type material as enum ('bois_clair', 'bois_fonce', 'ceramique_blanche');
create type cart_status as enum ('active', 'converted', 'abandoned');
create type order_status as enum (
  'pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded'
);
create type cremation_timing as enum ('post_cremation', 'pre_cremation');
create type partner_kind as enum ('crematorium', 'veterinaire');
create type discount_kind as enum ('percent', 'fixed');

-- ----------------------------------------------------------------------------
-- Comptes
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null,
  full_name text,
  phone text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on column profiles.deleted_at is
  'Droit à l''oubli : anonymisation logique. Les commandes sont conservées pour l''obligation comptable.';

-- ----------------------------------------------------------------------------
-- Catalogue
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind product_kind not null,
  short_description text,
  long_description text,
  base_price_cents integer not null check (base_price_cents >= 0),
  vat_rate numeric(4, 3) not null default 0.200 check (vat_rate >= 0 and vat_rate < 1),
  images jsonb not null default '[]'::jsonb,
  lead_time_days_min smallint not null default 5,
  lead_time_days_max smallint not null default 10,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_time_coherent check (lead_time_days_min <= lead_time_days_max)
);

create index products_active_slug_idx on products (slug) where is_active;
create index products_kind_idx on products (kind, sort_order) where is_active;

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  sku text not null unique,
  weight_class weight_class,
  material material,
  price_delta_cents integer not null default 0,
  images jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index product_variants_product_idx on product_variants (product_id) where is_active;
create unique index product_variants_combo_idx
  on product_variants (product_id, weight_class, material)
  where weight_class is not null and material is not null;

-- Composition des coffrets préconfigurés.
create table bundle_items (
  bundle_id uuid not null references products (id) on delete cascade,
  item_product_id uuid not null references products (id) on delete restrict,
  quantity smallint not null default 1 check (quantity > 0),
  is_swappable boolean not null default false,
  sort_order smallint not null default 0,
  primary key (bundle_id, item_product_id)
);

-- ----------------------------------------------------------------------------
-- Partenaires et remises
-- ----------------------------------------------------------------------------
create table partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind partner_kind not null default 'crematorium',
  region text,
  city text,
  postal_code text,
  address text,
  phone text,
  email citext,
  logo_url text,
  description text,
  promo_code text,
  commission_rate numeric(4, 3) default 0.000,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index partners_active_slug_idx on partners (slug) where is_active;

comment on column partners.commission_rate is
  'Reporting interne uniquement. Ne doit jamais être exposé côté client : voir la policy RLS.';

create table promo_codes (
  code text primary key,
  kind discount_kind not null,
  value integer not null check (value > 0),
  partner_id uuid references partners (id) on delete set null,
  min_order_cents integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint percent_range check (kind <> 'percent' or value between 1 and 100)
);

-- ----------------------------------------------------------------------------
-- Uploads client
-- ----------------------------------------------------------------------------
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references profiles (id) on delete set null,
  cart_id uuid,
  order_id uuid,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  checksum text,
  consent_given_at timestamptz not null,
  consent_text_version text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table media_assets is
  'Photos d''animaux. Bucket privé, accès par URL signée uniquement. Pas d''insertion sans consentement horodaté.';

-- ----------------------------------------------------------------------------
-- Brouillon de configurateur
-- ----------------------------------------------------------------------------
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  anon_token text unique,
  state jsonb not null default '{}'::jsonb,
  status cart_status not null default 'active',
  expires_at timestamptz not null default now() + interval '30 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index carts_anon_token_idx on carts (anon_token);
create index carts_expiry_idx on carts (expires_at) where status = 'active';

-- ----------------------------------------------------------------------------
-- Commandes
-- ----------------------------------------------------------------------------
create sequence order_number_seq start 1;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default 'MPN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 6, '0'),
  user_id uuid references profiles (id) on delete set null,
  email citext not null,
  phone text,
  status order_status not null default 'pending_payment',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  vat_cents integer not null default 0 check (vat_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency char(3) not null default 'EUR',
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  shipping_address jsonb,
  billing_address jsonb,
  partner_id uuid references partners (id) on delete set null,
  promo_code text references promo_codes (code) on delete set null,
  referral_source text,
  cremation_timing cremation_timing not null default 'post_cremation',
  customer_note text,
  paid_at timestamptz,
  shipped_at timestamptz,
  tracking_number text,
  tracking_carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_email_idx on orders (email);
create index orders_user_idx on orders (user_id, created_at desc);
create index orders_status_idx on orders (status, created_at desc);
create index orders_partner_idx on orders (partner_id) where partner_id is not null;

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  variant_id uuid references product_variants (id) on delete set null,
  name_snapshot text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity smallint not null default 1 check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  personalization jsonb,
  photo_asset_id uuid references media_assets (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on order_items (order_id);

comment on column order_items.name_snapshot is
  'Libellé figé à l''achat : changer un prix ou un nom au catalogue ne doit jamais réécrire l''historique.';

alter table media_assets
  add constraint media_assets_cart_fk foreign key (cart_id) references carts (id) on delete set null,
  add constraint media_assets_order_fk foreign key (order_id) references orders (id) on delete set null;

create index media_assets_owner_idx on media_assets (owner_user_id) where deleted_at is null;
create index media_assets_cart_idx on media_assets (cart_id) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Journalisation technique
-- ----------------------------------------------------------------------------
create table stripe_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

comment on table stripe_events is 'Idempotence du webhook : un évènement déjà présent n''est jamais rejoué.';

create table email_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete set null,
  to_email citext not null,
  template text not null,
  resend_id text,
  status text not null default 'sent',
  error text,
  sent_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger carts_updated_at before update on carts
  for each row execute function set_updated_at();
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS
-- Principe : lecture publique du catalogue, lecture propriétaire des données
-- client, aucune écriture client. service_role contourne la RLS par nature et
-- n'a donc besoin d'aucune policy.
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table bundle_items enable row level security;
alter table partners enable row level security;
alter table promo_codes enable row level security;
alter table media_assets enable row level security;
alter table carts enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table stripe_events enable row level security;
alter table email_log enable row level security;

-- Catalogue : lisible par tous, y compris anonyme.
create policy products_public_read on products
  for select to anon, authenticated using (is_active);

create policy product_variants_public_read on product_variants
  for select to anon, authenticated using (
    is_active and exists (select 1 from products p where p.id = product_id and p.is_active)
  );

create policy bundle_items_public_read on bundle_items
  for select to anon, authenticated using (
    exists (select 1 from products p where p.id = bundle_id and p.is_active)
  );

-- Partenaires : lisibles, mais la commission n'est jamais exposée par cette
-- voie — le client ne lit les partenaires qu'à travers la vue ci-dessous.
create policy partners_public_read on partners
  for select to anon, authenticated using (is_active);

create view partners_public
with (security_invoker = true) as
  select id, slug, name, kind, region, city, postal_code, address, phone,
         logo_url, description, promo_code
  from partners
  where is_active;

-- promo_codes : aucune policy. Seul le serveur valide un code.

-- Données client : lecture par le propriétaire uniquement.
create policy profiles_self_read on profiles
  for select to authenticated using ((select auth.uid()) = id and deleted_at is null);

create policy profiles_self_update on profiles
  for update to authenticated
  using ((select auth.uid()) = id and deleted_at is null)
  with check ((select auth.uid()) = id);

create policy orders_owner_read on orders
  for select to authenticated using ((select auth.uid()) = user_id);

create policy order_items_owner_read on order_items
  for select to authenticated using (
    exists (select 1 from orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

create policy carts_owner_read on carts
  for select to authenticated using ((select auth.uid()) = user_id);

create policy media_assets_owner_read on media_assets
  for select to authenticated using ((select auth.uid()) = owner_user_id and deleted_at is null);

-- stripe_events, email_log, promo_codes : service_role exclusivement.

-- ----------------------------------------------------------------------------
-- Storage : bucket privé pour les photos d'animaux
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos', 'pet-photos', false, 10485760,
  array['image/jpeg', 'image/png', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- Aucune policy storage pour anon/authenticated : les URLs d'upload et de
-- lecture sont signées côté serveur après vérification du consentement.
