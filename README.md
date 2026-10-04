# Document Management System

Semesterprojekt für SWEN3: ein Dokumentenmanagementsystem zum Archivieren von Dokumenten,
mit OCR, KI-generierten Zusammenfassungen und Volltextsuche.

**Stand Sprint 2:** REST-Server mit PostgreSQL, Verwaltung von Dokumenten, Dokumentstatus mit Verlauf
als zusätzlicher Use Case sowie eine Web-UI, die über nginx ausgeliefert wird.

## Projektstruktur

| Pfad                  | Beschreibung                                            |
|-----------------------|---------------------------------------------------------|
| `paperless-rest/`     | REST-Server (Java 25, Spring Boot 4, JPA)               |
| `paperless-frontend/` | Web-UI (React, Vite, Tailwind), ausgeliefert über nginx |
| `docker-compose.yml`  | Startet alle Services (Web-UI, REST-Server, PostgreSQL) |
| `.env.example`        | Vorlage für die Zugangsdaten in der `.env`              |

Im Container liefert nginx die gebaute Web-UI aus und leitet Anfragen an `/api` an den REST-Server weiter.

Der REST-Server ist in drei Schichten aufgebaut:

| Schicht        | Package        | Inhalt                                          |
|----------------|----------------|-------------------------------------------------|
| Presentation   | `presentation` | REST-Controller, Fehlerbehandlung               |
| Business       | `business`     | Services, DTOs, Mapper, fachliche Exceptions    |
| Persistence    | `persistence`  | JPA-Entities, Repositories                      |

Die Web-UI (`paperless-frontend/src`) ist so aufgebaut:

| Datei         | Inhalt                                                             |
|---------------|--------------------------------------------------------------------|
| `App.tsx`     | Hält den Zustand und ruft den REST-Server auf                      |
| `components/` | Komponenten, die nur anzeigen (Tabelle, Formular, Details, Status) |
| `api.ts`      | Alle HTTP-Aufrufe an `/api/documents`                              |
| `types.ts`    | Typen passend zu den DTOs des REST-Servers                         |
| `status.ts`   | Bezeichnung, Farbe und erlaubte Wechsel je Status                  |
| `format.ts`   | Anzeige von Dateigröße und Datum                                   |

## Voraussetzungen

- Docker Desktop
- JDK 25 und Node.js 24 (nur für die lokale Entwicklung ohne Docker)

## Konfiguration

Zugangsdaten stehen nicht im Code, sondern in einer `.env`-Datei im Projekt-Root.
Die `.env` wird nicht committed, als Vorlage dient `.env.example`:

```bash
cp .env.example .env
```

| Variable            | Beschreibung              |
|---------------------|---------------------------|
| `POSTGRES_DB`       | Name der Datenbank        |
| `POSTGRES_USER`     | Datenbank-Benutzer        |
| `POSTGRES_PASSWORD` | Passwort des Benutzers    |

`docker compose` übergibt die Werte an die Datenbank und den REST-Server.
Der lokal gestartete REST-Server liest dieselbe `.env` (`spring.config.import` in `application.properties`).

Hinweis: PostgreSQL übernimmt die Zugangsdaten nur beim ersten Start. Wurden sie geändert,
muss das Volume mit `docker compose down -v` gelöscht werden.

## Mit Docker starten

```bash
docker compose up --build
```

- Web-UI: http://localhost
- REST-Server: http://localhost:8081
- PostgreSQL: `localhost:5432` (Zugangsdaten aus der `.env`)

Beenden mit `docker compose down` (mit `-v` werden zusätzlich die Datenbankdaten gelöscht).

## Lokale Entwicklung

Nur die Datenbank in Docker starten und den REST-Server aus der IDE oder mit Maven ausführen
(Arbeitsverzeichnis `paperless-rest`, damit die `.env` gefunden wird):

```bash
docker compose up -d db
cd paperless-rest
./mvnw spring-boot:run
```

Hinweis: Der REST-Server im Container und die lokal gestartete Anwendung verwenden beide Port 8081,
es kann also immer nur einer der beiden laufen.

Die Web-UI lokal mit dem Vite-Dev-Server starten (leitet `/api` an `localhost:8081` weiter):

```bash
cd paperless-frontend
npm install
npm run dev
```

Die Web-UI ist dann unter http://localhost erreichbar.

Hinweis: Der Vite-Dev-Server und das Frontend im Container verwenden beide Port 80,
der `frontend`-Container darf dabei also nicht laufen.

## Build und Tests

```bash
cd paperless-rest
./mvnw clean verify
```

Die Unit-Tests benötigen keine Datenbank, das Repository wird mit Mockito gemockt.

Web-UI prüfen und bauen:

```bash
cd paperless-frontend
npm run lint    # Linter (oxlint)
npm run build   # Typprüfung und Build nach dist/
```

## REST-API

| Methode | Pfad                          | Beschreibung                                   | Antwort              |
|---------|-------------------------------|------------------------------------------------|----------------------|
| GET     | `/api/documents`              | Alle Dokumente                                 | 200                  |
| GET     | `/api/documents/{id}`         | Ein Dokument                                   | 200, 404             |
| POST    | `/api/documents`              | Dokument anlegen (Status wird `RECEIVED`)      | 201, 400             |
| PUT     | `/api/documents/{id}`         | Metadaten ändern                               | 200, 400, 404        |
| DELETE  | `/api/documents/{id}`         | Dokument samt Verlauf löschen                  | 204, 404             |
| PATCH   | `/api/documents/{id}/status`  | Status ändern                                  | 200, 400, 404, 409   |
| GET     | `/api/documents/{id}/history` | Statusverlauf (neuester Eintrag zuerst)        | 200, 404             |

Fehler werden als Problem Details (RFC 9457) im JSON-Format zurückgegeben.

### Dokumentstatus

Jede Statusänderung wird mit Zeitpunkt und optionalem Kommentar im Verlauf gespeichert.
Nicht erlaubte Änderungen werden mit `409 Conflict` abgelehnt.

| Status      | Bedeutung                       | Erlaubte Änderungen      |
|-------------|---------------------------------|--------------------------|
| `RECEIVED`  | Eingegangen (beim Anlegen)      | `IN_REVIEW`, `REJECTED`  |
| `IN_REVIEW` | Wird geprüft                    | `DONE`, `REJECTED`       |
| `DONE`      | Erledigt                        | `ARCHIVED`               |
| `REJECTED`  | Abgelehnt                       | `IN_REVIEW`              |
| `ARCHIVED`  | Abgeschlossen (Endzustand)      | –                        |

### Beispiele

```bash
# Dokument anlegen
curl -X POST http://localhost:8081/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Rechnung März", "fileName": "rechnung.pdf", "contentType": "application/pdf", "fileSize": 12345}'

# Status ändern
curl -X PATCH http://localhost:8081/api/documents/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_REVIEW", "comment": "Prüfung gestartet"}'

# Verlauf anzeigen
curl http://localhost:8081/api/documents/1/history
```
