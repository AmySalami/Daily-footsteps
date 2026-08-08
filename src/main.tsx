import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Design system first (tokens), then app-level styles that consume them.
import './styles/design-system.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
