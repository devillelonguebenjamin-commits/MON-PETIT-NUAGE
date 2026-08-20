import { siteConfig } from '@/config/site';
import type { Discount } from '@/lib/types';

/**
 * Moteur de prix unique, partagé entre l'affichage client et la facturation
 * serveur (note de cadrage §2.3). Le serveur reste seul juge du total facturé :
 * le client n'envoie jamais de montant, uniquement des identifiants.
 *
 * Tous les montants sont en centimes. Les prix du catalogue sont TTC.
 */

export interface QuoteLine {
  /** Identifiant produit ou variante, pour la traçabilité de la ligne. */
  reference: string;
  label: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  /** TVA incluse dans le total, isolée pour la facture. */
  vatCents: number;
  totalCents: number;
}

export class PricingError extends Error {}

function assertValidLine(line: QuoteLine): void {
  if (!Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
    throw new PricingError(`Prix unitaire invalide pour « ${line.label} ».`);
  }
  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new PricingError(`Quantité invalide pour « ${line.label} ».`);
  }
}

export function computeDiscountCents(subtotalCents: number, discount: Discount | null): number {
  if (!discount) return 0;
  if (subtotalCents < discount.minOrderCents) return 0;

  const raw =
    discount.kind === 'percent'
      ? Math.round((subtotalCents * discount.value) / 100)
      : discount.value;

  // Une remise ne peut jamais dépasser le sous-total ni rendre le total négatif.
  return Math.min(Math.max(raw, 0), subtotalCents);
}

/** Part de TVA contenue dans un montant TTC. */
export function extractVatCents(ttcCents: number, vatRate = siteConfig.vatRate): number {
  return Math.round(ttcCents - ttcCents / (1 + vatRate));
}

export function computeQuote(lines: QuoteLine[], discount: Discount | null = null): Quote {
  lines.forEach(assertValidLine);

  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const discountCents = computeDiscountCents(subtotalCents, discount);
  const shippingCents = siteConfig.shippingCents;
  const totalCents = subtotalCents - discountCents + shippingCents;

  return {
    lines,
    subtotalCents,
    discountCents,
    shippingCents,
    vatCents: extractVatCents(totalCents),
    totalCents,
  };
}
