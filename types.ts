
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  PRO = 'pro',
  INSANE = 'insane'
}

export enum GameMode {
  SOLO = 'solo',
  TIME_ATTACK = 'timed',
  COMPETITIVE = 'competitive',
  DAILY = 'daily',
  BEAT_THE_CLOCK = 'beat_the_clock',
  ACCURACY_CHALLENGE = 'accuracy_challenge',
  WPM_RACE = 'wpm_race',
  CUSTOM_TEXT = 'custom_text',
  CODE = 'code',
  ADAPTIVE = 'adaptive'
}

export enum CompetitiveType {
  BOTS = 'bots',
  MULTIPLAYER = 'multiplayer'
}

export enum AIProvider {
  GEMINI = 'gemini',
  GITHUB = 'github'
}

export enum PowerUpType {
  SKIP_WORD = 'SKIP_WORD',
  TIME_FREEZE = 'TIME_FREEZE',
  SLOW_OPPONENTS = 'SLOW_OPPONENTS'
}

export enum AppView {
  GAME = 'game',
  SETTINGS = 'settings',
  PROFILE = 'profile',
  HISTORY = 'history',
  TUTORIALS = 'tutorials',
  PRIVACY = 'privacy',
  REDIRECT = 'redirect',
  SEARCH = 'search',
  LEADERBOARD = 'leaderboard',
  CLANS = 'clans',
  NOT_FOUND = 'not_found'
}

export enum SoundProfile {
  CLASSIC = 'classic',
  MECHANICAL_BLUE = 'mechanical_blue',
  MECHANICAL_BROWN = 'mechanical_brown',
  MECHANICAL_RED = 'mechanical_red',
  SYNTH = 'synth',
  SILENT = 'silent'
}

export enum KeyboardLayout {
  ANSI = 'ansi',
  ISO = 'iso',
  JIS = 'jis'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: string;
  completed: boolean;
  type: 'wpm' | 'races' | 'accuracy' | 'words';
}

export interface UserProfile {
  username: string;
  handle?: string;
  avatar: string;
  accentColor: string;
  theme?: string;
  is_pro?: boolean;
  discord_id?: string;
  customTheme?: {
    bg: string;
    text: string;
    accent: string;
    glass: string;
  };
  quests?: Quest[];
  lastQuestDate?: string;
}

export interface PomodoroSettings {
  enabled: boolean;
  defaultMinutes: number;
  size: 'small' | 'medium' | 'large';
}

export interface UserPreferences {
  ai_provider: AIProvider;
  github_token: string;
  user_profile: UserProfile;
  pomodoro_settings: PomodoroSettings;
  ai_opponent_count: number;
  ai_opponent_difficulty: Difficulty;
  calibrated_keys: string[];
  key_mappings: Record<string, string>;
  sound_profile?: SoundProfile;
  keyboard_layout?: KeyboardLayout;
  speed_unit?: 'wpm' | 'cpm';
  zen_mode?: boolean;
  focus_penalty?: boolean;
  ghost_racing?: boolean;
  show_heatmap?: boolean;
  blind_mode?: boolean;
  streamer_mode?: boolean;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  label: string;
  icon: string;
  description: string;
}

export interface ReplayEvent {
  timestamp: number;
  key: string;
  isCorrect: boolean;
}

export interface TypingResult {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
  difficulty: Difficulty;
  mode: GameMode;
  textLength: number;
  words?: number;
  text?: string;
  errorMap?: Record<string, number>;
  keySpeeds?: Record<string, number[]>;
  coachNote?: string;
  replayData?: ReplayEvent[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string;
  owner_id: string;
  created_at: string;
  member_count: number;
  total_wpm: number;
  avatar_url?: string;
}

export interface ClanMember {
  id: string;
  clan_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  username?: string;
  avatar?: string;
}

export interface PlayerState {
  id: string;
  name: string;
  index: number;
  errors: number;
  isBot: boolean;
  isGhost?: boolean;
  avatar: string;
}

export interface RoomState {
  id: string;
  players: PlayerState[];
  isActive: boolean;
  text: string;
}

export interface GameConfig {
  difficulty: Difficulty;
  mode: GameMode;
  category: string;
  provider: AIProvider;
}
