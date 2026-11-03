import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, X, SearchX, Search } from 'lucide-react';
import { Accordion, Drawer, Slider, Switch, ToggleGroup } from '@animate-ui/react/primitives/radix-ui';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import { ReducedMotionConfig, spring, transition, useTempoTransition } from '@animate-ui/react/utils/motion';
import { buses, bodyTypes, fuels, emissions, makes, countries, busTitle, type Bus } from '../data/buses';
import { BusCard } from '../components/BusCard';
import { Button, CheckRow, SelectField } from '../components/ui';
import { useFavorites } from '../lib/favorites';
import { cn, formatEUR, formatNumber } from '../lib/format';

const PRICE_MAX = 700000;
const YEAR_MIN = 2014;
const YEAR_MAX = 2025;
const KM_MAX = 750000;

type Filters = {
  q: string;
  body: string[];
  fuel: string[];
  emission: string[];
  make: string[];
  country: string[];
  price: [number, number];
  year: [number, number];
  maxKm: number;
  minSeats: number;
  wheelchair: boolean;
  vatOnly: boolean;
  saved: boolean;
};

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

function fromParams(p: URLSearchParams): Filters {
  return {
    q: p.get('q') ?? '',
    body: list(p.get('body')),
    fuel: list(p.get('fuel')),
    emission: list(p.get('emission')),
    make: list(p.get('make')),
    country: list(p.get('country')),
    price: [Number(p.get('minPrice') ?? 0), Number(p.get('maxPrice') ?? PRICE_MAX)],
    year: [Number(p.get('minYear') ?? YEAR_MIN), Number(p.get('maxYear') ?? YEAR_MAX)],
    maxKm: Number(p.get('maxKm') ?? KM_MAX),
    minSeats: Number(p.get('minSeats') ?? 0),
    wheelchair: p.get('wheelchair') === '1',
    vatOnly: p.get('vat') === '1',
    saved: p.get('saved') === '1',
  };
}

function toParams(f: Filters, sort: string) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  (['body', 'fuel', 'emission', 'make', 'country'] as const).forEach((k) => f[k].length && p.set(k, f[k].join(',')));
  if (f.price[0] > 0) p.set('minPrice', String(f.price[0]));
  if (f.price[1] < PRICE_MAX) p.set('maxPrice', String(f.price[1]));
  if (f.year[0] > YEAR_MIN) p.set('minYear', String(f.year[0]));
  if (f.year[1] < YEAR_MAX) p.set('maxYear', String(f.year[1]));
  if (f.maxKm < KM_MAX) p.set('maxKm', String(f.maxKm));
  if (f.minSeats) p.set('minSeats', String(f.minSeats));
  if (f.wheelchair) p.set('wheelchair', '1');
  if (f.vatOnly) p.set('vat', '1');
  if (f.saved) p.set('saved', '1');
  if (sort !== 'recommended') p.set('sort', sort);
  return p;
}

const sorters: Record<string, (a: Bus, b: Bus) => number> = {
  recommended: (a, b) => Number(!!b.featured) - Number(!!a.featured) || a.listedDaysAgo - b.listedDaysAgo,
  newest: (a, b) => a.listedDaysAgo - b.listedDaysAgo,
  'price-asc': (a, b) => a.priceNet - b.priceNet,
  'price-desc': (a, b) => b.priceNet - a.priceNet,
  'km-asc': (a, b) => a.mileageKm - b.mileageKm,
  'year-desc': (a, b) => b.year - a.year,
};

/* ---------- Filter panel parts ---------- */

function Section({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={value} className="border-b border-line">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-semibold text-ink">
          {title}
          <ChevronDown className="size-4 text-faint transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden">
        <div className="pb-4">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function RangeSlider({ label, value, min, max, step, onChange, format }: { label: string; value: number[]; min: number; max: number; step: number; onChange: (v: number[]) => void; format: (v: number) => string }) {
  return (
    <div>
      <div className="mb-3 flex justify-between text-xs text-muted">
        <span className="tabular">{format(value[0])}</span>
        <span className="tabular">{format(value[value.length - 1])}</span>
      </div>
      <Slider.Root value={value} min={min} max={max} step={step} onValueChange={onChange} className="relative flex h-5 touch-none items-center select-none" aria-label={label}>
        <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-sunken">
          <Slider.Range className="absolute h-full rounded-full bg-accent" />
        </Slider.Track>
        {value.map((_, i) => (
          <Slider.Thumb key={i} className="block size-5 cursor-grab rounded-full border-2 border-accent bg-surface shadow-card active:cursor-grabbing" aria-label={`${label} ${i === 0 ? 'minimum' : 'maximum'}`} />
        ))}
      </Slider.Root>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label htmlFor={id} className="cursor-pointer text-sm text-ink-2">
        {label}
      </label>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-line-strong p-0.5 transition-colors duration-200 data-[state=checked]:justify-end data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block size-5 rounded-full bg-white shadow-card" />
      </Switch.Root>
    </div>
  );
}

function FilterPanel({ f, set, counts }: { f: Filters; set: (patch: Partial<Filters>) => void; counts: (key: 'body' | 'fuel' | 'emission' | 'make' | 'country', v: string) => number }) {
  const toggleIn = (key: 'body' | 'fuel' | 'emission' | 'make' | 'country', v: string, on: boolean) => set({ [key]: on ? [...f[key], v] : f[key].filter((x) => x !== v) } as Partial<Filters>);

  return (
    <Accordion.Root type="multiple" defaultValue={['body', 'price', 'fuel', 'year']}>
      <Section value="body" title="Vehicle type">
        {bodyTypes.map((v) => (
          <CheckRow key={v} label={v} count={counts('body', v)} checked={f.body.includes(v)} onChange={(on) => toggleIn('body', v, on)} />
        ))}
      </Section>
      <Section value="price" title="Price (net, EUR)">
        <RangeSlider label="Price" value={f.price} min={0} max={PRICE_MAX} step={5000} onChange={(v) => set({ price: [v[0], v[1]] })} format={(v) => (v >= PRICE_MAX ? `${formatEUR(v)}+` : formatEUR(v))} />
      </Section>
      <Section value="fuel" title="Drivetrain">
        {fuels.map((v) => (
          <CheckRow key={v} label={v} count={counts('fuel', v)} checked={f.fuel.includes(v)} onChange={(on) => toggleIn('fuel', v, on)} />
        ))}
      </Section>
      <Section value="year" title="Year of manufacture">
        <RangeSlider label="Year" value={f.year} min={YEAR_MIN} max={YEAR_MAX} step={1} onChange={(v) => set({ year: [v[0], v[1]] })} format={String} />
      </Section>
      <Section value="km" title="Mileage">
        <RangeSlider label="Max. mileage" value={[f.maxKm]} min={0} max={KM_MAX} step={10000} onChange={(v) => set({ maxKm: v[0] })} format={(v) => (v === 0 ? '0 km' : `up to ${formatNumber(v)} km`)} />
      </Section>
      <Section value="emission" title="Emission class">
        {emissions.map((v) => (
          <CheckRow key={v} label={v} count={counts('emission', v)} checked={f.emission.includes(v)} onChange={(on) => toggleIn('emission', v, on)} />
        ))}
      </Section>
      <Section value="make" title="Make">
        {makes.map((v) => (
          <CheckRow key={v} label={v} count={counts('make', v)} checked={f.make.includes(v)} onChange={(on) => toggleIn('make', v, on)} />
        ))}
      </Section>
      <Section value="country" title="Location">
        {countries.map((v) => (
          <CheckRow key={v} label={v} count={counts('country', v)} checked={f.country.includes(v)} onChange={(on) => toggleIn('country', v, on)} />
        ))}
      </Section>
      <Section value="more" title="Seats & equipment">
        <SelectField
          label="Minimum seats"
          value={String(f.minSeats)}
          onValueChange={(v) => set({ minSeats: Number(v) })}
          options={[0, 20, 30, 45, 55, 70].map((n) => ({ value: String(n), label: n ? `${n}+ seats` : 'Any' }))}
        />
        <div className="mt-3">
          <SwitchRow label="Wheelchair accessible" checked={f.wheelchair} onChange={(v) => set({ wheelchair: v })} />
          <SwitchRow label="VAT deductible only" checked={f.vatOnly} onChange={(v) => set({ vatOnly: v })} />
          <SwitchRow label="Saved buses only" checked={f.saved} onChange={(v) => set({ saved: v })} />
        </div>
      </Section>
    </Accordion.Root>
  );
}

/* ---------- Page ---------- */

export function Listings() {
  const [params, setParams] = useSearchParams();
  const f = React.useMemo(() => fromParams(params), [params]);
  const sort = params.get('sort') ?? 'recommended';
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const favorites = useFavorites();

  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  const set = (patch: Partial<Filters>) => setParams(toParams({ ...f, ...patch }, sort), { replace: true });
  const setSort = (s: string) => setParams(toParams(f, s), { replace: true });

  const match = (b: Bus, skip?: keyof Filters) => {
    const q = f.q.trim().toLowerCase();
    return (
      (!q || `${busTitle(b)} ${b.city} ${b.country} ${b.id}`.toLowerCase().includes(q)) &&
      (skip === 'body' || !f.body.length || f.body.includes(b.body)) &&
      (skip === 'fuel' || !f.fuel.length || f.fuel.includes(b.fuel)) &&
      (skip === 'emission' || !f.emission.length || f.emission.includes(b.emission)) &&
      (skip === 'make' || !f.make.length || f.make.includes(b.make)) &&
      (skip === 'country' || !f.country.length || f.country.includes(b.country)) &&
      b.priceNet >= f.price[0] &&
      (f.price[1] >= PRICE_MAX || b.priceNet <= f.price[1]) &&
      b.year >= f.year[0] &&
      b.year <= f.year[1] &&
      b.mileageKm <= f.maxKm &&
      b.seats >= f.minSeats &&
      (!f.wheelchair || b.wheelchair) &&
      (!f.vatOnly || b.vatDeductible) &&
      (!f.saved || favorites.has(b.id))
    );
  };

  const results = buses.filter((b) => match(b)).sort(sorters[sort] ?? sorters.recommended);
  const counts = (key: 'body' | 'fuel' | 'emission' | 'make' | 'country', v: string) =>
    buses.filter((b) => match(b, key) && (key === 'body' ? b.body : key === 'fuel' ? b.fuel : key === 'emission' ? b.emission : key === 'make' ? b.make : b.country) === v).length;

  // Active filter chips.
  const chips: { key: string; label: string; clear: () => void }[] = [];
  (['body', 'fuel', 'emission', 'make', 'country'] as const).forEach((k) =>
    f[k].forEach((v) => chips.push({ key: `${k}-${v}`, label: v, clear: () => set({ [k]: f[k].filter((x) => x !== v) } as Partial<Filters>) })),
  );
  if (f.price[0] > 0 || f.price[1] < PRICE_MAX) chips.push({ key: 'price', label: `${formatEUR(f.price[0])} – ${f.price[1] >= PRICE_MAX ? 'any' : formatEUR(f.price[1])}`, clear: () => set({ price: [0, PRICE_MAX] }) });
  if (f.year[0] > YEAR_MIN || f.year[1] < YEAR_MAX) chips.push({ key: 'year', label: `${f.year[0]}–${f.year[1]}`, clear: () => set({ year: [YEAR_MIN, YEAR_MAX] }) });
  if (f.maxKm < KM_MAX) chips.push({ key: 'km', label: `≤ ${formatNumber(f.maxKm)} km`, clear: () => set({ maxKm: KM_MAX }) });
  if (f.minSeats) chips.push({ key: 'seats', label: `${f.minSeats}+ seats`, clear: () => set({ minSeats: 0 }) });
  if (f.wheelchair) chips.push({ key: 'wc', label: 'Wheelchair accessible', clear: () => set({ wheelchair: false }) });
  if (f.vatOnly) chips.push({ key: 'vat', label: 'VAT deductible', clear: () => set({ vatOnly: false }) });
  if (f.saved) chips.push({ key: 'saved', label: 'Saved only', clear: () => set({ saved: false }) });
  if (f.q) chips.push({ key: 'q', label: `“${f.q}”`, clear: () => set({ q: '' }) });

  const clearAll = () => setParams(sort !== 'recommended' ? new URLSearchParams({ sort }) : new URLSearchParams(), { replace: true });

  return (
    <div className="container-page pt-8 pb-4 lg:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Home / Buses for sale</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">Buses & coaches for sale</h1>
        </div>
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search by make, model, city or ID</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="e.g. Tourismo, Utrecht, FM-24790"
            className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm text-ink transition-[border-color] duration-200 outline-none placeholder:text-faint hover:border-line-strong focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-line bg-surface px-5 [scrollbar-width:thin]">
            <div className="flex items-center justify-between border-b border-line py-4">
              <p className="font-semibold text-ink">Filters</p>
              {chips.length > 0 && (
                <button type="button" onClick={clearAll} className="text-sm font-medium text-accent hover:underline">
                  Reset all
                </button>
              )}
            </div>
            <FilterPanel f={f} set={set} counts={counts} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="inline-flex font-semibold text-ink">
                <SlidingNumber number={results.length} />
              </span>{' '}
              {results.length === 1 ? 'bus' : 'buses'} found
            </p>
            <div className="flex items-center gap-2">
              <Drawer.Root direction="bottom" open={mobileOpen} onOpenChange={setMobileOpen}>
                <Drawer.Trigger asChild>
                  <Button variant="secondary" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="size-4" /> Filters
                    {chips.length > 0 && <span className="tabular grid size-5 place-items-center rounded-full bg-accent text-[11px] text-white">{chips.length}</span>}
                  </Button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
                  <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-3xl bg-surface outline-none">
                    <Drawer.Handle className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-line-strong" />
                    <div className="flex items-center justify-between px-5 pt-3 pb-2">
                      <Drawer.Title className="text-lg font-semibold text-ink">Filters</Drawer.Title>
                      <Drawer.Description className="sr-only">Refine the bus listings</Drawer.Description>
                      <button type="button" onClick={clearAll} className="text-sm font-medium text-accent">
                        Reset all
                      </button>
                    </div>
                    <div className="overflow-y-auto px-5">
                      <FilterPanel f={f} set={set} counts={counts} />
                    </div>
                    <div className="border-t border-line p-4">
                      <Button size="lg" className="w-full" onClick={() => setMobileOpen(false)}>
                        Show {results.length} buses
                      </Button>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>

              <SelectField
                label="Sort by"
                hideLabel
                value={sort}
                onValueChange={setSort}
                className="w-48"
                triggerClassName="h-9 rounded-full"
                options={[
                  { value: 'recommended', label: 'Recommended' },
                  { value: 'newest', label: 'Newest listings' },
                  { value: 'price-asc', label: 'Price: low to high' },
                  { value: 'price-desc', label: 'Price: high to low' },
                  { value: 'km-asc', label: 'Lowest mileage' },
                  { value: 'year-desc', label: 'Newest year' },
                ]}
              />

              <ToggleGroup.Root
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as 'grid' | 'list')}
                className="hidden items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 sm:flex"
                aria-label="Layout"
              >
                {(
                  [
                    ['grid', LayoutGrid, 'Grid view'],
                    ['list', List, 'List view'],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <ToggleGroup.Item
                    key={v}
                    value={v}
                    aria-label={label}
                    className="relative grid size-8 cursor-pointer place-items-center rounded-full text-faint transition-colors duration-200 hover:text-ink data-[state=on]:bg-ink data-[state=on]:text-white"
                  >
                    <Icon className="relative z-[1] size-4" />
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup.Root>
            </div>
          </div>

          {/* Active chips */}
          <ReducedMotionConfig>
            <motion.ul layout="position" className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              <AnimatePresence mode="popLayout" initial={false}>
                {chips.map((c) => (
                  <motion.li
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: fade }}
                    transition={{ ...move, opacity: fade }}
                  >
                    <button
                      type="button"
                      onClick={c.clear}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pr-2 pl-3 text-xs font-medium text-ink-2 transition-colors duration-200 hover:border-line-strong hover:text-ink"
                      aria-label={`Remove filter ${c.label}`}
                    >
                      {c.label} <X className="size-3.5 text-faint" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </ReducedMotionConfig>

          {/* Results */}
          {results.length === 0 ? (
            <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-sunken text-muted">
                <SearchX className="size-5" />
              </span>
              <p className="mt-4 text-lg font-semibold text-ink">No buses match these filters</p>
              <p className="mt-1 max-w-sm text-sm text-muted">Widen the price or mileage range, or remove a filter. You can also save this search and we’ll email you new matches.</p>
              <div className="mt-6 flex gap-2">
                <Button onClick={clearAll}>Reset filters</Button>
                <Button variant="secondary">Save search</Button>
              </div>
            </div>
          ) : (
            <ReducedMotionConfig>
              <motion.ul
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={fade}
                className={cn('mt-4 grid gap-5', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((b) => (
                    <motion.li
                      key={b.id}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: fade }}
                      transition={{ ...move, opacity: fade }}
                    >
                      <BusCard bus={b} layout={view} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </ReducedMotionConfig>
          )}
        </div>
      </div>
    </div>
  );
}
