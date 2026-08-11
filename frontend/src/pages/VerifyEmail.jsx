import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  
  const hasAttempted = useRef(false);

  useEffect(() => {
    const doVerify = async () => {
      if (hasAttempted.current) return;
      hasAttempted.current = true;
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired.');
      }
    };

    doVerify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center">
        
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Verifying Email...</h2>
            <p className="text-slate-400 text-sm">Please wait while we secure your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Email Verified!</h2>
            <p className="text-emerald-400/80 text-sm font-medium mb-8">{message}</p>
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              Proceed to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Verification Failed</h2>
            <p className="text-red-400/80 text-sm font-medium mb-8">{message}</p>
            <button onClick={() => navigate('/')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700">
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default VerifyEmail;
