import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Search, ShieldCheck, FileCheck2, Truck, BadgeEuro, Star, Zap } from 'lucide-react';
import { Effects, Effect } from '@animate-ui/react/primitives/effects/effect';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import { Tabs, TabsList, TabsTrigger, TabsHighlight, TabsHighlightItem } from '@animate-ui/react/primitives/tabs';
import { useMotionTokens, useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { buses, makes, countries, sellers, type BodyType } from '../data/buses';
import { BusArt } from '../components/BusArt';
import { BusCard } from '../components/BusCard';
import { Button, SectionHeading, SelectField } from '../components/ui';
import { formatEUR } from '../lib/format';

const ANY = 'any';
const searchTabs = ['All', 'Coach', 'City bus', 'Intercity', 'Minibus', 'Electric'] as const;

function HeroSearch() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<string>('All');
  const [make, setMake] = React.useState(ANY);
  const [price, setPrice] = React.useState(ANY);
  const [country, setCountry] = React.useState(ANY);

  const matches = buses.filter(
    (b) =>
      (tab === 'All' || (tab === 'Electric' ? b.fuel === 'Electric' : b.body === tab)) &&
      (make === ANY || b.make === make) &&
      (price === ANY || b.priceNet <= Number(price)) &&
      (country === ANY || b.country === country),
  ).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (tab === 'Electric') q.set('fuel', 'Electric');
    else if (tab !== 'All') q.set('body', tab);
    if (make !== ANY) q.set('make', make);
    if (price !== ANY) q.set('maxPrice', price);
    if (country !== ANY) q.set('country', country);
    navigate(`/buses?${q.toString()}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-surface p-3 shadow-lift sm:p-4" aria-label="Search buses">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsHighlight className="inset-0 rounded-full bg-ink">
          <TabsList className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Body type">
            {searchTabs.map((t) => (
              <TabsHighlightItem key={t} value={t}>
                <TabsTrigger
                  value={t}
                  className="relative cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-200 hover:text-ink data-[state=active]:text-white"
                >
                  {t}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsList>
        </TabsHighlight>
      </Tabs>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <SelectField label="Make" value={make} onValueChange={setMake} options={[{ value: ANY, label: 'Any make' }, ...makes.map((m) => ({ value: m, label: m }))]} />
        <SelectField
          label="Max. price (net)"
          value={price}
          onValueChange={setPrice}
          options={[{ value: ANY, label: 'Any price' }, ...[75000, 100000, 150000, 250000, 400000].map((p) => ({ value: String(p), label: `Up to ${formatEUR(p)}` }))]}
        />
        <SelectField label="Location" value={country} onValueChange={setCountry} options={[{ value: ANY, label: 'All of Europe' }, ...countries.map((c) => ({ value: c, label: c }))]} />
        <Button type="submit" size="lg" className="h-12 sm:col-span-3">
          <Search className="size-4" />
          <span className="tabular">{`Show ${matches} ${matches === 1 ? 'bus' : 'buses'}`}</span>
        </Button>
      </div>
    </form>
  );
}

const categories: { label: string; body: BodyType; query: string; blurb: string; livery: string }[] = [
  { label: 'Coaches', body: 'Coach', query: 'body=Coach', blurb: 'Touring & long-distance', livery: '#1f2a44' },
  { label: 'City buses', body: 'City bus', query: 'body=City%20bus', blurb: 'Low-floor & articulated', livery: '#2f7d6d' },
  { label: 'Intercity', body: 'Intercity', query: 'body=Intercity', blurb: 'Regional & school lines', livery: '#f2c14e' },
  { label: 'Minibuses', body: 'Minibus', query: 'body=Minibus', blurb: 'Shuttle & on-demand', livery: '#e8e6df' },
  { label: 'Double-deckers', body: 'Double-decker', query: 'body=Double-decker', blurb: 'High-capacity coaches', livery: '#3b3f46' },
];

function CategoryTile({ c }: { c: (typeof categories)[number] }) {
  const reduce = useShouldReduceMotion();
  const { spring, scale } = useMotionTokens();
  const count = buses.filter((b) => b.body === c.body).length;
  return (
    <motion.div initial={{ transform: 'scale(1)' }} whileTap={{ transform: reduce ? 'scale(1)' : `scale(${scale.choice})` }} transition={spring.press} className="h-full">
      <Link
        to={`/buses?${c.query}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[box-shadow,border-color] duration-300 hover:border-line-strong hover:shadow-lift"
      >
        <div className="aspect-[2/1] overflow-hidden">
          <BusArt body={c.body} livery={c.livery} className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        </div>
        <div className="flex items-center justify-between gap-2 p-4">
          <div>
            <p className="font-semibold text-ink">{c.label}</p>
            <p className="text-xs text-muted">{c.blurb}</p>
          </div>
          <span className="tabular rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-2">{count}</span>
        </div>
      </Link>
    </motion.div>
  );
}

const stats = [
  { value: 12480, suffix: '+', label: 'Buses & coaches listed' },
  { value: 1850, suffix: '', label: 'Verified dealers & operators' },
  { value: 31, suffix: '', label: 'European countries' },
  { value: 4.8, suffix: '/5', label: 'Average seller rating', decimals: 1, from: 4 },
];

export function Home() {
  const featured = buses.filter((b) => b.featured).slice(0, 6);
  const electric = buses.filter((b) => b.emission === 'Zero emission');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_10%,#e8eefc_0%,transparent_60%)]" aria-hidden />
        <div className="container-page relative grid gap-10 pt-12 pb-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-20 lg:pb-20">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2">
              <ShieldCheck className="size-3.5 text-brass" /> Europe’s verified bus & coach exchange
            </p>
            <h1 className="text-[2.5rem] leading-[1.05] font-semibold text-ink sm:text-6xl">
              Buy and sell buses
              <br className="hidden sm:block" /> across Europe.
            </h1>
            <Effects holdDelay={100} slide={{ offset: 16 }} blur={{ initialBlur: 2 }} fade>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Coaches, city buses and zero-emission fleets from verified dealers in 31 countries. Transparent net pricing in euro, VAT-ready invoices and cross-border delivery.
              </p>
              <div className="mt-8">
                <HeroSearch />
              </div>
            </Effects>
          </div>
          <Effect slide={{ offset: 16 }} blur={{ initialBlur: 4 }} fade delay={150} className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift">
              <BusArt body="Coach" livery="#1f2a44" lengthM={12.5} tone="dusk" className="aspect-[4/3] w-full" title="Setra S 516 HD coach" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/95 p-4 backdrop-blur">
                <div>
                  <p className="text-xs text-muted">Featured · Düsseldorf, DE</p>
                  <p className="font-semibold text-ink">Setra S 516 HD · 2024</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-lg font-semibold text-ink">{formatEUR(389000)}</p>
                  <p className="text-xs text-faint">net, excl. VAT</p>
                </div>
              </div>
            </div>
          </Effect>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-surface">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                <CountingNumber
                  className="tabular"
                  number={s.value}
                  fromNumber={s.from}
                  decimalPlaces={s.decimals ?? 0}
                  thousandSeparator=","
                  inView
                  inViewOnce
                />
                {s.suffix}
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pt-20">
        <SectionHeading eyebrow="Browse" title="Find the right vehicle class" />
        <Effects inView inViewOnce holdDelay={80} slide={{ offset: 16 }} blur={{ initialBlur: 4 }} fade asChild>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <CategoryTile key={c.label} c={c} />
            ))}
          </div>
        </Effects>
      </section>

      {/* Featured */}
      <section className="container-page pt-20">
        <SectionHeading
          eyebrow="Featured"
          title="Hand-picked this week"
          action={
            <Link to="/buses" className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              View all buses <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          }
        />
        <Effects inView inViewOnce holdDelay={80} slide={{ offset: 16 }} blur={{ initialBlur: 4 }} fade asChild>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BusCard key={b.id} bus={b} />
            ))}
          </div>
        </Effects>
      </section>

      {/* Zero emission band */}
      <section className="container-page pt-20">
        <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-white sm:px-12 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_90%_20%,rgba(42,157,143,0.35),transparent_70%)]" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[#7fd1c4] uppercase">
                <Zap className="size-3.5" /> Zero-emission fleets
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Electrify your fleet with certified pre-owned e-buses.</h2>
              <p className="mt-4 max-w-lg text-white/70">
                Every electric listing carries a battery state-of-health report, charging-standard details and eligibility notes for EU Clean Vehicles Directive funding.
              </p>
              <Button asChild size="lg" variant="light" className="mt-8">
                <Link to="/buses?fuel=Electric">
                  Browse {electric.length} zero-emission buses <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[
                { k: 'Avg. battery health', v: 92, s: '%' },
                { k: 'Avg. range', v: 285, s: ' km' },
                { k: 'Countries delivering', v: 18, s: '' },
                { k: 'From', v: 189000, s: '', eur: true },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <dt className="text-xs text-white/55">{x.k}</dt>
                  <dd className="mt-2 font-display text-2xl font-semibold">
                    {x.eur && '€'}
                    <CountingNumber className="tabular" number={x.v} thousandSeparator="," inView inViewOnce />
                    {x.s}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container-page pt-20">
        <SectionHeading eyebrow="Built for B2B" title="Trade with confidence, across borders" />
        <Effects inView inViewOnce holdDelay={80} slide={{ offset: 16 }} blur={{ initialBlur: 4 }} fade asChild>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, t: 'Verified sellers', d: 'Company registration, VAT ID (VIES) and trade references checked before any listing goes live.' },
              { icon: BadgeEuro, t: 'Net pricing in EUR', d: 'Every price shown net with VAT status, so intra-EU reverse charge is clear from the start.' },
              { icon: FileCheck2, t: 'Inspection reports', d: 'Order an independent DEKRA-style inspection at the seller’s depot before you commit.' },
              { icon: Truck, t: 'Cross-border delivery', d: 'Export plates, transfer drivers and customs paperwork arranged by our logistics partners.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 font-semibold text-ink">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </Effects>
      </section>

      {/* Dealers */}
      <section className="container-page pt-20">
        <SectionHeading
          eyebrow="Top-rated"
          title="Trusted dealers & operators"
          action={
            <Link to="/dealers" className="text-sm font-medium text-accent">
              All dealers
            </Link>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers
            .filter((s) => s.verified)
            .slice(0, 3)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm font-semibold text-white">{s.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{s.name}</p>
                  <p className="text-sm text-muted">
                    {s.city}, {s.country}
                  </p>
                </div>
                <p className="flex items-center gap-1 text-sm font-medium text-ink">
                  <Star className="size-4 fill-brass text-brass" /> {s.rating}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pt-20">
        <div className="grid gap-6 rounded-[28px] border border-line bg-surface p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Selling a fleet? Reach buyers in 31 countries.</h2>
            <p className="mt-3 max-w-2xl text-muted">List single vehicles for free or connect your dealer management system. Average time to first enquiry: 38 hours.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/sell">List a bus</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/dealers">Dealer plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
