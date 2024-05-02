import './buffer-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import Ctx from './Ctx.ts';

const ctx = new Ctx();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).ctx = ctx;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Ctx.Provider value={ctx}>
      <App />
    </Ctx.Provider>
  </React.StrictMode>,
);
