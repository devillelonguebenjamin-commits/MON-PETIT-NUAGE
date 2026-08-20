import { describe, expect, it } from 'vitest';
import { computeDiscountCents, computeQuote, extractVatCents, PricingError } from '@/lib/pricing';
import type { QuoteLine } from '@/lib/pricing';
import type { Discount } from '@/lib/types';

const urne = (cents: number): QuoteLine => ({
  reference: 'urne-signature',
  label: 'Urne signature',
  unitPriceCents: cents,
  quantity: 1,
});

describe('computeQuote', () => {
  it('additionne les lignes et laisse la livraison offerte', () => {
    const quote = computeQuote([urne(24900), { ...urne(4900), reference: 'empreinte', label: 'Empreinte' }]);

    expect(quote.subtotalCents).toBe(29800);
    expect(quote.shippingCents).toBe(0);
    expect(quote.discountCents).toBe(0);
    expect(quote.totalCents).toBe(29800);
  });

  it('couvre les bornes du catalogue, de 149 € à 499 €', () => {
    expect(computeQuote([urne(14900)]).totalCents).toBe(14900);
    expect(computeQuote([urne(24900), urne(12900), urne(8900), urne(1900)]).totalCents).toBe(48600);
  });

  it('tient compte de la quantité', () => {
    expect(computeQuote([{ ...urne(4900), quantity: 3 }]).subtotalCents).toBe(14700);
  });

  it('refuse un prix négatif ou non entier', () => {
    expect(() => computeQuote([urne(-100)])).toThrow(PricingError);
    expect(() => computeQuote([urne(149.5)])).toThrow(PricingError);
  });

  it('refuse une quantité nulle', () => {
    expect(() => computeQuote([{ ...urne(14900), quantity: 0 }])).toThrow(PricingError);
  });
});

describe('computeDiscountCents', () => {
  const percent10: Discount = { code: 'NANTES10', kind: 'percent', value: 10, minOrderCents: 0 };
  const fixed15: Discount = { code: 'MERCI15', kind: 'fixed', value: 1500, minOrderCents: 0 };

  it('applique une remise en pourcentage', () => {
    expect(computeDiscountCents(24900, percent10)).toBe(2490);
  });

  it('applique une remise en montant fixe', () => {
    expect(computeDiscountCents(24900, fixed15)).toBe(1500);
  });

  it('arrondit au centime le plus proche', () => {
    expect(computeDiscountCents(14900, { ...percent10, value: 15 })).toBe(2235);
    expect(computeDiscountCents(12999, percent10)).toBe(1300);
  });

  it('ignore la remise sous le plancher de commande', () => {
    expect(computeDiscountCents(9900, { ...fixed15, minOrderCents: 15000 })).toBe(0);
    expect(computeDiscountCents(15000, { ...fixed15, minOrderCents: 15000 })).toBe(1500);
  });

  it('ne rend jamais un total négatif', () => {
    expect(computeDiscountCents(1000, { ...fixed15, value: 50000 })).toBe(1000);
    expect(computeQuote([urne(1000)], { ...fixed15, value: 50000 }).totalCents).toBe(0);
  });

  it('renvoie zéro sans code promo', () => {
    expect(computeDiscountCents(24900, null)).toBe(0);
  });
});

describe('extractVatCents', () => {
  it('isole la TVA contenue dans un prix TTC à 20 %', () => {
    expect(extractVatCents(24900)).toBe(4150);
    expect(extractVatCents(14900)).toBe(2483);
    expect(extractVatCents(0)).toBe(0);
  });

  it('reste cohérent avec le total remisé du devis', () => {
    const quote = computeQuote([urne(24900)], { code: 'X', kind: 'percent', value: 10, minOrderCents: 0 });
    expect(quote.totalCents).toBe(22410);
    expect(quote.vatCents).toBe(extractVatCents(22410));
  });
});
