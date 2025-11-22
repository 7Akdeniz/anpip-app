# 🔐 Auth-Gating System für Anpip.com

## 📋 Übersicht

Das Auth-Gating System ermöglicht **freies Video-Viewing ohne Login**, während **alle sensiblen Aktionen eine Authentifizierung erfordern**. Das System bietet:

- ✅ **Freie Video-Ansicht** ohne Anmeldung
- ✅ **Automatisches Login-Modal** bei geschützten Aktionen
- ✅ **Return-to-Action** nach erfolgreichem Login
- ✅ **Freundliche UX-Messages** für jede Aktion
- ✅ **Social Logins** (Google, Apple, Facebook, Microsoft, LinkedIn)
- ✅ **Cross-Platform** (iOS, Android, Web)

---

## 🏗️ Architektur

### Core Components

```
hooks/
  └── useRequireAuth.ts          # Haupt-Hook für Auth-Checks

contexts/
  ├── AuthContext.tsx             # Auth-State Management
  └── AuthModalContext.tsx        # Modal-State Management

components/
  ├── modals/
  │   └── AuthModal.tsx           # Login/Register Modal
  └── auth/
      ├── LoginScreen.tsx         # Login-Formular
      └── RegisterScreen.tsx      # Registrierungs-Formular

app/
  ├── _layout.tsx                 # Root-Layout mit Providern
  └── (tabs)/
      ├── index.tsx               # Feed mit geschützten Aktionen
      ├── upload.tsx              # Geschützter Screen
      ├── messages.tsx            # Geschützter Screen
      ├── profile.tsx             # Geschützter Screen
      └── _layout.tsx             # Tab-Navigation mit Auth-Checks
```

---

## 🎯 Geschützte Aktionen

### Feed-Aktionen (require Login)

| Aktion | Beschreibung | UX-Message |
|--------|--------------|------------|
| **Like** | Video liken | "Melde dich an, um Videos zu liken" |
| **Comment** | Kommentieren | "Melde dich an, um zu kommentieren" |
| **Share** | Teilen | "Melde dich an, um Videos zu teilen" |
| **Save** | Speichern | "Melde dich an, um Videos zu speichern" |
| **Follow** | Creator folgen | "Melde dich an, um Creator:innen zu folgen" |
| **Gift** | Geschenk senden | "Melde dich an, um Geschenke zu senden" |

### Geschützte Screens

| Screen | Auth-Requirement | Redirect nach Login |
|--------|------------------|---------------------|
| **Upload** | ✅ Required | Zurück zu Upload |
| **Messages** | ✅ Required | Zurück zu Messages |
| **Profile** | ✅ Required | Zurück zu Profile |
| **Settings** | ✅ Required | Zurück zu Settings |
| **Feed** | ❌ Frei | - |

### Geschützte Tab-Navigation

| Tab | Nicht authentifiziert | Authentifiziert |
|-----|----------------------|-----------------|
| **Home** | ✅ Frei zugänglich | ✅ Voll nutzbar |
| **Upload** | ⚠️ Login-Modal | ✅ Upload erlaubt |
| **Messages** | ⚠️ Login-Modal | ✅ Chat erlaubt |
| **Profile** | ⚠️ Login-Modal | ✅ Profil sichtbar |

---

## 🔧 Implementation

### 1. useRequireAuth Hook

Der zentrale Hook für Auth-Checks:

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

function MyComponent() {
  const { requireAuth, checkAuth, isAuthenticated } = useRequireAuth();

  // Async Action mit Callback
  const handleLike = () => {
    requireAuth({
      actionName: 'like',
      onAuthSuccess: async () => {
        await likeVideo(videoId);
      },
      message: 'Melde dich an, um Videos zu liken', // Optional
    });
  };

  // Sync Check
  const handleNavigate = () => {
    if (checkAuth('upload')) {
      router.push('/upload');
    }
  };

  return <button onPress={handleLike}>Like</button>;
}
```

**API:**

```typescript
interface AuthActionConfig {
  actionName: string;           // Name für Tracking & Default-Message
  onAuthSuccess?: () => void;   // Callback nach erfolgreichem Login
  message?: string;             // Custom UX-Message (optional)
}

function useRequireAuth() {
  return {
    requireAuth: (config: AuthActionConfig) => boolean;
    checkAuth: (actionName: string, message?: string) => boolean;
    isAuthenticated: boolean;
    loading: boolean;
    user: User | null;
  };
}
```

### 2. Auth-Modal Integration

Das Modal wird automatisch geöffnet wenn `requireAuth()` fehlschlägt:

```typescript
// In app/_layout.tsx
<AuthProvider>
  <AuthModalProvider>
    {children}
    <AuthModal />  {/* Globales Modal */}
  </AuthModalProvider>
</AuthProvider>
```

### 3. Screen Protection

Screens schützen mit Auth-Check:

```typescript
export default function UploadScreen() {
  const { checkAuth, isAuthenticated } = useRequireAuth();
  
  useEffect(() => {
    checkAuth('upload'); // Öffnet Modal wenn nicht authentifiziert
  }, []);

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return <UploadScreenContent />;
}
```

### 4. Tab Navigation Protection

Tabs schützen in `_layout.tsx`:

```typescript
const { checkAuth } = useRequireAuth();

const handleTabPress = (routeName: string, event: any) => {
  if (routeName === 'upload') {
    event.preventDefault();
    if (checkAuth('upload')) {
      router.push('/upload');
    }
  }
};

<Tabs.Screen
  name="upload"
  listeners={{
    tabPress: handleTabPress,
  }}
/>
```

---

## 🎨 UX Flow

### Scenario 1: Freies Video-Viewing

```
1. User öffnet App
   └─> Feed wird angezeigt
       └─> Videos spielen ab
           └─> Kein Login erforderlich ✅
```

### Scenario 2: Like-Aktion (nicht authentifiziert)

```
1. User klickt auf Like-Button
   └─> requireAuth({ actionName: 'like', ... })
       └─> isAuthenticated === false
           └─> Auth-Modal öffnet sich
               ├─ Message: "Melde dich an, um Videos zu liken"
               ├─ Login-Tab (Email/Password + Social Logins)
               └─ Register-Tab (Email/Password + Social Logins)

2. User loggt sich ein (z.B. mit Google)
   └─> Auth-State wird aktualisiert
       └─> handleAuthSuccess() wird aufgerufen
           └─> onAuthSuccess() Callback wird ausgeführt
               └─> likeVideo() wird aufgerufen
                   └─> Modal schließt sich
                       └─> Like-Count erhöht sich ✅
```

### Scenario 3: Tab-Navigation zu Upload (nicht authentifiziert)

```
1. User klickt auf Upload-Tab
   └─> handleTabPress('upload', event)
       └─> checkAuth('upload')
           └─> isAuthenticated === false
               └─> Auth-Modal öffnet sich
                   └─ Message: "Melde dich an, um Videos hochzuladen"

2. User registriert sich
   └─> Auth-State wird aktualisiert
       └─> Modal schließt sich
           └─> Upload-Screen wird angezeigt ✅
```

---

## 📱 Platform Support

### Web
- ✅ Email/Password Login
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Microsoft OAuth
- ✅ LinkedIn OAuth

### iOS
- ✅ Email/Password Login
- ✅ Apple Sign In
- ✅ Google OAuth
- ✅ Facebook OAuth

### Android
- ✅ Email/Password Login
- ✅ Google OAuth
- ✅ Facebook OAuth

---

## 🧪 Testing

Tests in `__tests__/auth-gating.test.tsx`:

```bash
npm run test auth-gating
```

**Test-Coverage:**

- ✅ useRequireAuth Hook
- ✅ Feed-Aktionen (Like, Comment, Share, Save, Follow, Gift)
- ✅ Protected Screens (Upload, Messages, Profile)
- ✅ Return-to-Action nach Login
- ✅ UX Messages
- ✅ Social Login Integration
- ✅ Edge Cases

---

## 🔄 Return-to-Action Flow

Das System speichert die beabsichtigte Aktion und führt sie nach Login automatisch aus:

```typescript
// 1. User klickt auf Like ohne Login
requireAuth({
  actionName: 'like',
  onAuthSuccess: async () => {
    await likeVideo(videoId);  // ← Wird nach Login ausgeführt
  },
});

// 2. Auth-Modal öffnet sich
<AuthModal
  message="Melde dich an, um Videos zu liken"
  onSuccess={() => {
    // Like-Funktion wird automatisch aufgerufen
  }}
/>

// 3. User loggt sich ein
useEffect(() => {
  if (isAuthenticated && isVisible) {
    handleAuthSuccess();  // Führt onSuccess() aus
  }
}, [isAuthenticated]);
```

---

## 🎯 Best Practices

### 1. Konsistente Messages

Verwende die Default-Messages aus `getDefaultMessage()`:

```typescript
const messages = {
  like: 'Melde dich an, um Videos zu liken',
  comment: 'Melde dich an, um zu kommentieren',
  share: 'Melde dich an, um Videos zu teilen',
  // ...
};
```

### 2. Optimistic Updates

Like/Follow Actions sollten optimistic updates verwenden:

```typescript
const handleLike = () => {
  requireAuth({
    actionName: 'like',
    onAuthSuccess: async () => {
      // Optimistic Update
      setLikedVideos(prev => new Set(prev).add(videoId));
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, likes_count: v.likes_count + 1 }
          : v
      ));

      try {
        await likeVideo(userId, videoId);
      } catch (error) {
        // Revert on error
        setLikedVideos(prev => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
      }
    },
  });
};
```

### 3. Loading States

Zeige Loading-Indicator während Auth-Check:

```typescript
if (!isAuthenticated && loading) {
  return <LoadingScreen />;
}
```

### 4. Error Handling

Handle Auth-Errors gracefully:

```typescript
try {
  await signIn(email, password);
} catch (error) {
  Alert.alert('Anmeldung fehlgeschlagen', error.message);
}
```

---

## 🚀 Features

### ✅ Implementiert

- [x] useRequireAuth Hook
- [x] AuthModalContext
- [x] AuthModal Component
- [x] LoginScreen Component
- [x] RegisterScreen Component
- [x] Feed-Aktionen geschützt (Like, Comment, Share, Save, Follow, Gift)
- [x] Screens geschützt (Upload, Messages, Profile)
- [x] Tab-Navigation geschützt
- [x] Return-to-Action nach Login
- [x] Freundliche UX-Messages
- [x] Social Logins (Google, Apple, Facebook)
- [x] Cross-Platform Support
- [x] Tests

### 🔜 Geplant

- [ ] Remember Me / Stay Logged In
- [ ] Biometric Auth (Face ID, Touch ID)
- [ ] Session Persistence
- [ ] Magic Link Login
- [ ] 2FA (Two-Factor Authentication)

---

## 📚 Weitere Dokumentation

- [Auth System Documentation](./AUTH_SYSTEM.md)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [OAuth Providers Setup](./OAuth_Setup.md)

---

## 🤝 Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/anpip/app/issues
- Discord: https://discord.gg/anpip
- Email: support@anpip.com

---

**Erstellt**: 2025-01-XX
**Version**: 1.0.0
**Status**: ✅ Production Ready
