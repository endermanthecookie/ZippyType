import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { User, Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AccountSettingsProps {
  user: any;
  profile: any;
  setProfile: (p: any) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, profile, setProfile }) => {
  const [newUsername, setNewUsername] = useState(profile.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername === profile.username) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from('usernames')
        .select('user_id')
        .eq('username', newUsername.toLowerCase())
        .single();

      if (existing && existing.user_id !== user.id) {
        throw new Error("Username is already taken.");
      }

      // Update usernames table
      const { error: unError } = await supabase
        .from('usernames')
        .upsert({ user_id: user.id, username: newUsername.toLowerCase() });

      if (unError) throw unError;

      // Update profile state
      setProfile({ ...profile, username: newUsername.toLowerCase() });
      setSuccess("Username updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess("Password updated successfully!");
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <ShieldCheck size={22} />
        </div>
        <h2 className="text-base font-black text-white uppercase tracking-tighter">Account Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Username Section */}
        <div className="p-8 glass border border-white/10 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3">
            <User size={18} className="text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Change Pilot Handle</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">New Username</label>
              <input 
                type="text" 
                value={newUsername}
                onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="new_handle"
                maxLength={20}
              />
            </div>
            <button 
              onClick={handleUpdateUsername}
              disabled={loading || newUsername === profile.username}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Username"}
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="p-8 glass border border-white/10 rounded-[2rem] space-y-6">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-rose-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Security Update</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={loading || !newPassword}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Change Password"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
