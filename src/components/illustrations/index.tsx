import { cn } from '@/lib/utils';

/**
 * Illustrations maison : nuages et silhouettes de pattes, formes arrondies,
 * aucune imagerie funéraire. Elles servent d'espaces réservés en attendant les
 * photos produit, et resteront en production sur les zones sans photo.
 *
 * Toutes prennent leur couleur du contexte via `currentColor`, pour respecter
 * les deux registres de la marque.
 */

type SvgProps = React.SVGProps<SVGSVGElement>;

/** Logo : une patte dont les coussinets forment un nuage. */
export function CloudPaw({ className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Mon Petit Nuage"
      className={cn('size-10', className)}
      {...props}
    >
      <path
        d="M13.5 30.5c-3.6 0-6.5-2.7-6.5-6s2.9-6 6.5-6c.4 0 .8 0 1.2.1C15.8 14.4 19.5 11.5 24 11.5c5.2 0 9.5 3.9 9.9 8.9 3.4.4 6.1 3.2 6.1 6.6 0 3.6-3 6.5-6.7 6.5H13.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <ellipse cx="17.5" cy="37.5" rx="3.1" ry="3.6" fill="currentColor" />
      <ellipse cx="24" cy="39.2" rx="3.1" ry="3.6" fill="currentColor" />
      <ellipse cx="30.5" cy="37.5" rx="3.1" ry="3.6" fill="currentColor" />
    </svg>
  );
}

export function Paw({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-6', className)} {...props}>
      <ellipse cx="9" cy="11" rx="3.2" ry="4" fill="currentColor" />
      <ellipse cx="16" cy="8.5" rx="3.2" ry="4.2" fill="currentColor" />
      <ellipse cx="23" cy="11" rx="3.2" ry="4" fill="currentColor" />
      <path
        d="M16 15.5c4.2 0 7.5 3 7.5 6.6 0 2.8-2.2 4.4-5 4.4-1 0-1.8-.2-2.5-.4-.7.2-1.5.4-2.5.4-2.8 0-5-1.6-5-4.4 0-3.6 3.3-6.6 7.5-6.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Cloud({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 64 32" fill="none" aria-hidden="true" className={cn('w-16', className)} {...props}>
      <path
        d="M14 28c-5 0-9-3.6-9-8s4-8 9-8h.8C16.4 6.6 21.2 3 27 3c6.8 0 12.4 4.9 13 11.2 4.6.5 8 4 8 8.1 0 3.1-2.4 5.7-5.6 5.7H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Espace réservé pour une photo produit à venir. Volontairement non
 * photographique : personne ne doit le confondre avec une image définitive.
 */
export function ProductPlaceholder({
  label,
  className,
  ratio = 'aspect-4/3',
}: {
  label: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Visuel à venir : ${label}`}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl bg-secondary/70',
        ratio,
        className,
      )}
    >
      <Cloud className="absolute -left-4 top-4 w-28 text-ivory/70" />
      <Cloud className="absolute -right-6 bottom-6 w-36 text-ivory/50" />
      <Paw className="size-12 text-primary/35" />
    </div>
  );
}
