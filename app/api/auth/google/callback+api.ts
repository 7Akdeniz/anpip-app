/**
 * 🔐 GOOGLE OAUTH CALLBACK API
 * 
 * Empfängt den Authorization Code von Google
 * Tauscht ihn gegen Access Token und User-Info aus
 */

import { supabase } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_URI = process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = process.env.EXPO_PUBLIC_APP_URL 
  ? `${process.env.EXPO_PUBLIC_APP_URL}/auth/google/callback`
  : 'http://localhost:3000/auth/google/callback';

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

    const tokenResponse = await fetch(GOOGLE_TOKEN_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('❌ Token exchange failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange authorization code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

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

    // =====================================================
    // 3. VALIDIERUNG
    // =====================================================

    if (!googleUser.verified_email) {
      return new Response(
        JSON.stringify({ error: 'Email not verified by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!googleUser.email) {
      return new Response(
        JSON.stringify({ error: 'No email provided by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 4. USER IN DATENBANK SUCHEN ODER ERSTELLEN
    // =====================================================

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, google_id')
      .eq('email', googleUser.email)
      .single();

    let userId: string;

    if (existingUser) {
      // User existiert bereits
      userId = existingUser.id;

      // Google-ID speichern falls noch nicht vorhanden
      if (!existingUser.google_id) {
        await supabase
          .from('users')
          .update({ 
            google_id: googleUser.id,
            avatar_url: googleUser.picture,
          })
          .eq('id', userId);
      }
    } else {
      // Neuen User erstellen (Auto-Registrierung)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: googleUser.email,
          username: generateUsernameFromEmail(googleUser.email),
          display_name: googleUser.name,
          avatar_url: googleUser.picture,
          google_id: googleUser.id,
          email_verified: true,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        console.error('❌ Failed to create user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.id;
    }

    // =====================================================
    // 5. SUPABASE SESSION ERSTELLEN
    // =====================================================

    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    });

    if (authError || !authData.session) {
      console.error('❌ Session creation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 6. ERFOLGREICHE ANTWORT
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
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
