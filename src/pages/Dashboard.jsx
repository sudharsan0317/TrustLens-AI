import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, HelpCircle, ChevronRight,
  Bell, User, Link as LinkIcon, Mail, MessageSquare, Lock, 
  ClipboardList, ShieldAlert, TrendingUp, Info, CheckCircle2, 
  Sparkles, AlertCircle, Shield, Bot, Globe, Loader2,
  GitCommit, MapPin, Download, FileText, UploadCloud, Key, RefreshCw
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('url');
  const [isScanning, setIsScanning] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Feature State
  const [apiKey, setApiKey] = useState('tl_live_99a8b7c6d5e4f3a2b1_secret');
  const [copiedKey, setCopiedKey] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [isBulkScanning, setIsBulkScanning] = useState(false);

  const handleScan = () => {
    if (!inputValue.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setInputValue('');
    }, 2000);
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

  const handleSimulateBulkUpload = () => {
    setIsBulkScanning(true);
    setBulkProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setBulkProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsBulkScanning(false), 800);
      }
    }, 250);
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

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <BrandLogo className="w-7 h-7 shadow-lg shadow-indigo-500/20 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a onClick={() => navigate('/scan')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Search className="w-5 h-5" /> Scan
            </a>
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Settings className="w-5 h-5" /> Settings
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Unlock advanced protection and real-time alerts.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
              Upgrade Now
            </button>
          </div>

          <a href="#" className="flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white transition-colors group">
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

      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        <header className="h-20 flex items-center justify-end px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                S
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white leading-none mb-1">Sudharsan <ChevronRight className="w-3 h-3 inline rotate-90 opacity-50" /></p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
            
            {/* LEFT / CENTER COLUMN */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden">
                <div className="z-10">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-2">
                    Hello, Sudharsan! <span className="animate-wave text-2xl">👋</span>
                  </h1>
                  <p className="text-slate-400 text-sm">Stay safe online. Let AI check it for you.</p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent flex items-center justify-end pr-8 pointer-events-none">
                  <div className="w-32 h-20 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center relative shadow-2xl rotate-3">
                    <Shield className="w-10 h-10 text-indigo-400" />
                    <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>

              {/* Main Scanner Box */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
                <h2 className="text-white font-bold text-lg mb-1">Scan anything. <span className="text-slate-400 font-normal">Get instant trust score.</span></h2>
                
                <div className="flex gap-6 border-b border-slate-800 mb-6 mt-4">
                  <button onClick={() => setActiveTab('url')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'url' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    <LinkIcon className="w-4 h-4" /> URL
                  </button>
                  <button onClick={() => setActiveTab('email')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'email' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button onClick={() => setActiveTab('message')} className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'message' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center px-4 focus-within:border-indigo-500/50 transition-colors">
                    {currentInput.icon}
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentInput.placeholder} 
                      className="flex-1 bg-transparent border-none py-3 focus:outline-none text-white text-sm placeholder:text-slate-600"
                    />
                  </div>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning || !inputValue.trim()}
                    className={`bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm min-w-[120px] ${isScanning || !inputValue.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isScanning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analyze</>
                    )}
                  </button>
                </div>
                
                <p className="text-slate-500 text-xs mt-4 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> We never store or share your data.
                </p>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400"><ClipboardList className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-0.5">Total Scans</p>
                      <h3 className="text-2xl font-bold text-white leading-none">248</h3>
                      <p className="text-[10px] text-slate-500 mt-1">All Time</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#818cf8" /></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400"><ShieldAlert className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-0.5">Threats Detected</p>
                      <h3 className="text-2xl font-bold text-white leading-none">37</h3>
                      <p className="text-[10px] text-slate-500 mt-1">All Time</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#fbbf24" /></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><TrendingUp className="w-5 h-5"/></div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-0.5">Protection Rate</p>
                      <h3 className="text-2xl font-bold text-white leading-none">86%</h3>
                      <p className="text-[10px] text-slate-500 mt-1">This Month</p>
                    </div>
                  </div>
                  <div className="mt-2"><MiniChartLine color="#34d399" /></div>
                </div>
              </div>

              {/* ALGORITHMIC THREAT TRACING */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-indigo-400" /> Algorithmic Redirect & Threat Tracing
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">TRACE_ID: #8921-A</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
                    <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">1</div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">User Link</p>
                        <p className="text-[10px] text-slate-500 font-mono">bit.ly/3xX8a9</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                    <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-amber-500/30 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">2</div>
                      <div>
                        <p className="text-xs font-bold text-amber-400">302 Redirect</p>
                        <p className="text-[10px] text-slate-500 font-mono">auth-server.xyz</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                    <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-red-500/30 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold">3</div>
                      <div>
                        <p className="text-xs font-bold text-red-400">Final Payload</p>
                        <p className="text-[10px] text-slate-500 font-mono">spoof-paypal-login.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BULK CSV SCANNING ENGINE */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-indigo-400" /> Bulk Threat Scanner (CSV)
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/20 font-bold">PRO ENGINE</span>
                </div>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-950/40">
                  {!isBulkScanning ? (
                    <>
                      <FileText className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-slate-300">Drop your CSV containing multiple URLs or Emails</p>
                      <p className="text-[10px] text-slate-500 mt-1 mb-4">Upload up to 500 targets for simultaneous AI auditing.</p>
                      <button onClick={handleSimulateBulkUpload} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-700 transition-colors">
                        Simulate Bulk Scan
                      </button>
                    </>
                  ) : (
                    <div className="w-full max-w-md space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-indigo-400 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin"/> Processing Batch File...</span>
                        <span className="text-slate-300">{bulkProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${bulkProgress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Analyzing target {Math.floor((bulkProgress/100)*50)}/50...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT SCANS TABLE WITH EXPORT PDF */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white font-bold">Recent Scans</h3>
                    <p className="text-[10px] text-slate-500">Cross-referenced against global threat intelligence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => alert("Downloading Security Audit PDF Report...")} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors">
                      <Download className="w-3.5 h-3.5 text-indigo-400" /> Export PDF
                    </button>
                    <a onClick={() => navigate('/history')} className="text-indigo-400 text-xs font-bold hover:underline cursor-pointer">View All</a>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-xs border-b border-slate-800">
                        <th className="pb-3 font-semibold pl-2">Item</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold">Result</th>
                        <th className="pb-3 font-semibold">Time</th>
                        <th className="pb-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer">
                        <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-300"><Globe className="w-3.5 h-3.5 text-indigo-400"/> https://www.google.com</td>
                        <td className="py-3.5 text-slate-500">URL</td>
                        <td className="py-3.5 font-bold text-emerald-400">98/100</td>
                        <td className="py-3.5 text-emerald-400 font-medium">Safe</td>
                        <td className="py-3.5 text-slate-500">Just now</td>
                        <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                      </tr>
                      <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer">
                        <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-300"><Mail className="w-3.5 h-3.5 text-amber-400"/> Meeting details for tomorrow</td>
                        <td className="py-3.5 text-slate-500">Email</td>
                        <td className="py-3.5 font-bold text-amber-400">72/100</td>
                        <td className="py-3.5 text-amber-400 font-medium">Caution</td>
                        <td className="py-3.5 text-slate-500">5m ago</td>
                        <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                      </tr>
                      <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer">
                        <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-300"><Globe className="w-3.5 h-3.5 text-red-400"/> http://secure-login-update.com</td>
                        <td className="py-3.5 text-slate-500">URL</td>
                        <td className="py-3.5 font-bold text-red-400">18/100</td>
                        <td className="py-3.5 text-red-400 font-medium">High Risk</td>
                        <td className="py-3.5 text-slate-500">16m ago</td>
                        <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                      </tr>
                      <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer">
                        <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-300"><MessageSquare className="w-3.5 h-3.5 text-amber-400"/> Can you review this offer?</td>
                        <td className="py-3.5 text-slate-500">Message</td>
                        <td className="py-3.5 font-bold text-amber-400">65/100</td>
                        <td className="py-3.5 text-amber-400 font-medium">Caution</td>
                        <td className="py-3.5 text-slate-500">30m ago</td>
                        <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                      </tr>
                      <tr className="hover:bg-slate-800/20 cursor-pointer">
                        <td className="py-3.5 pl-2 flex items-center gap-2 font-medium text-slate-300"><Globe className="w-3.5 h-3.5 text-emerald-400"/> https://www.amazon.in</td>
                        <td className="py-3.5 text-slate-500">URL</td>
                        <td className="py-3.5 font-bold text-emerald-400">92/100</td>
                        <td className="py-3.5 text-emerald-400 font-medium">Safe</td>
                        <td className="py-3.5 text-slate-500">1h ago</td>
                        <td className="py-3.5 text-right pr-2"><ChevronRight className="w-4 h-4 text-slate-600 inline" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* TRUST SCORE ARC CARD */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm">Your Trust Score</h3>
                  <Info className="w-4 h-4 text-slate-500" />
                </div>
                
                <div className="relative flex items-end justify-center h-32 w-full mt-4">
                  <div className="absolute top-4 bg-emerald-500/10 w-32 h-32 rounded-full blur-2xl pointer-events-none"></div>
                  <svg className="w-56 h-28" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="17.6" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </svg>
                  <div className="absolute bottom-2 flex flex-col items-center">
                    <span className="text-5xl font-black text-white leading-none">86<span className="text-lg text-slate-400 font-bold ml-1">/100</span></span>
                    <div className="flex items-center gap-1.5 mt-2 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Safe
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-slate-300 text-sm font-medium">This link looks safe!</p>
                  <p className="text-slate-500 text-xs mt-0.5">No harmful signals detected.</p>
                </div>
                
                <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2 mt-5 text-center">
                  <p className="text-emerald-400/80 text-[10px] font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Last scanned: Just now
                  </p>
                </div>
              </div>

              {/* GEOGRAPHIC SERVER HEATMAP / LOCATION */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-indigo-400" /> Server Physical Location
                </h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 relative">
                    <MapPin className="w-5 h-5 animate-bounce" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md pointer-events-none"></div>
                  </div>
                  <h4 className="text-xs font-bold text-white">Ashburn, Virginia, USA</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">IP: 104.16.249.249 (Cloudflare Edge)</p>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-900 pt-3 w-full justify-center">
                    <span>Latency: <strong className="text-emerald-400">12ms</strong></span>
                    <span>ISP: <strong className="text-slate-200">AS13335</strong></span>
                  </div>
                </div>
              </div>

              {/* AI EXPLANATION CARD */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-5">
                  AI Explanation <Sparkles className="w-4 h-4 text-indigo-400" />
                </h3>
                
                <ul className="space-y-3 relative z-10 text-xs">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 font-medium leading-relaxed">SSL certificate is valid</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 font-medium leading-relaxed">Domain age is 2.8 years</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 font-medium leading-relaxed">No blacklisted records found</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 font-medium leading-relaxed">Low phishing keyword match</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 font-medium leading-relaxed">Reputation looks good</span>
                  </li>
                </ul>

                <button className="mt-5 text-xs font-bold text-indigo-400 border border-indigo-500/30 rounded-lg px-4 py-2 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5 cursor-pointer">
                  View Full Report <ChevronRight className="w-3 h-3" />
                </button>
                
                <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-40 pointer-events-none">
                  <Bot className="w-full h-full text-indigo-400" />
                </div>
              </div>

              {/* API KEY MANAGEMENT PANEL */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-indigo-400" /> Developer API Access
                </h3>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{apiKey}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopyKey} className="text-[10px] font-bold text-indigo-400 hover:underline cursor-pointer">
                      {copiedKey ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleRegenerateKey} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE INTEGRATIONS */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-indigo-400" /> Active Integrations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Browser Extension</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Protecting 3 browsers</p>
                      </div>
                    </div>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full flex items-center p-0.5 justify-end border border-emerald-500/30">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Gmail Add-on</p>
                        <p className="text-[10px] text-slate-500 font-medium">Not connected</p>
                      </div>
                    </div>
                    <div className="w-8 h-4 bg-slate-800 rounded-full flex items-center p-0.5 justify-start border border-slate-700">
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