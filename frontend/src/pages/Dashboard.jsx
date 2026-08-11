// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, HelpCircle, ChevronRight,
  Bell, Mail, MessageSquare, Lock, 
  ClipboardList, ShieldAlert, TrendingUp,
  Sparkles, AlertCircle, Shield, Bot, Globe, Loader2,
  GitCommit, MapPin, Download, FileText, UploadCloud, Key, RefreshCw, CheckCircle2, Info, User
} from 'lucide-react';
import { runScan, getScanHistory, runBulkScan } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const MiniChartLine = ({ color }) => (
  <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
    <path d="M0,25 C20,20 30,30 50,15 C70,0 80,20 100,10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('url');
  const [isScanning, setIsScanning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [scanError, setScanError] = useState('');

  const [apiKey, setApiKey] = useState(user?.api_key || 'tl_live_demo_key_99a8b7c6d5e4f3a2b1');
  const [copiedKey, setCopiedKey] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "CRITICAL_THREAT", title: "Critical threat blocked", message: "Malicious payload intercepted from API client #492.", time: "Just now" },
    { id: 2, type: "LOGIN", title: "New login detected", message: "Account accessed from Ashburn, VA (104.16.249.249).", time: "2 hours ago" },
    { id: 3, type: "REPORT", title: "Weekly report ready", message: "Your AI Trust Score report for the week is ready to download.", time: "1 day ago" }
  ]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [isBulkScanning, setIsBulkScanning] = useState(false);

  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [lastScanResult, setLastScanResult] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoadingScans(true);
      const data = await getScanHistory();
      setScans(data || []);
      if (data && data.length > 0) {
        setLastScanResult(data[0]);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    } finally {
      setLoadingScans(false);
    }
  };

  const handleExportCSV = () => {
    if (scans.length === 0) return;
    const formatFull = (iso) => iso ? new Date(iso).toLocaleString() : '';
    const headers = ['ID', 'Target Payload', 'Scan Type', 'Trust Score', 'Verdict', 'Timestamp'];
    const rows = scans.map(s => [
      s.id,
      `"${(s.input_data || '').replace(/"/g, '""')}"`,
      s.scan_type,
      s.trust_score,
      s.threat_label || (s.trust_score >= 60 ? 'SAFE' : 'CRITICAL'),
      formatFull(s.created_at),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens_report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchHistory();
    
    // WebSocket Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/api/v1/ws/notifications`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        setShowNotifications(true); // Pop open the dropdown to grab attention
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };
    
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (user?.api_key) {
      setApiKey(user.api_key);
    }
  }, [user]);

  const totalScansCount = scans.length;
  const threatsCount = scans.filter(s => (s.trust_score || 0) < 60).length;
  const safeScansCount = scans.filter(s => (s.trust_score || 0) >= 60).length;
  const protectionRate = totalScansCount > 0 ? Math.round((safeScansCount / totalScansCount) * 100) : 100;
  const latestTrustScore = lastScanResult?.trust_score ?? 86;

  const handleScan = async () => {
    if (!inputValue.trim()) return;
    setIsScanning(true);
    setScanError('');

    try {
      const result = await runScan(activeTab, inputValue);
      setLastScanResult(result);
      setInputValue('');
      await fetchHistory();
    } catch (err) {
      setScanError(err.message || 'Scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'tl_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkScanning(true);
    setBulkProgress(10);

    try {
      const text = await file.text();
      const items = text.split('\n')
        .map(line => line.split(',')[0].replace(/"/g, '').trim())
        .filter(item => item.length > 0 && item.length < 500);

      if (items.length === 0) {
        alert("No valid targets found in CSV.");
        setIsBulkScanning(false);
        return;
      }

      setBulkProgress(40);
      const payloadItems = items.slice(0, 500);
      
      const result = await runBulkScan(payloadItems);
      
      setBulkProgress(100);
      await fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to process CSV file: " + err.message);
    } finally {
      setTimeout(() => setIsBulkScanning(false), 1000);
      e.target.value = null;
    }
  };

  const getInputProps = () => {
    switch (activeTab) {
      case 'email':
        return {
          icon: <Mail className="w-5 h-5 text-slate-500 mr-3" />,
          placeholder: "Paste Email address to analyze..."
        };
      case 'message':
        return {
          icon: <MessageSquare className="w-5 h-5 text-slate-500 mr-3" />,
          placeholder: "Paste Message text to analyze..."
        };
      case 'url':
      default:
        return {
          icon: <Globe className="w-5 h-5 text-slate-500 mr-3" />,
          placeholder: "Paste URL to analyze..."
        };
    }
  };

  const currentInput = getInputProps();

  // Fake dynamic threat trace logic
  const getTraceData = () => {
    if (!lastScanResult) return {
      start: "bit.ly/3xX8a9", 
      mid: "auth-server.xyz", 
      end: "spoof-paypal-login.com", 
      traceId: "#8921-A"
    };
    
    const input = lastScanResult.input_data || "";
    let shortStart = input.length > 25 ? input.substring(0, 22) + '...' : input;
    
    if (latestTrustScore >= 60) {
      return {
        start: shortStart,
        mid: "Direct Connection",
        end: shortStart,
        traceId: `#${lastScanResult.id || '1024'}-S`
      };
    } else {
      return {
        start: shortStart,
        mid: "obfuscated-redirect.net",
        end: "malicious-payload-server.xyz",
        traceId: `#${lastScanResult.id || '1024'}-C`
      };
    }
  };
  const traceData = getTraceData();

  // Fake dynamic explanation logic
  const getDynamicExplanations = () => {
    if (latestTrustScore >= 80) {
      return [
        { text: "SSL certificate is valid and issued by a trusted CA", safe: true },
        { text: "Domain age is over 2 years", safe: true },
        { text: "No blacklisted records found", safe: true },
        { text: "Reputation looks excellent", safe: true }
      ];
    } else if (latestTrustScore >= 60) {
      return [
        { text: "SSL certificate is valid", safe: true },
        { text: "Low phishing keyword match", safe: true },
        { text: "Domain is relatively new", safe: false },
        { text: "Sender lacks strong DMARC records", safe: false }
      ];
    } else {
      return [
        { text: "Blacklisted IP detected in resolution chain", safe: false },
        { text: "Domain registered less than 7 days ago", safe: false },
        { text: "Suspicious homograph spoofing detected", safe: false },
        { text: "High probability of credential harvesting", safe: false }
      ];
    }
  };
  const dynamicExplanations = getDynamicExplanations();

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <BrandLogo className="w-7 h-7 shadow-lg shadow-indigo-500/20 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a onClick={() => navigate('/scan')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Search className="w-5 h-5" /> Scan
            </a>
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Settings className="w-5 h-5" /> Settings
            </a>
            <a onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <User className="w-5 h-5" /> Profile
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed">Unlock advanced protection and real-time alerts.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
              Upgrade Now
            </button>
          </div>

          <a onClick={() => navigate('/support')} className="flex items-center justify-between px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">Need Help?</span>
                <span className="text-[10px]">Contact Support</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 dark:from-slate-900 via-white dark:via-slate-950 to-white dark:to-slate-950">
        
        <header className="h-20 flex items-center justify-end px-8 z-20 flex-shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) setUnreadCount(0);
                }}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3">
                        <div className="mt-0.5">
                          {notif.type === 'CRITICAL_THREAT' ? <ShieldAlert className="w-4 h-4 text-red-500" /> : 
                           notif.type === 'LOGIN' ? <Lock className="w-4 h-4 text-amber-500" /> : 
                           <ClipboardList className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <button onClick={() => {setShowNotifications(false); setUnreadCount(0);}} className="w-full text-xs font-bold text-indigo-400 py-1.5 hover:text-indigo-500 transition-colors">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 uppercase">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user?.name || 'Sudharsan'} <ChevronRight className="w-3 h-3 inline rotate-90 opacity-50" /></p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-none">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
            
            {/* LEFT / CENTER COLUMN */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden">
                <div className="z-10">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-2">
                    Hello, {user?.name || 'Sudharsan'}! <span className="animate-wave text-2xl">👋</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Stay safe online. Let AI check it for you.</p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent flex items-center justify-end pr-8 pointer-events-none">
                  <div className="w-32 h-20 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-300/50 dark:border-slate-700/50 flex items-center justify-center relative shadow-2xl rotate-3">
                    <Shield className="w-10 h-10 text-indigo-400" />
                    <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>

              {/* Main Scanner Box */}
              <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-1">Scan anything. <span className="text-slate-600 dark:text-slate-400 font-normal">Get instant trust score.</span></h2>
                
                <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 mt-4">
                  <button onClick={() => setActiveTab('url')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'url' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>
                    <Globe className="w-4 h-4" /> URL
                  </button>
                  <button onClick={() => setActiveTab('email')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'email' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button onClick={() => setActiveTab('message')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'message' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center px-4 focus-within:border-indigo-500/50 transition-colors">
                    {currentInput.icon}
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentInput.placeholder} 
                      className="flex-1 bg-transparent border-none py-3 focus:outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-600"
                    />
                  </div>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning || !inputValue.trim()}
                    className={`bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm min-w-[120px] cursor-pointer ${isScanning || !inputValue.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isScanning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analyze</>
                    )}
                  </button>
                </div>

                {scanError && (
                  <p className="text-red-400 text-xs mt-2 font-medium">{scanError}</p>
                )}
                
                <p className="text-slate-500 text-xs mt-4 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> We never store or share your data.
                </p>
              </div>

              {/* DYNAMIC STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400"><ClipboardList className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-0.5">Total Scans</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{loadingScans ? '...' : totalScansCount}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">All Time</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#818cf8" /></div>
                </div>

                <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400"><ShieldAlert className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-0.5">Threats Detected</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{loadingScans ? '...' : threatsCount}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">All Time</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#fbbf24" /></div>
                </div>

                <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><TrendingUp className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-0.5">Protection Rate</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{loadingScans ? '...' : `${protectionRate}%`}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">This Month</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#34d399" /></div>
                </div>
              </div>

              {/* ALGORITHMIC THREAT TRACING */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-indigo-400" /> Algorithmic Redirect & Threat Tracing
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">TRACE_ID: {traceData.traceId}</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">1</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">User Target</p>
                        <p className="text-[10px] text-slate-500 font-mono max-w-[150px] truncate" title={traceData.start}>{traceData.start}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-amber-500/30 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">2</div>
                      <div>
                        <p className="text-xs font-bold text-amber-400">Analysis Node</p>
                        <p className="text-[10px] text-slate-500 font-mono">{traceData.mid}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                    <div className={`flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border w-full md:w-auto ${latestTrustScore >= 60 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${latestTrustScore >= 60 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>3</div>
                      <div>
                        <p className={`text-xs font-bold ${latestTrustScore >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{latestTrustScore >= 60 ? 'Verified Safe' : 'Final Payload'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{traceData.end}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BULK CSV SCANNING ENGINE */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-indigo-400" /> Bulk Threat Scanner (CSV)
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/20 font-bold">PRO ENGINE</span>
                </div>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 dark:bg-slate-950/40">
                  {!isBulkScanning ? (
                    <>
                      <FileText className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drop your CSV containing multiple URLs or Emails</p>
                      <p className="text-[10px] text-slate-500 mt-1 mb-4">Upload up to 500 targets for simultaneous AI auditing.</p>
                      <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer">
                        Upload CSV File
                        <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                      </label>
                    </>
                  ) : (
                    <div className="w-full max-w-md space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-indigo-400 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin"/> Processing Batch File...</span>
                        <span className="text-slate-700 dark:text-slate-300">{bulkProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${bulkProgress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Analyzing target {Math.floor((bulkProgress/100)*50)}/50...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT SCANS TABLE */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold">Recent Scans</h3>
                    <p className="text-[10px] text-slate-500">Cross-referenced against global threat intelligence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportCSV}
                      disabled={scans.length === 0}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" /> Export CSV
                    </button>
                    <a onClick={() => navigate('/history')} className="text-indigo-400 text-xs font-bold hover:underline cursor-pointer">View All</a>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-xs border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3 font-semibold pl-2">Item</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold">Result</th>
                        <th className="pb-3 font-semibold">Time</th>
                        <th className="pb-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {loadingScans ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">Loading recent scan records...</td>
                        </tr>
                      ) : scans.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">No scans logged yet. Analyze your first link above!</td>
                        </tr>
                      ) : (
                        scans.slice(0, 5).map((scan) => {
                          const score = scan.trust_score || 0;
                          const isSafe = score >= 60;
                          return (
                            <tr key={scan.id || Math.random()} onClick={() => navigate('/history')} className="border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-200/20 dark:bg-slate-800/20 cursor-pointer">
                              <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                {scan.scan_type === 'email' ? <Mail className="w-3.5 h-3.5 text-amber-400"/> : scan.scan_type === 'message' ? <MessageSquare className="w-3.5 h-3.5 text-amber-400"/> : <Globe className="w-3.5 h-3.5 text-indigo-400"/>}
                                {scan.input_data}
                              </td>
                              <td className="py-3.5 text-slate-500 uppercase">{scan.scan_type}</td>
                              <td className={`py-3.5 font-bold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{score}/100</td>
                              <td className={`py-3.5 font-medium ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{scan.threat_label || (isSafe ? 'Safe' : 'High Risk')}</td>
                              <td className="py-3.5 text-slate-500">{new Date(scan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* TRUST SCORE ARC CARD WITH REAL-TIME SCORE */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm">Your Trust Score</h3>
                  <Info className="w-4 h-4 text-slate-500" />
                </div>
                
                <div className="relative flex items-end justify-center h-32 w-full mt-4">
                  <div className={`absolute top-4 ${latestTrustScore >= 60 ? 'bg-emerald-500/10' : 'bg-red-500/10'} w-32 h-32 rounded-full blur-2xl pointer-events-none`}></div>
                  <svg className="w-56 h-28" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke={latestTrustScore >= 60 ? '#10b981' : '#ef4444'} 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      strokeDasharray="125.6" 
                      strokeDashoffset={125.6 - (125.6 * (latestTrustScore / 100))} 
                      className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                    />
                  </svg>
                  <div className="absolute bottom-2 flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{latestTrustScore}<span className="text-lg text-slate-600 dark:text-slate-400 font-bold ml-1">/100</span></span>
                    <div className={`flex items-center gap-1.5 mt-2 font-bold text-xs px-2.5 py-1 rounded-full ${latestTrustScore >= 60 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {latestTrustScore >= 60 ? <><CheckCircle2 className="w-3.5 h-3.5" /> Safe</> : <><AlertCircle className="w-3.5 h-3.5" /> High Risk</>}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{latestTrustScore >= 60 ? 'This target looks safe!' : 'Suspicious patterns detected!'}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{latestTrustScore >= 60 ? 'No harmful signals detected.' : 'Proceed with extreme caution.'}</p>
                </div>
                
                <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2 mt-5 text-center">
                  <p className="text-emerald-400/80 text-[10px] font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Last scanned: Just now
                  </p>
                </div>
              </div>

              {/* GEOGRAPHIC SERVER HEATMAP / LOCATION */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-indigo-400" /> Server Physical Location
                </h3>
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 relative">
                    <MapPin className="w-5 h-5 animate-bounce" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md pointer-events-none"></div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ashburn, Virginia, USA</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">IP: 104.16.249.249 (Cloudflare Edge)</p>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-900 pt-3 w-full justify-center">
                    <span>Latency: <strong className="text-emerald-400">12ms</strong></span>
                    <span>ISP: <strong className="text-slate-800 dark:text-slate-200">AS13335</strong></span>
                  </div>
                </div>
              </div>

              {/* AI EXPLANATION CARD WITH DYNAMIC REASONS */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 mb-5">
                  AI Explanation <Sparkles className="w-4 h-4 text-indigo-400" />
                </h3>
                
                <ul className="space-y-3 relative z-10 text-xs">
                  {dynamicExplanations.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {exp.safe ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{exp.text}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => navigate('/scan')} className="mt-5 text-xs font-bold text-indigo-400 border border-indigo-500/30 rounded-lg px-4 py-2 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5 cursor-pointer">
                  View Full Report <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* ACTIVE INTEGRATIONS */}
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-indigo-400" /> Active Integrations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Browser Extension</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Protecting 3 browsers</p>
                      </div>
                    </div>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full flex items-center p-0.5 justify-end border border-emerald-500/30">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Gmail Add-on</p>
                        <p className="text-[10px] text-slate-500 font-medium">Not connected</p>
                      </div>
                    </div>
                    <div className="w-8 h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center p-0.5 justify-start border border-slate-300 dark:border-slate-700">
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;