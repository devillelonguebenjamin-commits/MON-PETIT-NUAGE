import Link from 'next/link';
import { Cloud, Paw, ProductPlaceholder } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardText, CardTitle } from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/ui/section';
import { siteConfig } from '@/config/site';
import { getBundles } from '@/lib/catalogue';
import { testimonials } from '@/data/catalogue';
import { formatPrice } from '@/lib/utils';

const steps = [
  {
    title: 'Votre crématorium partenaire',
    text: "Il vous remet une carte avec un lien vers votre espace de personnalisation. Rien à faire sur place.",
  },
  {
    title: 'Votre personnalisation en ligne',
    text: "Vous choisissez le coffret, ajoutez une photo et le prénom à graver. Comptez huit minutes, à votre rythme.",
  },
  {
    title: 'La réception chez vous',
    text: `Fabrication en ${siteConfig.leadTimeDays.min} à ${siteConfig.leadTimeDays.max} jours ouvrés, livraison offerte et emballage soigné.`,
  },
];

/** Partenaires fictifs tant qu'aucun accord n'est signé (cadrage §6). */
const partners = [
  'Crématorium animalier de la Loire',
  'Crématorium animalier de Haute-Bretagne',
  'Clinique vétérinaire des Mauges',
];

export default function HomePage() {
  const bundles = getBundles();

  return (
    <main id="contenu">
      <section className="relative overflow-hidden bg-secondary/40 py-20 md:py-28">
        <Cloud className="pointer-events-none absolute -left-10 top-10 w-56 text-ivory/60" />
        <Cloud className="pointer-events-none absolute -right-16 bottom-0 w-72 text-ivory/40" />

        <div className="container-page relative grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="type-h1">Garder leur souvenir tout près de vous</h1>
            <p className="mt-6 max-w-prose text-text-muted">
              Des coffrets mémoriels façonnés à la main dans l&apos;Ouest de la France, pensés pour célébrer
              le passage de ceux qui nous ont quittés.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/coffrets">
                <Button size="lg">Découvrir nos coffrets</Button>
              </Link>
              <Link href="/personnaliser">
                <Button size="lg" variant="outline">
                  Composer le vôtre
                </Button>
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-text-muted">
              <Paw className="size-5 text-primary" aria-hidden="true" />
              Livraison offerte · Fabrication artisanale · Conseil au téléphone
            </p>
          </div>

          <ProductPlaceholder label="photo d’accueil, un animal vivant en lumière douce" />
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Comment ça se passe"
          title="Trois étapes, à votre rythme"
          lead="Vous n'avez jamais à décider dans l'urgence. Chaque étape peut être reprise plus tard, tout est conservé."
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardBody>
                  <span
                    className="flex size-9 items-center justify-center rounded-full bg-secondary font-serif text-primary"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <CardTitle className="mt-4">{step.title}</CardTitle>
                  <CardText className="mt-2">{step.text}</CardText>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="sand">
        <SectionHeading
          eyebrow="Nos coffrets"
          title="Trois façons de leur rendre hommage"
          lead="Chaque coffret part de la même urne signature, gravée à son prénom."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {bundles.map((bundle) => (
            <Card key={bundle.slug} className="flex h-full flex-col">
              <ProductPlaceholder label={bundle.name} className="rounded-b-none" />
              <CardBody className="flex flex-1 flex-col">
                <CardTitle>{bundle.name}</CardTitle>
                <p className="mt-1 font-serif text-xl text-primary">
                  {bundle.isCustom ? `À partir de ${formatPrice(bundle.basePriceCents)}` : formatPrice(bundle.basePriceCents)}
                </p>
                <CardText className="mt-3">{bundle.tagline}</CardText>
                <ul className="mt-4 space-y-2 text-sm text-text-muted">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Paw className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex-1" />
                <Link href={`/coffrets/${bundle.slug}`} className="block">
                  <Button block variant={bundle.slug === 'coffret-signature' ? 'primary' : 'outline'}>
                    Choisir
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Ils nous ont fait confiance" title="Quelques mots reçus" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author}>
              <Card className="h-full">
                <CardBody>
                  <Paw className="size-6 text-accent" aria-hidden="true" />
                  <blockquote className="mt-4 text-text-primary">« {testimonial.quote} »</blockquote>
                  <figcaption className="mt-4 text-sm text-text-muted">
                    {testimonial.author}, pour {testimonial.petName}
                  </figcaption>
                </CardBody>
              </Card>
            </figure>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeading
          eyebrow="Ils nous accompagnent"
          title="Nos crématoriums et vétérinaires partenaires"
          lead="Nous travaillons main dans la main avec les établissements qui vous accompagnent sur place."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <li
              key={partner}
              className="flex items-center gap-3 rounded-lg border border-border bg-ivory px-5 py-4 text-sm text-text-muted"
            >
              <Cloud className="w-10 shrink-0 text-accent" aria-hidden="true" />
              {partner}
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
