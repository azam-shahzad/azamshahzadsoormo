import { Link } from 'react-router-dom';
import { Check, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Effects } from '@animate-ui/react/primitives/effects/effect';
import { buses, sellers } from '../data/buses';
import { Badge, Button, SectionHeading } from '../components/ui';

const plans = [
  { name: 'Private', price: 0, note: 'For single vehicles', features: ['1 active listing', '60-day visibility', 'Buyer messaging'] },
  { name: 'Dealer', price: 149, note: 'For growing dealers', features: ['10 active listings', 'Verified badge', 'Lead inbox & CRM export', 'Basic analytics'], featured: false },
  { name: 'Dealer Pro', price: 299, note: 'For fleets & importers', features: ['25 active listings', 'Priority placement', 'DMS / XML feed import', 'Multi-user access', 'Cross-border logistics desk'], featured: true },
];

export function Dealers() {
  return (
    <div className="container-page pt-8 lg:pt-12">
      <p className="text-sm text-muted">Dealers & operators</p>
      <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">Verified sellers across Europe</h1>
      <p className="mt-2 max-w-2xl text-muted">Every company is checked against its trade register and VAT ID before listing.</p>

      <Effects holdDelay={80} slide={{ offset: 16 }} blur={{ initialBlur: 4 }} fade asChild>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((s) => (
            <div key={s.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-ink font-display text-sm font-semibold text-white">{s.initials}</span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                    {s.name} {s.verified && <ShieldCheck className="size-4 shrink-0 text-brass" aria-label="Verified" />}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5" /> {s.city}, {s.country}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{s.type}</Badge>
                <Badge tone="brass">
                  <Star className="size-3 fill-current" /> {s.rating} · {s.reviews} reviews
                </Badge>
              </div>
              <p className="mt-4 text-sm text-muted">{buses.filter((b) => b.sellerId === s.id).length} vehicles in stock · replies in ~{s.responseHours} h</p>
              <Button asChild variant="secondary" size="sm" className="mt-5 self-start">
                <Link to={`/buses?q=${encodeURIComponent(s.city)}`}>View stock</Link>
              </Button>
            </div>
          ))}
        </div>
      </Effects>

      <section className="pt-20">
        <SectionHeading eyebrow="Plans" title="Sell more with a dealer plan" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={p.featured ? 'rounded-3xl bg-ink p-7 text-white' : 'rounded-3xl border border-line bg-surface p-7'}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.name}</p>
                {p.featured && <Badge tone="brass">Most popular</Badge>}
              </div>
              <p className="mt-4 font-display text-4xl font-semibold">
                €{p.price}
                <span className={p.featured ? 'text-base font-normal text-white/60' : 'text-base font-normal text-muted'}> / month</span>
              </p>
              <p className={p.featured ? 'mt-1 text-sm text-white/60' : 'mt-1 text-sm text-muted'}>{p.note} · excl. VAT</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className={p.featured ? 'size-4 text-[#e9c46a]' : 'size-4 text-ok'} /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={p.featured ? 'light' : 'secondary'}>
                <Link to="/sell">{p.price === 0 ? 'List for free' : `Start ${p.name}`}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
