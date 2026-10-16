# Document Management System

Semesterprojekt für SWEN3: ein Dokumentenmanagementsystem zum Archivieren von Dokumenten,
mit OCR, KI-generierten Zusammenfassungen und Volltextsuche.

**Stand Sprint 2:** REST-Server mit PostgreSQL, Verwaltung von Dokumenten, Dokumentstatus mit Verlauf
als zusätzlicher Use Case sowie eine Web-UI, die über nginx ausgeliefert wird.

## Projektstruktur

| Pfad                    | Beschreibung                                                                  |
|-------------------------|-------------------------------------------------------------------------------|
| `paperless-rest/`       | REST-Server (Java 25, Spring Boot 4, JPA)                                     |
| `paperless-frontend/`   | Web-UI (React, Vite, Tailwind), ausgeliefert über nginx                       |
| `paperless-ocr-worker/` | OCR-Worker (Python 3.14, pika), arbeitet Aufträge aus RabbitMQ ab             |
| `docker-compose.yml`    | Startet alle Services (Web-UI, REST-Server, PostgreSQL, RabbitMQ, OCR-Worker) |
| `.env.example`          | Vorlage für die Zugangsdaten in der `.env`                                    |

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
| `App.tsx`     | Kopfzeile und Routen                                               |
| `pages/`      | Dashboard und Detailseite: laden Daten und führen Aktionen aus     |
| `components/` | Wiederverwendbare Teile (Formular, Statuswechsel, Badge, Fehler)   |
| `api.ts`      | Alle HTTP-Aufrufe an `/api/documents`                              |
| `types.ts`    | Typen passend zu den DTOs des REST-Servers                         |
| `status.ts`   | Bezeichnung, Farbe und erlaubte Wechsel je Status                  |
| `format.ts`   | Anzeige von Dateigröße und Datum                                   |

Der OCR-Worker ist ein eigenständiger Service: eigener Container, kein gemeinsamer Code mit dem REST-Server,
und er hängt nur von RabbitMQ ab. Aufbau von `paperless-ocr-worker/`:

| Pfad                         | Inhalt                                                    |
|------------------------------|-----------------------------------------------------------|
| `src/ocr_worker/worker.py`   | der Worker                                                |
| `src/ocr_worker/__init__.py` | macht `ocr_worker` zu einem Python-Paket (leer)           |
| `tests/test_worker.py`       | Unit-Tests                                                |
| `requirements.txt`           | Bibliothek für den Betrieb (`pika`)                       |
| `requirements-dev.txt`       | zusätzlich für die Entwicklung (`pytest`, `ruff`)         |
| `pyproject.toml`             | sagt pytest, dass der Code in `src/` liegt                |

In `worker.py`:

- `main()` verbindet sich über `RABBITMQ_URL` mit RabbitMQ und wartet auf Nachrichten in der `ocr-queue`.
- `on_message()` liest das JSON, loggt den Auftrag und bestätigt die Nachricht (`ack`).
  Eine fehlerhafte Nachricht wird geloggt und verworfen (`nack` ohne Requeue).

Der Aufbau folgt dem offiziellen RabbitMQ-Tutorial „Work Queues" für Python (Bibliothek `pika`).
Die OCR selbst kommt in Sprint 4.

## Voraussetzungen

- Docker Desktop
- JDK 25, Node.js 24 und Python 3.14 (nur für die lokale Entwicklung ohne Docker)

## Konfiguration

Zugangsdaten stehen nicht im Code, sondern in einer `.env`-Datei im Projekt-Root.
Die `.env` wird nicht committed, als Vorlage dient `.env.example`:

```bash
cp .env.example .env
```

| Variable                | Beschreibung                      |
|-------------------------|-----------------------------------|
| `POSTGRES_DB`           | Name der Datenbank                |
| `POSTGRES_USER`         | Datenbank-Benutzer                |
| `POSTGRES_PASSWORD`     | Passwort des Datenbank-Benutzers  |
| `RABBITMQ_DEFAULT_USER` | RabbitMQ-Benutzer                 |
| `RABBITMQ_DEFAULT_PASS` | Passwort des RabbitMQ-Benutzers   |

`docker compose` übergibt die Werte an die Datenbank, RabbitMQ, den REST-Server und den OCR-Worker.
Der lokal gestartete REST-Server liest dieselbe `.env` (`spring.config.import` in `application.properties`).

Hinweis: PostgreSQL und RabbitMQ übernehmen die Zugangsdaten nur beim ersten Start. Wurden sie geändert,
müssen die Volumes mit `docker compose down -v` gelöscht werden.

## Mit Docker starten

```bash
docker compose up --build
```

- Web-UI: http://localhost (Dashboard) und http://localhost/documents/{id} (Detailseite)
- REST-Server: http://localhost:8081
- PostgreSQL: `localhost:5432` (Zugangsdaten aus der `.env`)
- RabbitMQ: `localhost:5672` (AMQP) und die Management-UI unter http://localhost:15672
  (Login mit `RABBITMQ_DEFAULT_USER` und `RABBITMQ_DEFAULT_PASS` aus der `.env`)
- OCR-Worker: Logs mit `docker compose logs -f ocr-worker`

Beenden mit `docker compose down` (mit `-v` werden zusätzlich die Daten von PostgreSQL und RabbitMQ gelöscht).

### OCR-Worker von Hand testen

Ohne REST-Server lässt sich der Worker testen, indem man eine Nachricht direkt in seine Queue legt:

1. In der Management-UI (http://localhost:15672) unter „Queues and Streams" die `ocr-queue` öffnen.
2. Unter „Publish message" die Property `content_type` = `application/json` setzen und als Payload
   `{"documentId": 1, "fileName": "HelloWorld.pdf"}` schicken.
3. `docker compose logs -f ocr-worker` zeigt `Received OCR job for document 1 (HelloWorld.pdf)`.

Eine fehlerhafte Nachricht (z. B. Payload `hello`) erzeugt eine ERROR-Zeile und wird verworfen,
der Worker läuft weiter. Ist RabbitMQ nicht erreichbar, beendet sich der Worker und Docker startet ihn neu.

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

Den OCR-Worker lokal starten (verbindet sich mit dem RabbitMQ aus Docker,
Benutzer und Passwort in der URL wie in der `.env`):

```bash
docker compose up -d rabbitmq
docker compose stop ocr-worker          # sonst teilen sich beide Worker die Aufträge
cd paperless-ocr-worker
python3.14 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cd src
RABBITMQ_URL=amqp://paperless:change-me@localhost python -m ocr_worker.worker
```

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

OCR-Worker prüfen (in der aktivierten `.venv`, siehe „Lokale Entwicklung"):

```bash
cd paperless-ocr-worker
python -m pytest   # Unit-Tests, RabbitMQ wird gemockt
ruff check .       # Linter
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
Bei ungültigen Eingaben (400) nennt `detail` die betroffenen Felder, z. B. `title: must not be blank`.
Die Web-UI prüft die Eingaben schon im Formular (Validierung des Browsers), dort sind alle Felder Pflichtfelder.

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
