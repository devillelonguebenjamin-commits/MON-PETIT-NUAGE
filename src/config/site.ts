export const siteConfig = {
  name: 'Mon Petit Nuage',
  tagline: 'Célébrer leur passage',
  description:
    "Coffrets mémoriels artisanaux pour garder près de vous le souvenir de votre chien ou de votre chat. Fabriqués dans l'Ouest de la France, personnalisés avec soin.",
  url: 'https://monpetitnuage.fr',
  locale: 'fr_FR',
  contact: {
    email: 'contact@monpetitnuage.fr',
    phone: '+33 6 51 78 98 70',
    phoneDisplay: '06 51 78 98 70',
  },
  /** Livraison offerte sur toutes les commandes — décision de cadrage §6. */
  shippingCents: 0,
  vatRate: 0.2,
  leadTimeDays: { min: 5, max: 10 },
} as const;

export type SiteConfig = typeof siteConfig;
