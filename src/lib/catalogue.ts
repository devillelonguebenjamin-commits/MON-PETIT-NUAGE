import { bundles, options, urnVariants, URN_BASE_PRICE_CENTS } from '@/data/catalogue';
import type { CatalogueBundle, CatalogueOption, CatalogueUrnVariant } from '@/data/catalogue';
import type { Material, WeightClass } from '@/lib/types';
import type { QuoteLine } from '@/lib/pricing';

/**
 * Accès au catalogue. Lit aujourd'hui les données locales ; passera sur
 * Supabase en semaine 3 sans changer cette signature, les pages étant toutes
 * générées statiquement.
 */
export function getBundles(): CatalogueBundle[] {
  return bundles;
}

export function getBundle(slug: string): CatalogueBundle | undefined {
  return bundles.find((bundle) => bundle.slug === slug);
}

export function getOptions(): CatalogueOption[] {
  return options;
}

export function getOption(slug: string): CatalogueOption | undefined {
  return options.find((option) => option.slug === slug);
}

export function getUrnVariant(
  weightClass: WeightClass,
  material: Material,
): CatalogueUrnVariant | undefined {
  return urnVariants.find(
    (variant) => variant.weightClass === weightClass && variant.material === material,
  );
}

export function getUrnVariantBySku(sku: string): CatalogueUrnVariant | undefined {
  return urnVariants.find((variant) => variant.sku === sku);
}

/** Prix de l'urne pour un gabarit et un matériau donnés. */
export function urnPriceCents(weightClass: WeightClass, material: Material): number {
  const variant = getUrnVariant(weightClass, material);
  return URN_BASE_PRICE_CENTS + (variant?.priceDeltaCents ?? 0);
}

export interface ConfigurationInput {
  bundleSlug: string;
  weightClass: WeightClass | null;
  material: Material | null;
  optionSlugs: string[];
}

/**
 * Traduit une configuration en lignes de devis. Utilisé à l'identique par
 * l'affichage client et par la facturation serveur : c'est ce qui garantit que
 * le prix montré est le prix facturé.
 */
export function buildQuoteLines(input: ConfigurationInput): QuoteLine[] {
  const bundle = getBundle(input.bundleSlug);
  if (!bundle) return [];

  const lines: QuoteLine[] = [];

  // Le coffret porte son prix de base ; le choix de l'urne n'ajoute que l'écart
  // de matériau et de gabarit, jamais le prix d'une urne supplémentaire.
  lines.push({
    reference: bundle.slug,
    label: bundle.name,
    unitPriceCents: bundle.basePriceCents,
    quantity: 1,
  });

  if (input.weightClass && input.material) {
    const variant = getUrnVariant(input.weightClass, input.material);
    if (variant && variant.priceDeltaCents > 0) {
      lines.push({
        reference: variant.sku,
        label: `Urne — ${materialLabel(variant.material)}, ${weightLabel(variant.weightClass)}`,
        unitPriceCents: variant.priceDeltaCents,
        quantity: 1,
      });
    }
  }

  for (const slug of input.optionSlugs) {
    // Une option déjà comprise dans le coffret n'est jamais refacturée.
    if (bundle.includedOptionSlugs.includes(slug)) continue;

    const option = getOption(slug);
    if (!option) continue;

    lines.push({
      reference: option.slug,
      label: option.name,
      unitPriceCents: option.priceCents,
      quantity: 1,
    });
  }

  return lines;
}

function materialLabel(material: Material): string {
  return { bois_clair: 'bois clair', bois_fonce: 'bois foncé', ceramique_blanche: 'céramique blanche' }[
    material
  ];
}

function weightLabel(weightClass: WeightClass): string {
  return {
    lt_5: 'moins de 5 kg',
    '5_15': '5 à 15 kg',
    '15_30': '15 à 30 kg',
    gt_30: 'plus de 30 kg',
  }[weightClass];
}
