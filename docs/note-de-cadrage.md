# Mon Petit Nuage — Note de cadrage technique MVP

**Auteur :** équipe technique · **Destinataire :** Benjamin de Villelongue
**Statut :** cadrage validé le 20/08/2026 — décisions actées en §6
**Périmètre :** MVP 4 semaines (pages 1, 4, 5, 6, 7, 8, 9)

---

## 0. Synthèse et recommandations en une page

| Question | Réponse courte |
|---|---|
| Schéma DB | 11 tables Postgres, catalogue en `products` + `product_variants` + `bundle_items`, personnalisation portée par `order_items.personalization` (jsonb typé), RLS propriétaire stricte, écritures serveur uniquement |
| État configurateur | **Zustand + `persist` localStorage**, étape courante dans l'URL (`?etape=3`), brouillon serveur (`carts`) uniquement dès qu'une photo est uploadée |
| Rendering | SSG/ISR par défaut sur tout ce qui est indexable, SSR dynamique sur checkout + compte, CSR sur panier |
| Tests | 6 parcours Playwright bloquants en CI + Vitest sur le moteur de prix et le webhook Stripe |
| Timeline | 4 semaines à 17 h/semaine ≈ **70 h**. Le périmètre demandé pesait ~93 h : les trois arbitrages du §5.3 sont validés, ramenant à ~78 h |

**Toutes les décisions bloquantes sont prises (§6).** Le développement peut démarrer.

---

## 1. Schéma de base de données

### 1.1 Principes

- **Une seule source de vérité pour les prix : la base.** Le front n'envoie jamais de montant à l'API ; il envoie des identifiants de produits/options, le serveur recalcule le total et crée le PaymentIntent sur ce total. C'est la seule protection contre la manipulation du panier côté client.
- **Montants en centimes** (`integer`), jamais en float. TVA stockée séparément.
- **Aucune écriture client directe.** Le front lit le catalogue (anon key, RLS `select` public) et écrit exclusivement via les Route Handlers Next.js en `service_role`. Cela évite d'avoir à écrire des policies d'écriture subtiles sur des tables commerciales.
- **Snapshot à la commande.** `order_items` copie le libellé et le prix au moment de l'achat : changer un prix au catalogue ne doit jamais réécrire l'historique.

### 1.2 Tables

```
profiles                 1:1 avec auth.users
  id uuid PK → auth.users.id
  email, full_name, phone
  marketing_consent bool default false
  created_at, deleted_at            -- droit à l'oubli : soft delete + purge Storage

products                 catalogue unifié (coffret | urne | option)
  id uuid PK
  slug text unique, name text, kind product_kind
  short_description text, long_description text
  base_price_cents int, vat_rate numeric(4,3) default 0.200
  images jsonb            -- [{url, alt, position}]
  lead_time_days_min/max int
  is_active bool, sort_order int
  seo_title, seo_description
  created_at, updated_at

product_variants         déclinaisons d'urne (poids × matériau)
  id uuid PK, product_id FK
  sku text unique
  weight_class weight_class      -- lt_5 | 5_15 | 15_30 | gt_30
  material material              -- bois_clair | bois_fonce | ceramique_blanche
  price_delta_cents int default 0
  images jsonb, is_active bool

bundle_items             composition des 3 coffrets préconfigurés
  bundle_id FK → products (kind = 'coffret')
  item_product_id FK → products
  quantity int, is_swappable bool
  PK (bundle_id, item_product_id)

carts                    brouillon configurateur côté serveur
  id uuid PK
  user_id uuid null FK → profiles
  anon_token text unique            -- cookie httpOnly, signé
  state jsonb                       -- miroir du store Zustand, schéma versionné
  status cart_status                -- active | converted | abandoned
  expires_at timestamptz            -- +30 j, purge cron
  created_at, updated_at

media_assets             uploads client (photo animal)
  id uuid PK
  owner_user_id uuid null, cart_id uuid null, order_id uuid null
  storage_path text                 -- bucket privé "pet-photos"
  mime_type text, size_bytes int, checksum text
  consent_given_at timestamptz not null   -- RGPD : pas d'upload sans coche
  consent_text_version text not null      -- version du texte accepté
  deleted_at timestamptz            -- droit à l'oubli
  created_at

orders
  id uuid PK
  order_number text unique          -- MPN-2026-000123, communicable
  user_id uuid null                 -- null = commande invité
  email citext not null, phone text
  status order_status               -- pending_payment | paid | in_production
                                    -- | shipped | delivered | cancelled | refunded
  subtotal_cents, discount_cents, shipping_cents, vat_cents, total_cents int
  currency char(3) default 'EUR'
  stripe_payment_intent_id text unique, stripe_customer_id text
  shipping_address jsonb, billing_address jsonb
  partner_id uuid null FK, promo_code text null
  referral_source text null         -- flyer_qr | seo | social | direct
  cremation_timing cremation_timing -- post_cremation | pre_cremation
  customer_note text
  paid_at, shipped_at, tracking_number, tracking_carrier
  created_at, updated_at

order_items
  id uuid PK, order_id FK
  product_id FK, variant_id FK null
  name_snapshot text, unit_price_cents int, quantity int, line_total_cents int
  personalization jsonb null        -- voir §1.3
  photo_asset_id uuid null FK → media_assets

partners                 crématoriums / vétérinaires
  id uuid PK, slug text unique
  name, kind partner_kind           -- crematorium | veterinaire
  region, city, postal_code, address, phone, email
  logo_url, description, is_active
  promo_code text null              -- pré-rempli sur /partenaire/[slug]
  commission_rate numeric(4,3)      -- reporting interne, jamais exposé

promo_codes
  code text PK
  kind discount_kind                -- percent | fixed
  value int                         -- 10 = 10 % | 1500 = 15 €
  partner_id uuid null FK
  min_order_cents int default 0
  valid_from, valid_until
  max_uses int null, used_count int default 0
  is_active bool

stripe_events            idempotence webhook
  id text PK                        -- evt_xxx
  type text, payload jsonb, processed_at timestamptz

email_log                traçabilité transactionnel
  id uuid PK, order_id FK null, to_email citext
  template text, resend_id text, status text, sent_at
```

**Index à créer d'emblée :** `orders(email)`, `orders(user_id, created_at desc)`, `orders(stripe_payment_intent_id)`, `order_items(order_id)`, `products(slug) where is_active`, `partners(slug) where is_active`, `carts(anon_token)`, `carts(expires_at)` pour la purge.

### 1.3 Forme de `personalization`

Typée côté TypeScript avec Zod, validée à l'écriture serveur :

```ts
type Personalization = {
  petName: string;              // ≤ 30 car.
  petKind: 'chien' | 'chat';
  birthDate: string | null;     // ISO 8601
  farewellDate: string | null;  // ISO 8601
  engraving: string | null;     // ≤ 100 car.
  fontKey: 'fraunces' | 'inter';
};
```

Choix assumé : jsonb plutôt qu'une table dédiée. La personnalisation n'est jamais requêtée transversalement, elle est toujours lue avec sa ligne de commande. Une table apporterait des jointures sans bénéfice. Le jour où on fait de l'espace mémoriel (V2), on migre vers une table `memorials` propre.

### 1.4 RLS

| Table | anon | authenticated | service_role |
|---|---|---|---|
| `products`, `product_variants`, `bundle_items`, `partners` | `select` si `is_active` | idem | tout |
| `promo_codes` | aucun accès (validation serveur uniquement) | aucun | tout |
| `profiles` | — | `select`/`update` où `id = auth.uid()` | tout |
| `orders`, `order_items` | — | `select` où `user_id = auth.uid()` | tout |
| `media_assets` | — | `select`/`delete` où `owner_user_id = auth.uid()` | tout |
| `carts` | — | `select` où `user_id = auth.uid()` | tout |
| `stripe_events`, `email_log` | — | — | tout |

Deux points de vigilance :

- **Commandes invité.** 80 % du volume vient d'un flyer : imposer un compte avant paiement tuerait la conversion. Le suivi invité passe par un lien signé (token HMAC à durée limitée) envoyé dans l'email de confirmation, résolu par une Route Handler en `service_role` — jamais par RLS. Si le client crée un compte plus tard avec le même email, on rattache ses commandes.
- **Storage.** Bucket `pet-photos` **privé**. Upload via URL signée générée côté serveur après vérification du consentement ; lecture via URL signée courte durée. Aucune photo d'animal n'est jamais accessible par URL publique devinable.

### 1.5 RGPD

- Consentement explicite horodaté et versionné dans `media_assets` (pas de case pré-cochée).
- Droit à l'oubli : une Route Handler `/api/compte/supprimer` anonymise `orders` (email → hash, adresses → null, conservation des montants pour l'obligation comptable de 10 ans), supprime les objets Storage et soft-delete `profiles`.
- Purge automatique des `carts` expirés et de leurs `media_assets` orphelins (cron Supabase quotidien).
- Plausible : pas de cookie, pas de bannière requise. Aucun script tiers avant opt-in.

---

## 2. État du configurateur

### 2.1 Recommandation : Zustand + persist, étape dans l'URL

```
Store Zustand (client)  ──persist──▶  localStorage   (résilience onglet fermé)
        │
        ├─ étape courante ────────▶  URL ?etape=3     (retour navigateur, partage, analytics)
        │
        └─ à l'upload photo ─────▶  carts (Postgres)  (le fichier vit déjà côté serveur)
```

**Pourquoi pas React Context :** le configurateur re-render à chaque frappe dans le champ gravure, avec un preview live à côté. Context propage à tout l'arbre ; Zustand permet des sélecteurs granulaires (`useConfig(s => s.engraving)`) et ne re-render que le preview. C'est exactement le cas d'usage où la différence se voit.

**Pourquoi pas tout dans l'URL :** cinq étapes, une photo, quatre options — l'URL deviendrait illisible et fragile, et une photo ne s'encode pas en query param. En revanche, **l'étape seule dans l'URL** est non négociable : sans elle, le bouton « retour » du navigateur fait sortir du tunnel. Sur une cible 35-65 ans, c'est une cause d'abandon massive.

**Pourquoi persist :** notre client est en état émotionnel, il ferme l'onglet, il revient le lendemain. Reperdre 8 minutes de configuration est le pire scénario produit. localStorage couvre 90 % des cas ; le brouillon serveur couvre le changement d'appareil (téléphone → ordinateur), fréquent sur un panier à 280 €.

### 2.2 Forme du store

```ts
type ConfiguratorState = {
  version: 1;                       // migration si le schéma bouge
  bundleSlug: string | null;        // étape 1
  urn: { variantId: string | null; weightClass: WeightClass | null };
  photo: { assetId: string; previewUrl: string } | null;
  engraving: Personalization | null;
  options: string[];                // product ids
  cremationTiming: 'post' | 'pre';
  cartId: string | null;            // créé au premier upload
};
```

Chaque étape est validée par un schéma Zod ; la navigation « suivant » est bloquée tant que l'étape n'est pas valide, la navigation « précédent » est toujours libre.

### 2.3 Prix

Un module unique `lib/pricing.ts`, **importé par le client pour l'affichage et par le serveur pour la facturation**, alimenté par les prix venant de la base. Une seule implémentation, testée unitairement (§4.2). Le serveur reste seul juge du total facturé.

### 2.4 Défauts intelligents

Conformément au principe « minimiser les décisions » : coffret Signature présélectionné (panier moyen visé), matériau bois clair par défaut, timing « post-crémation » par défaut, aucune option cochée d'avance (une option pré-cochée sur un produit de deuil serait un dark pattern — exclu).

---

## 3. Stratégie de rendering

| Route | Mode | Revalidation | Notes |
|---|---|---|---|
| `/` | SSG + ISR | 1 h | Server Components, zéro JS hors carrousel témoignages |
| `/notre-approche`, `/nos-artisans` | SSG | build | Contenu en MDX local en V1.5 |
| `/coffrets` | ISR | 1 h | Prix depuis la base au build/revalidate |
| `/coffrets/[slug]` | SSG + `generateStaticParams` + ISR | 1 h | `generateMetadata` + JSON-LD `Product` |
| `/personnaliser` | Shell statique + îlots clients | — | Catalogue passé en props depuis un Server Component ; le tunnel lui-même est client |
| `/panier` | CSR, `noindex` | — | Lecture du store, aucun intérêt SEO |
| `/checkout` | SSR dynamique, `noindex` | — | PaymentIntent créé côté serveur au chargement |
| `/compte` | SSR dynamique, auth-gated, `noindex` | — | `cookies()` ⇒ dynamique de fait |
| `/journal`, `/journal/[slug]` | ISR (V1.5) | webhook CMS | `revalidateTag` sur publication |
| `/ressources` | SSG (V1.5) | build | |
| `/partenaires` | SSG + ISR | 24 h | |
| `/partenaire/[slug]` | SSG + `generateStaticParams` + ISR | 24 h | Cœur du parcours A : doit être instantané au scan du QR code |
| `/api/*` | Route Handlers, runtime Node | — | Stripe SDK incompatible Edge |

Règle générale : **SSG partout où c'est indexable, dynamique seulement là où il y a une identité ou un montant.** C'est ce qui tient l'objectif Lighthouse 90+ mobile : les trois pages contraintes (Home, Coffrets, Configurateur) sont statiques ou quasi-statiques, avec `next/image` en AVIF/WebP, `next/font` pour Fraunces et Inter (variable, `display: swap`, préchargement du subset latin), et aucun script tiers bloquant.

Point d'attention honnête : **le configurateur est la page la plus à risque sur Lighthouse.** Upload, date pickers et preview live pèsent. Mitigations prévues : `next/dynamic` sur les étapes 3 à 5, date pickers natifs `<input type="date">` plutôt qu'une librairie, preview en CSS/SVG et non en canvas. Si le budget JS dérape, on négocie 85+ sur cette page plutôt que de dégrader l'expérience.

---

## 4. Plan de tests

### 4.1 Playwright — parcours bloquants en CI

| # | Scénario | Assertions clés |
|---|---|---|
| P1 | **Checkout nominal** : coffret Signature → urne → photo → gravure → 1 option → paiement carte test `4242` | Total serveur = total affiché · `orders.status = 'paid'` · email de confirmation loggé · page de remerciement affiche l'`order_number` |
| P2 | **Carte refusée** `4000 0000 0000 0002` | Message d'erreur lisible et non technique · panier intact · aucune commande `paid` créée · réessai possible |
| P3 | **Configurateur — navigation** : aller jusqu'à l'étape 4, revenir à l'étape 2 via le bouton retour du navigateur, changer l'urne, avancer | État préservé, prix recalculé, aucune donnée perdue |
| P4 | **Persistance** : configurer 3 étapes, recharger la page | État restauré à l'identique, y compris la photo |
| P5 | **Parcours partenaire** : `/partenaire/[slug]` → code promo pré-rempli → checkout | Remise appliquée au total serveur · `orders.partner_id` renseigné |
| P6 | **Upload** : fichier > 10 Mo, puis format non supporté, puis JPG valide | Refus explicite sans casser le tunnel · consentement obligatoire avant upload |

Exécution : Chromium desktop + Mobile Safari émulé (le mobile porte l'essentiel du trafic QR code). Stripe en mode test, webhooks rejoués via `stripe listen`. Base de test Supabase dédiée, réinitialisée par un `globalSetup` avec seed déterministe. P1 et P2 sont bloquants pour tout merge.

### 4.2 Vitest — unitaire

- `lib/pricing.ts` : chaque coffret, chaque combinaison d'options, remises `percent` et `fixed`, plancher `min_order_cents`, arrondi TVA, non-régression sur les bornes 149 € / 499 €.
- Validation Zod : gravure à 100 et 101 caractères, prénom à 30 et 31, dates incohérentes (adieu antérieur à la naissance).
- Webhook Stripe : idempotence (même `evt_id` deux fois ⇒ une seule transition de statut), signature invalide ⇒ 400, `payment_intent.succeeded` sur commande inconnue ⇒ log sans crash.

### 4.3 Non automatisé au MVP

Accessibilité : `@axe-core/playwright` en assertion sur les 4 pages du tunnel (violations critiques = échec), complété par un passage clavier manuel. Lighthouse : mesure manuelle en fin de semaine 3, avec budget de perf inscrit dans le README plutôt qu'un job CI — ajouter Lighthouse-CI coûterait 3 h qu'on n'a pas.

---

## 5. Timeline

### 5.1 Budget réel

4 semaines × 17,5 h ≈ **70 h**. Estimation du périmètre demandé, hors optimisme :

| Lot | Heures |
|---|---|
| Setup (Next.js, TS strict, Tailwind + tokens, shadcn, Supabase, Vercel, CI) | 8 |
| Design system + composants de base | 8 |
| Home | 7 |
| `/coffrets` + `/coffrets/[slug]` | 9 |
| Configurateur 5 étapes (dont upload + preview live) | 20 |
| Panier + checkout Stripe + webhook + emails Resend | 16 |
| Compte client | 7 |
| Tests Playwright + Vitest | 10 |
| Perf, a11y, responsive, recette | 8 |
| **Total** | **93 h** |

**Écart : ~23 h.** Il faut le traiter maintenant, pas en semaine 4.

### 5.2 Planning proposé (périmètre ajusté)

**S1 — Fondations (17 h).** Setup complet, tokens de la palette en variables CSS + config Tailwind, typographie Fraunces/Inter, composants de base (Button, Card, Input, Stepper, Dialog), schéma Supabase migré + seed catalogue, CI GitHub Actions (lint, typecheck, build), déploiement Vercel avec preview par branche.
*Livrable : preview URL en ligne avec la page d'accueil en squelette et le design system visible.*

**S2 — Catalogue et configurateur (18 h).** Home complète, `/coffrets`, `/coffrets/[slug]` en SSG, store Zustand, étapes 1, 2, 4 et 5 du configurateur, moteur de prix + tests unitaires.
*Livrable : configuration complète possible hors photo, prix juste.*

**S3 — Photo, paiement, emails (18 h).** Upload Supabase Storage avec consentement, preview, étape 3, panier, checkout Stripe Elements, webhook idempotent, emails de confirmation et d'expédition via Resend.
*Livrable : première commande de bout en bout en mode test.*

**S4 — Suivi de commande, tests, recette (17 h).** Page de suivi `/commande/[token]`, Playwright P1–P6, passe a11y et perf, responsive, README, guide admin, seed de production.
*Livrable : MVP recettable, prêt à basculer Stripe en mode live.*

### 5.3 Arbitrages retenus pour tenir les 70 h — ✅ validés

Les trois leviers ci-dessous sont **validés** et intégrés au planning §5.2 :

1. **Compte client réduit** — retenu (−5 h) : au MVP, pas d'espace authentifié. Suivi de commande par lien signé reçu par email (`/commande/[token]`). Couvre 100 % du besoin réel en V1 — le compte n'a d'intérêt qu'avec les relances J+90 (V2). **Retenu.**
2. **Fiche produit générique plutôt que par produit** — retenu (−4 h) : un gabarit unique alimenté par la base, sans galerie éditorialisée par produit. Dépend de toute façon de la disponibilité des photos.
3. **Storybook reporté en V1.5** — retenu (−6 h) : le design system est documenté en Markdown + une page `/design-system` interne. Storybook prend son sens à plusieurs développeurs.

Ces trois leviers ramènent à ~78 h, soit 2 h/semaine de dépassement — absorbable. Wireframes des 12 pages et prototype cliquable des 3 parcours : je les propose en V1.5, le MVP tenant lieu de prototype dès la fin de S2 via les preview URLs.

Conséquence sur le planning : la semaine 4 troque le développement du compte authentifié contre la page `/commande/[token]` et une marge de recette élargie. La couverture Playwright P1–P6 est donc **maintenue en intégralité**.

### 5.4 Risques

| Risque | Impact | Parade |
|---|---|---|
| Photos produits et textes non disponibles à S2 | Bloque Home, coffrets, fiches | Placeholders explicites dès S1 ; liste des contenus attendus à J+3 |
| Validation Stripe du compte (KYC) | Bloque le passage en live, pas le développement | Ouvrir le compte cette semaine, développer en mode test |
| Preview live de gravure plus coûteux que prévu | −4 h ailleurs | Repli : preview statique sur mockup unique, sans changement de police |
| Disponibilité de validation 2 h/jour | Décalage cumulatif | Point de 20 min en fin de chaque semaine, sur preview URL |

---

## 6. Décisions actées

Validées le 20/08/2026. Elles ont valeur d'hypothèses de développement : toute évolution après le démarrage se traite comme un changement de périmètre.

| # | Sujet | Décision | Conséquence technique |
|---|---|---|---|
| 1 | Périmètre | Les trois arbitrages du §5.3 sont retenus | ~78 h de charge, compte authentifié hors MVP, Storybook en V1.5 |
| 2 | Encaissement pré-crémation | **Capture immédiate**, comme une précommande | Aucun surcoût. `PaymentIntent` en capture automatique, y compris pour `cremation_timing = 'pre_cremation'` |
| 3 | Frais de port | **Offerts pour toutes les commandes** | `orders.shipping_cents = 0` au MVP, colonne conservée pour ne pas migrer plus tard. Message de réassurance affiché dès la fiche produit et rappelé au checkout |
| 4 | TVA | **Prix affichés TTC, taux normal de 20 %** | `products.vat_rate` reste paramétrable par produit ; valeur par défaut 0.200 |
| 5 | Git | **`main` comme branche par défaut**, travail en pull requests relues | Preview URL Vercel par branche, CI bloquante avant fusion |
| 6 | Textes juridiques | **Je rédige les brouillons** | CGV, mentions légales, politique de confidentialité et clause de rétractation produits en semaine 4, marqués « à faire valider par un juriste » |
| 7 | Comptes externes | **Ouverts à ton nom, accès collaborateur pour moi** | Vercel, Supabase, Stripe, Resend, Plausible. Le KYC Stripe est le chemin critique |
| 8 | Partenaires | **Aucun accord signé** au lancement | Données de départ fictives mais réalistes, remplaçables sans redéploiement. Landings `/partenaire/[slug]` confirmées en V1.5 |

### 6.1 Points de vigilance ouverts par ces décisions

- **Capture immédiate en pré-crémation.** Encaisser avant la remise des cendres impose une transparence forte : la date d'expédition estimée doit être affichée avant paiement, pas seulement dans l'email. Prévu à l'étape de récapitulatif.
- **Rétractation.** Un produit gravé au prénom de l'animal relève de l'exclusion du droit de rétractation (bien confectionné selon les spécifications du consommateur). Cette exclusion doit être acceptée explicitement au checkout, par une case distincte des CGV — sans quoi elle n'est pas opposable. À intégrer en semaine 3.
- **Brouillons juridiques.** Je produis des textes cohérents avec l'activité, mais je ne suis pas juriste : ils ne doivent pas partir en production sans relecture professionnelle. À faire avant le basculement de Stripe en mode live.
- **KYC Stripe.** Seul élément externe capable de décaler la mise en ligne indépendamment du développement. À lancer dès cette semaine, avant même que le code en ait besoin.

### 6.2 Ce qui reste à fournir de ton côté

| Élément | Échéance | Bloque |
|---|---|---|
| Accès collaborateur Vercel, Supabase, Stripe, Resend, Plausible | Semaine 1 | Déploiement et preview URLs |
| Photos produits (urnes : 3 matériaux × mise en situation et détail matière) | Semaine 2 | Fiches produit, `/coffrets`, configurateur |
| Photo et texte du portrait fondateur | V1.5 | `/notre-approche` |
| 3 témoignages clients anonymisés | Semaine 2 | Section réassurance de la Home |
| Entité juridique, adresse, numéro de TVA, hébergeur | Semaine 4 | Mentions légales |
| Noms, régions et codes promo des partenaires | Avant mise en production | Données de départ `partners` (fictives d'ici là) |
