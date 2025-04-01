import { StrictMode } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { App } from './app/App';
import './app/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </StrictMode>,
);
