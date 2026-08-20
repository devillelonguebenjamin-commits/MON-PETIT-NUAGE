import Link from 'next/link';
import { CloudPaw } from '@/components/illustrations';
import { siteConfig } from '@/config/site';

const columns = [
  {
    title: 'Nos coffrets',
    links: [
      { href: '/coffrets', label: 'Les trois coffrets' },
      { href: '/coffrets/coffret-douceur', label: 'Coffret Douceur' },
      { href: '/coffrets/coffret-signature', label: 'Coffret Signature' },
      { href: '/personnaliser', label: 'Composer le vôtre' },
    ],
  },
  {
    title: 'La maison',
    links: [
      { href: '/notre-approche', label: 'Notre approche' },
      { href: '/nos-artisans', label: 'Nos artisans' },
      { href: '/partenaires', label: 'Nos partenaires' },
    ],
  },
  {
    title: 'Informations',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/cgv', label: 'Conditions générales de vente' },
      { href: '/confidentialite', label: 'Données personnelles' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 text-primary">
              <CloudPaw className="size-9" />
              <span className="font-serif text-lg text-text-primary">{siteConfig.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-text-muted">
              Coffrets mémoriels façonnés à la main dans l&apos;Ouest de la France, pour célébrer le passage de
              ceux qui nous ont quittés.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-medium text-text-primary">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Une question ? Écrivez-nous à{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="underline underline-offset-4">
              {siteConfig.contact.email}
            </a>{' '}
            ou appelez le{' '}
            <a href={`tel:${siteConfig.contact.phone}`} className="underline underline-offset-4">
              {siteConfig.contact.phoneDisplay}
            </a>
            .
          </p>
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
