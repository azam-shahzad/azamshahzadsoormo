import * as React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, UploadCloud } from 'lucide-react';
import { Switch } from '@animate-ui/react/primitives/radix-ui';
import { blur, ReducedMotionConfig, shift, transition, useShouldReduceMotion, useTempoTransition } from '@animate-ui/react/utils/motion';
import { bodyTypes, emissions, fuels, makes, type BodyType } from '../data/buses';
import { BusArt } from '../components/BusArt';
import { Button, SelectField } from '../components/ui';
import { cn, formatEUR } from '../lib/format';

const stepsMeta = ['Vehicle', 'Details', 'Price', 'Review'];
const plural: Record<BodyType, string> = { Coach: 'coaches', 'City bus': 'city buses', Intercity: 'intercity buses', Minibus: 'minibuses', 'Double-decker': 'double-deckers' };

function Steps({ step, direction, children }: { step: number; direction: 1 | -1; children: React.ReactNode }) {
  const reduce = useShouldReduceMotion();
  const leave = useTempoTransition(transition.panelOut);
  const enter = useTempoTransition(transition.panelIn);
  const ref = React.useRef<HTMLDivElement>(null);
  const away = (sign: number) => ({ opacity: 0, filter: blur.panel, transform: `translateX(${reduce ? 0 : sign * shift.step}px)` });
  const variants = {
    enter: (dir: number) => away(dir),
    center: { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px)', transition: enter },
    exit: (dir: number) => ({ ...away(-dir), transition: leave }),
  };
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={step}
        ref={ref}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        onAnimationComplete={(name) => {
          if (name !== 'center') return;
          ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-[border-color] duration-200 hover:border-line-strong focus:border-accent';

export function Sell() {
  const [{ step, direction }, setStep] = React.useState({ step: 0, direction: 1 as 1 | -1 });
  const go = (to: number) => setStep({ step: to, direction: to > step ? 1 : -1 });
  const [data, setData] = React.useState({ body: 'Coach' as BodyType, make: 'Mercedes-Benz', model: 'Tourismo', year: '2019', km: '412000', seats: '49', fuel: 'Diesel', emission: 'Euro 6', price: '164500', vat: true });
  const [published, setPublished] = React.useState(false);
  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));
  const estimate = Math.round((Number(data.price) || 0) * 0.94) / 1000;

  return (
    <div className="container-page pt-8 lg:pt-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-muted">Sell on Fleetmark</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">List a bus in four steps</h1>
        <p className="mt-2 max-w-2xl text-muted">Free for single vehicles. Your listing is reviewed within one business day and published to buyers in 31 countries.</p>

        {/* Stepper */}
        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Progress">
          {stepsMeta.map((s, i) => (
            <li key={s}>
              <div className="h-1 overflow-hidden rounded-full bg-sunken">
                <div className={cn('h-full w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out motion-reduce:transition-none', i <= step ? 'scale-x-100' : 'scale-x-0')} />
              </div>
              <p className={cn('mt-2 text-xs font-medium sm:text-sm', i <= step ? 'text-ink' : 'text-faint')} aria-current={i === step ? 'step' : undefined}>
                <span className="tabular">{i + 1}.</span> {s}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            {published ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-ok-soft text-ok">
                  <Check className="size-6" />
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-ink">Submitted for review</h2>
                <p className="mt-2 text-muted">We’ll notify you by email once your listing is live, usually within a business day.</p>
                <Button asChild className="mt-6">
                  <Link to="/dashboard">Go to Seller hub</Link>
                </Button>
              </div>
            ) : (
              <ReducedMotionConfig>
                <Steps step={step} direction={direction}>
                  {step === 0 && (
                    <section>
                      <h2 tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
                        What are you selling?
                      </h2>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {bodyTypes.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => set({ body: b })}
                            aria-pressed={data.body === b}
                            className={cn(
                              'cursor-pointer overflow-hidden rounded-2xl border text-left transition-[border-color,box-shadow] duration-200',
                              data.body === b ? 'border-accent ring-2 ring-accent/20' : 'border-line hover:border-line-strong',
                            )}
                          >
                            <BusArt body={b} livery="#24497a" className="aspect-[2/1] w-full" />
                            <span className="block px-3 py-2.5 text-sm font-medium text-ink">{b}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <SelectField label="Make" value={data.make} onValueChange={(v) => set({ make: v })} options={makes.map((m) => ({ value: m, label: m }))} />
                        <label className="text-xs font-medium text-muted">
                          Model
                          <input className={inputClass} value={data.model} onChange={(e) => set({ model: e.target.value })} />
                        </label>
                      </div>
                    </section>
                  )}
                  {step === 1 && (
                    <section>
                      <h2 tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
                        Key details
                      </h2>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-medium text-muted">
                          Year of manufacture
                          <input inputMode="numeric" className={inputClass} value={data.year} onChange={(e) => set({ year: e.target.value })} />
                        </label>
                        <label className="text-xs font-medium text-muted">
                          Mileage (km)
                          <input inputMode="numeric" className={inputClass} value={data.km} onChange={(e) => set({ km: e.target.value })} />
                        </label>
                        <label className="text-xs font-medium text-muted">
                          Seats
                          <input inputMode="numeric" className={inputClass} value={data.seats} onChange={(e) => set({ seats: e.target.value })} />
                        </label>
                        <SelectField label="Drivetrain" value={data.fuel} onValueChange={(v) => set({ fuel: v })} options={fuels.map((m) => ({ value: m, label: m }))} />
                        <SelectField label="Emission class" value={data.emission} onValueChange={(v) => set({ emission: v })} options={emissions.map((m) => ({ value: m, label: m }))} />
                      </div>
                      <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-line-strong bg-paper px-6 py-10 text-center">
                        <UploadCloud className="size-6 text-muted" />
                        <p className="mt-2 text-sm font-medium text-ink">Drag photos here or browse</p>
                        <p className="text-xs text-muted">At least 8 photos recommended · JPG or PNG up to 20 MB</p>
                      </div>
                    </section>
                  )}
                  {step === 2 && (
                    <section>
                      <h2 tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
                        Set your price
                      </h2>
                      <label className="mt-5 block text-xs font-medium text-muted">
                        Net price (EUR, excl. VAT)
                        <div className="relative">
                          <span className="pointer-events-none absolute top-1/2 left-3.5 mt-0.75 -translate-y-1/2 text-sm text-faint">€</span>
                          <input inputMode="numeric" className={cn(inputClass, 'pl-8 text-lg font-semibold')} value={data.price} onChange={(e) => set({ price: e.target.value.replace(/[^\d]/g, '') })} />
                        </div>
                      </label>
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-sunken p-4">
                        <div>
                          <p className="text-sm font-medium text-ink">VAT can be shown separately</p>
                          <p className="text-xs text-muted">Turn off for margin-scheme vehicles</p>
                        </div>
                        <Switch.Root
                          checked={data.vat}
                          onCheckedChange={(v) => set({ vat: v })}
                          aria-label="VAT can be shown separately"
                          className="relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-line-strong p-0.5 transition-colors duration-200 data-[state=checked]:justify-end data-[state=checked]:bg-accent"
                        >
                          <Switch.Thumb className="block size-5 rounded-full bg-white shadow-card" />
                        </Switch.Root>
                      </div>
                      <p className="mt-4 text-sm text-muted">
                        Market estimate for comparable {plural[data.body]}: <span className="font-semibold text-ink">€{estimate.toFixed(0)}k – €{(estimate * 1.12).toFixed(0)}k</span>
                      </p>
                    </section>
                  )}
                  {step === 3 && (
                    <section>
                      <h2 tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
                        Review & submit
                      </h2>
                      <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
                        {[
                          ['Vehicle', `${data.make} ${data.model}`],
                          ['Class', data.body],
                          ['Year', data.year],
                          ['Mileage', `${Number(data.km).toLocaleString('en-IE')} km`],
                          ['Seats', data.seats],
                          ['Drivetrain', `${data.fuel} · ${data.emission}`],
                          ['Net price', formatEUR(Number(data.price) || 0)],
                          ['VAT', data.vat ? 'Deductible' : 'Margin scheme'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
                            <dt className="text-muted">{k}</dt>
                            <dd className="font-medium text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                </Steps>
              </ReducedMotionConfig>
            )}

            {!published && (
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                {step < 3 ? (
                  <Button onClick={() => go(step + 1)}>
                    Continue to {stepsMeta[step + 1].toLowerCase()} <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setPublished(true)}>Submit listing</Button>
                )}
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Live preview</p>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <BusArt body={data.body} livery="#24497a" className="aspect-[16/10] w-full" />
                <div className="p-4">
                  <p className="text-xs text-faint uppercase">
                    {data.body} · {data.year}
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    {data.make} {data.model}
                  </p>
                  <p className="tabular mt-3 text-xl font-semibold text-ink">{formatEUR(Number(data.price) || 0)}</p>
                  <p className="text-xs text-faint">{data.vat ? 'Net · VAT deductible' : 'Margin scheme · no VAT'}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
