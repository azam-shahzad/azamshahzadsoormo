import { Link } from 'react-router-dom';
import { Logo } from './Header';

const cols = [
  { title: 'Buy', links: [['All buses', '/buses'], ['Coaches', '/buses?body=Coach'], ['City buses', '/buses?body=City%20bus'], ['Electric buses', '/buses?fuel=Electric'], ['Minibuses', '/buses?body=Minibus']] },
  { title: 'Sell', links: [['List a bus', '/sell'], ['Seller hub', '/dashboard'], ['Dealer plans', '/dealers'], ['Valuation', '/sell']] },
  { title: 'Company', links: [['About Fleetmark', '/'], ['Trust & safety', '/'], ['Press', '/'], ['Contact', '/']] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white/70">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed">
            The B2B marketplace for buses and coaches across Europe. Verified dealers and operators, VAT-ready invoicing, cross-border delivery.
          </p>
          <p className="mt-6 text-xs text-white/45">Prices in EUR. Net prices shown excl. VAT unless stated otherwise.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition-colors duration-200 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© 2026 Fleetmark Europe B.V. · Demo marketplace</p>
          <p>English · EUR (€) · 27 EU markets + UK, CH, NO</p>
        </div>
      </div>
    </footer>
  );
}
