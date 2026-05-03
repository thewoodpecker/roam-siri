import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Take browser scroll-restoration off auto. On reload, the browser was
// putting the page back where it left off; we want every reload to land
// at the top of the document. Setting this *before* React mounts ensures
// the initial paint happens at scroll 0.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
if (typeof window !== 'undefined') {
  window.scrollTo(0, 0);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
