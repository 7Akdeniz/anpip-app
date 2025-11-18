/**
 * SUPABASE CLIENT - Verbindung zur Datenbank
 * 
 * WICHTIG: Vor dem ersten Start musst du die .env Datei ausfüllen!
 */

import { createClient } from '@supabase/supabase-js';

// Prüfe, ob die Umgebungsvariablen gesetzt sind
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ SUPABASE NICHT KONFIGURIERT!\n' +
    'Erstelle eine .env Datei mit:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=...\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=...'
  );
}

// Erstelle den Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Auth Helper-Funktionen
export const auth = {
  // Registrierung mit Email & Passwort
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Login mit Email & Passwort
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Aktuellen User holen
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Session abrufen
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};
