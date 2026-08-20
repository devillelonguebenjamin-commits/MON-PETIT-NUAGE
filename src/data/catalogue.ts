import type { Material, WeightClass } from '@/lib/types';

/**
 * Source de vérité du catalogue tant que Supabase n'est pas raccordé.
 * `supabase/seed.sql` doit rester aligné : un test unitaire vérifie qu'aucun
 * slug ni aucun prix ne diverge entre les deux.
 *
 * En semaine 3, `src/lib/catalogue.ts` lira Supabase et ce fichier ne servira
 * plus qu'aux tests et au développement hors ligne.
 */

export interface CatalogueOption {
  slug: string;
  name: string;
  shortDescription: string;
  priceCents: number;
}

export interface CatalogueUrnVariant {
  sku: string;
  weightClass: WeightClass;
  material: Material;
  priceDeltaCents: number;
}

export interface CatalogueBundle {
  slug: string;
  name: string;
  tagline: string;
  basePriceCents: number;
  /** Trois éléments au maximum sur les cartes, conformément au brief. */
  includes: string[];
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  /** Options incluses d'office, non facturées en plus. */
  includedOptionSlugs: string[];
  faq: { question: string; answer: string }[];
  materials: string;
  dimensions: string;
  isCustom?: boolean;
}

export const URN_BASE_PRICE_CENTS = 12_900;

export const urnVariants: CatalogueUrnVariant[] = [
  { sku: 'URN-S-BC', weightClass: 'lt_5', material: 'bois_clair', priceDeltaCents: 0 },
  { sku: 'URN-S-BF', weightClass: 'lt_5', material: 'bois_fonce', priceDeltaCents: 0 },
  { sku: 'URN-S-CB', weightClass: 'lt_5', material: 'ceramique_blanche', priceDeltaCents: 2000 },
  { sku: 'URN-M-BC', weightClass: '5_15', material: 'bois_clair', priceDeltaCents: 1500 },
  { sku: 'URN-M-BF', weightClass: '5_15', material: 'bois_fonce', priceDeltaCents: 1500 },
  { sku: 'URN-M-CB', weightClass: '5_15', material: 'ceramique_blanche', priceDeltaCents: 3500 },
  { sku: 'URN-L-BC', weightClass: '15_30', material: 'bois_clair', priceDeltaCents: 3000 },
  { sku: 'URN-L-BF', weightClass: '15_30', material: 'bois_fonce', priceDeltaCents: 3000 },
  { sku: 'URN-L-CB', weightClass: '15_30', material: 'ceramique_blanche', priceDeltaCents: 5000 },
  { sku: 'URN-XL-BC', weightClass: 'gt_30', material: 'bois_clair', priceDeltaCents: 4500 },
  { sku: 'URN-XL-BF', weightClass: 'gt_30', material: 'bois_fonce', priceDeltaCents: 4500 },
  { sku: 'URN-XL-CB', weightClass: 'gt_30', material: 'ceramique_blanche', priceDeltaCents: 6500 },
];

export const options: CatalogueOption[] = [
  {
    slug: 'empreinte-encadree',
    name: 'Empreinte de patte encadrée',
    shortDescription: "L'empreinte relevée par le crématorium, montée sous cadre bois.",
    priceCents: 4900,
  },
  {
    slug: 'bijou-cendres',
    name: 'Bijou avec cendres',
    shortDescription: 'Pendentif en acier inoxydable, chaîne comprise, à garder près de vous.',
    priceCents: 8900,
  },
  {
    slug: 'portrait-aquarelle',
    name: 'Portrait aquarelle A4',
    shortDescription: "Peint à la main d'après votre photo par une illustratrice de Rennes.",
    priceCents: 12900,
  },
  {
    slug: 'coffret-expedition-premium',
    name: "Coffret d'expédition premium",
    shortDescription: "Boîte en bois brun nuit fermée d'un ruban, prête à offrir ou à conserver.",
    priceCents: 1900,
  },
];

const sharedFaq = [
  {
    question: 'Puis-je commander avant la crémation ?',
    answer:
      "Oui. Beaucoup de familles préfèrent s'en occuper à ce moment-là plutôt que d'y revenir plus tard. Nous fabriquons votre coffret pendant le délai de remise des cendres, qui est d'environ quatorze jours, et nous vous l'envoyons ensuite. Le paiement est encaissé à la commande.",
  },
  {
    question: 'Comment choisir la taille de l’urne ?',
    answer:
      "Nous vous demandons simplement le poids de votre compagnon. Les quatre tailles couvrent tous les gabarits, du chat au grand chien, avec une marge confortable. En cas d'hésitation entre deux tailles, choisissez la plus grande : nous ajustons sans surcoût si nécessaire.",
  },
  {
    question: 'Que se passe-t-il si la gravure comporte une erreur ?',
    answer:
      "Vous relisez le prénom et les dates sur un aperçu avant de valider, et nous vous renvoyons ce même aperçu par email. Si une erreur nous échappe malgré cela, nous refaisons la pièce à nos frais.",
  },
  {
    question: 'Quel est le délai de fabrication ?',
    answer:
      'Cinq à dix jours ouvrés selon les pièces choisies, auxquels s’ajoute la livraison. Vous recevez un email dès que votre coffret part de l’atelier.',
  },
  {
    question: 'La livraison est-elle payante ?',
    answer:
      "Non, elle est offerte sur toutes les commandes, en France métropolitaine. Le colis voyage avec un suivi et une signature à la remise.",
  },
];

export const bundles: CatalogueBundle[] = [
  {
    slug: 'coffret-douceur',
    name: 'Coffret Douceur',
    tagline: "L'essentiel, dans sa forme la plus simple.",
    basePriceCents: 14_900,
    includes: ['Urne signature gravée', 'Certificat de crémation', 'Livraison offerte'],
    longDescription:
      "Le Coffret Douceur réunit ce qui compte : une urne signature gravée à son prénom et le certificat de crémation. C'est notre proposition la plus sobre, pensée pour celles et ceux qui souhaitent un objet discret, à poser sur une étagère ou près d'une fenêtre.\n\nL'urne est tournée dans un atelier de Loire-Atlantique, poncée puis huilée à la main. Le grain du bois se révèle à la lumière et change légèrement au fil des saisons, comme le ferait n'importe quelle belle pièce de menuiserie. Le prénom de votre compagnon et les dates que vous choisissez sont gravés au laser sur la face avant.\n\nVous choisissez le matériau et la taille selon son gabarit, puis le texte à graver. Nous nous occupons du reste : vous recevez un aperçu par email avant que la gravure ne parte à l'atelier, et un suivi dès l'expédition.",
    seoTitle: 'Coffret Douceur — urne gravée et certificat',
    seoDescription:
      "Une urne signature gravée du prénom de votre compagnon et son certificat de crémation. Fabrication artisanale dans l'Ouest de la France, livraison offerte.",
    includedOptionSlugs: [],
    materials: 'Chêne ou noyer massif huilé, ou céramique émaillée. Plaque de fermeture vissée et feutrée.',
    dimensions: 'De 11 × 11 × 14 cm à 19 × 19 × 24 cm selon la taille choisie.',
    faq: sharedFaq,
  },
  {
    slug: 'coffret-signature',
    name: 'Coffret Signature',
    tagline: 'Notre coffret le plus complet, empreinte comprise.',
    basePriceCents: 24_900,
    includes: ['Urne signature gravée', 'Empreinte de patte encadrée', "Coffret d'expédition premium"],
    longDescription:
      "Le Coffret Signature ajoute à l'urne gravée l'empreinte de patte encadrée, relevée par votre crématorium partenaire, et un coffret d'expédition premium en bois brun nuit fermé d'un ruban.\n\nC'est la proposition que choisissent la plupart des familles. Elle rassemble en un seul envoi les traces les plus parlantes du passage de votre compagnon : son prénom gravé dans le bois, et la forme exacte de sa patte. L'empreinte est prise dans une argile fine puis montée sous cadre, prête à accrocher ou à poser.\n\nLe coffret d'expédition n'est pas un simple emballage. Il est pensé pour être conservé : beaucoup de familles y rangent le collier, une photo, quelques objets. C'est pour cela qu'il est en bois et non en carton.",
    seoTitle: 'Coffret Signature — urne, empreinte encadrée et certificat',
    seoDescription:
      "Urne signature gravée, empreinte de patte encadrée, certificat et coffret d'expédition premium. Artisanat de l'Ouest de la France, livraison offerte.",
    includedOptionSlugs: ['empreinte-encadree', 'coffret-expedition-premium'],
    materials:
      'Chêne ou noyer massif huilé, ou céramique émaillée. Cadre en chêne, argile fine. Coffret en bois teinté brun nuit, ruban de coton.',
    dimensions: "Urne de 11 × 11 × 14 cm à 19 × 19 × 24 cm. Cadre de l'empreinte : 15 × 15 cm.",
    faq: sharedFaq,
  },
  {
    slug: 'composer-votre-coffret',
    name: 'Composer votre coffret',
    tagline: 'Vous choisissez chaque élément, à partir de 129 €.',
    basePriceCents: 12_900,
    includes: ['Urne signature gravée', 'Les options de votre choix', 'Livraison offerte'],
    longDescription:
      "Si aucune de nos deux propositions ne correspond tout à fait, composez la vôtre.\n\nVous partez de l'urne signature, vous choisissez son matériau et sa taille, puis vous ajoutez seulement ce qui vous parle : l'empreinte encadrée, un bijou à porter au quotidien, un portrait aquarelle peint d'après votre photo.\n\nLe prix se met à jour à chaque étape et reste affiché en permanence. Aucune option n'est cochée d'avance, et il n'y a pas de surprise au moment de payer.",
    seoTitle: 'Composer votre coffret mémoriel sur mesure',
    seoDescription:
      'Composez le coffret qui vous ressemble : urne, empreinte, bijou, portrait. À partir de 129 €, livraison offerte.',
    includedOptionSlugs: [],
    materials: 'Selon les pièces choisies. Toutes nos urnes sont en bois massif huilé ou en céramique émaillée.',
    dimensions: 'Variables selon la composition.',
    isCustom: true,
    faq: sharedFaq,
  },
];

export const testimonials = [
  {
    author: 'Camille',
    petName: 'Nala',
    quote:
      "Je redoutais ce moment et tout s'est fait en quelques minutes, sans jamais avoir l'impression d'acheter quelque chose.",
  },
  {
    author: 'Thierry',
    petName: 'Gribouille',
    quote:
      "L'urne est plus belle que sur les photos. On voit que quelqu'un l'a faite à la main, et ça change tout.",
  },
  {
    author: 'Sophie',
    petName: 'Marcel',
    quote:
      "L'empreinte encadrée est dans le couloir. Mes enfants la touchent en passant. C'était exactement ce qu'il nous fallait.",
  },
];
