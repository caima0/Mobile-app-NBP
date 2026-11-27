# Backend — Mobilny system wymiany walut

## 1. Temat i zakres odpowiedzialności

Temat projektu: mobilny system wymiany walut.

Zakres tej części projektu obejmuje wyłącznie backend:
- usługę REST API w Pythonie z użyciem FastAPI;
- bazę danych PostgreSQL;
- uwierzytelnianie i autoryzację;
- obsługę sald, zasileń i wymiany walut;
- historię operacji;
- integrację z API Narodowego Banku Polskiego;
- spójność danych i ochronę przed powtórnym wykonaniem operacji.

Implementacja aplikacji mobilnej pozostaje poza zakresem tej części.

## 2. Podział odpowiedzialności w zespole

- Osoba odpowiedzialna za backend: API, baza danych, integracja NBP,
  bezpieczeństwo, testy serwera i dokumentacja backendu.
- Osoba odpowiedzialna za aplikację mobilną: interfejs, komunikacja z API,
  lokalny cache oraz obsługa stanów połączenia.
- Wspólnie: uzgodnienie kontraktu API i testy integracyjne.

## 3. Technologie

- Python i FastAPI — usługa REST API.
- Pydantic — walidacja danych wejściowych i wyjściowych.
- PostgreSQL — trwałe przechowywanie danych.
- SQLAlchemy — dostęp do bazy danych.
- Alembic — migracje schematu.
- HTTPX — komunikacja z API NBP.
- pytest — testy backendu.

Architektura opisuje system docelowy.
Obecnie zaimplementowano konfigurację aplikacji, połączenie PostgreSQL,
migrację tabeli użytkowników, rejestrację z hashowaniem Argon2id
oraz testy integracyjne rejestracji.

Logowanie, autoryzacja, portfele, integracja NBP i wymiana walut
pozostają do implementacji.

## 4. Szkic architektury

```mermaid
flowchart LR
    Mobile[Aplikacja mobilna] -->|HTTP/HTTPS| API[FastAPI]
    API --> Services[Serwisy biznesowe]
    Services --> Repositories[Repozytoria]
    Repositories --> DB[(PostgreSQL)]
    Services --> NBPClient[Klient NBP]
    NBPClient -->|HTTPS| NBP[API NBP]
```

Backend jest podzielony na warstwy:
- routery przyjmują żądania HTTP i zwracają odpowiedzi;
- schematy Pydantic określają format danych;
- serwisy realizują reguły biznesowe i wyznaczają granice transakcji;
- repozytoria odczytują i zapisują dane;
- klient NBP odpowiada za komunikację z zewnętrznym źródłem kursów.

Zależności są przekazywane przez mechanizm dependency injection.
Klasy mają określone odpowiedzialności zgodnie z zasadami OOP i SOLID.

## 5. Właściciele danych

| Dane | Źródło i odpowiedzialność |
|---|---|
| Użytkownicy i hashe haseł | Backend; trwały zapis w PostgreSQL |
| Salda | Backend; aplikacja nie może ustawiać ich bezpośrednio |
| Zasilenia i transakcje wymiany | Backend; trwały zapis w PostgreSQL |
| Kurs zastosowany w transakcji | Backend zapisuje go razem z transakcją |
| Aktualne i historyczne kursy referencyjne | API NBP |
| Lokalny cache aplikacji | Kopia danych; nie rozstrzyga o stanie środków |

Zmiana kursów NBP nie zmienia kursu zapisanego w wykonanej transakcji.

## 6. Ścieżka żądania przez sieć mobilną

1. Aplikacja tworzy żądanie do API.
2. Żądanie przechodzi przez sieć radiową i sieć operatora komórkowego.
3. Przez internet trafia do backendu.
4. Backend identyfikuje użytkownika, sprawdza uprawnienia i waliduje dane.
5. Backend korzysta z PostgreSQL lub API NBP, zależnie od operacji.
6. Odpowiedź wraca przez internet i sieć operatora do aplikacji.

Połączenie aplikacja–backend oraz backend–NBP to dwa odrębne
połączenia, które mogą ulec awarii niezależnie.

## 7. Scenariusze normalne

### S1. Odczyt salda

Uwierzytelniony użytkownik wysyła żądanie odczytu portfela.
Backend ustala tożsamość użytkownika, pobiera jego salda z bazy
i zwraca odpowiedź. Odczyt nie zmienia sald.

### S2. Kupno waluty

Użytkownik przesyła walutę i kwotę oraz identyfikator operacji.
Backend sprawdza uprawnienia, dane, dostępność odpowiedniego kursu
i wystarczające środki.

Zmniejszenie salda źródłowego, zwiększenie salda docelowego
oraz zapis transakcji następują w jednej transakcji bazy danych.
Sukces jest potwierdzany dopiero po jej zatwierdzeniu.

## 8. Scenariusze przerwane problemem sieciowym

### S3. Utrata połączenia przed wysłaniem

Żądanie nie dociera do backendu, więc serwer nie zmienia danych.
Operacje finansowe bez połączenia są blokowane i nie są kolejkowane.

### S4. Utrata odpowiedzi po wysłaniu wymiany

Backend mógł zatwierdzić wymianę mimo utraty odpowiedzi.
Brak odpowiedzi nie oznacza odrzucenia ani anulowania operacji.

Po odzyskaniu połączenia klient sprawdza wynik po identyfikatorze
operacji. Ewentualne ponowienie wykorzystuje ten sam identyfikator.
Backend zapobiega ponownemu wykonaniu tej samej operacji.

## 9. Pierwsze ryzyka

| Ryzyko | Planowane postępowanie |
|---|---|
| Utrata połączenia z backendem | Brak potwierdzenia sukcesu; sprawdzenie wyniku po odzyskaniu sieci |
| Utrata odpowiedzi po zapisie | Trwały wynik operacji i ochrona przed duplikacją |
| Nieaktualne kursy | Zwracanie daty kursu i kontrola jego dopuszczalności przy wymianie |
| Niedostępność NBP | Ograniczony czas oczekiwania i jednoznaczny błąd; brak niepotwierdzonego przeliczenia |
| Konkurencyjne wymiany | Transakcje i kontrola współbieżności w bazie |
| Nieuprawniony dostęp | Uwierzytelnianie i kontrola właściciela danych w backendzie |

## 10. Uruchomienie lokalne

### Wymagania

- Python 3.14 — wersja używana podczas prac.
- Docker Desktop z Docker Compose.
- Polecenia wykonywane z katalogu backend.

### Przygotowanie środowiska

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

Przy pierwszej konfiguracji utwórz lokalny plik ustawień:

```bash
cp .env.example .env
```

Nie kopiuj ponownie pliku, jeśli .env już istnieje, aby nie nadpisać ustawień.
W lokalnym .env ustaw niepuste POSTGRES_PASSWORD.
Plik .env nie jest przechowywany w Git.

```bash
docker compose up -d db
docker compose ps
```

Poczekaj, aż baza uzyska status healthy, a następnie wykonaj:

```bash
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/v1/health
- PostgreSQL: 127.0.0.1:5433, jeśli nie zmieniono POSTGRES_PORT.

Dane PostgreSQL są przechowywane w nazwanym wolumenie.
Zmiana hasła w .env nie zmienia hasła użytkownika w już
zainicjalizowanej bazie.

### Sprawdzenie migracji

```bash
python -m alembic current
python -m alembic check
```

### Testy

```bash
python -m pytest -q
```

Testy wymagają działającego PostgreSQL i zastosowanych migracji.
Korzystają z bazy wskazanej przez lokalną konfigurację.
Zmiany każdego testu są izolowane przez SAVEPOINT
i wycofywane zewnętrzną transakcją.

Zestaw testów jest przeznaczony do uruchamiania sekwencyjnego.
Obejmuje rejestrację, normalizację loginu, zajęty login,
walidację i bezpieczny format odpowiedzi.

### Zatrzymanie

Serwer API: Ctrl+C.

```bash
docker compose stop db
```

## 11. Zaimplementowane API

### GET /api/v1/health

Odpowiedź 200:

```json
{"status": "ok"}
```

Endpoint potwierdza działanie API, nie sprawdza dostępności bazy.

### POST /api/v1/auth/register

Żądanie:

```json
{
  "login": "example_user",
  "password": "Example-password-123"
}
```

Login jest normalizowany przez usunięcie skrajnych spacji
i zamianę liter na małe. Ma od 3 do 50 znaków.
Dozwolone znaki: a–z, 0–9, podkreślenie, kropka i myślnik.

Hasło ma od 8 do 128 znaków. Nie jest normalizowane.
Dodatkowe pola żądania są odrzucane.

Odpowiedź 201:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "login": "example_user",
  "created_at": "2026-11-27T10:00:00Z"
}
```

Odpowiedź nie zawiera hasła ani hasha.
Rejestracja nie loguje użytkownika i nie zwraca tokenu.

Odpowiedź 409 dla zajętego loginu:

```json
{
  "detail": {
    "code": "LOGIN_ALREADY_EXISTS",
    "message": "Login is already registered."
  }
}
```

Odpowiedź 422 dla błędnego żądania zawiera kod VALIDATION_ERROR
oraz listę błędów z polami location, message i type.
Wartości wejściowe nie są kopiowane do odpowiedzi błędu.

## 12. Aktualne ograniczenia

- Brak logowania, tokenów i kontroli dostępu do danych użytkownika.
- Brak portfela, zasileń, wymiany i historii operacji finansowych.
- Brak integracji z NBP.
- Mechanizmy odporności operacji finansowych są na etapie projektu.
- Modele i diagramy systemu docelowego wykraczają poza gotowy kod.
- Zgodność pola login i reguł walidacji z klientem mobilnym
  wymaga uzgodnienia z osobą odpowiedzialną za frontend.
