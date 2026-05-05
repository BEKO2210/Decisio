import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DecisionsProvider } from './state/decisionsContext';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element missing');

createRoot(rootEl).render(
  <StrictMode>
    <DecisionsProvider>
      <App />
    </DecisionsProvider>
  </StrictMode>
);
