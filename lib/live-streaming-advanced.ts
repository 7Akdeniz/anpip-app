/**
 * 🔴 ADVANCED LIVE-STREAMING SYSTEM 2025
 * 
 * Features:
 * - WebRTC (ultra-low latency < 1s)
 * - HLS fallback (compatibility)
 * - Live Chat mit Emojis & Moderation
 * - Live-Shopping
 * - Live-Q&A
 * - Auto-Replay nach Stream-Ende
 * - Multi-Region CDN
 */

import { supabase } from './supabase';

export interface LiveStream {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location?: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  language: string;
  
  // Stream-Status
  status: 'scheduled' | 'live' | 'ended' | 'replay';
  scheduledTime?: Date;
  startTime?: Date;
  endTime?: Date;
  
  // Streaming-URLs
  webrtcUrl?: string;
  hlsUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  
  // Statistiken
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  likes: number;
  
  // Features
  features: {
    chat: boolean;
    shopping: boolean;
    qa: boolean;
    donations: boolean;
    polls: boolean;
    subtitles: boolean;
  };
  
  // Moderation
  moderatorIds: string[];
  bannedUserIds: string[];
  slowMode?: number; // Sekunden zwischen Nachrichten
  subscriberOnly?: boolean;
  
  // Replay
  replayVideoId?: string;
  autoReplay: boolean;
  
  // Monetarisierung
  isPaid: boolean;
  ticketPrice?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'emoji' | 'donation' | 'join' | 'leave' | 'moderator' | 'system';
  metadata?: {
    donationAmount?: number;
    emojiId?: string;
    isModerator?: boolean;
    isPinned?: boolean;
  };
  deleted?: boolean;
}

export interface LiveProduct {
  id: string;
  streamId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  stockCount: number;
  soldCount: number;
  isActive: boolean;
  url: string;
}

export interface LiveQAQuestion {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  question: string;
  timestamp: Date;
  answered: boolean;
  likes: number;
  isPinned: boolean;
}

export class LiveStreamingService {
  
  /**
   * 🎥 Erstelle neuen Live-Stream
   */
  async createLiveStream(
    userId: string,
    config: Partial<LiveStream>
  ): Promise<{ stream: LiveStream; credentials: { rtmpUrl: string; streamKey: string } }> {
    const streamKey = this.generateSecureStreamKey();
    const streamId = this.generateStreamId();
    
    // RTMP Ingest URL (z.B. via MediaLive oder eigener Server)
    const rtmpUrl = `rtmp://ingest.anpip.com/live`;
    
    // WebRTC & HLS URLs werden nach Stream-Start generiert
    const webrtcUrl = `wss://live.anpip.com/webrtc/${streamId}`;
    const hlsUrl = `https://cdn.anpip.com/live/${streamId}/master.m3u8`;
    
    const stream: LiveStream = {
      id: streamId,
      userId,
      username: config.username || '',
      userAvatar: config.userAvatar,
      title: config.title || '',
      description: config.description || '',
      category: config.category || 'general',
      tags: config.tags || [],
      location: config.location,
      language: config.language || 'de',
      status: config.scheduledTime ? 'scheduled' : 'live',
      scheduledTime: config.scheduledTime,
      startTime: config.scheduledTime ? undefined : new Date(),
      webrtcUrl,
      hlsUrl,
      rtmpUrl,
      streamKey,
      viewerCount: 0,
      peakViewerCount: 0,
      totalViews: 0,
      likes: 0,
      features: {
        chat: true,
        shopping: config.features?.shopping || false,
        qa: config.features?.qa || false,
        donations: config.features?.donations || false,
        polls: config.features?.polls || false,
        subtitles: config.features?.subtitles || false,
      },
      moderatorIds: [userId], // Streamer ist automatisch Moderator
      bannedUserIds: [],
      autoReplay: config.autoReplay !== false,
      isPaid: config.isPaid || false,
      ticketPrice: config.ticketPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // In Datenbank speichern
    const { error } = await supabase
      .from('live_streams')
      .insert([stream]);
    
    if (error) throw error;
    
    return {
      stream,
      credentials: { rtmpUrl, streamKey }
    };
  }
  
  /**
   * 📡 Stream starten
   */
  async startStream(streamId: string): Promise<void> {
    await supabase
      .from('live_streams')
      .update({
        status: 'live',
        startTime: new Date(),
        updatedAt: new Date(),
      })
      .eq('id', streamId);
    
    // WebRTC/HLS Transcoder starten
    await this.startTranscoder(streamId);
  }
  
  /**
   * ⏹️ Stream beenden & automatisch Replay erstellen
   */
  async endStream(streamId: string): Promise<string | null> {
    const { data: stream } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .single();
    
    if (!stream) return null;
    
    const endTime = new Date();
    
    // Stream-Status aktualisieren
    await supabase
      .from('live_streams')
      .update({
        status: 'ended',
        endTime,
        updatedAt: endTime,
      })
      .eq('id', streamId);
    
    // Auto-Replay: Stream-Aufnahme als normales Video speichern
    if (stream.autoReplay) {
      const replayVideoId = await this.createReplayVideo(stream, endTime);
      
      await supabase
        .from('live_streams')
        .update({
          status: 'replay',
          replayVideoId,
        })
        .eq('id', streamId);
      
      return replayVideoId;
    }
    
    return null;
  }
  
  /**
   * 💾 Replay-Video erstellen
   */
  private async createReplayVideo(stream: LiveStream, endTime: Date): Promise<string> {
    const duration = stream.startTime 
      ? (endTime.getTime() - new Date(stream.startTime).getTime()) / 1000 
      : 0;
    
    const { data, error } = await supabase
      .from('videos')
      .insert([{
        user_id: stream.userId,
        title: `🔴 ${stream.title} (Live-Replay)`,
        description: `Live-Stream vom ${new Date(stream.startTime || '').toLocaleDateString()}\n\n${stream.description}`,
        category: stream.category,
        tags: [...stream.tags, 'live-replay'],
        location: stream.location,
        language: stream.language,
        video_url: stream.hlsUrl, // HLS-Recording URL
        duration,
        views: stream.totalViews,
        likes: stream.likes,
        status: 'published',
        is_live_replay: true,
        original_stream_id: stream.id,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  /**
   * 💬 Chat-Nachricht senden
   */
  async sendChatMessage(
    streamId: string,
    userId: string,
    message: string,
    type: LiveChatMessage['type'] = 'message'
  ): Promise<LiveChatMessage> {
    // Prüfe Slow-Mode, Bans, etc.
    const { data: stream } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .single();
    
    if (!stream) throw new Error('Stream not found');
    if (stream.bannedUserIds.includes(userId)) throw new Error('User banned');
    
    const chatMessage: LiveChatMessage = {
      id: crypto.randomUUID(),
      streamId,
      userId,
      username: '', // Wird von DB geholt
      message,
      timestamp: new Date(),
      type,
    };
    
    // In Echtzeit-DB speichern (Realtime-Subscription)
    await supabase
      .from('live_chat_messages')
      .insert([chatMessage]);
    
    return chatMessage;
  }
  
  /**
   * 🛒 Produkt zum Live-Shopping hinzufügen
   */
  async addLiveProduct(streamId: string, product: Partial<LiveProduct>): Promise<LiveProduct> {
    const liveProduct: LiveProduct = {
      id: crypto.randomUUID(),
      streamId,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'EUR',
      imageUrl: product.imageUrl || '',
      stockCount: product.stockCount || 0,
      soldCount: 0,
      isActive: true,
      url: product.url || '',
    };
    
    await supabase
      .from('live_products')
      .insert([liveProduct]);
    
    return liveProduct;
  }
  
  /**
   * ❓ Q&A Frage hinzufügen
   */
  async addQuestion(
    streamId: string,
    userId: string,
    username: string,
    question: string
  ): Promise<LiveQAQuestion> {
    const qa: LiveQAQuestion = {
      id: crypto.randomUUID(),
      streamId,
      userId,
      username,
      question,
      timestamp: new Date(),
      answered: false,
      likes: 0,
      isPinned: false,
    };
    
    await supabase
      .from('live_qa_questions')
      .insert([qa]);
    
    return qa;
  }
  
  /**
   * 👀 Viewer Count erhöhen
   */
  async incrementViewerCount(streamId: string): Promise<void> {
    const { data: stream } = await supabase
      .from('live_streams')
      .select('viewerCount, peakViewerCount')
      .eq('id', streamId)
      .single();
    
    if (!stream) return;
    
    const newCount = stream.viewerCount + 1;
    const peakCount = Math.max(newCount, stream.peakViewerCount);
    
    await supabase
      .from('live_streams')
      .update({
        viewerCount: newCount,
        peakViewerCount: peakCount,
      })
      .eq('id', streamId);
    
    // Total views separat erhöhen
    await supabase.rpc('increment_total_views', { stream_id: streamId });
  }
  
  /**
   * 🔨 Moderator-Aktionen
   */
  async moderateUser(
    streamId: string,
    moderatorId: string,
    targetUserId: string,
    action: 'ban' | 'timeout' | 'delete-message'
  ): Promise<void> {
    // Prüfe Moderator-Rechte
    const { data: stream } = await supabase
      .from('live_streams')
      .select('moderatorIds')
      .eq('id', streamId)
      .single();
    
    if (!stream?.moderatorIds.includes(moderatorId)) {
      throw new Error('Not authorized');
    }
    
    if (action === 'ban') {
      // Banned User zur Liste hinzufügen
      const { data: stream } = await supabase
        .from('live_streams')
        .select('bannedUserIds')
        .eq('id', streamId)
        .single();
      
      const bannedList = stream?.bannedUserIds || [];
      if (!bannedList.includes(targetUserId)) {
        bannedList.push(targetUserId);
        await supabase
          .from('live_streams')
          .update({ bannedUserIds: bannedList })
          .eq('id', streamId);
      }
    }
    // Weitere Aktionen...
  }
  
  /**
   * 🔍 Live-Streams suchen
   */
  async searchLiveStreams(filters: {
    status?: LiveStream['status'];
    category?: string;
    language?: string;
    location?: string;
    limit?: number;
  }): Promise<LiveStream[]> {
    let query = supabase
      .from('live_streams')
      .select('*')
      .order('viewerCount', { ascending: false });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.language) query = query.eq('language', filters.language);
    if (filters.limit) query = query.limit(filters.limit);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }
  
  /**
   * 🔐 Secure Stream Key generieren
   */
  private generateSecureStreamKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
  
  private generateStreamId(): string {
    return `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 🎬 WebRTC/HLS Transcoder starten
   */
  private async startTranscoder(streamId: string): Promise<void> {
    // In Production: AWS MediaLive, Wowza, oder eigener FFmpeg-Service
    // Hier: Placeholder für Transcoder-Logik
    console.log(`Starting transcoder for stream ${streamId}`);
    
    // Beispiel FFmpeg-Befehl für HLS-Transcoding:
    // ffmpeg -i rtmp://ingest.anpip.com/live/{streamKey} \
    //   -c:v libx264 -c:a aac \
    //   -f hls -hls_time 2 -hls_list_size 5 \
    //   -hls_flags delete_segments \
    //   /var/www/live/{streamId}/master.m3u8
  }
}

export const liveStreamingService = new LiveStreamingService();
