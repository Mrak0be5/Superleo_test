
export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  PLAYABLE_AD = 'PLAYABLE_AD'
}

export const APP_NAMES = ['Grand Theft Auto', 'Fish Idle', 'Evolution'] as const;
export type AppName = typeof APP_NAMES[number];

export const GAMES_DATA: Record<AppName, { iconPath: string; color: string; bg: string }> = {
  'Grand Theft Auto': { 
    // Car/Wheel icon
    iconPath: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-2.7 9c-.2.6.3 1.1.9 1.1h2c.6 0 1.1.4 1.4.9l2.7 9c.2.6.9 1.1 1.1 1.1h2c.6 0 1.1-.4 1.4-.9L14 26h2c.6 0 1.1-.4 1.4-.9l2.7-9c.2-.6-.3-1.1-.9-1.1 M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M7 11h2v2H7v-2zm8 0h2v2h-2v-2z', 
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20'
  },
  'Fish Idle': { 
    // Fish icon
    iconPath: 'M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0 2.5c-2.5 0-4.5 2-4.5 4.5S9.5 15.5 12 15.5 16.5 13.5 16.5 11 14.5 6.5 12 6.5z', 
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  'Evolution': { 
    // DNA icon
    iconPath: 'M12 2.01c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7 7-3.13 7-7 7zm-1-11h2v3h-2zm0 4h2v3h-2zm0 4h2v3h-2z', 
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  }
};

export interface ABVariant {
  id: string;
  imageUrl: string;
  isControl: boolean;
  impressions?: number;
  conversions?: number;
  performanceCtx?: number; // percentage vs control, e.g., +12.5
}

export interface ABTest {
  id: string;
  status: 'active' | 'completed' | 'draft';
  startDate: number;
  variants: ABVariant[];
}

export interface AppDetails {
  name: AppName;
  bundleId: string;
  storeId: string;
  description: string;
  approvalStatus: {
    google: 'approved' | 'pending' | 'rejected' | 'not_submitted';
    facebook: 'approved' | 'pending' | 'rejected' | 'not_submitted';
    tiktok: 'approved' | 'pending' | 'rejected' | 'not_submitted';
  };
  adIds: {
    rewarded: string;
    interstitial: string;
    banner: string;
  };
  activeAbTest?: ABTest;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  title: string;
  createdAt: number;
  tags: string[];
  appName?: AppName;
  metadata?: {
    duration?: number;
    resolution?: string;
    prompt?: string;
    model?: string;
  };
  cpiMetrics?: {
    ww: number;
    usa: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  appName?: AppName;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  platform: 'google' | 'facebook' | 'tiktok';
  createdAt: number;
  creativeIds?: string[];
  targeting?: {
    geo: string;
    age: string;
    gender: 'all' | 'male' | 'female';
  };
}

export interface GenerationConfig {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  resolution?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: {
    type: 'video' | 'image' | 'campaign';
    url?: string;
    data?: any;
  };
}
