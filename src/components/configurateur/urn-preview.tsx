'use client';

import { MATERIAL_LABELS } from '@/lib/types';
import type { Material } from '@/lib/types';
import { cn } from '@/lib/utils';

const MATERIAL_COLORS: Record<Material, { body: string; grain: string; text: string }> = {
  bois_clair: { body: '#D9C3A5', grain: '#C7AC8A', text: '#4A3A2C' },
  bois_fonce: { body: '#7A5A44', grain: '#6A4C39', text: '#F4EADF' },
  ceramique_blanche: { body: '#F2EFE9', grain: '#E4DFD6', text: '#3E2E28' },
};

/** Découpe la phrase gravée en lignes courtes, comme le ferait l'atelier. */
function wrapPhrase(phrase: string, maxChars = 26, maxLines = 4): string[] {
  const words = phrase.trim().slice(0, 100).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines.slice(0, maxLines);
}

function formatFrenchDate(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR').format(parsed);
}

/**
 * Aperçu de la gravure. Rendu en SVG plutôt qu'en canvas : le texte reste
 * sélectionnable et lisible par un lecteur d'écran, et le coût pour la
 * performance de la page est nul.
 */
export function UrnPreview({
  material,
  petName,
  birthDate,
  farewellDate,
  engraving,
  className,
}: {
  material: Material;
  petName: string;
  birthDate: string;
  farewellDate: string;
  engraving: string;
  className?: string;
}) {
  const colors = MATERIAL_COLORS[material];
  const trimmedName = petName.trim();
  const name = trimmedName || 'Son prénom';
  const from = formatFrenchDate(birthDate);
  const to = formatFrenchDate(farewellDate);
  const dates = from && to ? `${from} — ${to}` : from || to;
  const phraseLines = wrapPhrase(engraving);

  const spoken = [
    `Aperçu de la gravure sur une urne en ${MATERIAL_LABELS[material].toLowerCase()}.`,
    trimmedName ? `Prénom gravé : ${trimmedName}.` : 'Le prénom reste à compléter.',
    dates ? `Dates : ${dates}.` : null,
    engraving.trim() ? `Phrase : ${engraving.trim()}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={cn('rounded-xl border border-border bg-secondary/40 p-6', className)}>
      <svg viewBox="0 0 260 300" className="mx-auto w-full max-w-64" role="img" aria-label={spoken}>
        <defs>
          <linearGradient id="urn-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.body} />
            <stop offset="100%" stopColor={colors.grain} />
          </linearGradient>
        </defs>

        <ellipse cx="130" cy="286" rx="76" ry="9" fill="#3E2E28" opacity="0.12" />
        <rect x="46" y="42" width="168" height="240" rx="26" fill="url(#urn-body)" />
        <rect x="58" y="26" width="144" height="22" rx="11" fill={colors.grain} />

        <text
          x="130"
          y="146"
          textAnchor="middle"
          fill={colors.text}
          style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28 }}
        >
          {name.slice(0, 30)}
        </text>

        {dates ? (
          <text
            x="130"
            y="176"
            textAnchor="middle"
            fill={colors.text}
            opacity="0.75"
            style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13 }}
          >
            {dates}
          </text>
        ) : null}

        {phraseLines.map((line, index) => (
          <text
            key={line}
            x="130"
            y={204 + index * 18}
            textAnchor="middle"
            fill={colors.text}
            opacity="0.85"
            style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11 }}
          >
            {line}
          </text>
        ))}
      </svg>

      <figcaption className="mt-4 text-center text-sm text-text-muted">
        Aperçu indicatif · {MATERIAL_LABELS[material]}
      </figcaption>
    </figure>
  );
}
