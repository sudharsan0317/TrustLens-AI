// File: src/pages/History.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Search, Clock, Settings, Loader2,
  Shield, ShieldAlert, ShieldCheck, Download,
  Link, Mail, MessageSquare, Filter, RefreshCw,
  ChevronUp, ChevronDown, AlertTriangle, User
} from 'lucide-react';
import { getScanHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── helpers ──────────────────────────────────────────────────────────────────

const SCAN_TYPE_META = {
  url:     { label: 'URL',     Icon: Link,          color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20'     },
  email:   { label: 'EMAIL',   Icon: Mail,          color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  },
  message: { label: 'MESSAGE', Icon: MessageSquare, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
};

const VERDICT_META = {
  SAFE:       { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  SUSPICIOUS: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
  PHISHING:   { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400'     },
  CRITICAL:   { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400'     },
};

function getVerdict(item) {
  const label = (item.threat_label || '').toUpperCase();
  if (VERDICT_META[label]) return label;
  return item.trust_score >= 80 ? 'SAFE' : item.trust_score >= 55 ? 'SUSPICIOUS' : 'CRITICAL';
}

function getTrustBarColor(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 55) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatRelative(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatFull(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  });
}

function exportCSV(data) {
  const headers = ['ID', 'Target Payload', 'Scan Type', 'Trust Score', 'Verdict', 'Timestamp'];
  const rows = data.map(item => [
    item.id,
    `"${(item.input_data || '').replace(/"/g, '""')}"`,
    item.scan_type,
    item.trust_score,
    getVerdict(item),
    formatFull(item.created_at),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'trustlens_history.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── component ────────────────────────────────────────────────────────────────

function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('all');
  const [sortDir, setSortDir]         = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getScanHistory();
      setHistoryData(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, search, sortDir]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = historyData.length;
    const safe      = historyData.filter(i => getVerdict(i) === 'SAFE').length;
    const flagged   = total - safe;
    const avgScore  = total ? Math.round(historyData.reduce((s, i) => s + i.trust_score, 0) / total) : 0;
    return { total, safe, flagged, avgScore };
  }, [historyData]);

  // ── filtered + sorted rows ─────────────────────────────────────────────────
  const displayData = useMemo(() => {
    let rows = [...historyData];
    if (typeFilter !== 'all') rows = rows.filter(r => r.scan_type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.input_data || '').toLowerCase().includes(q) ||
        (r.scan_type  || '').toLowerCase().includes(q) ||
        getVerdict(r).toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortDir === 'desc' ? tb - ta : ta - tb;
    });
    return rows;
  }, [historyData, typeFilter, search, sortDir]);

  const typeCounts = useMemo(() => {
    return historyData.reduce((acc, r) => {
      acc[r.scan_type] = (acc[r.scan_type] || 0) + 1;
      return acc;
    }, {});
  }, [historyData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayData.slice(startIndex, startIndex + itemsPerPage);
  }, [displayData, currentPage]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden selection:bg-indigo-500/30">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
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
            <a className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors cursor-default">
              <Clock className="w-5 h-5" /> History
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Settings className="w-5 h-5" /> Settings
            </a>
            <a onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <User className="w-5 h-5" /> Profile
            </a>
          </nav>
        </div>

        {/* sidebar mini-stats */}
        {!loading && historyData.length > 0 && (
          <div className="p-4 border-t border-slate-800/50 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Session Summary</p>
            {[
              { label: 'Total Scans', value: stats.total,   color: 'text-indigo-400'  },
              { label: 'Safe',        value: stats.safe,    color: 'text-emerald-400' },
              { label: 'Flagged',     value: stats.flagged, color: 'text-red-400'     },
              { label: 'Avg Score',   value: `${stats.avgScore}/100`, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between px-1">
                <span className="text-[11px] text-slate-400">{label}</span>
                <span className={`text-[11px] font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

        {/* topbar */}
        <header className="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0 border-b border-slate-800/30">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Threat Intelligence Log</h1>
            <p className="text-slate-500 text-xs mt-0.5">Review, filter and export your historical scan forensics.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => exportCSV(displayData)}
              disabled={displayData.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={fetchHistory}
              className="p-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div onClick={() => navigate('/profile')} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 px-2 py-1 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="text-sm font-bold text-white">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── stat cards ── */}
          {!loading && historyData.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Scans',  value: stats.total,   icon: Shield,       gradient: 'from-indigo-600/20 to-indigo-600/5',  border: 'border-indigo-500/20', text: 'text-indigo-400' },
                { label: 'Safe',         value: stats.safe,    icon: ShieldCheck,  gradient: 'from-emerald-600/20 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                { label: 'Threats Found',value: stats.flagged, icon: ShieldAlert,  gradient: 'from-red-600/20 to-red-600/5',         border: 'border-red-500/20',    text: 'text-red-400' },
                { label: 'Avg Trust',    value: `${stats.avgScore}%`, icon: Filter, gradient: 'from-amber-600/20 to-amber-600/5',  border: 'border-amber-500/20',  text: 'text-amber-400' },
              ].map(({ label, value, icon: Icon, gradient, border, text }) => (
                <div key={label} className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-5 flex items-center gap-4`}>
                  <div className={`p-2.5 rounded-xl bg-slate-900/60`}>
                    <Icon className={`w-5 h-5 ${text}`} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">{label}</p>
                    <p className={`text-2xl font-extrabold ${text} leading-tight`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── controls bar ── */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search payload, type, verdict…"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* type filter tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {[['all', 'All'], ['url', 'URL'], ['email', 'Email'], ['message', 'Message']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setTypeFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === val
                      ? 'bg-indigo-500 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lbl}
                  {val !== 'all' && typeCounts[val] ? (
                    <span className="ml-1.5 opacity-70">{typeCounts[val]}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* sort toggle */}
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
            >
              {sortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>

          {/* ── error ── */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm font-semibold">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── table card ── */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                <p className="text-sm text-slate-500">Loading audit records…</p>
              </div>
            ) : displayData.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 font-bold">No records found</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {search || typeFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Scan a URL, email or message to begin.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                      <th className="py-3 pl-6 font-semibold">Target Payload</th>
                      <th className="py-3 font-semibold">Type</th>
                      <th className="py-3 font-semibold">Trust Score</th>
                      <th className="py-3 font-semibold">Verdict</th>
                      <th className="py-3 pr-6 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => {
                      const verdict   = getVerdict(item);
                      const vm        = VERDICT_META[verdict] || VERDICT_META.SUSPICIOUS;
                      const tm        = SCAN_TYPE_META[item.scan_type] || SCAN_TYPE_META.url;
                      const TypeIcon  = tm.Icon;
                      const score     = Math.round(item.trust_score || 0);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors group"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {/* payload */}
                          <td className="py-4 pl-6 pr-4">
                            <span className="font-mono text-xs text-slate-200 truncate max-w-xs block group-hover:text-white transition-colors" title={item.input_data}>
                              {item.input_data}
                            </span>
                          </td>

                          {/* scan type */}
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${tm.bg} ${tm.color} border ${tm.border}`}>
                              <TypeIcon className="w-3 h-3" />
                              {tm.label}
                            </span>
                          </td>

                          {/* trust score with mini bar */}
                          <td className="py-4 pr-4">
                            <div className="flex flex-col gap-1 min-w-[80px]">
                              <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                                {score}/100
                              </span>
                              <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getTrustBarColor(score)} transition-all`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* verdict */}
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${vm.bg} ${vm.color} border ${vm.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${vm.dot}`} />
                              {verdict}
                            </span>
                          </td>

                          {/* timestamp — relative with full on hover */}
                          <td className="py-4 pr-6">
                            <span
                              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-default"
                              title={formatFull(item.created_at)}
                            >
                              {formatRelative(item.created_at)}
                            </span>
                            <p className="text-[10px] text-slate-700 mt-0.5">{formatFull(item.created_at)}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* footer row count */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/40">
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-slate-600">
                      Showing <span className="text-slate-400 font-bold">{displayData.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, displayData.length)} - {Math.min(currentPage * itemsPerPage, displayData.length)}</span> of <span className="text-slate-400 font-bold">{displayData.length}</span> records
                    </p>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Prev
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(displayData.length / itemsPerPage), p + 1))}
                        disabled={currentPage >= Math.ceil(displayData.length / itemsPerPage) || displayData.length === 0}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  {(search || typeFilter !== 'all') && (
                    <button
                      onClick={() => { setSearch(''); setTypeFilter('all'); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default History;
