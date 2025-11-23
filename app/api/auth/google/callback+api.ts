/**
 * 🔐 GOOGLE OAUTH CALLBACK API
 * 
 * Empfängt den Authorization Code von Google
 * Tauscht ihn gegen Access Token und User-Info aus
 */

import { supabase } from '@/lib/supabase';

// Environment Variables - verwende EXPO_PUBLIC_ für Client-Side
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_URI = process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token';
const APP_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8081';

// Redirect URI berechnen
const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/google/callback`;
  }
  return `${APP_URL}/auth/google/callback`;
};

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function POST(request: Request) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 1. AUTHORIZATION CODE GEGEN TOKEN TAUSCHEN
    // =====================================================

    console.log('🔄 Tausche Authorization Code gegen Token...');
    
    const redirectUri = getRedirectUri();
    console.log('   Redirect URI:', redirectUri);

    const tokenResponse = await fetch(GOOGLE_TOKEN_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('❌ Token exchange failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange authorization code',
          details: error,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();
    console.log('✅ Token erfolgreich erhalten');

    // =====================================================
    // 2. USER-INFO VON GOOGLE ABRUFEN
    // =====================================================

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error('❌ Failed to fetch user info');
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user information' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    console.log('✅ User-Info erhalten:', googleUser.email);

    // =====================================================
    // 3. VALIDIERUNG
    // =====================================================

    if (!googleUser.verified_email) {
      console.error('❌ Email not verified');
      return new Response(
        JSON.stringify({ error: 'Email not verified by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!googleUser.email) {
      console.error('❌ No email provided');
      return new Response(
        JSON.stringify({ error: 'No email provided by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 4. SUPABASE SESSION ERSTELLEN
    // =====================================================
    // Supabase Auth handhabt automatisch die User-Erstellung
    
    console.log('🔐 Erstelle Supabase Session...');

    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    });

    if (authError || !authData.session) {
      console.error('❌ Session creation failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create session',
          details: authError,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update User Metadata nach erfolgreicher Session-Erstellung
    if (authData.user) {
      await supabase.auth.updateUser({
        data: {
          full_name: googleUser.name,
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          avatar_url: googleUser.picture,
          display_name: googleUser.name,
        },
      });
    }

    console.log('✅ Session erfolgreich erstellt');

    // =====================================================
    // 5. ERFOLGREICHE ANTWORT
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        },
        session: authData.session,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Google Callback Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const username = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const random = Math.floor(Math.random() * 9999);
  return `${username}${random}`;
}
