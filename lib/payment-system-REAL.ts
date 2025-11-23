/**
 * ============================================================================
 * REAL PAYMENT SYSTEM (Stripe Integration)
 * ============================================================================
 * 
 * Features:
 * - Coin Purchases (Stripe)
 * - Gift Sending (mit Revenue Share)
 * - Creator Cash-Out
 * - Transaction History
 * 
 * Setup:
 * 1. npm install stripe
 * 2. .env: STRIPE_SECRET_KEY=sk_test_...
 * 3. Stripe Dashboard: Webhooks konfigurieren
 */

import Stripe from 'stripe';
import { supabase } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// ============================================================================
// TYPES
// ============================================================================

export interface CoinPackage {
  id: string;
  coins: number;
  price: number; // in cents (USD)
  bonus: number; // extra coins
  popular?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  coins: number;
  revenue_share: number; // 0-1 (70% = 0.7)
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserCoins {
  user_id: string;
  coins: number;
  total_spent: number;
  total_earned: number;
}

export interface CreatorEarnings {
  user_id: string;
  coins: number;
  usd_equivalent: number;
  pending_payout: number;
  total_paid_out: number;
}

// ============================================================================
// COIN PACKAGES
// ============================================================================

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'small',
    coins: 100,
    price: 99, // $0.99
    bonus: 0,
  },
  {
    id: 'medium',
    coins: 500,
    price: 499, // $4.99
    bonus: 50, // 10% bonus
    popular: true,
  },
  {
    id: 'large',
    coins: 1000,
    price: 899, // $8.99
    bonus: 200, // 20% bonus
  },
  {
    id: 'mega',
    coins: 5000,
    price: 3999, // $39.99
    bonus: 1500, // 30% bonus
  },
];

// ============================================================================
// GIFTS
// ============================================================================

export const GIFTS: Gift[] = [
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    coins: 1,
    revenue_share: 0.5,
    rarity: 'common',
  },
  {
    id: 'heart',
    name: 'Herz',
    emoji: '❤️',
    coins: 5,
    revenue_share: 0.6,
    rarity: 'common',
  },
  {
    id: 'fire',
    name: 'Feuer',
    emoji: '🔥',
    coins: 10,
    revenue_share: 0.65,
    rarity: 'rare',
  },
  {
    id: 'diamond',
    name: 'Diamant',
    emoji: '💎',
    coins: 100,
    revenue_share: 0.7,
    rarity: 'epic',
  },
  {
    id: 'crown',
    name: 'Krone',
    emoji: '👑',
    coins: 500,
    revenue_share: 0.75,
    rarity: 'legendary',
  },
];

// ============================================================================
// PAYMENT SYSTEM
// ============================================================================

export class PaymentSystem {
  
  /**
   * Kaufe Coins mit Stripe
   * 
   * @returns Payment Intent Client Secret (für Frontend)
   */
  async purchaseCoins(
    userId: string,
    packageId: string,
    metadata?: Record<string, string>
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    
    const pkg = COIN_PACKAGES.find(p => p.id === packageId);
    
    if (!pkg) {
      throw new Error('Invalid package ID');
    }
    
    // Erstelle Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      metadata: {
        user_id: userId,
        package_id: packageId,
        coins: pkg.coins + pkg.bonus,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Speichere Transaction in DB (Status: pending)
    await supabase.from('coin_transactions').insert({
      user_id: userId,
      payment_intent_id: paymentIntent.id,
      package_id: packageId,
      coins: pkg.coins + pkg.bonus,
      amount_usd: pkg.price / 100,
      status: 'pending',
    });
    
    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }
  
  /**
   * Webhook: Payment erfolgreich
   * 
   * Wird von Stripe aufgerufen wenn Payment erfolgreich
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    
    // Hole Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return;
    }
    
    const userId = paymentIntent.metadata.user_id;
    const coins = parseInt(paymentIntent.metadata.coins);
    
    // Update User Coins
    await supabase.rpc('add_user_coins', {
      p_user_id: userId,
      p_coins: coins,
    });
    
    // Update Transaction Status
    await supabase
      .from('coin_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntentId);
    
    console.log(`✅ User ${userId} purchased ${coins} coins`);
  }
  
  /**
   * Hole User Coins
   */
  async getUserCoins(userId: string): Promise<UserCoins> {
    
    const { data, error } = await supabase
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      // Create initial record
      await supabase.from('user_coins').insert({
        user_id: userId,
        coins: 0,
        total_spent: 0,
        total_earned: 0,
      });
      
      return {
        user_id: userId,
        coins: 0,
        total_spent: 0,
        total_earned: 0,
      };
    }
    
    return data;
  }
  
  /**
   * Sende Gift an Creator
   */
  async sendGift(
    fromUserId: string,
    toUserId: string,
    videoId: string,
    giftId: string
  ): Promise<{ success: boolean; error?: string }> {
    
    const gift = GIFTS.find(g => g.id === giftId);
    
    if (!gift) {
      return { success: false, error: 'Invalid gift' };
    }
    
    // 1. Prüfe ob User genug Coins hat
    const userCoins = await this.getUserCoins(fromUserId);
    
    if (userCoins.coins < gift.coins) {
      return { success: false, error: 'Not enough coins' };
    }
    
    // 2. Ziehe Coins ab (Sender)
    const { error: deductError } = await supabase.rpc('deduct_user_coins', {
      p_user_id: fromUserId,
      p_coins: gift.coins,
    });
    
    if (deductError) {
      return { success: false, error: 'Failed to deduct coins' };
    }
    
    // 3. Creator bekommt Revenue Share
    const creatorCoins = Math.floor(gift.coins * gift.revenue_share);
    
    await supabase.rpc('add_creator_earnings', {
      p_user_id: toUserId,
      p_coins: creatorCoins,
    });
    
    // 4. Speichere Gift-Transaktion
    await supabase.from('gifts_sent').insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      video_id: videoId,
      gift_id: giftId,
      coins_spent: gift.coins,
      creator_earnings: creatorCoins,
      created_at: new Date().toISOString(),
    });
    
    // 5. Notification an Creator (optional)
    await this.sendGiftNotification(toUserId, fromUserId, gift);
    
    return { success: true };
  }
  
  /**
   * Creator Cash-Out (Coins → USD → Bank Account)
   * 
   * Conversion: 1 Coin = $0.01
   * Minimum: $10 (1000 Coins)
   */
  async requestCashOut(
    userId: string,
    coins: number
  ): Promise<{ success: boolean; error?: string }> {
    
    // Minimum: 1000 Coins = $10
    if (coins < 1000) {
      return { success: false, error: 'Minimum cash-out: 1000 coins ($10)' };
    }
    
    // Hole Creator Earnings
    const { data: earnings } = await supabase
      .from('creator_earnings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!earnings || earnings.coins < coins) {
      return { success: false, error: 'Not enough earnings' };
    }
    
    // Berechne USD-Betrag
    const usdAmount = coins * 0.01;
    
    // Hole Stripe Connect Account (Creator muss einen haben)
    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('stripe_account_id')
      .eq('user_id', userId)
      .single();
    
    if (!creator?.stripe_account_id) {
      return { 
        success: false, 
        error: 'Please connect your Stripe account first',
      };
    }
    
    // Stripe Transfer
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.floor(usdAmount * 100), // in cents
        currency: 'usd',
        destination: creator.stripe_account_id,
        metadata: {
          user_id: userId,
          coins,
        },
      });
      
      // Update Creator Earnings
      await supabase.rpc('process_cash_out', {
        p_user_id: userId,
        p_coins: coins,
        p_usd_amount: usdAmount,
      });
      
      // Speichere Payout-Record
      await supabase.from('payouts').insert({
        user_id: userId,
        coins,
        usd_amount: usdAmount,
        stripe_transfer_id: transfer.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Cash-out error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Erstelle Stripe Connect Account für Creator
   */
  async createCreatorAccount(userId: string): Promise<{ accountLink: string }> {
    
    // Prüfe ob Account schon existiert
    const { data: existing } = await supabase
      .from('creator_profiles')
      .select('stripe_account_id')
      .eq('user_id', userId)
      .single();
    
    if (existing?.stripe_account_id) {
      // Account existiert, erstelle neuen Link
      const accountLink = await stripe.accountLinks.create({
        account: existing.stripe_account_id,
        refresh_url: 'https://anpip.com/settings/creator',
        return_url: 'https://anpip.com/settings/creator?success=true',
        type: 'account_onboarding',
      });
      
      return { accountLink: accountLink.url };
    }
    
    // Erstelle neuen Stripe Connect Account
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        user_id: userId,
      },
    });
    
    // Speichere in DB
    await supabase.from('creator_profiles').upsert({
      user_id: userId,
      stripe_account_id: account.id,
    });
    
    // Erstelle Onboarding-Link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://anpip.com/settings/creator',
      return_url: 'https://anpip.com/settings/creator?success=true',
      type: 'account_onboarding',
    });
    
    return { accountLink: accountLink.url };
  }
  
  /**
   * Hole Creator Earnings
   */
  async getCreatorEarnings(userId: string): Promise<CreatorEarnings> {
    
    const { data, error } = await supabase
      .from('creator_earnings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return {
        user_id: userId,
        coins: 0,
        usd_equivalent: 0,
        pending_payout: 0,
        total_paid_out: 0,
      };
    }
    
    return {
      ...data,
      usd_equivalent: data.coins * 0.01,
    };
  }
  
  /**
   * Send Gift Notification
   */
  private async sendGiftNotification(
    toUserId: string,
    fromUserId: string,
    gift: Gift
  ): Promise<void> {
    
    // Hole Sender Info
    const { data: sender } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', fromUserId)
      .single();
    
    // Create Notification
    await supabase.from('notifications').insert({
      user_id: toUserId,
      type: 'gift',
      title: `${sender?.username || 'Someone'} sent you a gift!`,
      message: `You received ${gift.emoji} ${gift.name}`,
      data: {
        from_user_id: fromUserId,
        gift_id: gift.id,
        coins: Math.floor(gift.coins * gift.revenue_share),
      },
    });
  }
}

// ============================================================================
// DATABASE FUNCTIONS (erstelle diese in Supabase)
// ============================================================================

/**
 * SQL Functions:
 * 
 * -- Add coins to user
 * CREATE OR REPLACE FUNCTION add_user_coins(p_user_id UUID, p_coins INTEGER)
 * RETURNS void AS $$
 * BEGIN
 *   INSERT INTO user_coins (user_id, coins)
 *   VALUES (p_user_id, p_coins)
 *   ON CONFLICT (user_id)
 *   DO UPDATE SET coins = user_coins.coins + p_coins;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * -- Deduct coins from user
 * CREATE OR REPLACE FUNCTION deduct_user_coins(p_user_id UUID, p_coins INTEGER)
 * RETURNS void AS $$
 * BEGIN
 *   UPDATE user_coins
 *   SET coins = coins - p_coins,
 *       total_spent = total_spent + p_coins
 *   WHERE user_id = p_user_id AND coins >= p_coins;
 *   
 *   IF NOT FOUND THEN
 *     RAISE EXCEPTION 'Not enough coins';
 *   END IF;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * -- Add creator earnings
 * CREATE OR REPLACE FUNCTION add_creator_earnings(p_user_id UUID, p_coins INTEGER)
 * RETURNS void AS $$
 * BEGIN
 *   INSERT INTO creator_earnings (user_id, coins)
 *   VALUES (p_user_id, p_coins)
 *   ON CONFLICT (user_id)
 *   DO UPDATE SET coins = creator_earnings.coins + p_coins;
 * END;
 * $$ LANGUAGE plpgsql;
 */

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const paymentSystem = new PaymentSystem();
