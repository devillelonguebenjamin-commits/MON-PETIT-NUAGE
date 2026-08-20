import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-ivory hover:bg-primary-hover',
        secondary: 'bg-secondary text-text-primary hover:bg-accent',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-secondary/60',
        ghost: 'bg-transparent text-text-primary hover:bg-secondary/50',
        night: 'bg-night text-ivory hover:bg-night/90',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6',
        lg: 'h-14 px-8 text-[1.0625rem]',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
