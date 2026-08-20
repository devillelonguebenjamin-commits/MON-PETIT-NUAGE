import type { Metadata } from 'next';
import Link from 'next/link';
import { Paw, ProductPlaceholder } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardText, CardTitle } from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/ui/section';
import { getBundles, getOptions } from '@/lib/catalogue';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nos coffrets mémoriels',
  description:
    "Trois coffrets pour célébrer le passage de votre chien ou de votre chat : urne gravée, empreinte encadrée, bijou, portrait. Fabrication artisanale, livraison offerte.",
  alternates: { canonical: '/coffrets' },
};

export default function CoffretsPage() {
  const bundles = getBundles();
  const options = getOptions();

  return (
    <main id="contenu">
      <Section>
        <SectionHeading
          eyebrow="Nos coffrets"
          title="Trois façons de leur rendre hommage"
          lead="Chaque coffret part de la même urne signature, tournée à la main et gravée à son prénom. Vous pouvez aussi composer le vôtre, élément par élément."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <Card key={bundle.slug} className="flex h-full flex-col">
              <ProductPlaceholder label={bundle.name} className="rounded-b-none" />
              <CardBody className="flex flex-1 flex-col">
                <CardTitle>{bundle.name}</CardTitle>
                <p className="mt-1 font-serif text-xl text-primary">
                  {bundle.isCustom
                    ? `À partir de ${formatPrice(bundle.basePriceCents)}`
                    : formatPrice(bundle.basePriceCents)}
                </p>
                <CardText className="mt-3">{bundle.tagline}</CardText>

                <ul className="mt-5 space-y-2 text-sm text-text-muted">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Paw className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex-1" />
                <div className="flex flex-col gap-2">
                  <Link href={`/personnaliser?coffret=${bundle.slug}`} className="block">
                    <Button block variant={bundle.slug === 'coffret-signature' ? 'primary' : 'outline'}>
                      Choisir ce coffret
                    </Button>
                  </Link>
                  <Link
                    href={`/coffrets/${bundle.slug}`}
                    className="text-center text-sm text-text-muted underline underline-offset-4 hover:text-text-primary"
                  >
                    Voir le détail
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeading
          eyebrow="À ajouter si vous le souhaitez"
          title="Les compléments"
          lead="Aucun n'est coché d'avance. Vous les ajoutez à l'étape des options, ou plus tard."
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {options.map((option) => (
            <li key={option.slug}>
              <Card className="h-full">
                <CardBody className="flex items-start gap-5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Paw className="size-7 text-primary/60" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-serif text-lg">{option.name}</h3>
                      <span className="text-sm text-primary">+ {formatPrice(option.priceCents)}</span>
                    </div>
                    <CardText className="mt-1.5 text-sm">{option.shortDescription}</CardText>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
