# Paperless DMS – Smartphone-App

React-Native-App (Expo SDK 58, TypeScript, Expo Router) für das Paperless DMS. Sie läuft in **Expo Go** auf iOS
und Android und spricht wie die Web-UI über nginx (Port 80, `/api`) mit dem REST-Server.

## Funktionen

- Dokumentliste mit Volltextsuche, Status als Pille und den ersten zwei Zeilen der Zusammenfassung
- PDF-Upload mit optionalem Titel
- Detailseite mit Metadaten, Zusammenfassung („Retry summary“ nach einem Fehler), erkanntem Text in einer
  scrollbaren Box, Statuswechsel mit Kommentar und Verlauf
- Titel bearbeiten, Dokument löschen, PDF öffnen, mit denselben Regeln wie in der Web-UI: Ablehnen nur mit
  Begründung, archivierte Dokumente sind schreibgeschützt, Löschen nur bei „Received“ oder „Rejected“
- Eigener Name oben in der Liste („Your name“): wird auf dem Gerät gespeichert (AsyncStorage, bleibt nach Neustart
  und Updates erhalten) und bei Upload und Statuswechsel im Verlauf angezeigt
- Liste und Detailseite aktualisieren sich selbst: alle 10 Sekunden (während der Verarbeitung alle 3 Sekunden) und
  sofort, wenn die App wieder in den Vordergrund kommt
- Status „Processing“ mit Uhr-Symbol, solange OCR und Zusammenfassung laufen, danach automatisch „In Review“

## Voraussetzungen

- Node.js 24 mit npm
- Laufender Stack im Projektordner: `docker compose up -d`
- **Expo Go** aus dem App Store bzw. Play Store, oder ein Android-Emulator bzw. iOS-Simulator
- Handy und Rechner im selben WLAN (im FH-WLAN sind Geräte oft abgeschottet, dann den Hotspot des Handys nutzen)

## Starten

```bash
cd paperless-mobile
npm install
npm start
```

QR-Code scannen: iPhone mit der Kamera-App, Android in Expo Go mit „Scan QR code“. Läuft ein Emulator, startet `a`
die App im Android-Emulator und `i` im iOS-Simulator. Expo Go wird dort automatisch installiert.

Der runde Entwicklerknopf von Expo Go kann Buttons verdecken. Er lässt sich im Entwicklermenü unter „Tools button“
ausschalten.

Der Entwicklungsserver läuft auf Port **8082**, weil der REST-Server 8081 belegt.

**Server-Adresse:** Die App nimmt die IP des Rechners aus der Adresse des Entwicklungsservers
(`Constants.expoConfig.hostUri`) und hängt `/api/documents` an. Funktioniert das nicht (z. B. mit `--tunnel`):

```bash
EXPO_PUBLIC_API_URL=http://<IP-des-Rechners>/api/documents npm start
```

In der Windows-PowerShell: `$env:EXPO_PUBLIC_API_URL="http://<IP-des-Rechners>/api/documents"; npm start`.

Die IP steht in der Ausgabe von `npm start` (`exp://<IP>:8082`).

## Aufbau

```
src/api.ts                   REST-Aufrufe, Typen, summaryState()
src/theme.ts                 Farben wie in der Web-UI, Status-Tabelle mit Regeln, Formularstile, Formatierung
src/userName.ts              eigener Name, gespeichert mit AsyncStorage
src/useAutoRefresh.ts        automatisches Neuladen (Intervall und Rückkehr in die App)
src/app/_layout.tsx          Navigation (Expo Router) und Kopfzeile
src/app/index.tsx            Dokumentliste, Suche, Upload
src/app/documents/[id].tsx   Detailseite
src/components/              AppButton, Dialog, EditTitleModal, ErrorBox, StatusBadge, StatusChange, UploadModal,
                             UserNameModal
```

## Prüfen

```bash
npx tsc --noEmit
npx expo lint
```

Automatisierte Tests gibt es für die App nicht. Geprüft wird mit TypeScript, ESLint und von Hand in Expo Go
gegen den laufenden Stack.

## Design-Entscheidungen

- **Expo und Expo Go:** gleiche Sprache und Konzepte wie die Web-UI (React, TypeScript), ein Code für iOS und
  Android, kein eigener Build mit Xcode oder Android Studio nötig.
- **Upload über `XMLHttpRequest`:** In SDK 58 ersetzt Expo das globale `fetch`. Das kann den React-Native-Dateiteil
  `{ uri, name, type }` nicht senden („Unsupported FormDataPart implementation“), `XMLHttpRequest` schon.
- **PDF öffnen:** Die App lädt das PDF in den Cache (`expo-file-system`) und öffnet es mit `file.preview()`.
  Android zeigt es im PDF-Viewer des Systems über der App, iOS in der Vorschau innerhalb der App. Ein fest
  eingebauter PDF-Viewer bräuchte eine native Bibliothek, die es in Expo Go nicht gibt.
- **Keine Einstellungsseite:** Die Server-Adresse kommt automatisch vom Entwicklungsserver.
