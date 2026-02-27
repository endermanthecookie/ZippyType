import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, User, Shield, Activity } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { UserProfile } from '../types';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  rank?: number;
}

interface LeaderboardProps {
  currentUser: any;
  userProfile: UserProfile;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, userProfile }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        // Add rank
        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
        setEntries(rankedData);

        // Find user rank
        if (currentUser) {
          const userEntry = rankedData.find(e => e.user_id === currentUser.id);
          if (userEntry) {
            setUserRank(userEntry.rank);
          } else {
            // If user is not in top 100, try to fetch their specific rank
            // This is a bit complex without a specific rank function, so we might skip for now
            // or just show "Unranked" or "> 100"
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-amber-400" size={24} fill="currentColor" />;
      case 2: return <Medal className="text-slate-300" size={24} fill="currentColor" />;
      case 3: return <Medal className="text-amber-700" size={24} fill="currentColor" />;
      default: return <span className="text-slate-500 font-black font-mono text-lg">#{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
          <Trophy size={48} className="text-amber-500" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Leaderboard</span>
        </h2>
        <p className="text-slate-400 font-medium max-w-lg mx-auto">
          Top pilots ranked by total characters typed minus errors.
        </p>
      </div>

      {userRank && (
        <div className="glass border border-indigo-500/30 p-6 rounded-2xl flex items-center justify-between bg-indigo-500/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
              #{userRank}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Rank</h3>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Keep pushing!</p>
            </div>
          </div>
          <div className="text-right relative z-10">
             <div className="text-2xl font-black text-white font-mono">
               {entries.find(e => e.user_id === currentUser.id)?.score.toLocaleString() || 0}
             </div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</div>
          </div>
        </div>
      )}

      <div className="glass border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pilot</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-500 animate-pulse">
                    Loading rankings...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-500">
                    No records yet. Be the first!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr 
                    key={entry.user_id} 
                    className={`group transition-colors hover:bg-white/5 ${entry.user_id === currentUser?.id ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : ''}`}
                  >
                    <td className="p-6 w-24">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(entry.rank!)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${entry.user_id === currentUser?.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                          <User size={16} />
                        </div>
                        <span className={`font-bold ${entry.user_id === currentUser?.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                          {entry.username}
                        </span>
                        {entry.user_id === currentUser?.id && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/30">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-mono font-bold text-white text-lg tracking-tight">
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
