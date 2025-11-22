# 🎬 Anpip.com - Social Media Kurzvideo-Plattform

Eine moderne TikTok-ähnliche App im Google Material Design Stil mit React Native, Expo und Supabase.

## 📱 Features

- ✨ **Cross-Platform**: iOS, Android & Web aus einem Code
- 🎨 **Google Material Design**: Sauberes, modernes UI mit lila (#9C27B0) als Hauptfarbe
- 🌍 **50 Sprachen**: Vollständiger Sprach-Switcher
- 🎥 **Video-Feed**: Vertikales Vollbild-Format (9:16)
- 🔍 **Explore**: Suche, Trends, Hashtags
- 👤 **Profile**: User-Profile mit Stats
- 📤 **Upload**: Video-Upload mit Titel, Beschreibung, Hashtags
- 🔔 **Benachrichtigungen**: Likes, Kommentare, Follower
- 🗄️ **Supabase Backend**: PostgreSQL-Datenbank, Auth, Storage

## 🚀 Schnellstart

### 1. Installation

```bash
# Dependencies installieren
npm install
```

### 2. Supabase einrichten (siehe unten für Details)

```bash
# .env Datei erstellen
cp .env.example .env

# Fülle die Supabase-Daten ein:
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. App starten

```bash
# Web
npm run web

# iOS Simulator (benötigt Xcode)
npm run ios

# Android Emulator (benötigt Android Studio)
npm run android

# Alle Plattformen
npm start
```

## 📂 Projektstruktur

```
Anpip.com/
├── app/                    # Screens (expo-router)
│   ├── (tabs)/            # Tab-Navigation
│   │   ├── feed.tsx       # Hauptseite / For You
│   │   ├── explore.tsx    # Entdecken & Suche
│   │   ├── upload.tsx     # Video hochladen
│   │   ├── notifications.tsx  # Benachrichtigungen
│   │   └── profile.tsx    # Profil
│   └── _layout.tsx        # Root Layout
├── components/            # UI-Komponenten
│   ├── ui/               # Basis-Komponenten
│   │   ├── PrimaryButton.tsx
│   │   ├── IconButton.tsx
│   │   ├── Card.tsx
│   │   └── Typography.tsx
│   └── LanguageSwitcher.tsx  # Sprach-Switcher
├── constants/            # Theme & Konstanten
│   └── Theme.ts          # Farben, Fonts, Spacing
├── i18n/                 # Internationalisierung
│   ├── languages.ts      # 50 Sprachen
│   ├── translations/     # Übersetzungen
│   └── I18nContext.tsx   # Sprach-Provider
├── lib/                  # Services & Utilities
│   └── supabase.ts       # Supabase Client
├── assets/               # Bilder, Icons, Fonts
├── .env.example          # Beispiel-Umgebungsvariablen
├── app.json              # Expo-Konfiguration
└── package.json          # Dependencies
```

## 🎨 Design-System

### Farben

```typescript
Primary: #9C27B0 (Lila)
Primary Light: #E1BEE7
Primary Dark: #6A0080

Background: #FFFFFF
Surface: #FAFAFA

Text: #212121
Text Secondary: #757575
```

### Komponenten

Alle UI-Komponenten findest du in `components/ui/`:

```tsx
import { PrimaryButton, IconButton, Card, Typography } from '@/components/ui';

<PrimaryButton title="Klick mich" onPress={() => {}} />
<Card><Typography>Hallo Welt</Typography></Card>
```

## 🗄️ Supabase Setup (WICHTIG!)

### Schritt 1: Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke auf "Start your project"
3. Melde dich mit GitHub an
4. Klicke auf "New Project"
5. Wähle:
   - **Name**: Anpip
   - **Database Password**: Ein sicheres Passwort (speichere es!)
   - **Region**: Europa (Frankfurt) oder deine bevorzugte Region
6. Klicke "Create new project" (dauert ~2 Minuten)

### Schritt 2: API-Keys holen

1. In deinem Supabase-Projekt, klicke links auf **Settings** (⚙️)
2. Klicke auf **API**
3. Kopiere:
   - **Project URL** (z.B. `https://abcdefgh.supabase.co`)
   - **anon public** Key (die lange Zeichenkette unter "Project API keys")

### Schritt 3: .env Datei erstellen

```bash
# In VS Code oder Terminal:
cp .env.example .env
```

Öffne die `.env` Datei und füge deine Werte ein:

```env
EXPO_PUBLIC_SUPABASE_URL=https://deine-projekt-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-sehr-langer-anon-key-hier
```

### Schritt 4: Datenbank-Schema erstellen

1. In Supabase, klicke links auf **SQL Editor**
2. Klicke auf **New query**
3. Kopiere das folgende SQL und führe es aus:

```sql
-- USER PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIDEOS
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  visibility TEXT DEFAULT 'public', -- 'public', 'friends', 'private'
  language TEXT DEFAULT 'de',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIKES
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- COMMENTS
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FOLLOWS
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- MESSAGES
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention'
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES (für Performance)
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_likes_video_id ON likes(video_id);
CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ROW LEVEL SECURITY (RLS) aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES (Zugriffsrechte)

-- Profiles: Jeder kann lesen, nur eigenes bearbeiten
CREATE POLICY "Profiles sind öffentlich lesbar" ON profiles FOR SELECT USING (true);
CREATE POLICY "User kann eigenes Profil updaten" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User kann eigenes Profil erstellen" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Videos: Öffentliche sind für alle, Private nur für Owner
CREATE POLICY "Öffentliche Videos sind lesbar" ON videos FOR SELECT USING (
  visibility = 'public' OR user_id = auth.uid()
);
CREATE POLICY "User kann eigene Videos erstellen" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User kann eigene Videos updaten" ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User kann eigene Videos löschen" ON videos FOR DELETE USING (auth.uid() = user_id);

-- Likes: Jeder kann lesen und erstellen
CREATE POLICY "Likes sind lesbar" ON likes FOR SELECT USING (true);
CREATE POLICY "User kann liken" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User kann eigene Likes löschen" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Jeder kann lesen und erstellen
CREATE POLICY "Comments sind lesbar" ON comments FOR SELECT USING (true);
CREATE POLICY "User kann kommentieren" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User kann eigene Comments löschen" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Follows: Jeder kann lesen und erstellen
CREATE POLICY "Follows sind lesbar" ON follows FOR SELECT USING (true);
CREATE POLICY "User kann folgen" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "User kann unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Messages: Nur zwischen Sender und Empfänger
CREATE POLICY "User kann eigene Messages lesen" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "User kann Messages senden" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Nur für den User
CREATE POLICY "User kann eigene Notifications lesen" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System kann Notifications erstellen" ON notifications FOR INSERT WITH CHECK (true);
```

4. Klicke **Run** (oder drücke Cmd+Enter)

### Schritt 5: Storage für Videos einrichten

1. Klicke links auf **Storage**
2. Klicke **New bucket**
3. Name: `videos`
4. Public bucket: **Ja** (Häkchen setzen)
5. Klicke **Create bucket**

Wiederhole für:
- Bucket: `thumbnails` (public)
- Bucket: `avatars` (public)

## 📱 GitHub Repository

### Git initialisieren (falls noch nicht geschehen)

```bash
# Git-Konfiguration (einmalig)
git config --global user.name "Dein Name"
git config --global user.email "deine@email.com"

# Repository initialisieren
git init
git add .
git commit -m "Initial commit: Anpip.com setup"
```

### GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com)
2. Klicke auf **+** → **New repository**
3. Name: `anpip-app`
4. **NICHT** "Initialize with README" ankreuzen
5. Klicke **Create repository**

### Mit GitHub verbinden

```bash
# Remote hinzufügen (ersetze USERNAME mit deinem GitHub-Namen)
git remote add origin https://github.com/USERNAME/anpip-app.git

# Pushen
git branch -M main
git push -u origin main
```

## 🌍 Sprachen

Die App unterstützt 50 Sprachen! Der Sprach-Switcher erscheint als Floating-Button unten rechts.

Neue Übersetzungen hinzufügen:
1. Erstelle `i18n/translations/SPRACHCODE.ts` (z.B. `es.ts` für Spanisch)
2. Kopiere die Struktur von `de.ts`
3. Importiere in `i18n/I18nContext.tsx`

## 🔧 Nützliche Befehle

```bash
# Development
npm start              # Expo Dev Server starten
npm run web           # Web-Version
npm run ios           # iOS Simulator
npm run android       # Android Emulator

# Code-Qualität
npm run lint          # TypeScript-Fehler prüfen

# Build (später für Production)
npm run build         # Production Build
```

## 📖 Dokumentation

### Komponenten verwenden

```tsx
import { PrimaryButton, Card, Typography } from '@/components/ui';

<PrimaryButton 
  title="Klick mich" 
  onPress={() => console.log('Geklickt!')}
  variant="filled"  // oder 'outlined'
  size="large"      // 'small', 'medium', 'large'
  fullWidth
/>
```

### Farben aus Theme

```tsx
import { Colors } from '@/constants/Theme';

<View style={{ backgroundColor: Colors.primary }} />
```

### Übersetzungen nutzen

```tsx
import { useI18n } from '@/i18n/I18nContext';

function MyScreen() {
  const { t } = useI18n();
  
  return <Text>{t.forYou}</Text>;
}
```

### Supabase verwenden

```tsx
import { supabase, auth } from '@/lib/supabase';

// Login
const { data, error } = await auth.signIn('email@example.com', 'password');

// Videos holen
const { data: videos } = await supabase
  .from('videos')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

## ❓ Häufige Probleme

### "Supabase nicht konfiguriert"
→ Hast du die `.env` Datei erstellt und ausgefüllt?

### App lädt nicht im Browser
→ Prüfe, ob Port 8081 frei ist. Stoppe die App (Ctrl+C) und starte neu.

### Fehler beim Git-Push
→ Stelle sicher, dass du auf GitHub eingeloggt bist und das Repository erstellt hast.

## 📞 Support

Bei Fragen oder Problemen:
1. Schau in die Dokumentation
2. Prüfe die Konsole auf Fehlermeldungen
3. Frag mich (deinen Mentor) 😊

## 📄 Lizenz

Privates Projekt - Alle Rechte vorbehalten.

---

**Viel Erfolg mit Anpip! 🚀**
# Force Vercel rebuild - Sat Nov 22 14:39:26 CET 2025
