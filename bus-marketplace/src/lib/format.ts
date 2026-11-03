const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IE');

export const formatEUR = (value: number) => eur.format(Math.round(value));
export const formatNumber = (value: number) => num.format(value);
export const formatKm = (value: number) => `${num.format(value)} km`;

/** Standard VAT rates (%) by seller country, used to show gross prices next to net B2B prices. */
export const vatRates: Record<string, number> = { DE: 19, PL: 23, AT: 20, FR: 20, SE: 25, NL: 21, ES: 21 };
export const grossPrice = (net: number, countryCode: string) => net * (1 + (vatRates[countryCode] ?? 20) / 100);

/** Monthly payment of an annuity loan. */
export function monthlyPayment(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
