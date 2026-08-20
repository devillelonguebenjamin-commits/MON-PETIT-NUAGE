'use client';

import { cn } from '@/lib/utils';

export type StepperStep = { index: number; label: string };

export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: readonly StepperStep[];
  current: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <nav aria-label="Étapes de la personnalisation">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {steps.map((step) => {
          const isDone = step.index < current;
          const isCurrent = step.index === current;
          const reachable = step.index <= current && Boolean(onSelect);

          return (
            <li key={step.index} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={reachable ? () => onSelect?.(step.index) : undefined}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                  isCurrent && 'bg-primary text-ivory',
                  isDone && 'text-primary hover:bg-secondary/60',
                  !isCurrent && !isDone && 'text-text-muted',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-sm tabular-nums',
                    isCurrent ? 'bg-ivory/25 text-ivory' : 'bg-secondary text-text-primary',
                  )}
                  aria-hidden="true"
                >
                  {step.index}
                </span>
                <span className={cn(!isCurrent && 'hidden sm:inline')}>{step.label}</span>
              </button>
              {step.index < steps.length ? (
                <span aria-hidden="true" className="h-px w-4 bg-border sm:w-6" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
