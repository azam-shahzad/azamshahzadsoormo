import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, X, Plus } from 'lucide-react';
import { Highlight } from '@animate-ui/react/primitives/effects/highlight';
import { Drawer } from '@animate-ui/react/primitives/radix-ui';
import { spring } from '@animate-ui/react/utils/motion';
import { Button } from './ui';
import { useFavorites } from '../lib/favorites';
import { cn } from '../lib/format';

const links = [
  { to: '/buses', label: 'Buy a bus' },
  { to: '/sell', label: 'Sell' },
  { to: '/dealers', label: 'Dealers' },
  { to: '/dashboard', label: 'Seller hub' },
];

export function Logo({ inverted }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Fleetmark home">
      <span className={cn('grid size-8 place-items-center rounded-lg', inverted ? 'bg-white text-ink' : 'bg-ink text-white')}>
        <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden>
          <path d="M4 14V6a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 16 6v8" stroke="#E9C46A" strokeWidth="1.8" />
          <path d="M4 10h12" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="7" cy="15" r="1.6" fill="currentColor" />
          <circle cx="13" cy="15" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className={cn('font-display text-[17px] font-semibold tracking-tight', inverted ? 'text-white' : 'text-ink')}>Fleetmark</span>
    </Link>
  );
}

export function Header() {
  const { ids } = useFavorites();
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center md:flex">
            <Highlight hover className="inset-0 rounded-full bg-sunken" transition={spring.highlight}>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  data-value={l.to}
                  className={({ isActive }) =>
                    cn('relative z-[1] block rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200', isActive ? 'text-ink' : 'text-muted hover:text-ink')
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </Highlight>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/buses?saved=1"
            className="relative hidden size-10 place-items-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-sunken sm:grid"
            aria-label={`Saved buses (${ids.size})`}
          >
            <Heart className="size-[18px]" />
            {ids.size > 0 && (
              <span className="tabular absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-white">{ids.size}</span>
            )}
          </Link>
          <Link to="/dashboard" className="hidden text-sm font-medium text-ink-2 hover:text-ink sm:block sm:px-3">
            Sign in
          </Link>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/sell">
              <Plus className="size-4" /> List a bus
            </Link>
          </Button>

          <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
              <button type="button" className="grid size-10 place-items-center rounded-full text-ink hover:bg-sunken md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
              <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-paper p-5 shadow-pop outline-none">
                <div className="flex items-center justify-between">
                  <Logo />
                  <Drawer.Close asChild>
                    <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-sunken" aria-label="Close menu">
                      <X className="size-5" />
                    </button>
                  </Drawer.Close>
                </div>
                <Drawer.Title className="sr-only">Menu</Drawer.Title>
                <Drawer.Description className="sr-only">Site navigation</Drawer.Description>
                <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                  {[{ to: '/', label: 'Home' }, ...links, { to: '/buses?saved=1', label: `Saved (${ids.size})` }].map((l) => (
                    <NavLink key={l.to} to={l.to} onClick={close} className="rounded-xl px-3 py-3 text-[17px] font-medium text-ink hover:bg-sunken">
                      {l.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-auto grid gap-2">
                  <Button asChild size="lg">
                    <Link to="/sell" onClick={close}>
                      List a bus
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/dashboard" onClick={close}>
                      Sign in
                    </Link>
                  </Button>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
    </header>
  );
}
