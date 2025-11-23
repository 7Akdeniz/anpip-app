// ============================================================================
// 🎛️ SETTINGS TYPES - Anpip.com
// ============================================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_private: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface UserSession {
  id: string;
  device_name: string;
  device_type: string;
  location?: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export interface NotificationSettings {
  push_enabled: boolean;
  comments: boolean;
  followers: boolean;
  likes: boolean;
  messages: boolean;
  mentions: boolean;
  group_notifications: boolean;
}

export interface PrivacySettings {
  is_private: boolean;
  who_can_find_me: 'everyone' | 'nobody' | 'verified';
  who_can_follow: 'everyone' | 'nobody' | 'verified';
  who_can_see_videos: 'everyone' | 'followers' | 'nobody';
  show_in_suggestions: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  font_size: 'small' | 'medium' | 'large';
  animations: 'normal' | 'reduced';
  accessibility_mode: boolean;
}

export interface LocationSettings {
  auto_detect: boolean;
  country?: string;
  city?: string;
  suggest_for_market: boolean;
}

export interface MediaSettings {
  autoplay: boolean;
  autoplay_wifi_only: boolean;
  default_sound: boolean;
  always_show_captions: boolean;
  video_quality: 'auto' | 'low' | 'high';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last_four?: string;
  is_default: boolean;
  expiry?: string;
}

export interface Subscription {
  id: string;
  plan_name: string;
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  currency: string;
  next_billing_date?: string;
  cancel_at_period_end: boolean;
}

export interface BlockedUser {
  id: string;
  username: string;
  avatar_url?: string;
  blocked_at: string;
}

export interface LoginHistory {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  timestamp: string;
  success: boolean;
}
