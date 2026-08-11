// File: src/pages/Profile.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, MapPin, Phone, Shield, Bell, Lock, Edit3, Save, X, LogOut, BadgeCheck, Loader2, Search, Clock, Settings, Crown, Globe, AlertCircle, CheckCircle2, Camera, Send, Home, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { subscribeToPush, sendTestPush, getProfile, updateProfile, resendVerification, setup2FA, verify2FA, disable2FA, deleteAccount } from '../services/api';

const BrandLogo = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#pp_grad)" />
    <path d="M16 7L8 10.5V16C8 21.25 11.4 26.1 16 27.5C20.6 26.1 24 21.25 24 16V10.5L16 7Z"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" />
    <defs>
      <linearGradient id="pp_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

// Reusable field component
const Field = ({ label, hint, children, required }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
      {label}
      {required && <span className="text-red-400">*</span>}
      {hint && <span className="text-slate-600 font-normal ml-1">— {hint}</span>}
    </label>
    {children}
  </div>
);

const inputCls = (disabled) =>
  `w-full bg-white dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none ${
    disabled
      ? 'border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed'
      : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10'
  }`;

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileRef = useRef();

  // ── form state ──────────────────────────────────────────────────────────────
  const [firstName,   setFirstName]   = useState(user?.name?.split(' ')[0] || '');
  const [lastName,    setLastName]    = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [email]                       = useState(user?.email || '');
  const [phone,       setPhone]       = useState('');
  const [dob,         setDob]         = useState('');
  const [gender,      setGender]      = useState('');
  const [country,     setCountry]     = useState('');
  const [city,        setCity]        = useState('');
  const [bio,         setBio]         = useState('');
  const [website,     setWebsite]     = useState('');
  const [avatar,      setAvatar]      = useState(null); // base64 preview

  // ── ui state ────────────────────────────────────────────────────────────────
  const [emailVerified, setEmailVerified] = useState(false);
  const [saving,      setSaving]   = useState(false);
  const [saved,       setSaved]    = useState(false);
  const [activeTab,   setActiveTab] = useState('personal'); // 'personal' | 'security' | 'preferences'

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setFirstName(data.name?.split(' ')[0] || '');
        setLastName(data.name?.split(' ').slice(1).join(' ') || '');
        setPhone(data.phone || '');
        setDob(data.dob || '');
        setGender(data.gender || '');
        setCountry(data.country || '');
        setCity(data.city || '');
        setBio(data.bio || '');
        setWebsite(data.website || '');
        setEmailVerified(data.is_verified || false);
        setTwoFA(data.is_two_fa_enabled || false);
        if (data.avatar_url) setAvatar(data.avatar_url);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Password change
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [pwdError,    setPwdError]    = useState('');

  // Preferences
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [darkMode]                    = useState(true);
  const [twoFA,       setTwoFA]       = useState(false);
  const [qrCode,      setQrCode]      = useState(null);
  const [totpSecret,  setTotpSecret]  = useState('');
  const [totpCode,    setTotpCode]    = useState('');
  const [is2FASetup,  setIs2FASetup]  = useState(false);
  const [loading2FA,  setLoading2FA]  = useState(false);

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const fullName = `${firstName} ${lastName}`.trim();
    try {
      const payload = {
        full_name: fullName,
        dob,
        gender,
        phone,
        website,
        country,
        city,
        bio,
        avatar_url: avatar
      };
      await updateProfile(payload);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, name: fullName }));
      setSaved(true);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwdError('');
    if (!currentPwd) { setPwdError('Enter your current password.'); return; }
    if (newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setPwdError('✓ Password updated successfully.');
  };

  const handlePushToggle = async () => {
    if (pushEnabled) {
      setPushEnabled(false);
      return;
    }
    setLoadingPush(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported by this browser.');
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permission for notifications was denied.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;
      
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
      }

      await subscribeToPush(subscription);
      setPushEnabled(true);
      alert('Push notifications enabled successfully!');
    } catch (err) {
      console.error('Push error:', err);
      alert('Failed to enable push notifications: ' + err.message);
    } finally {
      setLoadingPush(false);
    }
  };

  const handleTestPush = async () => {
    setTestPushLoading(true);
    try {
      await sendTestPush();
    } catch (err) {
      alert(err.message);
    } finally {
      setTestPushLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      alert("Verification email sent! Check your inbox.");
    } catch (err) {
      alert("Failed to send verification email.");
    }
  };

  const handle2FAToggle = async () => {
    if (twoFA) {
      const code = prompt("Enter your 6-digit authenticator code to disable 2FA:");
      if (!code) return;
      try {
        await disable2FA(code);
        setTwoFA(false);
        alert("2FA successfully disabled.");
      } catch (err) {
        alert(err.message || "Failed to disable 2FA.");
      }
      return;
    }

    if (!is2FASetup) {
      try {
        const res = await setup2FA();
        setQrCode(res.qr_code);
        setTotpSecret(res.secret);
        setIs2FASetup(true);
      } catch (err) {
        alert(err.message || "Failed to initiate 2FA setup.");
      }
    } else {
      setIs2FASetup(false);
      setQrCode(null);
    }
  };

  const handle2FAVerify = async () => {
    setLoading2FA(true);
    try {
      await verify2FA(totpCode, totpSecret);
      setTwoFA(true);
      setIs2FASetup(false);
      setQrCode(null);
      setTotpCode('');
      alert("2FA successfully enabled!");
    } catch (err) {
      alert(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
        alert("Your account has been successfully deleted.");
        handleLogout();
      } catch (err) {
        alert(err.message || "Failed to delete account.");
      }
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U';

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const PUBLIC_VAPID_KEY = "BMRq1lt_Z-EwIRzXHDEI51FKXvGJkHKSCrMYS2MX4yE1WSnfgxQ3A_3yq0Wr3X0e4dyf22bdnsMPueiKTxu1W44";

  const Toggle = ({ enabled, onToggle }) => (
    <div className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${enabled ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} onClick={onToggle}>
      <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-indigo-500/30">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <BrandLogo className="w-7 h-7 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>
          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer"><Home className="w-5 h-5" /> Dashboard</a>
            <a onClick={() => navigate('/scan')}      className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer"><Search className="w-5 h-5" /> Scan</a>
            <a onClick={() => navigate('/history')}  className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer"><Clock className="w-5 h-5" /> History</a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer"><Settings className="w-5 h-5" /> Settings</a>
            <a className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 cursor-default"><User className="w-5 h-5" /> Profile</a>
          </nav>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <Crown className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-3">Unlock advanced features.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white text-xs font-bold py-2 rounded-lg transition-colors">Upgrade Now</button>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 dark:from-slate-900 via-white dark:via-slate-950 to-white dark:to-slate-950">

        {/* TOPBAR */}
        <header className="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0 border-b border-slate-200/30 dark:border-slate-800/30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manage your personal information and account settings.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40" />
                : <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">{initials}</div>
              }
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{`${firstName} ${lastName}`.trim() || user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white shadow-xl shadow-indigo-500/20 overflow-hidden border-2 border-indigo-500/30">
                  {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-colors border-2 border-slate-950"
                >
                  <Camera className="w-4 h-4 text-slate-900 dark:text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{`${firstName} ${lastName}`.trim() || 'Your Name'}</h2>
                  {emailVerified && <BadgeCheck className="w-5 h-5 text-indigo-400" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{email || 'email@example.com'}</p>
                <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-slate-700">Free Plan</span>
                  {twoFA && <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> 2FA On</span>}
                  {!emailVerified && <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Email Unverified</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-1 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5">
              {[
                { id: 'personal',    label: 'Personal Info',  Icon: User   },
                { id: 'security',    label: 'Security',       Icon: Lock   },
                { id: 'preferences', label: 'Preferences',    Icon: Settings },
              ].map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-indigo-600 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {activeTab === 'personal' && (
              <div className="space-y-5">
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" required>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inputCls(false)} />
                    </Field>
                    <Field label="Last Name" required>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inputCls(false)} />
                    </Field>
                  </div>

                  <Field label="Date of Birth">
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                        className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>

                  <Field label="Gender">
                    <select value={gender} onChange={e => setGender(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 transition-colors appearance-none cursor-pointer">
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </Field>

                  <Field label="Bio" hint="max 200 chars">
                    <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 200))} rows={3}
                      placeholder="Tell us a bit about yourself…"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 transition-colors resize-none" />
                    <p className="text-[10px] text-slate-600 text-right">{bio.length}/200</p>
                  </Field>
                </div>

                {/* Contact */}
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2"><Mail className="w-4 h-4 text-violet-400" /> Contact Details</h3>

                  <Field label="Email Address" required>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="email" value={email} disabled className={`${inputCls(true)} pl-10`} />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {emailVerified
                          ? <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                          : <button onClick={handleResendVerification} className="flex items-center gap-1 text-[10px] text-amber-400 font-bold hover:text-amber-300 transition-colors cursor-pointer"><AlertCircle className="w-3.5 h-3.5" /> Verify now</button>
                        }
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed. Contact support if needed.</p>
                  </Field>

                  <Field label="Phone Number" hint="with country code">
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210" className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>

                  <Field label="Website / Portfolio">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com" className={`${inputCls(false)} pl-10`} />
                      </div>
                      {website && (
                        <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors border border-indigo-500/20 flex-shrink-0 cursor-pointer">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Location */}
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Country">
                      <select value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 transition-colors appearance-none cursor-pointer">
                        <option value="" disabled>Select country</option>
                        <option>United States</option>
                        <option>India</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>Japan</option>
                        <option>Singapore</option>
                        <option>Brazil</option>
                        <option>Mexico</option>
                        <option>South Africa</option>
                        <option>United Arab Emirates</option>
                        <option>Netherlands</option>
                        <option>Sweden</option>
                        <option>Switzerland</option>
                        <option>Italy</option>
                        <option>Spain</option>
                        <option>South Korea</option>
                        <option>New Zealand</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="City">
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" value={city} onChange={e => setCity(e.target.value)}
                          placeholder="Chennai" className={`${inputCls(false)} pl-10`} />
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-slate-900 dark:text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-sm">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Profile saved!
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                {/* Email verification banner */}
                {!emailVerified && (
                  <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-300">Email not verified</p>
                      <p className="text-xs text-amber-400/80 mt-0.5">Verify your email to secure your account and enable full features.</p>
                    </div>
                    <button onClick={handleResendVerification} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors cursor-pointer">
                      Send Verification
                    </button>
                  </div>
                )}
                
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" /> Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Field label="Current Password" required>
                      <input type={showPwd ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Enter current password" className={inputCls(false)} />
                    </Field>
                    <Field label="New Password" required>
                      <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Enter new password" className={inputCls(false)} />
                    </Field>
                    <Field label="Confirm New Password" required>
                      <input type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat new password" className={inputCls(false)} />
                    </Field>
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold rounded-xl transition-colors text-sm cursor-pointer">Update Password</button>
                  </form>
                </div>
                {/* Danger zone */}
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-red-500/20 rounded-3xl p-6 space-y-4">
                  <h3 className="text-red-400 font-bold text-base flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Danger Zone</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-red-500/10 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Delete Account</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Permanently remove your account and all data. This cannot be undone.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PREFERENCES TAB ── */}
            {activeTab === 'preferences' && (
              <div className="space-y-5">
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base">Notifications</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Receive scan results and alerts by email.</p>
                    </div>
                    <Toggle enabled={notifEmail} onToggle={() => setNotifEmail(v => !v)} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Push Notifications</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Browser push alerts for critical threats.</p>
                    </div>
                    <Toggle enabled={pushEnabled} onToggle={handlePushToggle} />
                  </div>
                  
                  {pushEnabled && (
                    <button onClick={handleTestPush} disabled={testPushLoading} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold py-2 rounded-xl transition-colors text-xs flex items-center justify-center gap-2">
                      {testPushLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Sending...</> : <><Bell className="w-3.5 h-3.5"/> Test Push Notification</>}
                    </button>
                  )}
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base">Appearance</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">TrustLens AI looks best in dark mode.</p>
                    </div>
                    <Toggle enabled={theme === 'dark'} onToggle={toggleTheme} />
                  </div>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base">Privacy</h3>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    {[
                      'We never sell your data to third parties.',
                      'Scan payloads are processed in-memory and not logged beyond your history.',
                      'You can delete your account and all associated data at any time.',
                    ].map((txt, i) => (
                      <p key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> {txt}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
