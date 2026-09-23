# Document Management System

Semesterprojekt für SWEN3: ein Dokumentenmanagementsystem zum Archivieren von Dokumenten,
mit OCR, KI-generierten Zusammenfassungen und Volltextsuche.

**Stand Sprint 1:** REST-Server mit PostgreSQL, Verwaltung von Dokumenten sowie
Dokumentstatus mit Verlauf als zusätzlicher Use Case.

## Projektstruktur

| Pfad                 | Beschreibung                                    |
|----------------------|-------------------------------------------------|
| `paperless-rest/`    | REST-Server (Java 25, Spring Boot 4, JPA)       |
| `docker-compose.yml` | Startet alle Services (REST-Server, PostgreSQL) |

Der REST-Server ist in drei Schichten aufgebaut:

| Schicht        | Package        | Inhalt                                          |
|----------------|----------------|-------------------------------------------------|
| Presentation   | `presentation` | REST-Controller, Fehlerbehandlung               |
| Business       | `business`     | Services, DTOs, Mapper, fachliche Exceptions    |
| Persistence    | `persistence`  | JPA-Entities, Repositories                      |

## Voraussetzungen

- Docker Desktop
- JDK 25 (nur für die lokale Entwicklung ohne Docker)

## Mit Docker starten

```bash
docker compose up --build
```

- REST-Server: http://localhost:8080
- PostgreSQL: `localhost:5432` (Datenbank, Benutzer und Passwort: `paperless`)

Beenden mit `docker compose down` (mit `-v` werden zusätzlich die Datenbankdaten gelöscht).

## Lokale Entwicklung

Nur die Datenbank in Docker starten und den REST-Server aus der IDE oder mit Maven ausführen:

```bash
docker compose up -d db
cd paperless-rest
./mvnw spring-boot:run
```

Hinweis: Der REST-Server im Container und die lokal gestartete Anwendung verwenden beide Port 8080,
es kann also immer nur einer der beiden laufen.

## Build und Tests

```bash
cd paperless-rest
./mvnw clean verify
```

Die Unit-Tests benötigen keine Datenbank, das Repository wird mit Mockito gemockt.

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
curl -X POST http://localhost:8080/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Rechnung März", "fileName": "rechnung.pdf", "contentType": "application/pdf", "fileSize": 12345}'

# Status ändern
curl -X PATCH http://localhost:8080/api/documents/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_REVIEW", "comment": "Prüfung gestartet"}'

# Verlauf anzeigen
curl http://localhost:8080/api/documents/1/history
```
