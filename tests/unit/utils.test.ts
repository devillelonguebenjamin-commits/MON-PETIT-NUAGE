import { describe, expect, it } from 'vitest';
import { cn, formatPrice } from '@/lib/utils';

describe('cn', () => {
  /**
   * Régression : `text-base-light` était interprété par tailwind-merge comme la
   * taille de police `text-base` et se faisait écraser par `text-sm`, ce qui
   * effaçait la couleur du texte des boutons. Les tokens ont été renommés pour
   * lever l'ambiguïté — ces tests verrouillent le comportement.
   */
  it('conserve la couleur du texte à côté d’une taille de police', () => {
    const result = cn('bg-primary text-ivory', 'text-sm');
    expect(result).toContain('text-ivory');
    expect(result).toContain('text-sm');
  });

  it('conserve la couleur du texte à côté d’une utilité de titre', () => {
    const result = cn('text-text-muted', 'type-h3');
    expect(result).toContain('text-text-muted');
    expect(result).toContain('type-h3');
  });

  it('laisse la dernière classe l’emporter sur un vrai conflit', () => {
    expect(cn('bg-primary', 'bg-night')).toBe('bg-night');
  });
});

describe('formatPrice', () => {
  it('affiche les prix ronds sans décimales', () => {
    expect(formatPrice(24900).replace(/ | /g, ' ')).toBe('249 €');
    expect(formatPrice(14900).replace(/ | /g, ' ')).toBe('149 €');
  });

  it('affiche les centimes quand il y en a', () => {
    expect(formatPrice(22410).replace(/ | /g, ' ')).toBe('224,10 €');
  });

  it('gère la gratuité', () => {
    expect(formatPrice(0).replace(/ | /g, ' ')).toBe('0 €');
  });
});
