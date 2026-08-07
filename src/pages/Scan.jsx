import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, HelpCircle, ChevronRight,
  Bell, Globe, Loader2, Sparkles, Terminal, FileType, UploadCloud, 
  ToggleRight, Activity, ShieldCheck, AlertOctagon
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

const CustomToggle = ({ label, description, isOn, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors" onClick={onToggle}>
    <div className="flex flex-col pr-4">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <span className="text-[10px] text-slate-500 mt-0.5">{description}</span>
    </div>
    <div className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isOn ? 'bg-indigo-500' : 'bg-slate-700'}`}>
      <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOn ? 'translate-x-2' : '-translate-x-2'}`} />
    </div>
  </div>
);

function Scan() {
  const navigate = useNavigate();
  
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [toggles, setToggles] = useState({
    dns: true,
    darkweb: false,
    bypass: false,
  });

  const [logs, setLogs] = useState([
    "> SYSTEM READY.",
    "> AWAITING TARGET INPUT FOR FORENSIC ANALYSIS..."
  ]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startAdvancedScan = () => {
    if (!inputValue.trim() || isScanning) return;
    
    setIsScanning(true);
    setLogs([`> INITIATING FORENSIC SCAN ON: ${inputValue}`]);

    const sequence = [
      "> ESTABLISHING SECURE CONNECTION TO TARGET...",
      "> HTTP/2 200 OK",
      toggles.dns ? "> [DEEP DNS] RESOLVING NAMESERVERS... NS1.CLOUDFLARE.COM" : "> SKIPPING DEEP DNS RESOLUTION...",
      "> ANALYZING SSL CERTIFICATE CHAIN...",
      "> SSL ISSUER: DIGICERT INC (VALID)",
      "> INITIATING AI VISUAL HEURISTICS ENGINE...",
      "> MATCHING DOMAIN AGE... [REGISTERED 2.8 YEARS AGO]",
      toggles.darkweb ? "> [DARK WEB] CROSS-REFERENCING ONION REGISTRIES... [CLEAN]" : "> SKIPPING DARK WEB CHECK...",
      "> PARSING JAVASCRIPT PAYLOADS FOR MALICIOUS INJECTIONS...",
      "> 0 OBFUSCATED SCRIPTS DETECTED.",
      "> FINALIZING THREAT INTELLIGENCE REPORT...",
      "> SCAN COMPLETE.",
      "> FINAL SCORE: 98/100 (SECURE)"
    ];

    let step = 0;
    
    const pushNextLog = () => {
      if (step < sequence.length) {
        setLogs(prev => [...prev, sequence[step]]);
        step++;
        
        const nextDelay = Math.random() * 600 + 300;
        setTimeout(pushNextLog, nextDelay);
      } else {
        setIsScanning(false);
      }
    };

    setTimeout(pushNextLog, 500);
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <BrandLogo className="w-7 h-7 shadow-lg shadow-indigo-500/20 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            {/* Active Tab */}
            <a className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-default">
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
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                Advanced Scan Center
              </h1>
              <p className="text-slate-400 text-sm">Configure forensic parameters and monitor algorithmic analysis in real-time.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-white font-bold text-sm mb-4">Target Identity</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center px-4 focus-within:border-indigo-500/50 transition-colors">
                      <Globe className="w-5 h-5 text-indigo-500 mr-3 animate-pulse" />
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter URL, Domain, or IP Address..." 
                        className="flex-1 bg-transparent border-none py-3 focus:outline-none text-white text-sm placeholder:text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={startAdvancedScan}
                    disabled={isScanning || !inputValue.trim()}
                    className={`w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm ${isScanning || !inputValue.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isScanning ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Executing Forensic Scan...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Initialize Advanced Scan</>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" /> Analysis Parameters
                  </h3>
                  <div className="space-y-3">
                    <CustomToggle 
                      label="Deep DNS Resolution" 
                      description="Trace nameservers and historical IP ownership." 
                      isOn={toggles.dns} 
                      onToggle={() => handleToggle('dns')} 
                    />
                    <CustomToggle 
                      label="Dark Web Mention Check" 
                      description="Cross-reference domain against onion registries (Takes longer)." 
                      isOn={toggles.darkweb} 
                      onToggle={() => handleToggle('darkweb')} 
                    />
                    <CustomToggle 
                      label="Bypass Local Cache" 
                      description="Force a live connection instead of using recent DB records." 
                      isOn={toggles.bypass} 
                      onToggle={() => handleToggle('bypass')} 
                    />
                  </div>
                </div>

                <div 
                  className={`bg-slate-900/40 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); alert("File offline analysis feature coming soon!"); }}
                >
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 mb-4 shadow-inner">
                    <UploadCloud className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Offline File Analysis</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">Drag and drop raw .eml (email) or .html payloads here for isolated, air-gapped scanning.</p>
                  <button className="text-xs font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                    Browse Files
                  </button>
                </div>

              </div>

              <div className="bg-[#0A0A0A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-400">root@trustlens-ai:~</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs md:text-sm leading-relaxed text-emerald-400 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-2">
                    {logs.map((log, index) => {
                      // ADDED SAFETY CHECK: Fallback to empty string if log is somehow undefined
                      const safeLog = log || "";
                      let logClass = "text-emerald-400";
                      
                      if (safeLog.includes("ERROR") || safeLog.includes("HIGH RISK")) logClass = "text-red-400 font-bold";
                      else if (safeLog.includes("CAUTION") || safeLog.includes("SKIPPING")) logClass = "text-amber-400";
                      else if (safeLog.includes("COMPLETE") || safeLog.includes("SECURE")) logClass = "text-indigo-400 font-bold";

                      return (
                        <div key={index} className={logClass}>
                          {safeLog}
                        </div>
                      );
                    })}
                    
                    <div className="flex items-center mt-1">
                      <span className="text-emerald-400 mr-2">{'>'}</span>
                      <div className="w-2.5 h-4 bg-emerald-400 animate-pulse"></div>
                    </div>
                    
                    <div ref={logsEndRef} className="h-4"></div>
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

export default Scan;