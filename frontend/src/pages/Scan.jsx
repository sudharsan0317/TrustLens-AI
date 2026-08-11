import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, User, Crown, Bell, ChevronRight, 
  Globe, ShieldCheck, ShieldAlert, CloudUpload, Layers, Mail, MessageSquare, AlertTriangle
} from 'lucide-react';
import ReasonChip from '../components/ReasonChip';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../context/AuthContext';
import { runScan, runFusionScan } from '../services/api';

const BrandLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear)" />
    <path d="M16 7L8 10.5V16C8 21.25 11.4 26.1 16 27.5C20.6 26.1 24 21.25 24 16V10.5L16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" />
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

const Toggle = ({ enabled, onToggle }) => (
  <div className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={onToggle}>
    <span className={`absolute top-1 left-1 h-3 w-3 rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
  </div>
);

// Signal bar for fusion breakdown
const SignalBar = ({ label, icon: Icon, score, weight, color }) => {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">weight {Math.round(weight * 100)}%</span>
          <span className={`font-bold ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {pct}/100
          </span>
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

function Scan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [scanMode, setScanMode] = useState('single'); // 'single' | 'fusion'
  const [target, setTarget] = useState('');
  const [fusionUrl, setFusionUrl] = useState('');
  const [fusionEmail, setFusionEmail] = useState('');
  const [fusionMessage, setFusionMessage] = useState('');
  const [deepDns, setDeepDns] = useState(true);
  const [darkWeb, setDarkWeb] = useState(false);
  const [bypassCache, setBypassCache] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');

  const terminalBodyRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const detectType = (val) => {
    if (val.startsWith('http') || val.includes('www.') || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'url';
    if (val.includes('@') && !val.includes(' ')) return 'email';
    return 'message';
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const addTerminalLine = async (text, color = 'text-emerald-400', delay = 600) => {
    setTerminalLines(prev => [...prev, { text, color }]);
    await sleep(delay);
  };

  const handleSingleScan = async () => {
    if (!target.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setScanError('');
    setTerminalLines([]);

    const type = detectType(target.trim());
    addTerminalLine(`> INITIATING FORENSIC SCAN ON: ${target}`, 'text-emerald-400', 800);
    
    let apiResult = null, apiError = null;
    const options = { deepDns, darkWeb, bypassCache };
    runScan(type, target.trim(), options)
      .then(res => apiResult = res)
      .catch(err => apiError = err);

    await addTerminalLine(`> ESTABLISHING SECURE CONNECTION...`, 'text-emerald-400', 1000);
    if (deepDns) await addTerminalLine(`> [DEEP DNS] RESOLVING NAMESERVERS...`, 'text-emerald-400', 1200);
    if (type === 'url') {
      await addTerminalLine(`> ANALYZING SSL CERTIFICATE CHAIN...`, 'text-emerald-400', 900);
      await addTerminalLine(`> PARSING JAVASCRIPT PAYLOADS FOR MALICIOUS INJECTIONS...`, 'text-emerald-400', 1500);
    } else if (type === 'email') {
      await addTerminalLine(`> EXTRACTING EMAIL HEADERS...`, 'text-emerald-400', 1000);
      await addTerminalLine(`> VERIFYING SPF/DKIM/DMARC RECORDS...`, 'text-emerald-400', 1200);
    } else {
      await addTerminalLine(`> INITIATING NLP HEURISTICS ENGINE...`, 'text-emerald-400', 1000);
      await addTerminalLine(`> EXTRACTING LINGUISTIC PATTERNS...`, 'text-emerald-400', 1200);
    }
    if (darkWeb) await addTerminalLine(`> CROSS-REFERENCING DARK WEB ONION REGISTRIES...`, 'text-amber-400', 2000);
    await addTerminalLine(`> FINALIZING THREAT INTELLIGENCE REPORT...`, 'text-emerald-400', 1500);
    while (!apiResult && !apiError) await sleep(500);
    await addTerminalLine(`> SCAN COMPLETE.`, 'text-indigo-400', 500);

    if (apiError) {
      await addTerminalLine(`> FATAL ERROR: ${apiError.message}`, 'text-red-500', 0);
      setScanError(apiError.message);
    } else {
      const isSafe = apiResult.trust_score > 60;
      const verdictColor = isSafe ? 'text-emerald-400' : 'text-red-500';
      await addTerminalLine(`> FINAL SCORE: ${apiResult.trust_score}/100 (${apiResult.threat_label || (isSafe ? 'SECURE' : 'CRITICAL')})`, verdictColor, 0);
      setScanResult(apiResult);
    }
    setIsScanning(false);
  };

  const handleFusionScan = async () => {
    if (!fusionUrl.trim() && !fusionEmail.trim() && !fusionMessage.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setScanError('');
    setTerminalLines([]);

    const inputs = [];
    if (fusionUrl.trim()) inputs.push('URL');
    if (fusionEmail.trim()) inputs.push('EMAIL');
    if (fusionMessage.trim()) inputs.push('MESSAGE');

    addTerminalLine(`> FUSION ENGINE ACTIVATED — PROCESSING ${inputs.join(' + ')}`, 'text-violet-400', 800);

    let apiResult = null, apiError = null;
    runFusionScan({ url: fusionUrl || null, email: fusionEmail || null, message: fusionMessage || null })
      .then(res => apiResult = res)
      .catch(err => apiError = err);

    await addTerminalLine(`> LOADING ML FUSION LAYER...`, 'text-violet-400', 900);
    if (fusionUrl) await addTerminalLine(`> [URL] RUNNING RANDOM FOREST CLASSIFIER...`, 'text-emerald-400', 1200);
    if (fusionEmail) await addTerminalLine(`> [EMAIL] RUNNING LOGISTIC REGRESSION MODEL...`, 'text-emerald-400', 1100);
    if (fusionMessage) await addTerminalLine(`> [MSG] RUNNING TF-IDF + PIPELINE CLASSIFIER...`, 'text-emerald-400', 1000);
    await addTerminalLine(`> COMPUTING WEIGHTED RISK PROBABILITY...`, 'text-violet-400', 1300);
    await addTerminalLine(`> FUSING SIGNAL CONTRIBUTIONS...`, 'text-violet-400', 1000);
    while (!apiResult && !apiError) await sleep(500);
    await addTerminalLine(`> FUSION ANALYSIS COMPLETE.`, 'text-indigo-400', 400);

    if (apiError) {
      await addTerminalLine(`> FATAL ERROR: ${apiError.message}`, 'text-red-500', 0);
      setScanError(apiError.message);
    } else {
      const isSafe = apiResult.trust_score > 60;
      await addTerminalLine(
        `> FUSION TRUST SCORE: ${apiResult.trust_score}/100 — ${apiResult.threat_label}`,
        isSafe ? 'text-emerald-400' : 'text-red-500', 0
      );
      if (apiResult.risk_probability !== undefined) {
        await addTerminalLine(`> PHISHING PROBABILITY: ${apiResult.risk_probability}%`, isSafe ? 'text-emerald-400' : 'text-red-500', 0);
      }
      setScanResult({ ...apiResult, _fusion: true });
    }
    setIsScanning(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTarget(file.name);
      handleSingleScan();
    }
  };

  const fusionSignals = scanResult?._fusion ? scanResult.details?.signals || {} : null;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50">
            <BrandLogo className="w-7 h-7 shadow-lg shadow-indigo-500/20 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-default">
              <Search className="w-5 h-5" /> Scan
            </a>
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Settings className="w-5 h-5" /> Settings
            </a>
            <a onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <User className="w-5 h-5" /> Profile
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-600 dark:text-indigo-400 mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed">Unlock advanced protection and real-time alerts.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 dark:from-slate-900 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0">
          <div></div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 uppercase text-white">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user?.name || 'User'} <ChevronRight className="w-3 h-3 inline rotate-90 opacity-50" /></p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Advanced Scan Center</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Configure forensic parameters and monitor algorithmic analysis in real-time.</p>
            </div>

            {/* MODE TOGGLE */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
              <button
                onClick={() => { setScanMode('single'); setScanResult(null); setTerminalLines([]); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${scanMode === 'single' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                <Search className="w-4 h-4" /> Single Scan
              </button>
              <button
                onClick={() => { setScanMode('fusion'); setScanResult(null); setTerminalLines([]); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${scanMode === 'fusion' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                <Layers className="w-4 h-4" /> Fusion Mode
                <span className="ml-1 px-1.5 py-0.5 bg-violet-500/20 text-violet-300 text-[9px] font-extrabold rounded uppercase tracking-wider">AI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: CONTROL PANEL */}
              <div className="space-y-6">
                
                {scanMode === 'single' ? (
                  /* Single Scan Input */
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Target Identity</h3>
                    <div className="relative group mb-4">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSingleScan()}
                        disabled={isScanning}
                        placeholder="google.com, message, or email@domain.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleSingleScan}
                      disabled={isScanning || !target.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Initialize Advanced Scan
                    </button>
                  </div>
                ) : (
                  /* Fusion Mode Inputs */
                  <div className="bg-white dark:bg-slate-900/40 border border-violet-500/30 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-violet-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fusion Intelligence Inputs</h3>
                      <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-bold">Fill any combination</span>
                    </div>

                    <div className="relative group">
                      <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        value={fusionUrl}
                        onChange={e => setFusionUrl(e.target.value)}
                        disabled={isScanning}
                        placeholder="Suspicious URL (optional)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        value={fusionEmail}
                        onChange={e => setFusionEmail(e.target.value)}
                        disabled={isScanning}
                        placeholder="Sender email address (optional)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <textarea
                        value={fusionMessage}
                        onChange={e => setFusionMessage(e.target.value)}
                        disabled={isScanning}
                        rows={3}
                        placeholder="Suspicious message body (optional)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleFusionScan}
                      disabled={isScanning || (!fusionUrl.trim() && !fusionEmail.trim() && !fusionMessage.trim())}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" /> Run Fusion Analysis
                    </button>
                  </div>
                )}

                {/* Analysis Parameters */}
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400" /> Analysis Parameters</h3>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Deep DNS Resolution</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Trace nameservers and historical IP ownership.</p>
                    </div>
                    <Toggle enabled={deepDns} onToggle={() => !isScanning && setDeepDns(!deepDns)} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Dark Web Mention Check</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cross-reference domain against onion registries (takes longer).</p>
                    </div>
                    <Toggle enabled={darkWeb} onToggle={() => !isScanning && setDarkWeb(!darkWeb)} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Bypass Local Cache</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Force a live connection instead of using recent DB records.</p>
                    </div>
                    <Toggle enabled={bypassCache} onToggle={() => !isScanning && setBypassCache(!bypassCache)} />
                  </div>
                </div>

                {/* Offline File Analysis */}
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm border-dashed">
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Offline File Analysis</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Drag and drop raw .eml (email) or .html payloads here for isolated, air-gapped scanning.</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".eml,.html,.txt" onChange={handleFileUpload} />
                    <button 
                      onClick={() => !isScanning && fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="px-6 py-2 mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: TERMINAL & RESULTS */}
              <div className="space-y-6 h-full flex flex-col">
                
                <div className="flex-1 h-[500px] bg-[#0a0a0c] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-mono relative">
                  {/* Terminal Header */}
                  <div className={`h-10 border-b border-slate-800 flex items-center justify-between px-4 ${scanMode === 'fusion' ? 'bg-violet-950/60' : 'bg-[#16161a]'}`}>
                    <p className={`text-xs font-bold flex items-center gap-2 ${scanMode === 'fusion' ? 'text-violet-400' : 'text-slate-500'}`}>
                      <ChevronRight className="w-4 h-4" />
                      {scanMode === 'fusion' ? 'trustlens-fusion@ml-engine:~' : 'root@trustlens-ai:~'}
                    </p>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    </div>
                  </div>
                  
                  {/* Terminal Body */}
                  <div ref={terminalBodyRef} className="flex-1 p-6 overflow-y-auto text-xs sm:text-sm space-y-2 text-emerald-400 leading-relaxed shadow-inner">
                    {terminalLines.map((line, idx) => (
                      <div key={idx} className={`${line.color} animate-in fade-in duration-300 break-all`}>
                        {line.text}
                      </div>
                    ))}
                    {isScanning && (
                      <div className="animate-pulse">_</div>
                    )}
                  </div>
                </div>

                {/* RESULT CARD */}
                {scanResult && !isScanning && (
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-slate-900 dark:text-white space-y-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          {scanResult._fusion ? (
                            <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Layers className="w-3 h-3" /> FUSION SCAN
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              {scanResult.scan_type || 'URL'} SCAN
                            </span>
                          )}
                          {scanResult.trust_score > 60 ? (
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VERDICT: {scanResult.threat_label || 'SAFE'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> VERDICT: {scanResult.threat_label || 'CRITICAL'}
                            </span>
                          )}
                          {scanResult.risk_probability !== undefined && (
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold">
                              RISK: {scanResult.risk_probability}%
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold mt-2 break-all font-mono">
                          {scanResult.input_data}
                        </h2>
                      </div>

                      <div className="flex-shrink-0 flex justify-center bg-slate-50 dark:bg-transparent p-4 rounded-full">
                        <ScoreRing score={scanResult.trust_score} />
                      </div>
                    </div>

                    {/* FUSION SIGNAL BREAKDOWN */}
                    {fusionSignals && Object.keys(fusionSignals).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" /> ML Fusion Signal Breakdown
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                          {fusionSignals.url && (
                            <SignalBar
                              label="URL Analysis"
                              icon={Globe}
                              score={fusionSignals.url.trust_score ?? Math.round((1 - fusionSignals.url.phishing_probability) * 100)}
                              weight={fusionSignals.url.effective_weight ?? 0.4}
                              color="text-indigo-400"
                            />
                          )}
                          {fusionSignals.message && (
                            <SignalBar
                              label="Message NLP"
                              icon={MessageSquare}
                              score={fusionSignals.message.trust_score ?? Math.round((1 - fusionSignals.message.phishing_probability) * 100)}
                              weight={fusionSignals.message.effective_weight ?? 0.4}
                              color="text-emerald-400"
                            />
                          )}
                          {fusionSignals.email && (
                            <SignalBar
                              label="Email Intelligence"
                              icon={Mail}
                              score={fusionSignals.email.trust_score ?? Math.round((1 - fusionSignals.email.phishing_probability) * 100)}
                              weight={fusionSignals.email.effective_weight ?? 0.2}
                              color="text-amber-400"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Forensic Reasons */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Forensic Analysis Breakdown
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.details?.reasons?.length > 0 ? (
                          scanResult.details.reasons.map((reason, idx) => (
                            <ReasonChip key={idx} text={reason} />
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-xs">No critical risk triggers or malicious patterns detected in this target.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Scan;