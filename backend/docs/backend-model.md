# Lab 03 — Model backendu i przepływy danych

## 1. Zakres

Dokument opisuje wyłącznie model backendu.
Klient mobilny występuje jako zewnętrzny uczestnik komunikacji.
Diagram klas aplikacji mobilnej należy do odpowiedzialności
osoby realizującej frontend.

Modele przedstawiają projekt docelowy, a nie gotową implementację.

## 2. Źródła diagramów

| Diagram | Plik |
|---|---|
| Przypadki użycia backendu | [use-cases.puml](diagrams/use-cases.puml) |
| Klasy backendu | [backend-classes.puml](diagrams/backend-classes.puml) |
| Odczyt kursu | [read-rates.puml](diagrams/read-rates.puml) |
| Wymiana i odzyskanie wyniku | [exchange.puml](diagrams/exchange.puml) |

Pliki PlantUML są edytowalnymi źródłami diagramów.

## 3. Aktorzy i odpowiedzialności

- Gość może zarejestrować konto i się zalogować.
- Uwierzytelniony użytkownik korzysta wyłącznie ze swoich danych.
- API NBP dostarcza zewnętrzne dane kursowe.
- Backend sprawdza tożsamość, uprawnienia i poprawność operacji.
- PostgreSQL przechowuje autorytatywne salda, historię i wyniki operacji.

## 4. Powiązanie wymagań z modelem

Identyfikatory pochodzą z dokumentu requirements.md.

| Wymagania | Przypadek użycia lub reguła | Odpowiedzialne komponenty |
|---|---|---|
| F01–F02 | Rejestracja i logowanie | AuthRouter, AuthService, UserRepository, PasswordHasher, TokenProvider |
| F03–F04 | Identyfikacja i kontrola dostępu | AuthService oraz serwisy ograniczające dostęp do danych użytkownika |
| F05 | Odczyt portfela | WalletRouter, WalletService, WalletRepository |
| F06 | Zasilenie PLN | OperationsRouter, OperationService, UnitOfWork |
| F07–F08 | Aktualne i historyczne kursy | RatesRouter, RateService, RateProvider, NbpClient |
| F09–F10 | Kupno, sprzedaż i odrzucenie niepoprawnej operacji | OperationService, RateService, WalletRepository |
| F11 | Atomowy zapis | UnitOfWork i repozytoria w jednej transakcji PostgreSQL |
| F12–F13 | Historia i niezmienność kursu transakcji | Transaction, TransactionRepository, WalletService |
| F14–F15 | Duplikaty i konflikt parametrów | OperationService, OperationRepository, ograniczenie unikalności w bazie |
| F16 | Sprawdzenie wyniku | OperationsRouter, OperationService, OperationRepository |
| F17 | Walidacja | Schematy Pydantic i serwisy biznesowe |
| F18 | Odczyty bez operacji finansowych | WalletService, RateService, OperationService.get_result |

## 5. Pełny przepływ wymiany

1. Klient wysyła token, identyfikator operacji, waluty
   i kwotę waluty źródłowej.
2. Backend identyfikuje użytkownika i waliduje dane.
   Tożsamość właściciela wynika z tokenu, nie z dowolnego user_id
   przesłanego przez klienta.
3. OperationService sprawdza zapisany wynik dla użytkownika
   i identyfikatora operacji.
4. Jeśli wynik istnieje i parametry są zgodne, serwer go zwraca.
   Różne parametry pod tym samym identyfikatorem oznaczają konflikt.
5. Dla nowej operacji RateService uzyskuje dopuszczalny kurs.
   Klient nie wybiera zastosowanego kursu.
6. Backend rozpoczyna transakcję bazy i zabezpiecza identyfikator
   przed równoczesnym wykonaniem duplikatu.
7. Salda użytkownika są blokowane w ustalonej kolejności.
   Backend sprawdza środki i oblicza wynik przy użyciu Decimal.
8. Przy braku środków zapisuje końcowy wynik REJECTED,
   bez zmiany sald i bez zapisu wykonanej transakcji.
9. Przy sukcesie zapisuje oba salda, transakcję z kursem i czasem
   oraz wynik SUCCEEDED w jednej transakcji bazy.
10. Serwer potwierdza sukces dopiero po potwierdzonym commit.

Błąd przed zatwierdzeniem powoduje rollback.
Niejednoznaczny błąd podczas commit wymaga sprawdzenia wyniku
w nowej transakcji; nie jest dowodem wycofania operacji.

## 6. Utrata odpowiedzi i ponowne połączenie

Utrata odpowiedzi nie oznacza anulowania wymiany.

Po odzyskaniu łączności klient sprawdza wynik, używając
pierwotnego identyfikatora. Backend weryfikuje właściciela
i zwraca zapisany wynik.

Brak znalezionego wyniku nie dowodzi odrzucenia:
pierwotne żądanie może nadal być przetwarzane.

Ponowienie zachowuje identyfikator i parametry.
Ochrona w bazie zapobiega podwójnemu wykonaniu również wtedy,
gdy żądania przyjdą równocześnie.

Po ustaleniu wyniku klient pobiera aktualne salda i historię.
Lokalny cache nie może nadpisać danych finansowych serwera.

## 7. Granica integracji NBP

RateService zależy od interfejsu RateProvider.
NbpClient implementuje komunikację z NBP, limit czasu oczekiwania,
walidację odpowiedzi i mapowanie danych na model Rate.

Brak opublikowanego kursu jest odróżniany od awarii źródła.
Komunikacja z NBP nie odbywa się podczas blokowania sald.

Powtórzenie zakończonej operacji korzysta z zapisanego wyniku,
bez ponownego pobierania kursu.

## 8. Reguła autorytatywnego wyniku

Backend rozstrzyga o sukcesie na podstawie wyniku
zatwierdzonej transakcji PostgreSQL.

Interfejs klienta, timeout i lokalny cache nie stanowią
potwierdzenia wykonania ani anulowania operacji.