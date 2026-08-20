import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  counter?: { current: number; max: number };
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, counter, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
          {counter ? (
            <span className="text-sm tabular-nums text-text-muted" aria-hidden="true">
              {counter.current}/{counter.max}
            </span>
          ) : null}
        </div>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          className={cn(
            'h-12 rounded-md border bg-surface px-4 text-text-primary placeholder:text-text-muted/70',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
        {hint && !error ? (
          <p id={hintId} className="text-sm text-text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
