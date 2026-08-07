import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, HelpCircle, ChevronRight,
  Bell, Globe, Mail, MessageSquare, Download, Filter, Calendar, 
  CheckCircle2, AlertCircle, ShieldAlert, FileJson, FileSpreadsheet,
  ChevronDown, MoreHorizontal, Shield, Activity 
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

// Helper to generate fake historical data for the Heatmap
const generateHeatmapData = () => {
  const days = [];
  for (let i = 0; i < 364; i++) {
    const rand = Math.random();
    let level = 0; // No activity
    if (rand > 0.96) level = 4; // Critical Threat detected
    else if (rand > 0.85) level = 3; // High volume
    else if (rand > 0.60) level = 2; // Medium volume
    else if (rand > 0.30) level = 1; // Low volume
    days.push(level);
  }
  return days;
};

// Mock Database for the Table
const mockHistoryData = [
  { id: 'SCN-892', target: 'https://paypal-secure-update.com', type: 'URL', score: 12, status: 'Critical', date: 'Oct 24, 2023 14:32', icon: Globe },
  { id: 'SCN-891', target: 'Meeting details for tomorrow', type: 'Email', score: 72, status: 'Suspicious', date: 'Oct 24, 2023 11:15', icon: Mail },
  { id: 'SCN-890', target: 'https://github.com/login', type: 'URL', score: 98, status: 'Safe', date: 'Oct 23, 2023 09:41', icon: Globe },
  { id: 'SCN-889', target: 'Verify your Apple ID account', type: 'Message', score: 24, status: 'Critical', date: 'Oct 22, 2023 18:05', icon: MessageSquare },
  { id: 'SCN-888', target: 'https://amazon.in/orders', type: 'URL', score: 92, status: 'Safe', date: 'Oct 21, 2023 15:22', icon: Globe },
  { id: 'SCN-887', target: 'Invoice_77892.pdf.exe', type: 'Email', score: 8, status: 'Critical', date: 'Oct 20, 2023 10:11', icon: Mail },
  { id: 'SCN-886', target: 'https://netflix.com/browse', type: 'URL', score: 99, status: 'Safe', date: 'Oct 19, 2023 21:30', icon: Globe },
  { id: 'SCN-885', target: 'Your package has been delayed', type: 'Message', score: 45, status: 'Suspicious', date: 'Oct 18, 2023 08:14', icon: MessageSquare },
];

function HistoryPage() {
  const navigate = useNavigate();
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const getHeatmapColor = (level) => {
    switch(level) {
      case 4: return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10'; // Red for threats
      case 3: return 'bg-emerald-500';
      case 2: return 'bg-emerald-700';
      case 1: return 'bg-emerald-900/60';
      case 0: 
      default: return 'bg-slate-800/40';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Safe': return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> {status}</span>;
      case 'Suspicious': return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> {status}</span>;
      case 'Critical': return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3"/> {status}</span>;
      default: return null;
    }
  };

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
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a onClick={() => navigate('/scan')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Search className="w-5 h-5" /> Scan
            </a>
            {/* Active Tab */}
            <a className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-default">
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0">
          <div className="relative group w-96 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
            </div>
            <input type="text" placeholder="Search logs by ID, URL, or hash..." className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-xs font-medium text-white placeholder:text-slate-500 transition-all shadow-inner" />
          </div>
          
          <div className="flex items-center gap-6 ml-auto">
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

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                  Threat Intelligence Log
                </h1>
                <p className="text-slate-400 text-sm">Review, filter, and export your historical scan forensics.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-indigo-400" /> Export JSON
                </button>
                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
                </button>
              </div>
            </div>

            {/* GITHUB-STYLE HEATMAP */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Scan Activity (Last 12 Months)
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-800/40"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-900/60"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-700"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                  </div>
                  <span>More / Threat</span>
                </div>
              </div>
              
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
                  {heatmapData.map((level, i) => (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-crosshair hover:border hover:border-white ${getHeatmapColor(level)}`}
                      title={`Activity Level: ${level}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* ADVANCED FILTERING & GRID */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl shadow-lg flex flex-col">
              
              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center gap-3 bg-slate-950/30 rounded-t-3xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mr-2">
                  <Filter className="w-4 h-4" /> Filters:
                </div>
                
                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  All Types <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  Status: Any <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-500" /> Last 30 Days <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                
                <div className="ml-auto text-xs text-slate-500 font-medium">
                  Showing 1-8 of 2,491 logs
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-slate-800 bg-slate-900/20">
                      <th className="py-4 pl-6 font-semibold">Scan ID</th>
                      <th className="py-4 font-semibold">Target / Subject</th>
                      <th className="py-4 font-semibold">Type</th>
                      <th className="py-4 font-semibold">Trust Score</th>
                      <th className="py-4 font-semibold">Verdict</th>
                      <th className="py-4 font-semibold">Timestamp</th>
                      <th className="py-4 font-semibold text-center pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {mockHistoryData.map((row) => (
                      <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                        <td className="py-4 pl-6 font-mono text-slate-500">{row.id}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3 font-medium text-slate-200">
                            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                              <row.icon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="truncate max-w-xs block">{row.target}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-400">{row.type}</td>
                        <td className="py-4 font-bold font-mono">
                          <span className={row.score > 80 ? 'text-emerald-400' : row.score > 40 ? 'text-amber-400' : 'text-red-400'}>
                            {row.score}/100
                          </span>
                        </td>
                        <td className="py-4">{getStatusBadge(row.status)}</td>
                        <td className="py-4 text-slate-500">{row.date}</td>
                        <td className="py-4 text-center pr-4">
                          <button className="text-slate-500 hover:text-indigo-400 p-1 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination (Mock) */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/30 rounded-b-3xl text-xs text-slate-400">
                <button className="px-3 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">Previous</button>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">1</button>
                  <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors">2</button>
                  <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors">3</button>
                  <span className="flex items-center justify-center px-1">...</span>
                  <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors">312</button>
                </div>
                <button className="px-3 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">Next</button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HistoryPage;