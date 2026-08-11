import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import { Shield, User, Lock, EyeOff, Eye, Cpu, CheckCircle, Focus, Aperture, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginVerify2FA } from '../services/api';

// Small branding logo for the top left corner
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

// The massive, animated, high-tech Hero Logo for the left side
const HeroLensLogo = () => (
  <div className="relative flex items-center justify-center w-40 h-40">
    
    {/* Outer animated scanning radar ring */}
    <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500/30 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
      </svg>
    </div>
    
    {/* Inner reverse-rotating focus brackets */}
    <div className="absolute inset-3 animate-[spin_20s_linear_infinite_reverse]">
      <Focus className="w-full h-full text-violet-500/20" strokeWidth={0.5} />
    </div>

    {/* The main glowing Shield (Trust) */}
    <Shield className="w-28 h-28 text-indigo-400 absolute z-10 drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]" strokeWidth={1.5} />
    
    {/* The spinning Camera Lens (Lens) */}
    <div className="absolute z-20 flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-950 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,1)] border border-indigo-500/40 mt-1.5">
      <Aperture className="w-7 h-7 text-violet-400 animate-[spin_10s_linear_infinite]" strokeWidth={1.5} />
      
      {/* Glowing AI Core Pupil */}
      <div className="absolute w-2 h-2 bg-indigo-300 rounded-full animate-pulse shadow-[0_0_12px_3px_rgba(165,180,252,0.9)]"></div>
    </div>
  </div>
);

function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const { instance } = useMsal();

  // Single Google login handler using AuthContext
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await auth.loginWithGoogle(tokenResponse.access_token);
        if (res?.requires_2fa) {
          setTempToken(res.temp_token);
          setShow2FA(true);
          return;
        }
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    },
    onError: () => setError('Google Sign-In was cancelled or failed.'),
  });

  const handleMicrosoftLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["user.read"]
      });
      if (loginResponse && loginResponse.accessToken) {
        const res = await auth.loginWithMicrosoft(loginResponse.accessToken);
        if (res?.requires_2fa) {
          setTempToken(res.temp_token);
          setShow2FA(true);
          return;
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Microsoft Sign-In failed. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await auth.signup(fullName, email, password);
        navigate('/dashboard');
      } else {
        const res = await auth.login(email, password);
        if (res?.requires_2fa) {
          setTempToken(res.temp_token);
          setShow2FA(true);
          return;
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginVerify2FA(totpCode, tempToken);
      auth.finalizeLogin(res);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid 2FA code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      
      {/* LEFT SIDE - Dark Branding & Glowing Effects */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 dark:from-slate-900 via-white dark:via-slate-950 to-white dark:to-slate-950 border-r border-slate-200/50 dark:border-slate-800/50">
        
        {/* Cybersecurity glowing orbs in the background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <BrandLogo className="w-9 h-9 shadow-lg shadow-indigo-500/20" />
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
          </span>
        </div>

        {/* Floating Container housing the animated logo */}
        <div className="z-10 bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_0_60px_rgba(79,70,229,0.15)] mb-10 border border-slate-300/50 dark:border-slate-700/50 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] animate-pulse pointer-events-none"></div>
          
          <HeroLensLogo />
          
        </div>

        <h1 className="z-10 text-4xl font-extrabold mb-4 text-center tracking-tight text-slate-900 dark:text-white">
          Next-Gen Protection Against <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Phishing & Scams</span>
        </h1>
        
        <p className="z-10 text-slate-600 dark:text-slate-400 text-center max-w-md mb-12 text-base leading-relaxed">
          Analyze links, emails and messages in milliseconds. Our explainable AI keeps you one step ahead of digital threats.
        </p>

        {/* Premium Dark Feature Badges */}
        <div className="z-10 flex gap-6 mb-8">
          <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-xl flex flex-col items-center w-36 transition-transform hover:-translate-y-1 border border-slate-200 dark:border-slate-800">
            <div className="bg-indigo-500/10 p-3 rounded-xl mb-3 text-indigo-400 border border-indigo-500/20">
              <CheckCircle className="w-6 h-6"/>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Real-time</span>
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-xl flex flex-col items-center w-36 transition-transform hover:-translate-y-1 border border-slate-200 dark:border-slate-800">
            <div className="bg-violet-500/10 p-3 rounded-xl mb-3 text-violet-400 border border-violet-500/20">
              <Cpu className="w-6 h-6"/>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Explainable</span>
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-xl flex flex-col items-center w-36 transition-transform hover:-translate-y-1 border border-slate-200 dark:border-slate-800">
            <div className="bg-emerald-500/10 p-3 rounded-xl mb-3 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-6 h-6"/>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Privacy First</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - The Dark Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950 relative">
        
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 p-10 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
          
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <BrandLogo className="w-10 h-10 shadow-lg shadow-indigo-500/20" />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              TrustLens <span className="text-indigo-400">AI</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">
            {show2FA ? 'Two-Factor Auth 🔐' : isSignUp ? 'Create Account ✨' : 'Welcome Back 👋'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
            {show2FA ? 'Enter the 6-digit code from your authenticator app.' : isSignUp ? 'Sign up to protect your digital identity.' : 'Please enter your details to sign in.'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl text-center">
              {error}
            </div>
          )}

          {show2FA ? (
            <form className="space-y-5" onSubmit={handle2FASubmit}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
                </div>
                <input 
                  type="text" 
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code" 
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-300/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-500 shadow-inner tracking-widest text-center" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || totpCode.length !== 6}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] mt-6 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button 
                type="button" 
                onClick={() => { setShow2FA(false); setTempToken(''); setTotpCode(''); }}
                className="w-full mt-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
              >
                Back to Login
              </button>
            </form>
          ) : (
          <>
          <form className="space-y-5" onSubmit={handleLogin}>

            {isSignUp && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name" 
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-300/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-500 shadow-inner" 
                  required 
                />
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full pl-11 pr-4 py-3.5 border border-slate-300/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-500 shadow-inner" 
                required 
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full pl-11 pr-12 py-3.5 border border-slate-300/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-500 shadow-inner" 
                required 
              />
              <div 
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-indigo-400 hover:text-indigo-300 transition-colors"/>
                ) : (
                  <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors"/>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mt-6">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4.5 h-4.5 text-indigo-500 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer" />
                <span className="ml-2.5 text-slate-600 dark:text-slate-400 font-semibold group-hover:text-slate-800 dark:text-slate-200 transition-colors">Remember me</span>
              </label>
              <a onClick={() => navigate('/forgot-password')} className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors cursor-pointer">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] mt-6 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-8 relative flex items-center justify-center">
            <hr className="w-full border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-slate-50 dark:bg-slate-900 px-4 text-sm font-semibold text-slate-500">OR</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
  type="button"
  onClick={() => handleGoogleLogin()}
  className="flex items-center justify-center border border-slate-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-950 py-3 rounded-xl hover:bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
  Google
</button>
            
            <button 
              type="button"
              onClick={handleMicrosoftLogin}
              className="flex items-center justify-center border border-slate-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-950 py-3 rounded-xl hover:bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1h9v9H1z" />
                <path fill="#00a4ef" d="M1 11h9v9H1z" />
                <path fill="#7fba00" d="M11 1h9v9h-9z" />
                <path fill="#ffb900" d="M11 11h9v9h-9z" />
              </svg>
              Microsoft
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="font-extrabold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up for free'}
            </button>
          </p>
          </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;