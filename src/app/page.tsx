import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardText, CardTitle } from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/ui/section';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <main id="contenu">
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="type-h1">Garder leur souvenir tout près de vous</h1>
            <p className="mt-6 max-w-prose text-text-muted">
              Des coffrets mémoriels façonnés à la main dans l&apos;Ouest de la France, pensés pour célébrer le
              passage de ceux qui nous ont quittés.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/coffrets">
                <Button size="lg">Découvrir nos coffrets</Button>
              </Link>
              <Link href="/personnaliser">
                <Button size="lg" variant="outline">
                  Personnaliser
                </Button>
              </Link>
            </div>
          </div>
          <div className="aspect-4/3 rounded-xl border border-border bg-ivory shadow-soft" aria-hidden="true" />
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Comment ça se passe"
          title="Trois étapes, à votre rythme"
          lead="Nous nous occupons du reste. Vous n'avez jamais à décider dans l'urgence."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Votre crématorium partenaire',
              text: "Il vous remet une carte avec un lien vers votre espace de personnalisation.",
            },
            {
              title: 'Votre personnalisation en ligne',
              text: 'Vous choisissez le coffret, ajoutez une photo et le prénom à graver. Environ huit minutes.',
            },
            {
              title: 'La réception chez vous',
              text: `Fabrication en ${siteConfig.leadTimeDays.min} à ${siteConfig.leadTimeDays.max} jours, livraison offerte, emballage soigné.`,
            },
          ].map((step, i) => (
            <Card key={step.title}>
              <CardBody>
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-serif text-primary">
                  {i + 1}
                </span>
                <CardTitle className="mt-4">{step.title}</CardTitle>
                <CardText className="mt-2">{step.text}</CardText>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
