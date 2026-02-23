import React, { useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const OAuthCallback = () => {
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Authenticating...');

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a hash (implicit flow) or query params (pkce)
      // Supabase js handles parsing automatically when getSession is called
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        setStatus('error');
        setMessage(error.message);
        if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_ERROR', error: error.message }, window.location.origin);
            setTimeout(() => window.close(), 2000);
        }
        return;
      }

      if (data.session) {
        setStatus('success');
        setMessage('Successfully signed in! Closing window...');
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', session: data.session }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
          // Fallback if not in a popup
          setTimeout(() => window.location.href = '/', 1000);
        }
      } else {
        // Listen for the auth state change which might happen slightly after load
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                 setStatus('success');
                 setMessage('Successfully signed in! Closing window...');
                 if (window.opener) {
                    window.opener.postMessage({ type: 'OAUTH_SUCCESS', session }, window.location.origin);
                    setTimeout(() => window.close(), 1000);
                 } else {
                     setTimeout(() => window.location.href = '/', 1000);
                 }
            }
        });
        
        // If still nothing after a timeout, show error
        setTimeout(() => {
            if (status === 'loading') {
                // It's possible the hash was consumed but no session established?
                // Or maybe we are just waiting.
            }
        }, 5000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
      {status === 'loading' && <Loader2 className="animate-spin mb-4 text-indigo-500" size={48} />}
      {status === 'success' && <CheckCircle2 className="mb-4 text-emerald-500" size={48} />}
      {status === 'error' && <XCircle className="mb-4 text-rose-500" size={48} />}
      
      <h2 className="text-xl font-black uppercase tracking-widest mb-2">{status === 'error' ? 'Authentication Failed' : 'Authenticating'}</h2>
      <p className="text-sm font-medium text-slate-400 max-w-md">{message}</p>
    </div>
  );
};

export default OAuthCallback;
