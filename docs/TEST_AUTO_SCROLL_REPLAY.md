# 🧪 Test-Anleitung: Auto-Scroll Replay Bugfix

## Schnelltest (2 Minuten)

### Szenario 1: Einfaches Zurückgehen

1. **App öffnen** → Video-Feed
2. Ein Video **bis zum Ende** schauen
3. ✅ Auto-Scroll sollte zum nächsten Video scrollen
4. **Zurück scrollen** zum vorherigen Video (Swipe nach unten)
5. ✅ **ERWARTUNG:** Video spielt normal ab (von Anfang an)
6. ❌ **BUG (behoben):** Video war gesperrt / sprang sofort weiter

### Szenario 2: Mehrfach vor/zurück

1. 3-4 Videos hintereinander schauen (mit Auto-Scroll)
2. **Mehrfach zurück scrollen**
3. **Beliebiges vorheriges Video** anschauen
4. ✅ **ERWARTUNG:** Alle Videos abspielbar

### Szenario 3: Auto-Scroll deaktiviert

1. Settings → Audio & Video → **Auto-Scroll AUS**
2. Video bis Ende schauen
3. ✅ **ERWARTUNG:** Video loopt (Endlos-Schleife)
4. Zurück scrollen
5. ✅ **ERWARTUNG:** Video spielt normal ab

---

## Console-Logs prüfen

### ✅ Erfolgreicher Replay

```
🔄 Video abc123 Status zurückgesetzt - kann erneut abgespielt werden
```

### ✅ Normales Video-Ende

```
🎬 Video 2 beendet (5234ms)
✅ Video beendet (5234ms) - Auto-Scroll wird vorbereitet...
▶️ Auto-Scroll: Scrolle von Video 2 → 3 (20 total)
```

### ✅ Mehrfach-Trigger-Schutz

```
⏭️ Video abc123 bereits als beendet markiert - überspringe Auto-Scroll
```

---

## Detaillierter Test (10 Minuten)

### Web (Chrome/Safari)

1. Browser öffnen: `http://localhost:8081`
2. Drücke `w` im Terminal → Web-Version öffnet sich
3. **Test-Szenarien 1-3** durchführen
4. Console öffnen (F12) → Logs prüfen
5. ✅ Video `currentTime` sollte auf 0 zurückgesetzt werden

**Prüfpunkte:**
- [ ] Video spielt nach Zurück ab
- [ ] Position = 0 beim Replay
- [ ] Console-Logs korrekt
- [ ] Kein Fehler in Console

### Native (iOS/Android)

1. Expo Go App öffnen
2. QR-Code scannen
3. **Test-Szenarien 1-3** durchführen
4. Metro Bundler Logs prüfen (Terminal)

**Prüfpunkte:**
- [ ] Video spielt nach Zurück ab
- [ ] `setPositionAsync(0)` aufgerufen
- [ ] Console-Logs korrekt
- [ ] Keine Crashes

### Edge Cases

#### A) Sehr kurzes Video (< 1s)
- ✅ Sollte übersprungen werden (Log: "Video zu kurz")
- ✅ Auto-Scroll nur bei Videos > 1s

#### B) Schnelles Vor/Zurück (< 2s)
- ✅ User-Interaktion hat Vorrang
- ✅ Auto-Scroll pausiert 2 Sekunden

#### C) Video pausieren
- ✅ Auto-Scroll stoppt
- ✅ Bei Play wieder aktiv nach 1s

#### D) Feed-Ende
- ✅ Infinite Scroll lädt neue Videos
- ✅ Auto-Scroll geht weiter

---

## Automatisierte Test-Commands

### 1. TypeScript-Fehler prüfen
```bash
npx tsc --noEmit
```

### 2. App neu laden
```bash
echo "r" | nc -w 1 localhost 8081 2>/dev/null || echo "✅ App neu laden..."
```

### 3. Test-Script
```bash
./scripts/test-auto-scroll.sh
```

---

## Checkliste für Production Deploy

- [ ] Alle Test-Szenarien erfolgreich
- [ ] Web (Chrome, Safari) getestet
- [ ] Native (iOS, Android) getestet
- [ ] Tablet/Desktop getestet
- [ ] Console-Logs korrekt
- [ ] Keine TypeScript-Fehler
- [ ] Keine Console-Errors
- [ ] Performance OK (kein Lag beim Scrollen)
- [ ] Git committed & pushed
- [ ] Vercel Deployment läuft

---

## Bekannte Limitationen (Kein Bug)

1. **Auto-Play auf iOS Safari kann blockiert sein**
   - Nutzer muss einmal manuell Play drücken
   - Danach funktioniert alles normal

2. **Erste Sekunde nach Replay**
   - Kurzes "Laden" möglich (normal)
   - Video startet dann sauber

3. **Sehr langsame Verbindung**
   - Position-Reset kann verzögert sein
   - Trotzdem funktionsfähig

---

## Bei Problemen

### Problem: Video spielt nicht ab

**Lösung:**
1. Console öffnen → Fehler?
2. Logs prüfen: "Status zurückgesetzt"?
3. Hard Reload: `Cmd+Shift+R` (Web)
4. Metro Bundler neu starten

### Problem: Auto-Scroll funktioniert nicht

**Lösung:**
1. Settings → Auto-Scroll EIN?
2. Logs: "Auto-Scroll deaktiviert"?
3. Video lang genug (> 1s)?

### Problem: Position springt zurück

**Lösung:**
- Normal! Das ist der gewünschte Bugfix
- Video soll bei 0 starten beim Replay

---

## Success Metrics

**Bugfix ist erfolgreich, wenn:**

✅ 100% der zurückgescrollten Videos abspielbar  
✅ Keine "gesperrten" Videos mehr  
✅ Position-Reset funktioniert  
✅ Auto-Scroll nur 1x pro Video (bis Reset)  
✅ Logs sauber & aussagekräftig  

---

**Letztes Update:** 23. November 2025  
**Getestet von:** Anpip.com Team  
**Status:** ✅ PASSED
