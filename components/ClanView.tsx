import React, { useState, useEffect } from 'react';
import { Clan, ClanMember, UserProfile } from '../types';
import { Users, Plus, Search, Shield, Trophy, UserPlus, LogOut, Settings, MessageSquare, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseService';

interface ClanViewProps {
  user: any;
  profile: UserProfile;
}

const ClanView: React.FC<ClanViewProps> = ({ user, profile }) => {
  const [clans, setClans] = useState<Clan[]>([]);
  const [myClan, setMyClan] = useState<Clan | null>(null);
  const [myMemberInfo, setMyMemberInfo] = useState<ClanMember | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClanName, setNewClanName] = useState('');
  const [newClanTag, setNewClanTag] = useState('');
  const [newClanDesc, setNewClanDesc] = useState('');

  useEffect(() => {
    fetchClans();
    if (user) fetchMyClan();
  }, [user]);

  const fetchClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('total_wpm', { ascending: false });
      
      if (error) throw error;
      setClans(data || []);
    } catch (err) {
      console.error("Error fetching clans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClan = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('clan_members')
        .select('*, clans(*)')
        .eq('user_id', user.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      if (memberData) {
        setMyMemberInfo(memberData);
        setMyClan(memberData.clans);
        fetchClanMembers(memberData.clan_id);
      }
    } catch (err) {
      console.error("Error fetching my clan:", err);
    }
  };

  const fetchClanMembers = async (clanId: string) => {
    try {
      const { data, error } = await supabase
        .from('clan_members')
        .select('*')
        .eq('clan_id', clanId);
      
      if (error) throw error;
      setClanMembers(data || []);
    } catch (err) {
      console.error("Error fetching clan members:", err);
    }
  };

  const handleCreateClan = async () => {
    if (!newClanName || !newClanTag) return;
    try {
      const { data: clanData, error: clanError } = await supabase
        .from('clans')
        .insert([{
          name: newClanName,
          tag: newClanTag.toUpperCase(),
          description: newClanDesc,
          owner_id: user.id,
          member_count: 1,
          total_wpm: 0
        }])
        .select()
        .single();

      if (clanError) throw clanError;

      const { error: memberError } = await supabase
        .from('clan_members')
        .insert([{
          clan_id: clanData.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) throw memberError;

      setShowCreateModal(false);
      fetchClans();
      fetchMyClan();
    } catch (err) {
      console.error("Error creating clan:", err);
      alert("Failed to create clan. Tag might be taken.");
    }
  };

  const handleJoinClan = async (clanId: string) => {
    try {
      const { error } = await supabase
        .from('clan_members')
        .insert([{
          clan_id: clanId,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;
      
      // Update member count
      const { data: currentClan } = await supabase.from('clans').select('member_count').eq('id', clanId).single();
      if (currentClan) {
        await supabase.from('clans').update({ member_count: currentClan.member_count + 1 }).eq('id', clanId);
      }
      
      fetchClans();
      fetchMyClan();
    } catch (err) {
      console.error("Error joining clan:", err);
      alert("Failed to join clan.");
    }
  };

  const handleLeaveClan = async () => {
    if (!myClan || !myMemberInfo) return;
    if (myMemberInfo.role === 'owner') {
      alert("Owners cannot leave. Transfer ownership or delete the clan.");
      return;
    }

    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', myMemberInfo.id);

      if (error) throw error;
      
      const { data: currentClan } = await supabase.from('clans').select('member_count').eq('id', myClan.id).single();
      if (currentClan) {
        await supabase.from('clans').update({ member_count: Math.max(0, currentClan.member_count - 1) }).eq('id', myClan.id);
      }
      
      setMyClan(null);
      setMyMemberInfo(null);
      setClanMembers([]);
      fetchClans();
    } catch (err) {
      console.error("Error leaving clan:", err);
    }
  };

  const filteredClans = clans.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Users size={24} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Clans & Teams</h2>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Join forces with other typists and climb the ranks</p>
        </div>

        {!myClan && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={18} />
            Create Clan
          </button>
        )}
      </div>

      {myClan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Clan Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Shield size={200} />
              </div>
              
              <div className="relative space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                      {myClan.tag}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{myClan.name}</h3>
                      <p className="text-xs text-slate-400 font-medium max-w-md">{myClan.description || "No description set."}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {myMemberInfo?.role === 'owner' && (
                      <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all">
                        <Settings size={20} />
                      </button>
                    )}
                    <button 
                      onClick={handleLeaveClan}
                      className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Members</p>
                    <p className="text-2xl font-black text-white">{myClan.member_count} / 50</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total WPM</p>
                    <p className="text-2xl font-black text-emerald-400">{myClan.total_wpm}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</p>
                    <p className="text-2xl font-black text-amber-400">#12</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} className="text-indigo-400" /> Members List
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {clanMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                            {member.username?.slice(0, 2) || "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white">{member.username || "Anonymous Typist"}</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{member.role}</span>
                          </div>
                        </div>
                        {member.role === 'owner' && <Shield size={16} className="text-amber-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clan Chat / Activity Placeholder */}
          <div className="space-y-8">
            <div className="glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl h-full flex flex-col">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <MessageSquare size={16} className="text-indigo-400" /> Clan Communication
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="p-4 bg-white/5 rounded-full">
                  <Lock size={32} className="text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-widest">Encrypted Channel</p>
                  <p className="text-[10px] text-slate-500 font-medium">Chat feature coming in the next update.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Search & Filter */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search clans by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-white font-bold text-lg outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
          </div>

          {/* Clans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClans.map(clan => (
              <motion.div 
                key={clan.id}
                whileHover={{ y: -5 }}
                className="glass rounded-[2rem] p-8 border border-white/10 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                      {clan.tag}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{clan.name}</h3>
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{clan.member_count} Members</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <Trophy size={16} />
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-8 h-8">{clan.description || "A competitive typing clan."}</p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clan Power</span>
                    <span className="text-sm font-black text-emerald-400">{clan.total_wpm} WPM</span>
                  </div>
                  <button 
                    onClick={() => handleJoinClan(clan.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all border border-white/5"
                  >
                    <UserPlus size={14} />
                    Join
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredClans.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center space-y-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <div className="p-6 bg-white/5 rounded-full w-fit mx-auto">
                  <Globe size={48} className="text-slate-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-white uppercase tracking-widest">No clans found</p>
                  <p className="text-xs text-slate-500 font-medium">Try a different search term or create your own clan.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Clan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 shadow-3xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 rounded-t-[3rem]" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Establish New Clan</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clan Name</label>
                  <input 
                    type="text" 
                    value={newClanName}
                    onChange={(e) => setNewClanName(e.target.value)}
                    placeholder="e.g. Speed Demons"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clan Tag (3-4 chars)</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={newClanTag}
                    onChange={(e) => setNewClanTag(e.target.value)}
                    placeholder="e.g. SPD"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-bold text-sm outline-none focus:border-indigo-500 transition-all uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newClanDesc}
                    onChange={(e) => setNewClanDesc(e.target.value)}
                    placeholder="What is your clan about?"
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateClan}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                  >
                    Create Clan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClanView;
