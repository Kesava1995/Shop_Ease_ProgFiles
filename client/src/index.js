import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Note: We don't import 'index.css' here because all of our styles
// were bundled directly into the 'App.jsx' file to fix the
// import errors we were seeing.

// 1. Find the 'root' element in your public/index.html file.
const rootElement = document.getElementById('root');

// 2. Create a React root to manage this element.
const root = ReactDOM.createRoot(rootElement);

// 3. Render your main <App /> component into that element.
root.render(
  // StrictMode helps find potential problems in your app.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);