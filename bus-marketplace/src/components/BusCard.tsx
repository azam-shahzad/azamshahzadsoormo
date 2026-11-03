import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MapPin, Gauge, Users, CalendarDays, ShieldCheck, Zap } from 'lucide-react';
import { IconButton, IconButtonParticles } from '@animate-ui/react/primitives/buttons/icon';
import { useMotionTokens, useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import type { Bus } from '../data/buses';
import { busTitle, sellerById } from '../data/buses';
import { BusArt } from './BusArt';
import { Badge } from './ui';
import { useFavorites } from '../lib/favorites';
import { cn, formatEUR, formatNumber } from '../lib/format';

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const saved = has(id);
  return (
    <IconButton
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save bus'}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(
        'relative grid size-9 cursor-pointer place-items-center rounded-full bg-surface/95 text-ink-2 shadow-card transition-colors duration-200 hover:text-ink',
        saved && 'text-[#d6455d] hover:text-[#d6455d]',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-current')} />
      {saved && <IconButtonParticles className="text-[#d6455d]" />}
    </IconButton>
  );
}

export function BusCard({ bus, layout = 'grid' }: { bus: Bus; layout?: 'grid' | 'list' }) {
  const reduce = useShouldReduceMotion();
  const { spring, scale } = useMotionTokens();
  const seller = sellerById(bus.sellerId);
  const pressed = reduce ? 'scale(1)' : `scale(${scale.choice})`;
  const zero = bus.emission === 'Zero emission';

  return (
    <motion.article
      initial={{ transform: 'scale(1)' }}
      whileTap={{ transform: pressed }}
      transition={spring.press}
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift motion-reduce:hover:translate-y-0',
        layout === 'list' && 'sm:grid sm:grid-cols-[minmax(0,300px)_1fr]',
      )}
    >
      <div className={cn('relative overflow-hidden bg-sunken', layout === 'grid' ? 'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-auto sm:h-full')}>
        <BusArt
          body={bus.body}
          livery={bus.livery}
          lengthM={bus.lengthM}
          title={busTitle(bus)}
          className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {bus.condition !== 'Used' && <Badge tone="dark">{bus.condition}</Badge>}
          {zero && (
            <Badge tone="ok" className="bg-ok-soft/95">
              <Zap className="size-3" /> Zero emission
            </Badge>
          )}
        </div>
        <FavoriteButton id={bus.id} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-faint uppercase">
              {bus.body} · {bus.year}
            </p>
            <h3 className="mt-1 truncate text-[17px] font-semibold text-ink">
              <Link to={`/buses/${bus.id}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-accent">
                {busTitle(bus)}
              </Link>
            </h3>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px] text-muted">
          <div className="flex items-center gap-1.5">
            <Gauge className="size-3.5 shrink-0 text-faint" aria-hidden />
            <dt className="sr-only">Mileage</dt>
            <dd className="tabular">{formatNumber(bus.mileageKm)} km</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0 text-faint" aria-hidden />
            <dt className="sr-only">Seats</dt>
            <dd>
              {bus.seats} seats{bus.standing ? ` + ${bus.standing}` : ''}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-faint" aria-hidden />
            <dt className="sr-only">First registration</dt>
            <dd>{bus.firstRegistration === '—' ? 'Unregistered' : bus.firstRegistration}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="grid h-3.5 min-w-3.5 place-items-center text-[10px] font-semibold text-faint" aria-hidden>
              €
            </span>
            <dt className="sr-only">Emission class</dt>
            <dd>{bus.emission}</dd>
          </div>
        </dl>

        {layout === 'list' && <p className="line-clamp-2 text-sm text-muted">{bus.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="tabular text-xl font-semibold text-ink">{formatEUR(bus.priceNet)}</p>
            <p className="text-xs text-faint">{bus.vatDeductible ? 'Net, excl. VAT' : 'Margin scheme'}</p>
          </div>
          <div className="min-w-0 text-right text-xs text-muted">
            <p className="flex items-center justify-end gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden /> {bus.city}, {bus.countryCode}
            </p>
            <p className="mt-0.5 flex items-center justify-end gap-1 truncate">
              {seller.verified && <ShieldCheck className="size-3 shrink-0 text-brass" aria-label="Verified seller" />}
              <span className="truncate">{seller.name}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
