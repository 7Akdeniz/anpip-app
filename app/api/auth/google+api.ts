/**
 * 🔐 GOOGLE OAUTH BACKEND API
 * 
 * Verarbeitet Google ID-Token und erstellt/loggt User ein
 * WICHTIG: Läuft NUR auf dem Server (client_secret darf NIEMALS ins Frontend)
 */

import { supabase } from '@/lib/supabase';

// Google OAuth Konfiguration (aus .env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_URI = process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token';

interface GoogleTokenPayload {
  sub: string;           // Google User ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;       // Avatar URL
  given_name?: string;   // Vorname
  family_name?: string;  // Nachname
}

export async function POST(request: Request) {
  try {
    const { idToken, returnUrl } = await request.json();

    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'Missing ID token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 1. ID-TOKEN BEI GOOGLE VALIDIEREN
    // =====================================================
    
    const payload = await verifyGoogleToken(idToken);
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.email_verified) {
      return new Response(
        JSON.stringify({ error: 'Email not verified by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.email) {
      return new Response(
        JSON.stringify({ error: 'No email provided by Google' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 2. USER IN DATENBANK SUCHEN ODER ERSTELLEN
    // =====================================================

    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, email, google_id')
      .eq('email', payload.email)
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
            google_id: payload.sub,
            avatar_url: payload.picture,
          })
          .eq('id', userId);
      }
    } else {
      // Neuen User erstellen (Auto-Registrierung)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: payload.email,
          username: generateUsernameFromEmail(payload.email),
          display_name: payload.name,
          avatar_url: payload.picture,
          google_id: payload.sub,
          email_verified: true, // Google hat schon verifiziert
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
    // 3. SUPABASE SESSION ERSTELLEN
    // =====================================================

    // Verwende Supabase's eigenen Google-Provider für Session-Erstellung
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (authError || !authData.session) {
      console.error('❌ Session creation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // 4. ERFOLGREICHE ANTWORT
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: payload.email,
          name: payload.name,
          avatar: payload.picture,
        },
        session: authData.session,
        returnUrl: returnUrl || '/(tabs)',
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Google Auth Error:', error);
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

/**
 * Google ID-Token validieren
 * Verwendet Google's tokeninfo Endpoint
 */
async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    // Option 1: Google's tokeninfo endpoint (einfacher, aber macht zusätzlichen Request)
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      console.error('❌ Token verification failed:', response.status);
      return null;
    }

    const payload = await response.json() as GoogleTokenPayload;

    // Prüfe, ob Token für unsere App ausgestellt wurde
    if (payload.sub && GOOGLE_CLIENT_ID && !idToken.includes(GOOGLE_CLIENT_ID)) {
      // Zusätzliche Prüfung: Token muss für unsere Client-ID sein
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        const payloadPart = JSON.parse(atob(tokenParts[1]));
        if (payloadPart.aud !== GOOGLE_CLIENT_ID) {
          console.error('❌ Token audience mismatch');
          return null;
        }
      }
    }

    return payload;

  } catch (error) {
    console.error('❌ Token verification error:', error);
    return null;
  }
}

/**
 * Generiere Username aus Email
 * z.B. max.mustermann@gmail.com → max_mustermann
 */
function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const username = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Füge zufällige Zahl hinzu für Uniqueness
  const random = Math.floor(Math.random() * 9999);
  return `${username}${random}`;
}
