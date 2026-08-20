-- =============================================================================
-- Données de départ — catalogue et partenaires.
-- Les partenaires sont fictifs tant qu'aucun accord n'est signé (cadrage §6).
-- Textes conformes au ton éditorial : vouvoiement, formulations positives.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Urnes (kind = 'urne') — le prix de base porte la déclinaison la plus simple.
-- ----------------------------------------------------------------------------
insert into products (slug, name, kind, short_description, long_description, base_price_cents, sort_order)
values (
  'urne-signature',
  'Urne signature',
  'urne',
  'Façonnée à la main, gravée du prénom de votre compagnon.',
  'Notre urne signature est tournée dans un atelier de Loire-Atlantique. Chaque pièce est poncée puis huilée à la main, ce qui donne à son grain une profondeur qui se révèle à la lumière. Le prénom de votre compagnon et les dates que vous choisissez sont gravés au laser sur la face avant, dans une typographie dessinée pour rester lisible des années durant. Le fond est fermé par une plaque vissée et scellée, doublée d''un feutre qui protège les surfaces sur lesquelles vous la poserez.',
  12900,
  1
);

insert into product_variants (product_id, sku, weight_class, material, price_delta_cents)
select p.id, v.sku, v.weight_class::weight_class, v.material::material, v.delta
from products p
cross join (values
  ('URN-S-BC', 'lt_5',  'bois_clair',        0),
  ('URN-S-BF', 'lt_5',  'bois_fonce',        0),
  ('URN-S-CB', 'lt_5',  'ceramique_blanche', 2000),
  ('URN-M-BC', '5_15',  'bois_clair',        1500),
  ('URN-M-BF', '5_15',  'bois_fonce',        1500),
  ('URN-M-CB', '5_15',  'ceramique_blanche', 3500),
  ('URN-L-BC', '15_30', 'bois_clair',        3000),
  ('URN-L-BF', '15_30', 'bois_fonce',        3000),
  ('URN-L-CB', '15_30', 'ceramique_blanche', 5000),
  ('URN-XL-BC', 'gt_30', 'bois_clair',       4500),
  ('URN-XL-BF', 'gt_30', 'bois_fonce',       4500),
  ('URN-XL-CB', 'gt_30', 'ceramique_blanche', 6500)
) as v(sku, weight_class, material, delta)
where p.slug = 'urne-signature';

-- ----------------------------------------------------------------------------
-- Options additionnelles
-- ----------------------------------------------------------------------------
insert into products (slug, name, kind, short_description, base_price_cents, sort_order)
values
  ('empreinte-encadree', 'Empreinte de patte encadrée', 'option',
   'L''empreinte relevée par le crématorium, montée sous cadre bois.', 4900, 10),
  ('bijou-cendres', 'Bijou avec cendres', 'option',
   'Pendentif en acier inoxydable, chaîne comprise, à garder près de vous.', 8900, 11),
  ('portrait-aquarelle', 'Portrait aquarelle A4', 'option',
   'Peint à la main d''après votre photo par une illustratrice de Rennes.', 12900, 12),
  ('coffret-expedition-premium', 'Coffret d''expédition premium', 'option',
   'Boîte en bois brun nuit fermée d''un ruban, prête à offrir ou à conserver.', 1900, 13),
  ('certificat-cremation', 'Certificat de crémation', 'option',
   'Document nominatif remis avec votre coffret.', 0, 14);

-- ----------------------------------------------------------------------------
-- Coffrets préconfigurés
-- ----------------------------------------------------------------------------
insert into products (slug, name, kind, short_description, long_description, base_price_cents, sort_order, seo_title, seo_description)
values
  ('coffret-douceur', 'Coffret Douceur', 'coffret',
   'L''essentiel, dans sa forme la plus simple.',
   'Le Coffret Douceur réunit ce qui compte : une urne signature gravée à son prénom et le certificat de crémation. C''est notre proposition la plus sobre, pensée pour celles et ceux qui souhaitent un objet discret, à poser sur une étagère ou près d''une fenêtre. Vous choisissez le matériau et la taille selon le gabarit de votre compagnon, puis le prénom et les dates à graver. Nous nous occupons du reste.',
   14900, 1,
   'Coffret Douceur — urne gravée et certificat',
   'Une urne signature gravée du prénom de votre compagnon et son certificat de crémation. Fabrication artisanale dans l''Ouest de la France, livraison offerte.'),
  ('coffret-signature', 'Coffret Signature', 'coffret',
   'Notre coffret le plus complet, empreinte comprise.',
   'Le Coffret Signature ajoute à l''urne gravée l''empreinte de patte encadrée, relevée par votre crématorium partenaire, et un coffret d''expédition premium en bois brun nuit. C''est la proposition que choisissent la plupart des familles : elle rassemble en un seul envoi les traces les plus parlantes du passage de votre compagnon. L''empreinte est montée sous cadre, prête à accrocher ou à poser.',
   24900, 2,
   'Coffret Signature — urne, empreinte encadrée et certificat',
   'Urne signature gravée, empreinte de patte encadrée, certificat et coffret d''expédition premium. Artisanat de l''Ouest de la France, livraison offerte.'),
  ('composer-votre-coffret', 'Composer votre coffret', 'coffret',
   'Vous choisissez chaque élément, à partir de 129 €.',
   'Si aucune de nos deux propositions ne correspond tout à fait, composez la vôtre. Vous partez de l''urne signature, vous choisissez son matériau et sa taille, puis vous ajoutez seulement ce qui vous parle : l''empreinte encadrée, un bijou à porter, un portrait aquarelle. Le prix se met à jour à chaque étape, sans surprise au moment de payer.',
   12900, 3,
   'Composer votre coffret mémoriel sur mesure',
   'Composez le coffret qui vous ressemble : urne, empreinte, bijou, portrait. À partir de 129 €, livraison offerte.');

-- Composition des coffrets
insert into bundle_items (bundle_id, item_product_id, quantity, is_swappable, sort_order)
select b.id, i.id, 1, v.swappable, v.sort_order
from (values
  ('coffret-douceur',   'urne-signature',              true,  1),
  ('coffret-douceur',   'certificat-cremation',        false, 2),
  ('coffret-signature', 'urne-signature',              true,  1),
  ('coffret-signature', 'empreinte-encadree',          false, 2),
  ('coffret-signature', 'certificat-cremation',        false, 3),
  ('coffret-signature', 'coffret-expedition-premium',  false, 4),
  ('composer-votre-coffret', 'urne-signature',         true,  1),
  ('composer-votre-coffret', 'certificat-cremation',   false, 2)
) as v(bundle_slug, item_slug, swappable, sort_order)
join products b on b.slug = v.bundle_slug
join products i on i.slug = v.item_slug;

-- ----------------------------------------------------------------------------
-- Partenaires — DONNÉES FICTIVES, à remplacer avant la mise en production.
-- ----------------------------------------------------------------------------
insert into partners (slug, name, kind, region, city, postal_code, promo_code, commission_rate, description)
values
  ('crematorium-exemple-nantes', 'Crématorium animalier de la Loire', 'crematorium',
   'Pays de la Loire', 'Nantes', '44000', 'NANTES10', 0.100,
   'Établissement fictif de démonstration. À remplacer par un partenaire réel.'),
  ('crematorium-exemple-rennes', 'Crématorium animalier de Haute-Bretagne', 'crematorium',
   'Bretagne', 'Rennes', '35000', 'RENNES10', 0.100,
   'Établissement fictif de démonstration. À remplacer par un partenaire réel.');

insert into promo_codes (code, kind, value, partner_id, min_order_cents)
select v.code, 'percent'::discount_kind, 10, p.id, 0
from (values ('NANTES10', 'crematorium-exemple-nantes'), ('RENNES10', 'crematorium-exemple-rennes'))
  as v(code, partner_slug)
join partners p on p.slug = v.partner_slug;
