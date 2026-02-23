
import React, { useState, useEffect } from 'react';
import { supabase, linkUserToIp } from '../services/supabaseService';
import { X, Loader2, Sparkles, LogIn, UserPlus, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'OAUTH_SUCCESS' && event.data.session) {
        await supabase.auth.setSession(event.data.session);
        onClose();
      }
      if (event.data?.type === 'OAUTH_ERROR') {
          setError(event.data.error);
          setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      } else {
        authResponse = await supabase.auth.signUp({ email, password });
      }
      
      if (authResponse.error) throw authResponse.error;

      if (stayLoggedIn && authResponse.data.user) {
        await linkUserToIp(authResponse.data.user.id);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message === 'Invalid API key' ? 'Auth service error' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800/50 w-full max-w-sm rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative ring-1 ring-white/5">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-all hover:rotate-90"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-6 shadow-inner ring-1 ring-indigo-500/20">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-none">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs font-medium italic tracking-wide">
            Secure User Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative group">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white focus:outline-none transition-all font-sans text-xs shadow-inner relative z-10"
                placeholder="user@example.com"
              />
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center z-0" />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 pr-12 text-white focus:outline-none transition-all font-sans text-xs shadow-inner relative z-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors z-20"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center z-0" />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 relative group">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white focus:outline-none transition-all font-sans text-xs shadow-inner relative z-10"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center z-0" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-2">
            <button
              type="button"
              onClick={() => setStayLoggedIn(!stayLoggedIn)}
              className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${stayLoggedIn ? 'bg-indigo-600 border-indigo-500' : 'bg-black/40 border-slate-800'}`}
            >
              {stayLoggedIn && <ShieldCheck size={10} className="text-white" />}
            </button>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Stay logged in on this IP</span>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#FF5F00] to-[#FF8C00] hover:opacity-90 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] active:scale-[0.98]"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={20} /> Loading...</>
            ) : (
              <>{isLogin ? <LogIn size={20} /> : <UserPlus size={20} />} {isLogin ? 'Login' : 'Sign Up'}</>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-600 text-[9px] font-black uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/redirect`,
                    skipBrowserRedirect: true,
                  },
                });
                if (error) throw error;

                if (data?.url) {
                    const width = 500;
                    const height = 600;
                    const left = window.screen.width / 2 - width / 2;
                    const top = window.screen.height / 2 - height / 2;
                    
                    const popup = window.open(
                        data.url,
                        'google-auth',
                        `width=${width},height=${height},left=${left},top=${top}`
                    );

                    if (!popup) {
                        throw new Error('Popup blocked. Please allow popups.');
                    }
                }
              } catch (err: any) {
                setError(err.message);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 text-[10px] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-slate-600 hover:text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
          >
            {isLogin ? "Create an account" : "Already have an account?"}
          </button>
          
          <div>
            <a href="/pandc" className="text-[9px] text-slate-600 hover:text-slate-400 underline transition-colors">
              Privacy & Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
