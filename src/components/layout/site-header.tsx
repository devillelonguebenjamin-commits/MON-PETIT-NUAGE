import Link from 'next/link';
import { CloudPaw } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const navigation = [
  { href: '/coffrets', label: 'Nos coffrets' },
  { href: '/personnaliser', label: 'Personnaliser' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-ivory/90 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <CloudPaw className="size-9" />
          <span className="font-serif text-lg text-text-primary">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Navigation principale" className="flex items-center gap-2 sm:gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden rounded-full px-3 py-2 text-text-muted transition-colors hover:text-text-primary sm:inline-block"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/personnaliser">
            <Button size="sm">Composer un coffret</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
