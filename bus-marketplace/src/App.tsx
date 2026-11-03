import * as React from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Tooltip } from '@animate-ui/react/primitives/radix-ui';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FavoritesProvider } from './lib/favorites';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { Detail } from './pages/Detail';
import { Dashboard } from './pages/Dashboard';
import { Sell } from './pages/Sell';
import { Dealers } from './pages/Dealers';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <FavoritesProvider>
        <Tooltip.Provider delayDuration={300}>
          <ScrollToTop />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/buses" element={<Listings />} />
                <Route path="/buses/:id" element={<Detail />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/dealers" element={<Dealers />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Tooltip.Provider>
      </FavoritesProvider>
    </HashRouter>
  );
}
