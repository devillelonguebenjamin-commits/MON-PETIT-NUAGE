import * as React from 'react';
import { cn } from '@/lib/utils';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: 'light' | 'sand' | 'night';
};

const tones = {
  light: 'bg-ivory',
  sand: 'bg-secondary/45',
  night: 'bg-night text-ivory',
} as const;

export function Section({ className, tone = 'light', children, ...props }: SectionProps) {
  return (
    <section className={cn('py-16 md:py-24', tones[tone], className)} {...props}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="type-h2">{title}</h2>
      {lead ? <p className="mt-4 text-text-muted">{lead}</p> : null}
    </div>
  );
}
