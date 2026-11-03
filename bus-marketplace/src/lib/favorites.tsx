import * as React from 'react';

type Ctx = { ids: Set<string>; toggle: (id: string) => void; has: (id: string) => boolean };
const FavoritesContext = React.createContext<Ctx | null>(null);
const KEY = 'fleetmark:favorites';

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<Set<string>>(() => new Set(read()));
  const toggle = React.useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable: keep in memory only */
      }
      return next;
    });
  }, []);
  const value = React.useMemo(() => ({ ids, toggle, has: (id: string) => ids.has(id) }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
