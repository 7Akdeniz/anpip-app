/**
 * ============================================================================
 * IN-APP PURCHASES ENGINE (Coins/Gifts)
 * ============================================================================
 * 
 * Monetarisierung wie TikTok: User kaufen Coins → senden Gifts an Creator
 * 
 * Tech Stack:
 * - Expo In-App Purchases
 * - Stripe (Web)
 * - Google Play Billing (Android)
 * - App Store Connect (iOS)
 * 
 * Flow:
 * 1. User kauft Coins (100, 500, 1000, 5000)
 * 2. User sendet Gift an Creator (kostet Coins)
 * 3. Creator sieht Gifts + kann auszahlen
 * 4. 70% für Creator, 30% für Platform
 */

import { Platform } from 'react-native';
import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface CoinPackage {
  id: string;
  coins: number;
  price: number; // in EUR
  currency: string;
  bonus?: number; // Extra Coins
  popular?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  coins: number;
  animationUrl?: string;
}

export interface PurchaseResult {
  success: boolean;
  coins?: number;
  transactionId?: string;
  error?: string;
}

// ============================================================================
// COIN PACKAGES
// ============================================================================

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'coins_100',
    coins: 100,
    price: 0.99,
    currency: 'EUR',
  },
  {
    id: 'coins_500',
    coins: 500,
    price: 4.99,
    currency: 'EUR',
    bonus: 50, // +50 Coins gratis
    popular: true,
  },
  {
    id: 'coins_1000',
    coins: 1000,
    price: 9.99,
    currency: 'EUR',
    bonus: 150, // +150 Coins gratis
  },
  {
    id: 'coins_5000',
    coins: 5000,
    price: 49.99,
    currency: 'EUR',
    bonus: 1000, // +1000 Coins gratis
  },
];

// ============================================================================
// GIFTS
// ============================================================================

export const GIFTS: Gift[] = [
  { id: 'rose', name: 'Rose', icon: '🌹', coins: 1 },
  { id: 'heart', name: 'Herz', icon: '❤️', coins: 5 },
  { id: 'star', name: 'Stern', icon: '⭐', coins: 10 },
  { id: 'diamond', name: 'Diamant', icon: '💎', coins: 50 },
  { id: 'crown', name: 'Krone', icon: '👑', coins: 100 },
  { id: 'rocket', name: 'Rakete', icon: '🚀', coins: 500 },
  { id: 'castle', name: 'Schloss', icon: '🏰', coins: 1000 },
  { id: 'planet', name: 'Planet', icon: '🪐', coins: 5000 },
];

// ============================================================================
// BUY COINS (Simplified - Web Payment erstmal)
// ============================================================================

/**
 * Kauft Coins (Simplified Version mit Stripe Checkout)
 */
export async function buyCoins(
  userId: string,
  packageId: string
): Promise<PurchaseResult> {
  try {
    const pkg = COIN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    // SIMPLIFIED: Direct DB Update (für Testing)
    // TODO: Später echte Payment-Integration
    
    const totalCoins = pkg.coins + (pkg.bonus || 0);

    // 1. Hole aktuellen Coin-Stand
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    const currentCoins = user?.coins || 0;

    // 2. Update Coins
    const { error } = await supabase
      .from('users')
      .update({ 
        coins: currentCoins + totalCoins 
      })
      .eq('id', userId);

    if (error) throw error;

    // 3. Speichere Transaction
    await supabase.from('coin_transactions').insert({
      user_id: userId,
      type: 'purchase',
      coins: totalCoins,
      amount: pkg.price,
      currency: pkg.currency,
      package_id: packageId,
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    console.log(`✅ User ${userId} bought ${totalCoins} coins for €${pkg.price}`);

    return {
      success: true,
      coins: totalCoins,
      transactionId: `tx_${Date.now()}`,
    };

  } catch (error) {
    console.error('Failed to buy coins:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Purchase failed',
    };
  }
}

// ============================================================================
// ECHTE PAYMENT INTEGRATION (TODO)
// ============================================================================

/**
 * TODO: Stripe Checkout für Web
 */
async function createStripeCheckout(packageId: string, userId: string) {
  // Erstelle Checkout Session
  const response = await fetch('/api/payments/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId, userId }),
  });

  const { url } = await response.json();
  
  // Öffne Stripe Checkout
  if (Platform.OS === 'web') {
    window.location.href = url;
  }
}

/**
 * TODO: Expo In-App Purchases für Native
 */
async function buyCoinsNative(packageId: string) {
  // import * as InAppPurchases from 'expo-in-app-purchases';
  
  // await InAppPurchases.connectAsync();
  // const products = await InAppPurchases.getProductsAsync([packageId]);
  // await InAppPurchases.purchaseItemAsync(packageId);
}

// ============================================================================
// SEND GIFT
// ============================================================================

/**
 * Sendet Gift von User zu Creator
 */
export async function sendGift(
  fromUserId: string,
  toUserId: string,
  videoId: string,
  giftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const gift = GIFTS.find(g => g.id === giftId);
    if (!gift) {
      return { success: false, error: 'Gift not found' };
    }

    // 1. Check ob User genug Coins hat
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', fromUserId)
      .single();

    const currentCoins = user?.coins || 0;

    if (currentCoins < gift.coins) {
      return { 
        success: false, 
        error: `Not enough coins. You have ${currentCoins}, need ${gift.coins}` 
      };
    }

    // 2. Reduziere Coins beim Sender
    await supabase
      .from('users')
      .update({ coins: currentCoins - gift.coins })
      .eq('id', fromUserId);

    // 3. Speichere Gift
    await supabase.from('gifts').insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      video_id: videoId,
      gift_id: giftId,
      coins: gift.coins,
      created_at: new Date().toISOString(),
    });

    // 4. Update Creator-Earnings (70% vom Coin-Wert)
    const creatorEarnings = Math.floor(gift.coins * 0.7);
    
    const { data: creator } = await supabase
      .from('users')
      .select('total_earnings, pending_earnings')
      .eq('id', toUserId)
      .single();

    await supabase
      .from('users')
      .update({
        total_earnings: (creator?.total_earnings || 0) + creatorEarnings,
        pending_earnings: (creator?.pending_earnings || 0) + creatorEarnings,
      })
      .eq('id', toUserId);

    // 5. Transaction Log
    await supabase.from('coin_transactions').insert({
      user_id: fromUserId,
      type: 'gift_sent',
      coins: -gift.coins,
      gift_id: giftId,
      recipient_id: toUserId,
      video_id: videoId,
      status: 'completed',
    });

    await supabase.from('coin_transactions').insert({
      user_id: toUserId,
      type: 'gift_received',
      coins: creatorEarnings,
      gift_id: giftId,
      sender_id: fromUserId,
      video_id: videoId,
      status: 'completed',
    });

    console.log(`✅ Gift sent: ${gift.name} (${gift.coins} coins) from ${fromUserId} to ${toUserId}`);

    return { success: true };

  } catch (error) {
    console.error('Failed to send gift:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send gift',
    };
  }
}

// ============================================================================
// GET USER COINS
// ============================================================================

export async function getUserCoins(userId: string): Promise<number> {
  const { data } = await supabase
    .from('users')
    .select('coins')
    .eq('id', userId)
    .single();

  return data?.coins || 0;
}

// ============================================================================
// GET CREATOR EARNINGS
// ============================================================================

export async function getCreatorEarnings(userId: string): Promise<{
  totalEarnings: number;
  pendingEarnings: number;
  paidOut: number;
}> {
  const { data } = await supabase
    .from('users')
    .select('total_earnings, pending_earnings')
    .eq('id', userId)
    .single();

  return {
    totalEarnings: data?.total_earnings || 0,
    pendingEarnings: data?.pending_earnings || 0,
    paidOut: (data?.total_earnings || 0) - (data?.pending_earnings || 0),
  };
}

// ============================================================================
// WITHDRAW EARNINGS (Auszahlung)
// ============================================================================

export async function withdrawEarnings(
  userId: string,
  amount: number,
  method: 'bank' | 'paypal'
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check Minimum (z.B. min. 50€)
    if (amount < 50) {
      return { success: false, error: 'Minimum withdrawal is 50 coins (€50)' };
    }

    // 2. Check ob genug Earnings da sind
    const { data: user } = await supabase
      .from('users')
      .select('pending_earnings')
      .eq('id', userId)
      .single();

    if (!user || user.pending_earnings < amount) {
      return { success: false, error: 'Insufficient earnings' };
    }

    // 3. Erstelle Withdrawal Request
    await supabase.from('withdrawals').insert({
      user_id: userId,
      amount: amount,
      method: method,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // 4. Update Pending Earnings
    await supabase
      .from('users')
      .update({
        pending_earnings: user.pending_earnings - amount,
      })
      .eq('id', userId);

    console.log(`✅ Withdrawal request: ${amount} coins by ${userId} via ${method}`);

    return { success: true };

  } catch (error) {
    console.error('Withdrawal failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Withdrawal failed',
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const purchaseEngine = {
  buyCoins,
  sendGift,
  getUserCoins,
  getCreatorEarnings,
  withdrawEarnings,
  COIN_PACKAGES,
  GIFTS,
};
