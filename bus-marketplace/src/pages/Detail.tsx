import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, MapPin, MessageSquare, Phone, ShieldCheck, Star, Clock, FileCheck2, Check, Zap, Truck, Share2 } from 'lucide-react';
import { Dialog, Slider, ToggleGroup } from '@animate-ui/react/primitives/radix-ui';
import { Tabs, TabsList, TabsTrigger, TabsHighlight, TabsHighlightItem, TabsContents, TabsContent } from '@animate-ui/react/primitives/tabs';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import { Highlight, HighlightItem } from '@animate-ui/react/primitives/effects/highlight';
import { ReducedMotionConfig, blur, spring, transition, useTempoTransition } from '@animate-ui/react/utils/motion';
import { busById, buses, busTitle, sellerById, type Bus } from '../data/buses';
import { BusArt } from '../components/BusArt';
import { BusCard, FavoriteButton } from '../components/BusCard';
import { Badge, Button, Hint, SectionHeading } from '../components/ui';
import { cn, formatEUR, formatNumber, grossPrice, monthlyPayment, vatRates } from '../lib/format';

const views = [
  { key: 'side', label: 'Side profile', view: 'side', tone: 'studio' },
  { key: 'front', label: 'Front detail', view: 'front', tone: 'dusk' },
  { key: 'depot', label: 'At the depot', view: 'side', tone: 'depot' },
  { key: 'interior', label: 'Seat layout', view: 'interior', tone: 'studio' },
] as const;

function Gallery({ bus }: { bus: Bus }) {
  const [index, setIndex] = React.useState(0);
  const swap = useTempoTransition(transition.reveal);
  const go = (d: number) => setIndex((i) => (i + d + views.length) % views.length);
  const current = views[index];

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-line bg-sunken" role="region" aria-roledescription="carousel" aria-label="Photos">
        <ReducedMotionConfig>
          <div className="relative aspect-[16/10]">
            <AnimatePresence initial={false}>
              <motion.div
                key={current.key}
                className="absolute inset-0"
                initial={{ opacity: 0, filter: blur.surface }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: blur.surface, transition: swap }}
                transition={swap}
              >
                <BusArt body={bus.body} livery={bus.livery} lengthM={bus.lengthM} seats={bus.seats} view={current.view} tone={current.tone} className="size-full" title={`${busTitle(bus)} — ${current.label}`} />
              </motion.div>
            </AnimatePresence>
          </div>
        </ReducedMotionConfig>
        <div className="absolute top-4 left-4 flex gap-1.5">
          {bus.condition !== 'Used' && <Badge tone="dark">{bus.condition}</Badge>}
          {bus.emission === 'Zero emission' && (
            <Badge tone="ok">
              <Zap className="size-3" /> Zero emission
            </Badge>
          )}
        </div>
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <span className="tabular rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
            {index + 1} / {views.length}
          </span>
          <Button variant="secondary" size="icon" onClick={() => go(-1)} aria-label="Previous photo">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => go(1)} aria-label="Next photo">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Highlight value={current.key} onValueChange={(v) => v && setIndex(views.findIndex((x) => x.key === v))} className="inset-0 rounded-xl ring-2 ring-accent ring-offset-2 ring-offset-paper" transition={spring.selection} controlledItems>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {views.map((v) => (
            <HighlightItem key={v.key} value={v.key} className="relative">
              <button type="button" className="relative block aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl" aria-label={`Show ${v.label}`} aria-current={v.key === current.key}>
                <BusArt body={bus.body} livery={bus.livery} lengthM={bus.lengthM} seats={bus.seats} view={v.view} tone={v.tone} className="size-full overflow-hidden rounded-xl" />
              </button>
            </HighlightItem>
          ))}
        </div>
      </Highlight>
    </div>
  );
}

function Financing({ price }: { price: number }) {
  const [down, setDown] = React.useState(20);
  const [term, setTerm] = React.useState('60');
  const rate = 5.9;
  const principal = price * (1 - down / 100);
  const monthly = Math.round(monthlyPayment(principal, rate, Number(term)));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">Finance this bus</p>
        <Badge tone="brass">Leasing partner</Badge>
      </div>
      <p className="mt-4 text-xs text-muted">Estimated monthly rate (net)</p>
      <p className="mt-1 flex items-baseline gap-1 font-display text-3xl font-semibold text-ink">
        €<SlidingNumber number={monthly} thousandSeparator="," />
        <span className="text-sm font-normal text-muted">/ month</span>
      </p>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>Down payment</span>
          <span className="tabular font-medium text-ink">
            {down}% · {formatEUR((price * down) / 100)}
          </span>
        </div>
        <Slider.Root value={[down]} min={0} max={50} step={5} onValueChange={(v) => setDown(v[0])} className="relative flex h-5 touch-none items-center select-none" aria-label="Down payment">
          <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-sunken">
            <Slider.Range className="absolute h-full rounded-full bg-accent" />
          </Slider.Track>
          <Slider.Thumb className="block size-5 cursor-grab rounded-full border-2 border-accent bg-surface shadow-card" aria-label="Down payment" />
        </Slider.Root>
      </div>

      <p className="mt-5 mb-2 text-xs text-muted">Term</p>
      <ToggleGroup.Root type="single" value={term} onValueChange={(v) => v && setTerm(v)} className="grid grid-cols-4 gap-1 rounded-full bg-sunken p-1" aria-label="Term in months">
        {['36', '48', '60', '72'].map((t) => (
          <ToggleGroup.Item key={t} value={t} className="relative h-8 cursor-pointer rounded-full text-sm font-medium text-muted transition-colors duration-200 data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-card">
            <span className="relative z-[1]">{t} mo</span>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className="mt-4 text-[11px] leading-relaxed text-faint">Indicative {rate}% APR, subject to credit approval. Balloon and operating-lease options available on request.</p>
    </div>
  );
}

type FormState = 'idle' | 'sending' | 'sent';

function ContactDialog({ bus, children }: { bus: Bus; children: React.ReactElement }) {
  const seller = sellerById(bus.sellerId);
  const [state, setState] = React.useState<FormState>('idle');
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [values, setValues] = React.useState({ name: '', company: '', email: '', message: `Hello, I'm interested in the ${busTitle(bus)} (${bus.id}). Is it still available, and could you share the service history?` });
  const swap = useTempoTransition(transition.swap);
  const emailOk = /.+@.+\..+/.test(values.email);
  const errors = {
    name: !values.name.trim() ? 'Enter your name so the seller knows who to reply to.' : '',
    email: !emailOk ? 'Enter a business email, like name@company.eu.' : '',
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (errors.name || errors.email) return;
    setState('sending');
    window.setTimeout(() => setState('sent'), 900);
  }

  const field = 'mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-[border-color] duration-200 placeholder:text-faint hover:border-line-strong focus:border-accent';

  return (
    <Dialog.Root onOpenChange={(o) => !o && window.setTimeout(() => setState('idle'), 300)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content className="fixed inset-0 z-50 m-auto h-fit max-h-[92vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-pop outline-none sm:p-8">
          <ReducedMotionConfig>
            <AnimatePresence mode="wait" initial={false}>
              {state === 'sent' ? (
                <motion.div key="sent" initial={{ opacity: 0, filter: blur.icon }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: blur.icon, transition: swap }} transition={swap} className="py-6 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-ok-soft text-ok">
                    <Check className="size-6" />
                  </span>
                  <Dialog.Title className="mt-4 text-xl font-semibold text-ink">Enquiry sent to {seller.name}</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-muted">They usually reply within {seller.responseHours} hours. You’ll find the conversation in your Seller hub inbox.</Dialog.Description>
                  <Dialog.Close asChild>
                    <Button className="mt-6">Back to listing</Button>
                  </Dialog.Close>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0, filter: blur.icon }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: blur.icon, transition: swap }} transition={swap}>
                  <Dialog.Title className="text-xl font-semibold text-ink">Contact the seller</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted">
                    {busTitle(bus)} · {formatEUR(bus.priceNet)} net
                  </Dialog.Description>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-ink-2">
                      Full name
                      <input className={cn(field, touched.name && errors.name && 'border-[#c2413b]')} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} onBlur={() => setTouched({ ...touched, name: true })} aria-invalid={!!(touched.name && errors.name)} autoComplete="name" />
                      {touched.name && errors.name && <span className="mt-1 block text-xs font-normal text-[#c2413b]">{errors.name}</span>}
                    </label>
                    <label className="text-sm font-medium text-ink-2">
                      Company
                      <input className={field} value={values.company} onChange={(e) => setValues({ ...values, company: e.target.value })} autoComplete="organization" />
                    </label>
                    <label className="text-sm font-medium text-ink-2 sm:col-span-2">
                      Business email
                      <input type="email" className={cn(field, touched.email && errors.email && 'border-[#c2413b]')} value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} onBlur={() => setTouched({ ...touched, email: true })} aria-invalid={!!(touched.email && errors.email)} autoComplete="email" />
                      {touched.email && errors.email && <span className="mt-1 block text-xs font-normal text-[#c2413b]">{errors.email}</span>}
                    </label>
                    <label className="text-sm font-medium text-ink-2 sm:col-span-2">
                      Message
                      <textarea rows={4} className={cn(field, 'h-auto resize-none py-3 leading-relaxed')} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />
                    </label>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Dialog.Close asChild>
                      <Button variant="ghost" type="button">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button type="submit" disabled={state === 'sending'} className="min-w-40">
                      {state === 'sending' ? 'Sending…' : 'Send enquiry'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </ReducedMotionConfig>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SpecTable({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-8 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Detail() {
  const { id } = useParams();
  const bus = busById(id ?? '');

  if (!bus) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-semibold text-ink">This listing is no longer available</h1>
        <p className="mt-2 text-muted">It may have been sold or withdrawn by the seller.</p>
        <Button asChild className="mt-6">
          <Link to="/buses">Browse all buses</Link>
        </Button>
      </div>
    );
  }

  const seller = sellerById(bus.sellerId);
  const vat = vatRates[bus.countryCode] ?? 20;
  const similar = buses.filter((b) => b.id !== bus.id && (b.body === bus.body || b.fuel === bus.fuel)).slice(0, 3);

  const specs: [string, React.ReactNode][] = [
    ['Make & model', `${bus.make} ${bus.model}`],
    ['Variant', bus.variant || '—'],
    ['Vehicle class', bus.body],
    ['Condition', bus.condition],
    ['Year of manufacture', bus.year],
    ['First registration', bus.firstRegistration],
    ['Mileage', `${formatNumber(bus.mileageKm)} km`],
    ['Drivetrain', bus.fuel],
    ['Emission class', bus.emission],
    ['Power', `${bus.powerKw} kW (${Math.round(bus.powerKw * 1.341)} hp)`],
    ['Gearbox', bus.gearbox],
    ['Length', `${bus.lengthM.toFixed(1)} m`],
    ['Seats', bus.seats],
    ['Standing places', bus.standing || '—'],
    ['Wheelchair access', bus.wheelchair ? 'Yes' : 'No'],
    ...(bus.batteryKwh ? ([['Battery capacity', `${bus.batteryKwh} kWh`]] as [string, React.ReactNode][]) : []),
    ...(bus.rangeKm ? ([['Range (SORT)', `≈ ${bus.rangeKm} km`]] as [string, React.ReactNode][]) : []),
    ['Listing ID', bus.id],
  ];

  return (
    <div className="container-page pt-6 pb-20 lg:pt-8 lg:pb-0">
      <div className="flex items-center justify-between gap-4">
        <Link to="/buses" className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" /> Back to results
        </Link>
        <div className="flex items-center gap-2">
          <Hint label="Copy link to this listing">
            <Button variant="secondary" size="icon" aria-label="Share listing" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}>
              <Share2 className="size-4" />
            </Button>
          </Hint>
          <FavoriteButton id={bus.id} className="border border-line shadow-none" />
        </div>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <Gallery bus={bus} />

          <div className="mt-8">
            <p className="text-sm text-muted">
              {bus.body} · {bus.year} · {bus.id}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">{busTitle(bus)}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-4" /> {bus.city}, {bus.country} · listed {bus.listedDaysAgo === 1 ? 'yesterday' : `${bus.listedDaysAgo} days ago`}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Mileage', `${formatNumber(bus.mileageKm)} km`],
              ['First reg.', bus.firstRegistration === '—' ? 'New' : bus.firstRegistration],
              ['Seats', `${bus.seats}${bus.standing ? ` + ${bus.standing}` : ''}`],
              [bus.fuel === 'Electric' ? 'Range' : 'Emission', bus.fuel === 'Electric' ? `${bus.rangeKm} km` : bus.emission],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs text-muted">{k}</p>
                <p className="tabular mt-1 font-semibold text-ink">{v}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="overview" className="mt-10">
            <TabsHighlight className="inset-0 rounded-full bg-surface shadow-card">
              <TabsList className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sunken p-1 [scrollbar-width:none]">
                {[
                  ['overview', 'Overview'],
                  ['specs', 'Specifications'],
                  ['equipment', 'Equipment'],
                  ['delivery', 'Delivery & paperwork'],
                ].map(([v, l]) => (
                  <TabsHighlightItem key={v} value={v}>
                    <TabsTrigger value={v} className="relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-200 hover:text-ink data-[state=active]:text-ink">
                      {l}
                    </TabsTrigger>
                  </TabsHighlightItem>
                ))}
              </TabsList>
            </TabsHighlight>
            <TabsContents className="mt-6">
              <TabsContent value="overview">
                <p className="max-w-3xl leading-relaxed text-ink-2">{bus.description}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    [FileCheck2, 'Full service history available'],
                    [ShieldCheck, seller.verified ? 'Seller verified by Fleetmark' : 'Seller verification pending'],
                    [Truck, 'Delivery to 31 countries on request'],
                    [Clock, `Typical reply within ${seller.responseHours} h`],
                  ].map(([Icon, t]) => {
                    const I = Icon as typeof Check;
                    return (
                      <li key={t as string} className="flex items-center gap-3 text-sm text-ink-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
                          <I className="size-4" />
                        </span>
                        {t as string}
                      </li>
                    );
                  })}
                </ul>
              </TabsContent>
              <TabsContent value="specs">
                <SpecTable rows={specs} />
              </TabsContent>
              <TabsContent value="equipment">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {bus.features.map((x) => (
                    <li key={x} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-2">
                      <Check className="size-4 text-ok" /> {x}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="delivery">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['Collection', `From the seller’s depot in ${bus.city}. Viewing by appointment, Monday to Saturday.`],
                    ['Export & delivery', 'Export plates, transfer driver and EU-wide delivery arranged by Fleetmark logistics partners.'],
                    ['Invoicing', bus.vatDeductible ? `VAT invoice. Intra-EU B2B sales with a valid VAT ID are reverse-charged (0%).` : 'Sold under the margin scheme. VAT is not shown separately and cannot be reclaimed.'],
                  ].map(([t, d]) => (
                    <div key={t} className="rounded-2xl border border-line bg-surface p-5">
                      <p className="font-semibold text-ink">{t}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </TabsContents>
          </Tabs>
        </div>

        {/* Sticky purchase panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Price</p>
            <p className="tabular mt-1 font-display text-4xl font-semibold text-ink">{formatEUR(bus.priceNet)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              {bus.vatDeductible ? (
                <>
                  Net · {formatEUR(grossPrice(bus.priceNet, bus.countryCode))} incl. {vat}% VAT
                  <Hint label={`Business buyers in another EU country with a valid VAT ID pay the net price (reverse charge). Domestic buyers pay ${vat}% ${bus.countryCode} VAT.`}>
                    <button type="button" aria-label="About VAT" className="grid size-5 place-items-center rounded-full text-faint hover:text-ink">
                      <Info className="size-3.5" />
                    </button>
                  </Hint>
                </>
              ) : (
                'Margin scheme · VAT not deductible'
              )}
            </p>
            <div className="mt-6 grid gap-2">
              <ContactDialog bus={bus}>
                <Button size="lg" className="w-full">
                  <MessageSquare className="size-4" /> Contact seller
                </Button>
              </ContactDialog>
              <Button size="lg" variant="secondary" className="w-full">
                <Phone className="size-4" /> Show phone number
              </Button>
              <Button size="lg" variant="ghost" className="w-full">
                <FileCheck2 className="size-4" /> Order inspection · {formatEUR(390)}
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm font-semibold text-white">{seller.initials}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                  {seller.name}
                  {seller.verified && <ShieldCheck className="size-4 shrink-0 text-brass" aria-label="Verified" />}
                </p>
                <p className="text-xs text-muted">
                  {seller.type} · {seller.city} · since {seller.memberSince}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-brass text-brass" /> {seller.rating} ({seller.reviews})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> Replies in ~{seller.responseHours} h
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Financing price={bus.priceNet} />
          </div>
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="tabular text-lg leading-tight font-semibold text-ink">{formatEUR(bus.priceNet)}</p>
            <p className="text-xs text-faint">{bus.vatDeductible ? 'Net, excl. VAT' : 'Margin scheme'}</p>
          </div>
          <ContactDialog bus={bus}>
            <Button>
              <MessageSquare className="size-4" /> Contact seller
            </Button>
          </ContactDialog>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="pt-20">
          <SectionHeading title="Similar buses" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((b) => (
              <BusCard key={b.id} bus={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
