/**
 * GIFT/COIN SYSTEM SERVICE
 */

import { supabase } from './supabase';
import { logActivity } from './videoService';

export interface Gift {
  id: string;
  name: string;
  coins: number;
  icon: string;
  animation?: string;
}

export interface GiftTransaction {
  id?: string;
  sender_id: string;
  receiver_id: string;
  video_id: string;
  gift_id: string;
  coins: number;
  created_at?: string;
}

export const AVAILABLE_GIFTS: Gift[] = [
  { id: 'rose', name: 'Rose', coins: 1, icon: '🌹' },
  { id: 'heart', name: 'Herz', coins: 5, icon: '❤️' },
  { id: 'diamond', name: 'Diamant', coins: 10, icon: '💎' },
  { id: 'crown', name: 'Krone', coins: 50, icon: '👑' },
  { id: 'rocket', name: 'Rakete', coins: 100, icon: '🚀' },
  { id: 'star', name: 'Stern', coins: 200, icon: '⭐' },
  { id: 'fire', name: 'Feuer', coins: 500, icon: '🔥' },
  { id: 'trophy', name: 'Pokal', coins: 1000, icon: '🏆' },
];

/**
 * Get user's coin balance
 */
export async function getUserCoins(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.balance || 0;
  } catch (error) {
    console.error('Get coins error:', error);
    return 0;
  }
}

/**
 * Send gift to video creator
 */
export async function sendGift(
  senderId: string,
  receiverId: string,
  videoId: string,
  giftId: string
): Promise<boolean> {
  try {
    const gift = AVAILABLE_GIFTS.find(g => g.id === giftId);
    if (!gift) {
      throw new Error('Gift not found');
    }

    // Check sender's balance
    const senderBalance = await getUserCoins(senderId);
    if (senderBalance < gift.coins) {
      throw new Error('Insufficient coins');
    }

    // Start transaction
    const { error: txError } = await supabase.rpc('send_gift_transaction', {
      p_sender_id: senderId,
      p_receiver_id: receiverId,
      p_video_id: videoId,
      p_gift_id: giftId,
      p_coins: gift.coins,
    });

    if (txError) throw txError;

    // Log activity
    await logActivity(senderId, 'gift', videoId, receiverId, {
      gift_id: giftId,
      coins: gift.coins,
    });

    return true;
  } catch (error) {
    console.error('Send gift error:', error);
    throw error;
  }
}

/**
 * Get last gift sender for a video
 */
export async function getLastGiftSender(videoId: string) {
  try {
    const { data, error } = await supabase
      .from('gift_transactions')
      .select(`
        sender_id,
        gift_id,
        coins,
        created_at,
        sender:profiles!sender_id(id, username, avatar_url)
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Silently return null if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205') {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    // Only log non-schema errors
    const err = error as any;
    if (err?.code !== 'PGRST205') {
      console.error('Get last gift sender error:', error);
    }
    return null;
  }
}

/**
 * Get gift history for a video
 */
export async function getVideoGiftHistory(videoId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('gift_transactions')
      .select(`
        *,
        sender:profiles!sender_id(id, username, avatar_url)
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Silently return empty array if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    // Only log non-schema errors
    const err = error as any;
    if (err?.code !== 'PGRST205') {
      console.error('Get gift history error:', error);
    }
    return [];
  }
}

/**
 * Get total gifts received for a video
 */
export async function getVideoGiftCount(videoId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('gift_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Get gift count error:', error);
    return 0;
  }
}

/**
 * Purchase coins (in-app purchase integration point)
 */
export async function purchaseCoins(
  userId: string,
  amount: number,
  transactionId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('add_user_coins', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_id: transactionId,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Purchase coins error:', error);
    throw error;
  }
}
