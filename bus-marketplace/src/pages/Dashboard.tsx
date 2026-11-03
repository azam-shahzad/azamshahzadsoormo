import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BarChart3, Eye, Inbox, LayoutDashboard, MoreHorizontal, Plus, Settings, Truck, TrendingUp, Euro, MessageSquare, Pencil, Rocket, CircleCheck, Trash2, CreditCard } from 'lucide-react';
import { DropdownMenu, Progress, Switch } from '@animate-ui/react/primitives/radix-ui';
import { Tabs, TabsList, TabsTrigger, TabsHighlight, TabsHighlightItem, TabsContents, TabsContent } from '@animate-ui/react/primitives/tabs';
import { Highlight } from '@animate-ui/react/primitives/effects/highlight';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import { ReducedMotionConfig, spring, useShouldReduceMotion, useTempoTransition } from '@animate-ui/react/utils/motion';
import { buses, busTitle, sellerById } from '../data/buses';
import { BusArt } from '../components/BusArt';
import { Badge, Button } from '../components/ui';
import { cn, formatEUR, formatNumber } from '../lib/format';

const SELLER_ID = 'rheinbus';
const seller = sellerById(SELLER_ID);
const mine = buses.filter((b) => b.sellerId === SELLER_ID);

const nav = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, tab: 'listings' },
  { key: 'listings', label: 'Listings', icon: Truck, tab: 'listings' },
  { key: 'enquiries', label: 'Enquiries', icon: Inbox, badge: 4, tab: 'enquiries' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, tab: 'performance' },
  { key: 'billing', label: 'Billing', icon: CreditCard, tab: undefined },
  { key: 'settings', label: 'Settings', icon: Settings, tab: undefined },
];

const views14 = [420, 380, 510, 470, 620, 580, 300, 260, 640, 710, 690, 820, 760, 905];
const days = ['21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '1', '2', '3'];

const enquiries = [
  { id: 1, from: 'Martina Kovács', company: 'Volánbusz Partner Kft.', country: 'HU', bus: 'FM-24871', msg: 'Could you confirm the warranty transfer and earliest delivery to Budapest?', time: '12 min ago', unread: true },
  { id: 2, from: 'Pieter de Vries', company: 'Arriva Charter NL', country: 'NL', bus: 'FM-24790', msg: 'We need two units with the same spec. Is a fleet price possible?', time: '1 h ago', unread: true },
  { id: 3, from: 'Lukas Brandt', company: 'Brandt Reisen GmbH', country: 'DE', bus: 'FM-24501', msg: 'Can we schedule a viewing on Saturday morning?', time: '3 h ago', unread: true },
  { id: 4, from: 'Giulia Rossi', company: 'Autolinee Toscane', country: 'IT', bus: 'FM-24688', msg: 'Please send the battery warranty conditions and charging specs.', time: 'Yesterday', unread: true },
  { id: 5, from: 'Jan Novák', company: 'Dopravní podnik', country: 'CZ', bus: 'FM-24577', msg: 'Thanks for the documents, we will come back next week.', time: '2 days ago', unread: false },
];

function Kpi({ icon: Icon, label, value, delta, prefix, suffix, decimals }: { icon: typeof Eye; label: string; value: number; delta: string; prefix?: string; suffix?: string; decimals?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-sunken text-ink-2">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
        {prefix}
        <CountingNumber className="tabular" number={value} thousandSeparator="," decimalPlaces={decimals ?? 0} />
        {suffix}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ok">
        <TrendingUp className="size-3.5" /> {delta} <span className="font-normal text-faint">vs last 14 days</span>
      </p>
    </div>
  );
}

function ViewsChart() {
  const reduce = useShouldReduceMotion();
  const grow = useTempoTransition(spring.number);
  const max = Math.max(...views14);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-semibold text-ink">Listing views</p>
          <p className="text-xs text-muted">Last 14 days · all listings</p>
        </div>
        <p className="tabular text-sm font-medium text-ink">{formatNumber(views14.reduce((a, b) => a + b, 0))} total</p>
      </div>
      <ReducedMotionConfig>
        <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Bar chart of daily listing views, rising from 420 to 905 over 14 days">
          {views14.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <motion.div
                className={cn('w-full origin-bottom rounded-t-md', i === views14.length - 1 ? 'bg-accent' : 'bg-accent/25')}
                style={{ height: `${(v / max) * 100}%` }}
                initial={{ transform: reduce ? 'scaleY(1)' : 'scaleY(0)' }}
                animate={{ transform: 'scaleY(1)' }}
                transition={{ ...grow, delay: i * 0.03 }}
                title={`${v} views`}
              />
              <span className="text-[10px] text-faint">{days[i]}</span>
            </div>
          ))}
        </div>
      </ReducedMotionConfig>
    </div>
  );
}

function ListingRow({ bus }: { bus: (typeof mine)[number] }) {
  const [active, setActive] = React.useState(true);
  const enquiriesCount = (bus.views % 7) + 1;
  return (
    <tr className="border-b border-line last:border-0 hover:bg-paper/60">
      <td className="py-3 pr-4 pl-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
            <BusArt body={bus.body} livery={bus.livery} lengthM={bus.lengthM} className="size-full" />
          </div>
          <div className="min-w-0">
            <Link to={`/buses/${bus.id}`} className="block truncate font-medium text-ink hover:text-accent">
              {busTitle(bus)}
            </Link>
            <p className="text-xs text-muted">
              {bus.id} · {bus.year}
            </p>
          </div>
        </div>
      </td>
      <td className="tabular px-4 py-3 font-medium text-ink">{formatEUR(bus.priceNet)}</td>
      <td className="tabular hidden px-4 py-3 text-muted md:table-cell">{formatNumber(bus.views)}</td>
      <td className="tabular hidden px-4 py-3 text-muted md:table-cell">{enquiriesCount}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Switch.Root
            checked={active}
            onCheckedChange={setActive}
            aria-label={`Listing ${bus.id} visible`}
            className="relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-line-strong p-0.5 transition-colors duration-200 data-[state=checked]:justify-end data-[state=checked]:bg-ok"
          >
            <Switch.Thumb className="block size-4 rounded-full bg-white shadow-card" />
          </Switch.Root>
          <Badge tone={active ? 'ok' : 'neutral'} className="hidden sm:inline-flex">
            {active ? 'Live' : 'Paused'}
          </Badge>
        </div>
      </td>
      <td className="py-3 pr-5 pl-2 text-right">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink data-[state=open]:bg-sunken" aria-label={`Actions for ${bus.id}`}>
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-pop">
              {[
                [Pencil, 'Edit listing'],
                [Rocket, 'Boost to top · €49'],
                [CircleCheck, 'Mark as sold'],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Pencil;
                return (
                  <DropdownMenu.Item key={label as string} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-sunken">
                    <I className="size-4 text-muted" /> {label as string}
                  </DropdownMenu.Item>
                );
              })}
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#c2413b] outline-none data-[highlighted]:bg-[#fbeceb]">
                <Trash2 className="size-4" /> Delete {bus.id}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </td>
    </tr>
  );
}

function ListingsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-paper/70 text-xs text-muted">
            <tr>
              <th className="py-3 pr-4 pl-5 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Net price</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Views</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Enquiries</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="py-3 pr-5 pl-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {mine.map((b) => (
              <ListingRow key={b.id} bus={b} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnquiryList({ limit }: { limit?: number }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {enquiries.slice(0, limit).map((e) => (
        <li key={e.id} className="flex gap-4 p-4 transition-colors duration-200 hover:bg-paper/60 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-sm font-semibold text-ink-2">
            {e.from
              .split(' ')
              .map((p) => p[0])
              .join('')}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3">
              <p className="font-medium text-ink">
                {e.from} <span className="font-normal text-muted">· {e.company}</span>
              </p>
              <p className="text-xs text-faint">{e.time}</p>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{e.msg}</p>
            <p className="mt-1.5 text-xs text-faint">
              Re: {e.bus} · Buyer in {e.country}
            </p>
          </div>
          {e.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
        </li>
      ))}
    </ul>
  );
}

export function Dashboard() {
  const [section, setSection] = React.useState('overview');
  const [tab, setTab] = React.useState('listings');
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const openSection = (key: string, target?: string) => {
    setSection(key);
    if (target) {
      setTab(target);
      if (key !== 'overview') tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const totalValue = mine.reduce((a, b) => a + b.priceNet, 0);

  return (
    <div className="container-page pt-8 lg:pt-10">
      <div className="grid gap-8 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
              <span className="grid size-10 place-items-center rounded-xl bg-ink font-display text-sm font-semibold text-white">{seller.initials}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{seller.name}</p>
                <p className="text-xs text-muted">Dealer Pro plan</p>
              </div>
            </div>
            <nav aria-label="Seller hub" className="mt-4">
              <Highlight hover className="inset-0 rounded-xl bg-sunken" transition={spring.highlight} itemsClassName="block">
                {nav.map(({ key, label, icon: Icon, badge, tab: target }) => (
                  <button
                    key={key}
                    type="button"
                    data-value={key}
                    onClick={() => openSection(key, target)}
                    disabled={!target}
                    title={target ? undefined : 'Available on the full plan'}
                    aria-current={section === key ? 'page' : undefined}
                    className={cn(
                      'relative z-[1] flex w-full cursor-pointer items-center gap-3 disabled:cursor-not-allowed disabled:opacity-50 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      section === key ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Icon className="size-4" /> {label}
                    {badge && <span className="tabular ml-auto rounded-full bg-accent px-1.5 text-[11px] leading-5 text-white">{badge}</span>}
                  </button>
                ))}
              </Highlight>
            </nav>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Listing slots</span>
                <span className="tabular font-medium text-ink">{mine.length} / 25</span>
              </div>
              <Progress.Root value={(mine.length / 25) * 100} className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                <Progress.Indicator className="h-full w-full rounded-full bg-accent" />
              </Progress.Root>
              <p className="mt-3 text-xs text-muted">Renews 1 Dec 2026 · €299/month</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Seller hub</p>
              <h1 className="mt-1 text-3xl font-semibold text-ink">Good afternoon, Rhein Bus</h1>
            </div>
            <Button asChild>
              <Link to="/sell">
                <Plus className="size-4" /> New listing
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <Kpi icon={Eye} label="Listing views" value={8065} delta="+18.4%" />
            <Kpi icon={MessageSquare} label="Enquiries" value={46} delta="+9" />
            <Kpi icon={Truck} label="Active listings" value={mine.length} delta="+2" />
            <Kpi icon={Euro} label="Stock value (net)" value={totalValue / 1_000_000} prefix="€" suffix="m" decimals={2} delta="+€0.4m" />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="mt-8 scroll-mt-24" ref={tabsRef}>
            <TabsHighlight className="inset-0 rounded-full bg-surface shadow-card">
              <TabsList className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sunken p-1 [scrollbar-width:none]">
                {[
                  ['listings', 'Listings'],
                  ['enquiries', 'Enquiries'],
                  ['performance', 'Performance'],
                ].map(([v, l]) => (
                  <TabsHighlightItem key={v} value={v}>
                    <TabsTrigger value={v} className="relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-200 hover:text-ink data-[state=active]:text-ink">
                      {l}
                    </TabsTrigger>
                  </TabsHighlightItem>
                ))}
              </TabsList>
            </TabsHighlight>
            <TabsContents className="mt-5">
              <TabsContent value="listings">
                <ListingsTable />
              </TabsContent>
              <TabsContent value="enquiries">
                <EnquiryList />
              </TabsContent>
              <TabsContent value="performance">
                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                  <ViewsChart />
                  <div className="rounded-2xl border border-line bg-surface p-5">
                    <p className="font-semibold text-ink">Buyer origin</p>
                    <p className="text-xs text-muted">Share of enquiries by country</p>
                    <ul className="mt-5 space-y-3.5">
                      {[
                        ['Germany', 31],
                        ['Netherlands', 18],
                        ['Poland', 14],
                        ['Italy', 11],
                        ['Other EU', 26],
                      ].map(([c, v]) => (
                        <li key={c as string}>
                          <div className="flex justify-between text-sm">
                            <span className="text-ink-2">{c}</span>
                            <span className="tabular font-medium text-ink">{v}%</span>
                          </div>
                          <Progress.Root value={v as number} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                            <Progress.Indicator className="h-full w-full rounded-full bg-ink" />
                          </Progress.Root>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </TabsContents>
          </Tabs>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-ink">Latest enquiries</p>
                <Badge tone="accent">4 unread</Badge>
              </div>
              <EnquiryList limit={3} />
            </div>
            <div className="rounded-2xl border border-line bg-ink p-6 text-white">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#e9c46a] uppercase">Tip</p>
              <p className="mt-3 text-lg font-semibold">Listings with a battery health report get 2.3× more enquiries.</p>
              <p className="mt-2 text-sm text-white/65">Upload a SoH certificate to your electric listings to earn the “Battery verified” badge.</p>
              <Button variant="light" className="mt-5">Upload report</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
