# Auth Code Learn App

Trainiere das Merken und Eingeben von 6-stelligen Authentifizierungscodes.

## Features

- Anzeige eines zufälligen 6-stelligen Codes
- PIN-Eingabe mit sofortiger Validierung
- Streak, persönlicher Rekord und Anzahl richtiger Versuche
- Lokale Speicherung der Statistiken (AsyncStorage)
- Haptisches Feedback bei Erfolg und Fehler

## APK herunterladen

**Direkt (neueste Version):** https://github.com/leonard-roepcke/auth-code-learn-app/releases/latest

Falls du nur **v1.0.0** siehst: Dort unter **Assets** auf `auth-code-learn-app-v1.0.1.apk` klicken — das ist die aktuelle App.

Alternativ direkt:
https://github.com/leonard-roepcke/auth-code-learn-app/releases/download/v1.0.2/auth-code-learn-app-v1.0.1.apk

Lokal liegt die APK unter:

`releases/auth-code-learn-app-v1.0.1.apk`

Auf dem Android-Gerät die APK öffnen und die Installation aus unbekannten Quellen erlauben, falls nötig.

## Entwicklung

```bash
npm install
npm start
```

## APK selbst bauen

Voraussetzungen: Node.js, **Java 17** (JDK), Android SDK

```bash
npm install
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
npm run build:apk:local
```

Die APK wird erzeugt unter:

`android/app/build/outputs/apk/release/app-release.apk`

## Tech Stack

- Expo SDK 56
- React Native
- TypeScript
- AsyncStorage für Persistenz

## App-Paket

- Android: `com.authcodelearn.app`
