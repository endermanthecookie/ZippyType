
import { createClient } from '@supabase/supabase-js';
import { UserPreferences, AIProvider, Difficulty } from '../types';

const supabaseUrl = 'https://ewdrrhdsxjrhxyzgjokg.supabase.co';
const supabaseAnonKey = 'sb_publishable_VOd9I9_yUqlHFPBfkoCtfA_FtttMyKc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Encryption Helpers ---
const ENCRYPTION_PREFIX = 'ENC:';

async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return baseKey;
}

async function encryptToken(token: string, userId: string): Promise<string> {
  if (!token) return '';
  try {
    const key = await getEncryptionKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(token)
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return ENCRYPTION_PREFIX + btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('Encryption failed', e);
    return token;
  }
}

async function decryptToken(encryptedData: string, userId: string): Promise<string> {
  if (!encryptedData || !encryptedData.startsWith(ENCRYPTION_PREFIX)) return encryptedData;
  try {
    const key = await getEncryptionKey(userId);
    const rawData = atob(encryptedData.replace(ENCRYPTION_PREFIX, ''));
    const combined = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) combined[i] = rawData.charCodeAt(i);
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
}

// --- Service Methods ---

export const saveUserPreferences = async (userId: string, prefs: UserPreferences) => {
  const encryptedGithubToken = await encryptToken(prefs.github_token, userId);
  
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: userId, 
      ai_provider: prefs.ai_provider,
      github_token: encryptedGithubToken,
      pilot_profile: prefs.user_profile,
      pomodoro_settings: prefs.pomodoro_settings,
      ai_opponent_count: prefs.ai_opponent_count,
      ai_opponent_difficulty: prefs.ai_opponent_difficulty,
      calibrated_keys: prefs.calibrated_keys,
      key_mappings: prefs.key_mappings,
      sound_profile: prefs.sound_profile,
      keyboard_layout: prefs.keyboard_layout,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  
  if (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
  return true;
};

export const loadUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const decryptedGithubToken = await decryptToken(data.github_token, userId);

    return {
      ai_provider: (data.ai_provider as AIProvider) || AIProvider.GEMINI,
      github_token: decryptedGithubToken,
      user_profile: data.pilot_profile || { username: 'Guest Player', avatar: '😊', accentColor: 'indigo' },
      pomodoro_settings: data.pomodoro_settings || { enabled: true, defaultMinutes: 25, size: 'medium' },
      ai_opponent_count: data.ai_opponent_count || 1,
      ai_opponent_difficulty: (data.ai_opponent_difficulty as Difficulty) || Difficulty.MEDIUM,
      calibrated_keys: data.calibrated_keys || [],
      key_mappings: data.key_mappings || {},
      sound_profile: data.sound_profile,
      keyboard_layout: data.keyboard_layout
    };
  } catch (e) {
    console.error('Load preferences failed', e);
    return null;
  }
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/redirect`,
    },
  });
  if (error) throw error;
  return data;
};

export const linkUserToIp = async (userId: string) => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    await supabase.from('ip_sessions').upsert({ ip_address: ip, user_id: userId });
  } catch (e) {
    console.error('Failed to link IP to user', e);
  }
};

export const getUserIdByIp = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    const { data } = await supabase.from('ip_sessions').select('user_id').eq('ip_address', ip).maybeSingle();
    return data?.user_id || null;
  } catch {
    return null;
  }
};

export const checkIpSoloUsage = async (): Promise<boolean> => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    const { data } = await supabase.from('anonymous_runs').select('ip_address').eq('ip_address', ip).maybeSingle();
    return !!data;
  } catch {
    return false;
  }
};

export const recordIpSoloUsage = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    await supabase.from('anonymous_runs').upsert({ ip_address: ip });
  } catch (e) {
    console.error('Failed to record IP usage', e);
  }
};

export const getDailyText = async (generator: () => Promise<string>): Promise<string> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily')
      .select('daily, created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const lastCreated = new Date(data[0].created_at).toISOString().split('T')[0];
      if (lastCreated === today) {
        return data[0].daily;
      }
    }

    // Generate new text
    const newText = await generator();
    
    // Delete old entries and insert new one
    await supabase.from('daily').delete().neq('daily', 'placeholder_to_ensure_delete_all');
    await supabase.from('daily').insert({ daily: newText });

    return newText;
  } catch (e) {
    console.error('Daily text fetch failed', e);
    return generator(); // Fallback to fresh generation
  }
};
