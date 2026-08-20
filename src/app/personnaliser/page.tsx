import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Configurator } from '@/components/configurateur/configurator';
import { getBundles, getOptions } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Personnaliser votre coffret',
  description:
    'Composez le coffret mémoriel de votre compagnon en cinq étapes : coffret, urne, photo, gravure et options. Prix affiché à chaque étape, livraison offerte.',
  alternates: { canonical: '/personnaliser' },
};

/**
 * Coque statique : le catalogue est rendu au build et transmis en props au
 * tunnel, qui est le seul îlot client de la page.
 */
export default function PersonnaliserPage() {
  return (
    <main id="contenu">
      <Suspense fallback={<div className="container-page py-16" aria-busy="true" />}>
        <Configurator bundles={getBundles()} options={getOptions()} />
      </Suspense>
    </main>
  );
}
