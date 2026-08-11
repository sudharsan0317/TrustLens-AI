import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <GoogleOAuthProvider clientId="509412544544-19a9qlv9f4n5cr017uq5dpogsa1okvtc.apps.googleusercontent.com">
    <ThemeProvider>
      <App />
    </ThemeProvider>
   </GoogleOAuthProvider>
  </React.StrictMode>
);