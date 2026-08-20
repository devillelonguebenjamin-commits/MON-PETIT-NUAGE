import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bundles, options, urnVariants } from '@/data/catalogue';
import { buildQuoteLines, urnPriceCents } from '@/lib/catalogue';
import { computeQuote } from '@/lib/pricing';

const seed = readFileSync(new URL('../../supabase/seed.sql', import.meta.url), 'utf8');

describe('cohérence entre le catalogue TypeScript et le seed SQL', () => {
  it('déclare les mêmes coffrets aux mêmes prix', () => {
    for (const bundle of bundles) {
      expect(seed, `slug ${bundle.slug} absent du seed`).toContain(`'${bundle.slug}'`);
      expect(seed, `prix de ${bundle.slug} absent du seed`).toContain(String(bundle.basePriceCents));
    }
  });

  it('déclare les mêmes options aux mêmes prix', () => {
    for (const option of options) {
      expect(seed, `slug ${option.slug} absent du seed`).toContain(`'${option.slug}'`);
      expect(seed).toContain(String(option.priceCents));
    }
  });

  it('déclare les mêmes déclinaisons d’urne', () => {
    expect(urnVariants).toHaveLength(12);
    for (const variant of urnVariants) {
      expect(seed, `sku ${variant.sku} absent du seed`).toContain(`'${variant.sku}'`);
    }
  });
});

describe('urnPriceCents', () => {
  it('applique l’écart de gabarit et de matériau', () => {
    expect(urnPriceCents('lt_5', 'bois_clair')).toBe(12900);
    expect(urnPriceCents('lt_5', 'ceramique_blanche')).toBe(14900);
    expect(urnPriceCents('gt_30', 'ceramique_blanche')).toBe(19400);
  });
});

describe('buildQuoteLines', () => {
  it('facture le coffret seul quand rien n’est ajouté', () => {
    const lines = buildQuoteLines({
      bundleSlug: 'coffret-douceur',
      weightClass: 'lt_5',
      material: 'bois_clair',
      optionSlugs: [],
    });

    expect(computeQuote(lines).totalCents).toBe(14900);
  });

  it('ajoute l’écart d’urne sans refacturer une urne entière', () => {
    const lines = buildQuoteLines({
      bundleSlug: 'coffret-douceur',
      weightClass: 'gt_30',
      material: 'ceramique_blanche',
      optionSlugs: [],
    });

    expect(computeQuote(lines).totalCents).toBe(14900 + 6500);
  });

  it('ne refacture jamais une option déjà comprise dans le coffret', () => {
    const lines = buildQuoteLines({
      bundleSlug: 'coffret-signature',
      weightClass: 'lt_5',
      material: 'bois_clair',
      optionSlugs: ['empreinte-encadree', 'coffret-expedition-premium'],
    });

    expect(computeQuote(lines).totalCents).toBe(24900);
  });

  it('facture les options ajoutées en plus du coffret', () => {
    const lines = buildQuoteLines({
      bundleSlug: 'coffret-signature',
      weightClass: 'lt_5',
      material: 'bois_clair',
      optionSlugs: ['empreinte-encadree', 'bijou-cendres', 'portrait-aquarelle'],
    });

    expect(computeQuote(lines).totalCents).toBe(24900 + 8900 + 12900);
  });

  it('ignore une option inconnue plutôt que de casser le devis', () => {
    const lines = buildQuoteLines({
      bundleSlug: 'coffret-douceur',
      weightClass: 'lt_5',
      material: 'bois_clair',
      optionSlugs: ['option-qui-nexiste-pas'],
    });

    expect(computeQuote(lines).totalCents).toBe(14900);
  });

  it('renvoie un devis vide pour un coffret inconnu', () => {
    expect(
      buildQuoteLines({ bundleSlug: 'inexistant', weightClass: null, material: null, optionSlugs: [] }),
    ).toHaveLength(0);
  });

  it('démarre bien à 149 € sur la configuration la plus simple', () => {
    const minimum = buildQuoteLines({
      bundleSlug: 'coffret-douceur',
      weightClass: 'lt_5',
      material: 'bois_clair',
      optionSlugs: [],
    });

    expect(computeQuote(minimum).totalCents).toBe(14900);
  });

  it('plafonne à 532 € sur la configuration la plus complète', () => {
    // À signaler : le brief annonce une fourchette de 149 € à 499 €. Le
    // catalogue actuel dépasse ce plafond de 33 € sur la combinaison la plus
    // chère (Signature + urne XL céramique + bijou + portrait). Décision de
    // tarification à trancher ; ce test verrouille la valeur en attendant et
    // signalera toute dérive.
    const maximum = buildQuoteLines({
      bundleSlug: 'coffret-signature',
      weightClass: 'gt_30',
      material: 'ceramique_blanche',
      optionSlugs: ['bijou-cendres', 'portrait-aquarelle'],
    });

    expect(computeQuote(maximum).totalCents).toBe(53200);
  });
});
