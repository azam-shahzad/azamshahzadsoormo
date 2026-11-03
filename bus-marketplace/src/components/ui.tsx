import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button as MotionButton, type ButtonProps as MotionButtonProps } from '@animate-ui/react/primitives/buttons/button';
import { Select, Checkbox, Tooltip } from '@animate-ui/react/primitives/radix-ui';
import { cn } from '../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-paper',
  ghost: 'text-ink-2 hover:bg-sunken',
  dark: 'bg-ink text-white hover:bg-ink-2',
  light: 'bg-white text-ink hover:bg-white/90',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-[15px] gap-2',
  icon: 'size-9 p-0',
};

export type ButtonProps = MotionButtonProps & { variant?: Variant; size?: Size };

/** Pressable button: presses down on Animate UI's press spring, colour-only hover. */
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <MotionButton
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'ok' | 'brass' | 'warn' | 'dark'; className?: string }) {
  const tones = {
    neutral: 'bg-sunken text-ink-2',
    accent: 'bg-accent-soft text-accent',
    ok: 'bg-ok-soft text-ok',
    brass: 'bg-brass-soft text-brass',
    warn: 'bg-warn-soft text-warn',
    dark: 'bg-ink/85 text-white backdrop-blur-sm',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, action, className }: { eyebrow?: string; title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-brass uppercase">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

type Option = { value: string; label: string };

/** Labelled select built on Animate UI's Radix Select (grows from its trigger). */
export function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  hideLabel,
  triggerClassName,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  hideLabel?: boolean;
  triggerClassName?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-xs font-medium text-muted', hideLabel && 'sr-only')}>
        {label}
      </label>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          id={id}
          className={cn(
            'group flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 text-left text-sm text-ink transition-[border-color,box-shadow] duration-200 hover:border-line-strong data-[placeholder]:text-faint',
            triggerClassName,
          )}
        >
          <span className="truncate">
            <Select.Value placeholder={placeholder} />
          </span>
          <Select.Icon>
            <ChevronDown className="size-4 shrink-0 text-faint transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop"
          >
            <Select.Viewport>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className="relative flex cursor-pointer items-center justify-between gap-6 rounded-lg py-2 pr-2.5 pl-3 text-sm text-ink outline-none select-none data-[highlighted]:bg-sunken"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-4 text-accent" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

/** Checkbox row with an animated check (Animate UI's Radix Checkbox). */
export function CheckRow({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: (v: boolean) => void; count?: number }) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-line-strong bg-surface transition-[background-color,border-color] duration-200 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Checkbox.Indicator className="text-white">
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2.5 6.5 5 9l4.5-5.5" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between text-sm text-ink-2">
        <span>{label}</span>
        {count !== undefined && <span className="tabular text-xs text-faint">{count}</span>}
      </label>
    </div>
  );
}

export function Hint({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content sideOffset={6} className="z-50 max-w-60 rounded-lg bg-ink px-2.5 py-1.5 text-xs leading-relaxed text-white shadow-pop">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
