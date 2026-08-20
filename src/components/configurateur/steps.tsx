'use client';

import { Paw, ProductPlaceholder } from '@/components/illustrations';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CatalogueBundle, CatalogueOption } from '@/data/catalogue';
import { MATERIAL_LABELS, WEIGHT_CLASS_LABELS } from '@/lib/types';
import type { Material, WeightClass } from '@/lib/types';
import { ENGRAVING_MAX, PET_NAME_MAX } from '@/lib/validation';
import { cn, formatPrice } from '@/lib/utils';
import { useConfigurator } from '@/store/configurator';
import { UrnPreview } from './urn-preview';

const WEIGHT_CLASSES: WeightClass[] = ['lt_5', '5_15', '15_30', 'gt_30'];
const MATERIALS: Material[] = ['bois_clair', 'bois_fonce', 'ceramique_blanche'];

function StepIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="type-h2">{title}</h2>
      <p className="mt-3 text-text-muted">{lead}</p>
    </div>
  );
}

/** Étape 1 — choix du coffret. */
export function StepBundle({ bundles }: { bundles: CatalogueBundle[] }) {
  const bundleSlug = useConfigurator((state) => state.bundleSlug);
  const setBundle = useConfigurator((state) => state.setBundle);

  return (
    <div>
      <StepIntro
        title="Quel coffret souhaitez-vous ?"
        lead="Vous pourrez ajuster chaque élément aux étapes suivantes, et revenir ici à tout moment."
      />

      <fieldset className="mt-8">
        <legend className="sr-only">Choix du coffret</legend>
        <div className="grid gap-5 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const selected = bundleSlug === bundle.slug;
            return (
              <label
                key={bundle.slug}
                className={cn(
                  'group flex cursor-pointer flex-col rounded-xl border bg-surface shadow-soft transition-colors',
                  // L'input est en sr-only : sans cela, un utilisateur au
                  // clavier ne verrait aucun indicateur de focus.
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ivory',
                  selected ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-accent',
                )}
              >
                <input
                  type="radio"
                  name="coffret"
                  value={bundle.slug}
                  checked={selected}
                  onChange={() => setBundle(bundle.slug)}
                  className="sr-only"
                />
                <ProductPlaceholder label={bundle.name} className="rounded-b-none" />
                <div className="flex flex-1 flex-col p-6">
                  <span className="font-serif text-xl">{bundle.name}</span>
                  <span className="mt-1 font-serif text-lg text-primary">
                    {bundle.isCustom
                      ? `À partir de ${formatPrice(bundle.basePriceCents)}`
                      : formatPrice(bundle.basePriceCents)}
                  </span>
                  <ul className="mt-4 space-y-2 text-sm text-text-muted">
                    {bundle.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Paw className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={cn(
                      'mt-6 rounded-full px-4 py-2.5 text-center text-sm transition-colors',
                      selected ? 'bg-primary text-ivory' : 'bg-secondary text-text-primary',
                    )}
                  >
                    {selected ? 'Choisi' : 'Choisir'}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

/** Étape 2 — gabarit et matériau de l'urne. */
export function StepUrn() {
  const weightClass = useConfigurator((state) => state.weightClass);
  const material = useConfigurator((state) => state.material);
  const setWeightClass = useConfigurator((state) => state.setWeightClass);
  const setMaterial = useConfigurator((state) => state.setMaterial);

  return (
    <div>
      <StepIntro
        title="Quelle urne lui conviendra ?"
        lead="Le poids nous sert uniquement à choisir le bon volume. En cas d'hésitation entre deux tailles, prenez la plus grande : nous ajustons sans surcoût."
      />

      <fieldset className="mt-8">
        <legend className="font-medium text-text-primary">Son gabarit</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WEIGHT_CLASSES.map((option) => (
            <label
              key={option}
              className={cn(
                'cursor-pointer rounded-lg border px-4 py-4 text-center transition-colors',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ivory',
                weightClass === option
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-surface hover:border-accent',
              )}
            >
              <input
                type="radio"
                name="gabarit"
                value={option}
                checked={weightClass === option}
                onChange={() => setWeightClass(option)}
                className="sr-only"
              />
              {WEIGHT_CLASS_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="font-medium text-text-primary">Le matériau</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {MATERIALS.map((option) => (
            <label
              key={option}
              className={cn(
                'cursor-pointer overflow-hidden rounded-xl border transition-colors',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ivory',
                material === option
                  ? 'border-primary ring-2 ring-primary/25'
                  : 'border-border hover:border-accent',
              )}
            >
              <input
                type="radio"
                name="materiau"
                value={option}
                checked={material === option}
                onChange={() => setMaterial(option)}
                className="sr-only"
              />
              <ProductPlaceholder label={`urne ${MATERIAL_LABELS[option]}`} ratio="aspect-square" className="rounded-none" />
              <span className="block bg-surface px-4 py-3 text-center text-sm">
                {MATERIAL_LABELS[option]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Étape 3 — photo. L'upload arrive en semaine 3, l'étape reste franche là-dessus. */
export function StepPhoto() {
  return (
    <div>
      <StepIntro
        title="Une photo de votre compagnon"
        lead="Elle nous sert de référence pour le portrait aquarelle, et reste attachée à votre commande si vous souhaitez un objet complémentaire plus tard."
      />

      <Card className="mt-8 border-dashed bg-secondary/30">
        <CardBody className="py-12 text-center">
          <Paw className="mx-auto size-10 text-primary/40" aria-hidden="true" />
          <p className="mt-4 font-medium text-text-primary">L’envoi de photo arrive très bientôt</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            Cette étape est en cours de finalisation. Vous pouvez la passer : nous vous demanderons la photo
            par email après votre commande, sans que cela retarde la fabrication.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

/** Étape 4 — gravure, avec aperçu en direct. */
export function StepEngraving() {
  const engraving = useConfigurator((state) => state.engraving);
  const material = useConfigurator((state) => state.material);
  const update = useConfigurator((state) => state.updateEngraving);

  const datesInvalid =
    Boolean(engraving.birthDate) &&
    Boolean(engraving.farewellDate) &&
    Date.parse(engraving.birthDate) > Date.parse(engraving.farewellDate);

  return (
    <div>
      <StepIntro
        title="Que souhaitez-vous faire graver ?"
        lead="Vous relirez ce texte avant la fabrication, et nous vous le renverrons par email."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <UrnPreview
          material={material ?? 'bois_clair'}
          petName={engraving.petName}
          birthDate={engraving.birthDate}
          farewellDate={engraving.farewellDate}
          engraving={engraving.engraving}
          className="order-first lg:order-last lg:sticky lg:top-28"
        />

        <div className="grid gap-6">
          <Input
            label="Son prénom"
            value={engraving.petName}
            maxLength={PET_NAME_MAX}
            counter={{ current: engraving.petName.length, max: PET_NAME_MAX }}
            placeholder="Nala"
            onChange={(event) => update({ petName: event.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date d’arrivée"
              type="date"
              value={engraving.birthDate}
              hint="Facultative"
              onChange={(event) => update({ birthDate: event.target.value })}
            />
            <Input
              label="Date de départ"
              type="date"
              value={engraving.farewellDate}
              hint="Facultative"
              {...(datesInvalid ? { error: 'La date de départ doit suivre la date d’arrivée.' } : {})}
              onChange={(event) => update({ farewellDate: event.target.value })}
            />
          </div>

          <Input
            label="Une phrase, si vous le souhaitez"
            value={engraving.engraving}
            maxLength={ENGRAVING_MAX}
            counter={{ current: engraving.engraving.length, max: ENGRAVING_MAX }}
            hint="Facultative. Quelques mots suffisent souvent."
            placeholder="Toujours près de nous"
            onChange={(event) => update({ engraving: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

/** Étape 5 — options additionnelles. */
export function StepOptions({ options, bundle }: { options: CatalogueOption[]; bundle: CatalogueBundle | undefined }) {
  const optionSlugs = useConfigurator((state) => state.optionSlugs);
  const toggleOption = useConfigurator((state) => state.toggleOption);

  return (
    <div>
      <StepIntro
        title="Souhaitez-vous ajouter quelque chose ?"
        lead="Rien n'est coché d'avance. Vous pourrez aussi commander ces objets plus tard, votre gravure restera enregistrée."
      />

      <ul className="mt-8 grid gap-4">
        {options.map((option) => {
          const included = bundle?.includedOptionSlugs.includes(option.slug) ?? false;
          const checked = included || optionSlugs.includes(option.slug);

          return (
            <li key={option.slug}>
              <label
                className={cn(
                  'flex items-center gap-5 rounded-xl border bg-surface p-5 transition-colors',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ivory',
                  included ? 'border-border opacity-70' : 'cursor-pointer',
                  !included && checked ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-accent',
                )}
              >
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Paw className="size-8 text-primary/50" aria-hidden="true" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-serif text-lg">{option.name}</span>
                    <span className="text-sm text-primary">
                      {included ? 'Compris dans votre coffret' : `+ ${formatPrice(option.priceCents)}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{option.shortDescription}</p>
                </div>

                <input
                  type="checkbox"
                  checked={checked}
                  disabled={included}
                  onChange={() => toggleOption(option.slug)}
                  className="size-5 shrink-0 accent-[#B85042]"
                  aria-label={`Ajouter ${option.name}`}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
