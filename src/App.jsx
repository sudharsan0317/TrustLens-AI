import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import History from './pages/History';
import Settings from './pages/Settings'; // <-- 1. Imported the new Settings page

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} /> {/* <-- 2. Added the new route */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;