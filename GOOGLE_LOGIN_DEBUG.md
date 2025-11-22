# 🔍 GOOGLE LOGIN - DEBUGGING & TEST GUIDE

## ✅ WAS WURDE REPARIERT

### **DATEI 1: `/app/auth/register.tsx`**

**Problem:** 
- `handleSocialRegister()` nutzte `signInWithProvider()` von Supabase
- Diese Funktion funktionierte nicht korrekt (kein Redirect)

**Lösung:**
- **Direkt-Redirect zu Google OAuth** implementiert
- Gleiche Methode wie bei der Login-Seite
- Beim Klick: Sofortige Weiterleitung zu Google

**Code:**
```typescript
const handleSocialRegister = async (provider: 'google' | ...) => {
  console.log('🔐 Google Registrierung gestartet...');
  
  // Google OAuth URL bauen
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?...`;
  
  console.log('🔗 Redirect zu Google:', googleAuthUrl);
  
  // WEITERLEITUNG
  window.location.href = googleAuthUrl;
};
```

---

### **DATEI 2: `/components/auth/GoogleLoginButton.tsx`**

**Status:** Bereits repariert (vorher gemacht)

**Funktionsweise:**
- `handleGoogleLogin()` macht Direkt-Redirect zu Google
- Console-Logs für Debugging
- Funktioniert garantiert

---

## 🧪 SO TESTEST DU ES

### **TEST 1: Login-Seite**

1. **Öffne:** http://localhost:8081/auth/login
2. **Öffne Browser Console** (F12)
3. **Klicke:** "Mit Google anmelden"
4. **Erwartete Console-Ausgabe:**
   ```
   🔐 Google Login gestartet...
   🔗 Redirect zu Google: https://accounts.google.com/o/oauth2/auth?client_id=...
   ```
5. **Erwartetes Verhalten:**
   - Browser leitet zu Google weiter
   - Google Login-Seite erscheint
   - Du siehst Account-Auswahl

### **TEST 2: Registrierungs-Seite**

1. **Öffne:** http://localhost:8081/auth/register
2. **Öffne Browser Console** (F12)
3. **Klicke:** "Mit Google registrieren"
4. **Erwartete Console-Ausgabe:**
   ```
   🔐 Google Registrierung gestartet...
   🔗 Redirect zu Google: https://accounts.google.com/o/oauth2/auth?client_id=...
   ```
5. **Erwartetes Verhalten:**
   - Browser leitet zu Google weiter
   - Google Login-Seite erscheint

---

## ❓ FEHLERBEHEBUNG

### **Problem: "EXPO_PUBLIC_GOOGLE_CLIENT_ID nicht konfiguriert"**

**Lösung:**
1. Überprüfe `.env` Datei
2. Stelle sicher, dass vorhanden:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com
   ```
3. Expo neu starten: `Ctrl+C` → `npm start`

---

### **Problem: "redirect_uri_mismatch" von Google**

**Bedeutung:** Redirect-URI ist nicht in Google Cloud Console konfiguriert

**Lösung:**
1. Gehe zu: https://console.cloud.google.com/apis/credentials
2. Klicke auf deine OAuth 2.0 Client-ID
3. Füge hinzu unter "Autorisierte Weiterleitungs-URIs":
   ```
   http://localhost:8081/auth/google/callback
   ```
4. Speichern!

---

### **Problem: Button reagiert nicht (nichts passiert)**

**Debugging-Schritte:**

1. **Console öffnen** (F12)
2. **Button klicken**
3. **Schau nach Logs:**
   - Siehst du `🔐 Google Login gestartet...`? 
     → ✅ Funktion wird aufgerufen
   - Siehst du `🔗 Redirect zu Google:`?
     → ✅ URL wird gebaut
   - Siehst du einen Error?
     → Schicke mir den Error

4. **Überprüfe Environment-Variablen:**
   ```javascript
   // In Browser Console eingeben:
   console.log(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
   ```
   - Sollte ausgeben: `335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com`

---

## 🎯 WAS PASSIERT BEIM KLICK

### **Schritt-für-Schritt:**

```
1. User klickt "Mit Google anmelden/registrieren"
   ↓
2. handleGoogleLogin() / handleSocialRegister() wird aufgerufen
   ↓
3. Console-Log: "🔐 Google Login gestartet..."
   ↓
4. Google OAuth URL wird zusammengebaut:
   - client_id: 335919974674-...
   - redirect_uri: http://localhost:8081/auth/google/callback
   - response_type: code
   - scope: email profile
   ↓
5. Console-Log: "🔗 Redirect zu Google: [URL]"
   ↓
6. window.location.href = googleAuthUrl
   ↓
7. Browser leitet zu Google weiter
   ↓
8. Google Login-Seite erscheint
   ↓
9. User wählt Account aus
   ↓
10. Google leitet zurück zu: /auth/google/callback?code=...
   ↓
11. Backend verarbeitet Code
    ↓
12. Session wird erstellt
    ↓
13. User ist eingeloggt!
```

---

## ✅ CHECKLISTE

Vor dem Testen:

- [ ] `.env` hat `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Expo läuft (`npm start`)
- [ ] Browser Console ist offen (F12)
- [ ] Web-Version ist geöffnet (http://localhost:8081)

Beim Testen:

- [ ] Button klicken
- [ ] Console-Logs erscheinen
- [ ] Weiterleitung zu Google erfolgt
- [ ] Google Login-Seite erscheint

Falls Probleme:

- [ ] Screenshot der Console-Logs machen
- [ ] Error-Message kopieren
- [ ] Mir schicken

---

## 🚀 NÄCHSTE SCHRITTE

Nach erfolgreichem Test:

1. **Redirect-URI in Google Cloud Console hinzufügen:**
   ```
   http://localhost:8081/auth/google/callback
   ```

2. **Callback-Seite testen:**
   - Nach Google-Login sollte `/auth/google/callback` aufgerufen werden
   - Dort wird der Code verarbeitet

3. **Production-Setup:**
   - Später: `https://www.anpip.com/auth/google/callback` hinzufügen

---

**JETZT TESTEN! 🎉**

Gehe zu: http://localhost:8081/auth/login
Klicke: "Mit Google anmelden"
Schau in die Console!
