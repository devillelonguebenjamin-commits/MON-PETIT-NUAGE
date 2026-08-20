export type ProductKind = 'coffret' | 'urne' | 'option';
export type WeightClass = 'lt_5' | '5_15' | '15_30' | 'gt_30';
export type Material = 'bois_clair' | 'bois_fonce' | 'ceramique_blanche';
export type CremationTiming = 'post_cremation' | 'pre_cremation';
export type DiscountKind = 'percent' | 'fixed';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ProductImage {
  url: string;
  alt: string;
  position: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  shortDescription: string | null;
  longDescription: string | null;
  basePriceCents: number;
  vatRate: number;
  images: ProductImage[];
  leadTimeDaysMin: number;
  leadTimeDaysMax: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  weightClass: WeightClass | null;
  material: Material | null;
  priceDeltaCents: number;
  images: ProductImage[];
}

export interface Discount {
  code: string;
  kind: DiscountKind;
  /** Pourcentage entier (10 = 10 %) ou montant en centimes selon `kind`. */
  value: number;
  minOrderCents: number;
}

export const WEIGHT_CLASS_LABELS: Record<WeightClass, string> = {
  lt_5: 'Moins de 5 kg',
  '5_15': 'Entre 5 et 15 kg',
  '15_30': 'Entre 15 et 30 kg',
  gt_30: 'Plus de 30 kg',
};

export const MATERIAL_LABELS: Record<Material, string> = {
  bois_clair: 'Bois clair',
  bois_fonce: 'Bois foncé',
  ceramique_blanche: 'Céramique blanche',
};
