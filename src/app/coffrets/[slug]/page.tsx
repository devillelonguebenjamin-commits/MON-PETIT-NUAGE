import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Paw, ProductPlaceholder } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { siteConfig } from '@/config/site';
import { bundles } from '@/data/catalogue';
import { getBundle, getOption } from '@/lib/catalogue';
import { formatPrice } from '@/lib/utils';

export const revalidate = 3600;

export function generateStaticParams() {
  return bundles.map((bundle) => ({ slug: bundle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundle(slug);
  if (!bundle) return {};

  return {
    title: bundle.seoTitle,
    description: bundle.seoDescription,
    alternates: { canonical: `/coffrets/${bundle.slug}` },
    openGraph: { title: bundle.seoTitle, description: bundle.seoDescription, type: 'website' },
  };
}

export default async function CoffretPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = getBundle(slug);
  if (!bundle) notFound();

  const includedOptions = bundle.includedOptionSlugs
    .map((optionSlug) => getOption(optionSlug))
    .filter((option) => option !== undefined);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: bundle.seoDescription,
    brand: { '@type': 'Brand', name: siteConfig.name },
    material: bundle.materials,
    offers: {
      '@type': 'Offer',
      price: (bundle.basePriceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/coffrets/${bundle.slug}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'EUR' },
      },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: bundle.faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };

  return (
    <main id="contenu">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productJsonLd, faqJsonLd]) }}
      />

      <Section className="pb-10">
        <nav aria-label="Fil d’Ariane" className="mb-8 text-sm text-text-muted">
          <Link href="/coffrets" className="underline underline-offset-4 hover:text-text-primary">
            Nos coffrets
          </Link>
          <span aria-hidden="true"> · </span>
          <span>{bundle.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-4">
            <ProductPlaceholder label={`${bundle.name}, mise en situation`} />
            <div className="grid grid-cols-3 gap-4">
              <ProductPlaceholder label="détail de la gravure" ratio="aspect-square" />
              <ProductPlaceholder label="détail de la matière" ratio="aspect-square" />
              <ProductPlaceholder label="coffret ouvert" ratio="aspect-square" />
            </div>
          </div>

          <div>
            <h1 className="type-h1">{bundle.name}</h1>
            <p className="mt-3 font-serif text-2xl text-primary">
              {bundle.isCustom
                ? `À partir de ${formatPrice(bundle.basePriceCents)}`
                : formatPrice(bundle.basePriceCents)}
            </p>
            <p className="mt-4 text-text-muted">{bundle.tagline}</p>

            <ul className="mt-6 space-y-2.5">
              {bundle.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-text-primary">
                  <Paw className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href={`/personnaliser?coffret=${bundle.slug}`} className="block sm:inline-block">
                <Button size="lg" block>
                  Personnaliser ce coffret
                </Button>
              </Link>
              <p className="mt-3 text-sm text-text-muted">
                Fabrication en {siteConfig.leadTimeDays.min} à {siteConfig.leadTimeDays.max} jours ouvrés ·
                Livraison offerte · Aperçu de la gravure avant fabrication
              </p>
            </div>

            <Card className="mt-8 bg-secondary/40">
              <CardBody className="text-sm">
                <p className="font-medium text-text-primary">Vous n’avez pas encore les cendres ?</p>
                <p className="mt-1.5 text-text-muted">
                  Vous pouvez commander dès maintenant. Nous fabriquons votre coffret pendant le délai de
                  remise, qui est d’environ quatorze jours, et nous vous l’envoyons ensuite.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="type-h2">À propos de ce coffret</h2>
            <div className="mt-6 space-y-4 text-text-muted">
              {bundle.longDescription.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            {includedOptions.length > 0 ? (
              <>
                <h3 className="mt-10 type-h3">Ce qui est compris</h3>
                <ul className="mt-4 space-y-3">
                  {includedOptions.map((option) => (
                    <li key={option.slug} className="flex items-start gap-2.5 text-text-muted">
                      <Paw className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        <span className="text-text-primary">{option.name}</span> — {option.shortDescription}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <aside>
            <Card>
              <CardBody className="space-y-5 text-sm">
                <div>
                  <h3 className="font-medium text-text-primary">Matériaux</h3>
                  <p className="mt-1.5 text-text-muted">{bundle.materials}</p>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Dimensions</h3>
                  <p className="mt-1.5 text-text-muted">{bundle.dimensions}</p>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Délai de fabrication</h3>
                  <p className="mt-1.5 text-text-muted">
                    {siteConfig.leadTimeDays.min} à {siteConfig.leadTimeDays.max} jours ouvrés, puis
                    expédition suivie.
                  </p>
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>
      </Section>

      <Section>
        <h2 className="type-h2">Questions fréquentes</h2>
        <dl className="mt-8 max-w-3xl divide-y divide-border border-t border-border">
          {bundle.faq.map((entry) => (
            <div key={entry.question} className="py-6">
              <dt className="font-medium text-text-primary">{entry.question}</dt>
              <dd className="mt-2 text-text-muted">{entry.answer}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-text-muted">
          Une autre question ? Écrivez-nous à{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="underline underline-offset-4">
            {siteConfig.contact.email}
          </a>{' '}
          ou appelez le {siteConfig.contact.phoneDisplay}, nous répondons nous-mêmes.
        </p>
      </Section>
    </main>
  );
}
