import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Office.js Initialisierung
(async () => {
  // Warten bis Office.js geladen ist
  await new Promise<void>((resolve) => {
    if (typeof window.Office !== "undefined" && window.Office.context) {
      resolve();
    } else {
      window.Office?.onReady?.(() => resolve());
    }
  });

  // React App rendern
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('Root container not found');
  }
})();