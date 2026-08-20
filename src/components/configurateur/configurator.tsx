'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import type { CatalogueBundle, CatalogueOption } from '@/data/catalogue';
import { buildQuoteLines, getBundle } from '@/lib/catalogue';
import { computeQuote } from '@/lib/pricing';
import { MATERIAL_LABELS, WEIGHT_CLASS_LABELS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useConfigurator } from '@/store/configurator';
import { StepBundle, StepEngraving, StepOptions, StepPhoto, StepUrn } from './steps';

const STEPS = [
  { index: 1, label: 'Coffret' },
  { index: 2, label: 'Urne' },
  { index: 3, label: 'Photo' },
  { index: 4, label: 'Gravure' },
  { index: 5, label: 'Options' },
] as const;

const LAST_STEP = STEPS.length;

function parseStep(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= LAST_STEP ? parsed : 1;
}

export function Configurator({
  bundles,
  options,
}: {
  bundles: CatalogueBundle[];
  options: CatalogueOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams.get('etape'));

  // `persist` réhydrate après le premier rendu : tant que ce n'est pas fait, on
  // affiche le squelette plutôt qu'un état par défaut qui sauterait aux yeux.
  const hydrated = useSyncExternalStore(
    useConfigurator.persist.onFinishHydration,
    () => useConfigurator.persist.hasHydrated(),
    () => false,
  );

  const bundleSlug = useConfigurator((state) => state.bundleSlug);
  const weightClass = useConfigurator((state) => state.weightClass);
  const material = useConfigurator((state) => state.material);
  const optionSlugs = useConfigurator((state) => state.optionSlugs);
  const engraving = useConfigurator((state) => state.engraving);
  const setBundle = useConfigurator((state) => state.setBundle);

  // Un coffret passé en paramètre (depuis une fiche produit) préremplit l'étape 1.
  const requestedBundle = searchParams.get('coffret');
  useEffect(() => {
    if (requestedBundle && getBundle(requestedBundle)) setBundle(requestedBundle);
  }, [requestedBundle, setBundle]);

  const goToStep = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('etape', String(next));
      // L'étape vit dans l'URL : le bouton retour du navigateur revient à
      // l'étape précédente au lieu de faire sortir du tunnel.
      router.push(`/personnaliser?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, searchParams],
  );

  const bundle = bundleSlug ? getBundle(bundleSlug) : undefined;

  const quote = useMemo(
    () =>
      computeQuote(
        buildQuoteLines({
          bundleSlug: bundleSlug ?? '',
          weightClass,
          material,
          optionSlugs,
        }),
      ),
    [bundleSlug, weightClass, material, optionSlugs],
  );

  const blocker = useMemo(() => {
    if (step === 1 && !bundleSlug) return 'Choisissez un coffret pour continuer.';
    if (step === 2 && !weightClass) return 'Indiquez son gabarit pour continuer.';
    if (step === 4 && !engraving.petName.trim()) return 'Indiquez son prénom pour continuer.';
    return null;
  }, [step, bundleSlug, weightClass, engraving.petName]);

  if (!hydrated) {
    return (
      <div className="container-page py-16" aria-busy="true">
        <div className="h-6 w-48 animate-pulse rounded-full bg-secondary" />
        <div className="mt-8 h-72 animate-pulse rounded-xl bg-secondary/60" />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Stepper steps={STEPS} current={step} onSelect={goToStep} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          {step === 1 ? <StepBundle bundles={bundles} /> : null}
          {step === 2 ? <StepUrn /> : null}
          {step === 3 ? <StepPhoto /> : null}
          {step === 4 ? <StepEngraving /> : null}
          {step === 5 ? <StepOptions options={options} bundle={bundle} /> : null}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => goToStep(step - 1)}>
                Revenir
              </Button>
            ) : null}

            {step < LAST_STEP ? (
              <Button onClick={() => goToStep(step + 1)} disabled={Boolean(blocker)}>
                Continuer
              </Button>
            ) : (
              <Button size="lg" disabled title="Le paiement arrive en semaine 3">
                Passer au paiement
              </Button>
            )}

            {blocker ? (
              <p role="status" className="text-sm text-text-muted">
                {blocker}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <Card>
            <CardBody>
              <h2 className="font-serif text-lg">Votre coffret</h2>

              <dl className="mt-5 space-y-3 text-sm">
                {quote.lines.map((line) => (
                  <div key={line.reference} className="flex items-baseline justify-between gap-4">
                    <dt className="text-text-muted">{line.label}</dt>
                    <dd className="shrink-0 tabular-nums">{formatPrice(line.unitPriceCents)}</dd>
                  </div>
                ))}

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-muted">Livraison</dt>
                  <dd className="shrink-0 text-success">Offerte</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                <span className="font-medium">Total</span>
                <span className="font-serif text-xl tabular-nums text-primary">
                  {formatPrice(quote.totalCents)}
                </span>
              </div>
              <p className="mt-1 text-right text-sm text-text-muted">TTC, dont TVA {formatPrice(quote.vatCents)}</p>

              {weightClass && material ? (
                <p className="mt-5 border-t border-border pt-4 text-sm text-text-muted">
                  {WEIGHT_CLASS_LABELS[weightClass]} · {MATERIAL_LABELS[material]}
                </p>
              ) : null}

              {engraving.petName.trim() ? (
                <p className="mt-2 text-sm text-text-muted">Gravure : {engraving.petName.trim()}</p>
              ) : null}
            </CardBody>
          </Card>

          <p className="mt-4 text-sm text-text-muted">
            Votre configuration est enregistrée sur cet appareil. Vous pouvez fermer cette page et la
            reprendre plus tard.
          </p>
        </aside>
      </div>
    </div>
  );
}
