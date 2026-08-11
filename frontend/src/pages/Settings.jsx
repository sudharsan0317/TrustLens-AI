import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, ChevronRight,
  Bell, Shield, Key, CreditCard, Smartphone, Monitor, Webhook, 
  CheckCircle2, AlertCircle, Copy, RefreshCw, Zap, LogOut, User
} from 'lucide-react';
import { getSessions, revokeSession, revokeAllSessions, exportAccountData, getProfile, updateProfile, regenerateApiKey } from '../services/api';
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

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Read logged-in user state & logout function
  const [activeTab, setActiveTab] = useState('security');
  
  // Local states
  const [fullName, setFullName] = useState(user?.name || 'Sudharsan');
  const [twoFactor, setTwoFactor] = useState(false);
  const [ipBinding, setIpBinding] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [apiKey, setApiKey] = useState('Generating...');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // 2FA modal state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('setup'); // 'setup' | 'disable'
  const [twoFAQR, setTwoFAQR] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getProfile();
        setTwoFactor(data.is_two_fa_enabled || false);
        setIpBinding(data.strict_ip_binding || false);
        setLoginAlerts(data.login_alerts_enabled !== false);
        setApiKey(data.api_key || 'Generate your first key below');
        setWebhookUrl(data.webhook_url || '');
        setScanCount(data.scan_count || 0);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    if (activeTab === 'security') {
      fetchSessions();
      fetchSettings();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to revoke session", error);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions();
      setSessions([]);
    } catch (error) {
      console.error("Failed to revoke all sessions", error);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey || apiKey === 'Generate your first key below') return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm("Are you sure? Your old API key will immediately stop working.")) return;
    try {
      const data = await regenerateApiKey();
      setApiKey(data.api_key);
    } catch (error) {
      console.error("Failed to regenerate API key", error);
      alert("Failed to regenerate API key.");
    }
  };

  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    try {
      await updateProfile({ webhook_url: webhookUrl });
      alert("Webhook URL saved successfully!");
    } catch (error) {
      console.error("Failed to save webhook", error);
      alert("Failed to save webhook URL.");
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateSetting = async (field, value) => {
    try {
      await updateProfile({ [field]: value });
    } catch (error) {
      console.error(`Failed to update ${field}`, error);
    }
  };

  // --- 2FA Handlers ---
  const handleToggle2FA = async () => {
    if (twoFactor) {
      // Already enabled → show disable flow
      setTwoFAStep('disable');
      setTwoFACode('');
      setTwoFAError('');
      setShow2FAModal(true);
    } else {
      // Not enabled → fetch QR and show setup flow
      try {
        const data = await setup2FA();
        setTwoFAQR(data.qr_code);
        setTwoFASecret(data.secret);
        setTwoFAStep('setup');
        setTwoFACode('');
        setTwoFAError('');
        setShow2FAModal(true);
      } catch (err) {
        alert('Failed to start 2FA setup. Please try again.');
      }
    }
  };

  const handleConfirm2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      if (twoFAStep === 'setup') {
        await verify2FA(twoFACode, twoFASecret);
        setTwoFactor(true);
      } else {
        await disable2FA(twoFACode);
        setTwoFactor(false);
      }
      setShow2FAModal(false);
    } catch (err) {
      setTwoFAError(err.message || 'Invalid code. Please try again.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const toggleIpBinding = () => {
    const newValue = !ipBinding;
    setIpBinding(newValue);
    handleUpdateSetting("strict_ip_binding", newValue);
  };

  const toggleLoginAlerts = () => {
    const newValue = !loginAlerts;
    setLoginAlerts(newValue);
    handleUpdateSetting("login_alerts_enabled", newValue);
  };

  const handleExportData = async () => {
    try {
      const data = await exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trustlens-export-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data", error);
      alert("Failed to export data.");
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
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors">
              <Settings className="w-5 h-5" /> Settings
            </a>
            <a onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <User className="w-5 h-5" /> Profile
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

          {/* Log Out Button */}
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-end px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 uppercase">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white leading-none mb-1">{user?.name || 'Sudharsan'} <ChevronRight className="w-3 h-3 inline rotate-90 opacity-50" /></p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                Settings & Preferences
              </h1>
              <p className="text-slate-400 text-sm">Manage your account security, developer API access, and billing details.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              
              {/* VERTICAL TABS */}
              <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'security' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <Shield className="w-5 h-5" /> Profile & Security
                </button>
                <button 
                  onClick={() => setActiveTab('api')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'api' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <Key className="w-5 h-5" /> API & Webhooks
                </button>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'billing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <CreditCard className="w-5 h-5" /> Billing & Usage
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 space-y-6">
                
                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Profile Information */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Full Name</label>
                          <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-white transition-colors" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Email Address</label>
                          <input 
                            type="email" 
                            value={user?.email || 'sudharsan@example.com'} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-slate-400 transition-colors cursor-not-allowed" 
                            disabled 
                          />
                        </div>
                      </div>
                      <button className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors">
                        Save Changes
                      </button>
                    </div>

                    {/* Authentication */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-4">Authentication & Privacy</h3>
                      <div className="space-y-4">
                        <CustomToggle 
                          label="Two-Factor Authentication (2FA)" 
                          description="Require an authenticator app code when logging in." 
                          isOn={twoFactor} 
                          onToggle={handleToggle2FA} 
                        />
                        <CustomToggle 
                          label="Strict IP Binding" 
                          description="Automatically terminate sessions if the IP address changes." 
                          isOn={ipBinding} 
                          onToggle={toggleIpBinding} 
                        />
                        <CustomToggle 
                          label="Unrecognized Login Alerts" 
                          description="Send an email when a login occurs from a new device." 
                          isOn={loginAlerts} 
                          onToggle={toggleLoginAlerts} 
                        />
                        
                        <div className="pt-4 mt-2 border-t border-slate-800/60 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">Export Account Data</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Download a JSON archive of your scan history.</p>
                          </div>
                          <button onClick={handleExportData} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition-colors border border-slate-700">
                            Request Export
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">Active Sessions</h3>
                        <button onClick={handleRevokeAll} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Revoke All Others</button>
                      </div>
                      <div className="space-y-3">
                        {loadingSessions ? (
                          <div className="text-center text-slate-500 text-sm py-4">Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                          <div className="text-center text-slate-500 text-sm py-4">No active sessions found.</div>
                        ) : (
                          sessions.map((session, idx) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                              <div className="flex items-center gap-4">
                                {session.device?.toLowerCase().includes("iphone") || session.device?.toLowerCase().includes("android") || session.device?.toLowerCase().includes("mobile") ? (
                                  <Smartphone className="w-6 h-6 text-indigo-400" />
                                ) : (
                                  <Monitor className="w-6 h-6 text-indigo-400" />
                                )}
                                <div>
                                  <p className="text-sm font-bold text-white">{session.device} - {session.browser}</p>
                                  <p className="text-[10px] text-slate-500">IP: {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {idx === 0 ? (
                                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">Current Session</span>
                                ) : (
                                  <button onClick={() => handleRevokeSession(session.id)} className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors">
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- API & WEBHOOKS TAB --- */}
                {activeTab === 'api' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg">Developer API Keys</h3>
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold">PRODUCTION</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6">Use these keys to authenticate API requests from your backend servers.</p>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Secret Key</label>
                        <div className="bg-slate-950 p-1 pl-4 rounded-xl border border-slate-800 flex items-center justify-between focus-within:border-indigo-500/50 transition-colors">
                          <span className="text-sm text-slate-300 font-mono truncate max-w-md select-all">{apiKey}</span>
                          <div className="flex gap-2 p-1">
                            <button onClick={handleCopyKey} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2">
                              {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={handleRegenerateKey} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2" title="Regenerate Key">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-400/90 leading-relaxed font-medium">Do not share your API key in publicly accessible areas. If compromised, regenerate it immediately.</p>
                      </div>
                    </div>

                    {/* Webhooks */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                        Event Webhooks <Webhook className="w-5 h-5 text-indigo-400" />
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">Send a JSON payload to your server whenever a Critical Threat is detected.</p>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Webhook URL</label>
                          <input 
                            type="text" 
                            placeholder="https://api.yourdomain.com/webhooks/trustlens" 
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-white transition-colors font-mono" 
                          />
                        </div>
                        <button 
                          onClick={handleSaveWebhook}
                          disabled={savingWebhook}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {savingWebhook ? "Saving..." : "Save Webhook Endpoint"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BILLING & USAGE TAB --- */}
                {activeTab === 'billing' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold text-lg">Current Plan Usage</h3>
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700">Free Tier</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6">Your API limits reset on the 1st of every month.</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-slate-300">API Scans</span>
                          <span className="text-indigo-400">{scanCount} <span className="text-slate-500 font-medium">/ 1,000</span></span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out" style={{ width: `${Math.min((scanCount / 1000) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">~{Math.max(100 - (scanCount / 10), 0).toFixed(1)}% remaining</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                        <Crown className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="text-2xl font-black text-white mb-1">Pro</h3>
                        <p className="text-indigo-400 text-xl font-bold mb-4">$49<span className="text-sm text-slate-400 font-medium">/mo</span></p>
                        
                        <ul className="space-y-2 mb-6 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 10,000 Scans / month</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webhook Integrations</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Report Exports</li>
                        </ul>
                        
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25">
                          Upgrade to Pro
                        </button>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                        <Zap className="w-8 h-8 text-slate-400 mb-4" />
                        <h3 className="text-2xl font-black text-white mb-1">Enterprise</h3>
                        <p className="text-slate-200 text-xl font-bold mb-4">Custom</p>
                        
                        <ul className="space-y-2 mb-6 text-xs text-slate-400 font-medium">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Unlimited API Scans</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Dedicated Account Manager</li>
                        </ul>
                        
                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-colors border border-slate-700">
                          Contact Sales
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 2FA MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {twoFAStep === 'setup' ? (
              <>
                <div>
                  <h2 className="text-white font-extrabold text-xl mb-1">Set Up Two-Factor Authentication</h2>
                  <p className="text-slate-400 text-sm">Scan the QR code with Google Authenticator or Authy, then enter the 6-digit code below to confirm.</p>
                </div>
                {twoFAQR && (
                  <div className="flex justify-center bg-white p-4 rounded-2xl">
                    <img src={twoFAQR} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
                <div className="bg-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 font-mono break-all">
                  Manual key: <span className="text-indigo-400 select-all">{twoFASecret}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-white font-extrabold text-xl mb-1">Disable Two-Factor Authentication</h2>
                  <p className="text-slate-400 text-sm">Enter the 6-digit code from your authenticator app to confirm disabling 2FA.</p>
                </div>
              </>
            )}

            <input
              type="text"
              maxLength={6}
              value={twoFACode}
              onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              onKeyDown={e => e.key === 'Enter' && twoFACode.length === 6 && handleConfirm2FA()}
            />

            {twoFAError && (
              <p className="text-red-400 text-sm text-center">{twoFAError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm2FA}
                disabled={twoFACode.length !== 6 || twoFALoading}
                className={`flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  twoFAStep === 'setup'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {twoFALoading ? 'Verifying...' : twoFAStep === 'setup' ? 'Enable 2FA' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;