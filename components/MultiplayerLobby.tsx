import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { PlayerState, UserProfile } from '../types';
import { Rocket, Copy, Play, Users, MapPin, Wifi, CheckCircle2 } from 'lucide-react';

interface MultiplayerLobbyProps {
  user: any;
  profile: UserProfile;
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  players: PlayerState[];
  setPlayers: (players: PlayerState[]) => void;
  startGame: () => void;
  hostId: string | null;
  setHostId: (id: string | null) => void;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  user, profile, roomId, setRoomId, players, setPlayers, startGame, hostId, setHostId, isReady, setIsReady
}) => {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<'global' | 'local'>('global');
  const [nearbyRooms, setNearbyRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch nearby rooms (simulated for now, or using simple region filter)
  useEffect(() => {
    if (mode === 'local' && !roomId) {
      const fetchNearby = async () => {
        setLoading(true);
        // In a real app, we'd use PostGIS with user's lat/long.
        // For now, we'll just fetch rooms tagged as 'local' created recently.
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('region', 'local')
          .eq('status', 'waiting')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) setNearbyRooms(data);
        setLoading(false);
      };

      fetchNearby();
      const interval = setInterval(fetchNearby, 5000);
      return () => clearInterval(interval);
    }
  }, [mode, roomId]);

  const createRoom = async (region: 'global' | 'local') => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({ 
          host_id: user.id, 
          status: 'waiting',
          region: region,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setRoomId(data.id);
        setHostId(user.id);
        await joinRoom(data.id);
      }
    } catch (e) {
      console.error("Failed to create room", e);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('room_participants')
        .insert({
          room_id: id,
          user_id: user.id,
          username: profile.username,
          avatar: profile.avatar,
          progress: 0,
          errors: 0,
          is_ready: false
        });

      if (error) {
        if (error.code === '23505') { // Unique violation (already joined)
           // Just set state
        } else {
           throw error;
        }
      }
      setRoomId(id);
    } catch (e) {
      console.error("Failed to join room", e);
    }
  };

  const leaveRoom = async () => {
    if (!roomId || !user) return;
    await supabase.from('room_participants').delete().eq('room_id', roomId).eq('user_id', user.id);
    setRoomId(null);
    setPlayers([]);
    setHostId(null);
  };

  const toggleReady = async () => {
    if (!roomId || !user) return;
    const newReady = !isReady;
    setIsReady(newReady);
    await supabase.from('room_participants').update({ is_ready: newReady }).eq('room_id', roomId).eq('user_id', user.id);
  };

  if (roomId) {
    return (
      <div className="glass p-8 rounded-[2.5rem] border border-white/10 text-center space-y-8 w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            {mode === 'local' ? 'Local Wireless Lobby' : 'Global Network Lobby'}
          </p>
          <div className="flex items-center justify-center gap-4 relative">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-[0.1em] drop-shadow-glow font-mono">
              {roomId.slice(0, 8)}...
            </h4>
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white relative"
            >
              {copied ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Copy size={20} />}
            </button>
            {copied && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap z-50">
                Room code copied to clipboard!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5 relative group">
              {p.id === hostId && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Host</div>
              )}
              {/* @ts-ignore - is_ready might not be on PlayerState yet, need to update types */}
              {(p as any).is_ready && (
                <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Ready</div>
              )}
              <div className="text-4xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{p.avatar}</div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${p.id === user?.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                {p.name}
              </span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center justify-center gap-3 p-4 bg-black/10 rounded-2xl border border-white/5 border-dashed opacity-50">
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Waiting...</span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col items-center gap-4 relative z-10">
          {mode === 'local' ? (
             <button 
             onClick={toggleReady}
             className={`px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg hover:scale-105 active:scale-95 ${isReady ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-700 text-slate-300'}`}
           >
             {isReady ? 'Ready!' : 'Vote to Start'}
           </button>
          ) : (
            hostId === user?.id ? (
              <button 
                onClick={startGame}
                className="group relative px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_50px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Play size={16} /> Start Race
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Waiting for Host</span>
              </div>
            )
          )}
          
          <button 
            onClick={leaveRoom}
            className="text-[9px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-widest transition-colors mt-2"
          >
            Abort & Leave
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setMode('global')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-black/40 text-slate-500 hover:text-white'}`}
        >
          <Users size={16} /> Global Network
        </button>
        <button 
          onClick={() => setMode('local')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'local' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-black/40 text-slate-500 hover:text-white'}`}
        >
          <Wifi size={16} /> Local Wireless
        </button>
      </div>

      {mode === 'global' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => createRoom('global')}
            disabled={loading}
            className="p-8 glass border border-white/10 rounded-[2rem] hover:border-rose-500/30 transition-all group flex flex-col items-center justify-center gap-4 min-h-[200px]"
          >
            <div className="p-4 bg-rose-500/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Rocket className="text-rose-400" size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white">Create Room</span>
          </button>

          <div className="p-8 glass border border-white/10 rounded-[2rem] flex flex-col justify-center gap-4 min-h-[200px]">
            <input 
              value={joinCode} 
              onChange={e => setJoinCode(e.target.value)}
              placeholder="ENTER ROOM ID"
              className="bg-black/50 border border-white/10 rounded-xl p-4 text-center text-white font-black tracking-widest text-xs focus:border-rose-500 outline-none transition-all"
            />
            <button 
              onClick={() => joinRoom(joinCode)}
              disabled={loading || !joinCode}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" /> Nearby Signals
            </h3>
            <button 
              onClick={() => createRoom('local')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Start Local Lobby
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {nearbyRooms.length === 0 ? (
              <div className="p-8 text-center border border-white/5 rounded-2xl bg-black/20">
                <Wifi size={24} className="mx-auto text-slate-600 mb-2 opacity-50" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No local lobbies found</p>
              </div>
            ) : (
              nearbyRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => joinRoom(room.id)}
                  className="flex items-center justify-between p-4 glass border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                      {room.host_id.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Lobby {room.id.slice(0, 4)}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide">Waiting for players...</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    Join
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerLobby;
