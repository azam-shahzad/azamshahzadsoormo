import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimateUIProvider>
      <App />
    </AnimateUIProvider>
  </StrictMode>,
);
