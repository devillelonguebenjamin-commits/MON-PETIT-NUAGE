import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardText, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Section, SectionHeading } from '@/components/ui/section';

/**
 * Référence visuelle du design system, en remplacement de Storybook au MVP
 * (arbitrage 3 de la note de cadrage). Non indexée.
 */
export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
};

const swatches = [
  { name: 'primary', hex: '#B85042', usage: 'Actions principales, accents éditoriaux' },
  { name: 'secondary', hex: '#E7E8D1', usage: 'Fonds de section, surfaces calmes' },
  { name: 'accent', hex: '#A7BEAE', usage: 'Survols, états secondaires' },
  { name: 'night', hex: '#3E2E28', usage: 'Registre solennel, packaging' },
  { name: 'ivory', hex: '#FDFCF8', usage: 'Fond principal du site' },
  { name: 'text-primary', hex: '#1F1B18', usage: 'Texte courant' },
  { name: 'text-muted', hex: '#6B5F58', usage: 'Texte secondaire' },
];

export default function DesignSystemPage() {
  return (
    <main id="contenu">
      <Section>
        <SectionHeading
          eyebrow="Référence interne"
          title="Design system"
          lead="Tokens, typographie et composants de base. Toute couleur du site vient d'un token ci-dessous."
        />

        <h3 className="mt-14 type-h3">Palette</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {swatches.map((s) => (
            <Card key={s.name}>
              <div className="h-20 rounded-t-xl border-b border-border" style={{ backgroundColor: s.hex }} />
              <CardBody className="p-5">
                <p className="font-medium">{s.name}</p>
                <p className="text-sm uppercase text-text-muted">{s.hex}</p>
                <p className="mt-2 text-sm text-text-muted">{s.usage}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <h3 className="mt-14 type-h3">Typographie</h3>
        <div className="mt-6 space-y-4 border-l-2 border-border pl-6">
          <p className="type-h1">Fraunces · Titre H1</p>
          <p className="type-h2">Fraunces · Titre H2</p>
          <p className="type-h3">Fraunces · Titre H3</p>
          <p>Inter · Corps de texte, 17 px, interlignage 1.65 pour une lecture reposante.</p>
          <p className="text-sm text-text-muted">Inter · Mention secondaire, 14 px.</p>
        </div>

        <h3 className="mt-14 type-h3">Boutons</h3>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="night">Solennel</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Petit</Button>
          <Button size="md">Moyen</Button>
          <Button size="lg">Grand</Button>
        </div>

        <h3 className="mt-14 type-h3">Champs de saisie</h3>
        <div className="mt-6 grid max-w-xl gap-6">
          <Input label="Prénom de votre animal" placeholder="Nala" counter={{ current: 0, max: 30 }} />
          <Input label="Phrase à graver" hint="Optionnelle, 100 caractères maximum." placeholder="Toujours près de nous" />
          <Input label="Adresse email" defaultValue="pas-un-email" error="Merci de vérifier cette adresse." />
        </div>

        <h3 className="mt-14 type-h3">Cartes</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody>
              <CardTitle>Coffret Signature</CardTitle>
              <CardText className="mt-2">Urne, empreinte encadrée, certificat et coffret d&apos;expédition premium.</CardText>
            </CardBody>
          </Card>
          <Card className="bg-night text-ivory">
            <CardBody>
              <CardTitle>Registre solennel</CardTitle>
              <CardText className="mt-2 text-ivory/75">Ivoire sur brun nuit, réservé au packaging premium.</CardText>
            </CardBody>
          </Card>
        </div>
      </Section>
    </main>
  );
}
