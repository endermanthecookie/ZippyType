
import { createClient } from '@supabase/supabase-js';
import { UserPreferences, AIProvider, Difficulty } from '../types';

const supabaseUrl = 'https://ewdrrhdsxjrhxyzgjokg.supabase.co';
const supabaseAnonKey = 'sb_publishable_VOd9I9_yUqlHFPBfkoCtfA_FtttMyKc';

// --- Generic Retry Wrapper ---
function isNetworkError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('fetch') || 
         msg.includes('network') ||
         msg.includes('timeout') ||
         msg.includes('connection') ||
         err.status === 502 || err.status === 503 || err.status === 504 ||
         err.code === 'PGRST301' || err.code === '08006' || err.code === '08001';
}

async function withRetry<T>(fn: () => T | Promise<T>, retries = 5, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      
      // Check if it's a Supabase-style error response (data/error object)
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        const err = result.error as any;
        if (isNetworkError(err)) {
          console.warn(`Supabase call returned network error (Attempt ${i + 1}/${retries}): ${err.message || 'Unknown error'}. Retrying...`);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1) + Math.random() * 500));
            continue;
          }
        }
      }
      
      return result;
    } catch (err: any) {
      lastError = err;
      if (isNetworkError(err)) {
        console.warn(`Supabase call threw network error (Attempt ${i + 1}/${retries}): ${err.message || 'Unknown error'}. Retrying...`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1) + Math.random() * 500));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Encryption Helpers ---
const ENCRYPTION_PREFIX = 'ENC:';

async function getIP(): Promise<string> {
  const services = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://api.seeip.org/jsonip'
  ];
  
  for (const service of services) {
    try {
      const res = await fetch(service, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = await res.json();
      return data.ip || data.ip_address || data.query;
    } catch (e) {
      console.warn(`IP service ${service} failed:`, e);
    }
  }
  throw new Error("All IP services failed");
}

async function hashIP(ip: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

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
  
  const { error } = await withRetry(() => supabase
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
    }, { onConflict: 'user_id' }));
  
  if (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
  return true;
};

export const loadUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    );

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

export const checkProStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('zippypro')
        .select('is_active, months_remaining')
        .eq('user_id', userId)
        .maybeSingle()
    );
    
    if (error || !data) return false;
    return data.is_active && data.months_remaining > 0;
  } catch (e) {
    console.error('Check pro status failed', e);
    return false;
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
    const ip = await getIP();
    const hashedIp = await hashIP(ip);
    await withRetry(() => supabase.from('ip_sessions').upsert({ ip_address: hashedIp, user_id: userId }));
  } catch (e) {
    console.error('Failed to link IP to user', e);
  }
};

export const getUserIdByIp = async (): Promise<string | null> => {
  try {
    const ip = await getIP();
    const hashedIp = await hashIP(ip);
    const { data } = await withRetry(() => supabase.from('ip_sessions').select('user_id').eq('ip_address', hashedIp).maybeSingle());
    return data?.user_id || null;
  } catch {
    return null;
  }
};

export const checkIpSoloUsage = async (): Promise<boolean> => {
  try {
    const ip = await getIP();
    const hashedIp = await hashIP(ip);
    const { data } = await withRetry(() => supabase.from('anonymous_runs').select('ip_address').eq('ip_address', hashedIp).maybeSingle());
    return !!data;
  } catch {
    return false;
  }
};

export const recordIpSoloUsage = async () => {
  try {
    const ip = await getIP();
    const hashedIp = await hashIP(ip);
    await withRetry(() => supabase.from('anonymous_runs').upsert({ ip_address: hashedIp }));
  } catch (e) {
    console.error('Failed to record IP usage', e);
  }
};

export const incrementUsage = async (userId: string | null, isPro: boolean, isCustomTopic: boolean): Promise<number> => {
  try {
    let hashedIp = null;
    if (!userId) {
      const ip = await getIP();
      hashedIp = await hashIP(ip);
    }
    
    const { data, error } = await supabase.rpc('increment_usage', {
      user_id_arg: userId,
      ip_address_arg: hashedIp,
      is_pro_arg: isPro,
      is_custom_topic_arg: isCustomTopic
    });
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to increment usage', e);
    return 1; // Default to success if check fails to not block user
  }
};

export const getDailyText = async (generator: () => Promise<string>): Promise<string> => {
  try {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await withRetry(() => 
      supabase
        .from('daily_run')
        .select('text')
        .eq('date', today)
        .maybeSingle()
    );

    if (data) {
      return data.text;
    }

    // Generate new text
    const newText = await generator();
    
    // Insert new one for today
    await supabase.from('daily_run').insert({ date: today, text: newText });

    return newText;
  } catch (e) {
    console.error('Daily text fetch failed', e);
    return generator(); // Fallback to fresh generation
  }
};

export const initializeUserCredits = async (userId: string) => {
  try {
    const { data } = await withRetry(() => supabase.from('user_credits').select('credits').eq('user_id', userId).maybeSingle());
    if (!data) {
      await withRetry(() => supabase.from('user_credits').insert({ user_id: userId, credits: 10 }));
    }
  } catch (e) {
    console.error('Failed to initialize credits', e);
  }
};

export const saveHistory = async (userId: string, result: any) => {
  try {
    const { error } = await withRetry(() => supabase.from('history').insert({
      user_id: userId,
      wpm: Math.round(result.wpm),
      accuracy: Math.round(result.accuracy),
      time: Math.round(result.time),
      errors: Math.round(result.errors),
      difficulty: result.difficulty,
      mode: result.mode,
      text_length: Math.round(result.textLength)
    }));
    if (error) throw error;
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const fetchHistory = async (userId: string) => {
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
    
    if (error) {
      console.error('Supabase error fetching history:', error);
      throw error;
    }
    return data.map((item: any) => ({
      id: item.id,
      date: item.created_at,
      wpm: item.wpm,
      accuracy: item.accuracy,
      time: item.time,
      errors: item.errors,
      difficulty: item.difficulty,
      mode: item.mode,
      textLength: item.text_length
    }));
  } catch (e) {
    console.error(`Failed to fetch history:`, e);
    return [];
  }
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `profile_pic_${userId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const fetchAchievements = async (userId: string) => {
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId)
    );
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to fetch achievements', e);
    return null;
  }
};

export const saveAchievements = async (userId: string, achievements: any[]) => {
  try {
    const unlocked = achievements
      .filter(a => a.unlockedAt)
      .map(a => ({
        user_id: userId,
        achievement_id: a.id,
        unlocked_at: a.unlockedAt
      }));
    
    if (unlocked.length === 0) return;

    const { error } = await supabase
      .from('user_achievements')
      .upsert(unlocked, { onConflict: 'user_id,achievement_id' });
    
    if (error) throw error;
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
};
