// File: src/components/SearchBar.jsx
import React, { useState } from 'react';
import { runScan } from '../services/api';
import { Link, Mail, MessageSquare, Zap } from 'lucide-react';

// Auto-detect scan type from what the user typed
function detectScanType(text) {
  const t = text.trim();
  if (!t) return null;
  // Email pattern: contains @ and a dot after @
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return 'email';
  // URL / domain pattern: starts with http/https, or looks like a domain
  if (/^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+/.test(t)) return 'url';
  // Everything else is a message
  return 'message';
}

const TYPE_META = {
  url:     { label: 'URL',     Icon: Link,          placeholder: 'Enter a URL or domain to scan…',   color: 'text-sky-400'    },
  email:   { label: 'Email',   Icon: Mail,          placeholder: 'Enter an email address to scan…',  color: 'text-violet-400' },
  message: { label: 'Message', Icon: MessageSquare, placeholder: 'Enter a message or SMS to scan…',  color: 'text-amber-400'  },
};

function SearchBar({ onScanStart, onScanComplete, onError }) {
  const [inputText, setInputText]       = useState('');
  const [scanType, setScanType]         = useState('url');
  const [autoDetected, setAutoDetected] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    // Auto-detect and switch tab only when the user hasn't manually chosen
    const detected = detectScanType(val);
    if (detected && detected !== scanType) {
      setScanType(detected);
      setAutoDetected(true);
    } else if (!detected) {
      setAutoDetected(false);
    }
  };

  const handleTabClick = (type) => {
    setScanType(type);
    setAutoDetected(false); // manual override — clear auto flag
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onScanStart();
    setLoading(true);

    try {
      const data = await runScan(scanType, inputText.trim());
      onScanComplete(data);
    } catch (err) {
      onError(err.message || 'An error occurred during scanning.');
    } finally {
      setLoading(false);
    }
  };

  const meta = TYPE_META[scanType];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Scan Type Tabs */}
      <div className="flex items-center gap-2">
        {(['url', 'email', 'message']).map((type) => {
          const { label, Icon } = TYPE_META[type];
          const active = scanType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTabClick(type)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}

        {/* Auto-detect badge */}
        {autoDetected && (
          <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold ml-1 animate-pulse">
            <Zap className="w-3 h-3" /> Auto-detected
          </span>
        )}
      </div>

      {/* Input + Submit */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={meta.placeholder}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Scanning…' : 'Scan'}
        </button>
      </div>

    </form>
  );
}

export default SearchBar;

