# Lab 02 — Wymagania backendu i scenariusze sieciowe

## 1. Zakres

Dokument opisuje wymagania backendu systemu wymiany walut.
Zachowanie klienta określa wyłącznie oczekiwania kontraktu API.
Implementacja interfejsu i lokalnego cache należy do części mobilnej.

Wymagania są planem implementacji, a nie deklaracją gotowych funkcji.

## 2. Wymagania funkcjonalne

| ID | Wymaganie | Kryterium weryfikacji |
|---|---|---|
| F01 | Rejestracja użytkownika z unikalnym loginem | Poprawne dane tworzą konto; powtórzony login jest odrzucany; hasło nie jest zapisane jawnie ani zwracane w odpowiedzi |
| F02 | Logowanie użytkownika | Poprawne dane zwracają token; błędne dane nie pozwalają uzyskać dostępu |
| F03 | Identyfikacja użytkownika w API | Brak tokenu, token niepoprawny lub wygasły powoduje odrzucenie żądania chronionego |
| F04 | Kontrola właściciela danych | Użytkownik A nie może odczytać ani zmienić portfela, historii lub operacji użytkownika B |
| F05 | Odczyt portfela | Odpowiedź zawiera waluty i salda zalogowanego użytkownika zgodne z bazą |
| F06 | Symulowane zasilenie PLN | Dodatnia kwota z najwyżej dwoma miejscami dziesiętnymi zwiększa saldo i tworzy zapis operacji; kwota zerowa, ujemna lub niepoprawna nie zmienia danych |
| F07 | Odczyt aktualnych kursów NBP | Odpowiedź zawiera kod waluty, wartość kursu i datę obowiązywania danych |
| F08 | Odczyt historycznych kursów NBP | Dla obsługiwanej waluty i daty serwer zwraca dane NBP; brak publikacji jest odróżniany od awarii źródła |
| F09 | Kupno i sprzedaż waluty względem PLN | Serwer wybiera kurs według udokumentowanej reguły i oblicza wynik; klient nie ustala kursu ani salda końcowego |
| F10 | Odrzucenie niepoprawnej wymiany | Nieobsługiwana waluta, niepoprawna kwota, niedopuszczalny kurs lub brak środków powodują odrzucenie bez zmiany sald |
| F11 | Atomowość operacji finansowej | Zmiany sald, zapis operacji i zapis jej wyniku zatwierdzają się razem albo zostają wycofane |
| F12 | Historia operacji | Historia użytkownika zawiera zasilenia i wymiany; wymiana zawiera typ, waluty, kwoty, zastosowany kurs oraz czas wykonania |
| F13 | Niezmienność danych historycznych | Zmiana aktualnych kursów nie zmienia kwot ani kursów zapisanych wcześniej |
| F14 | Ochrona przed duplikacją | Ponowne zasilenie lub wymiana z tym samym identyfikatorem i parametrami nie zmienia sald drugi raz i zwraca ten sam wynik biznesowy |
| F15 | Konflikt identyfikatora | Ten sam identyfikator z innymi parametrami jest odrzucany bez dodatkowej zmiany sald |
| F16 | Odtworzenie wyniku | Właściciel może sprawdzić wynik operacji po identyfikatorze żądania, także po utracie odpowiedzi |
| F17 | Walidacja serwerowa | Niepoprawne dane są odrzucane niezależnie od walidacji aplikacji mobilnej; odpowiedź zawiera kod błędu i opis |
| F18 | Oddzielenie odczytów od zmian | Odczyt portfela, historii, kursów lub statusu operacji nie wykonuje operacji finansowej |

## 3. Wymagania niefunkcjonalne

| ID | Wymaganie | Kryterium weryfikacji |
|---|---|---|
| N01 | Bezpieczne przechowywanie haseł | Baza zawiera hash hasła; odpowiedzi i logi nie zawierają hasła ani jego hasha |
| N02 | Ochrona sekretów | Sekrety są pobierane z konfiguracji środowiska; repozytorium nie zawiera rzeczywistych haseł ani kluczy |
| N03 | Precyzyjne obliczenia | Kwoty i kursy wykorzystują Decimal oraz typ NUMERIC w bazie; wynik pieniężny jest zaokrąglany do 0,01 metodą ROUND_HALF_UP |
| N04 | Spójność przy współbieżności | Przy saldzie 100 PLN dwa równoczesne zlecenia wydania po 80 PLN dają dokładnie jeden sukces, saldo 20 PLN i jedną wykonaną wymianę |
| N05 | Trwałość wyniku | Po restarcie backendu zatwierdzona operacja i ochrona przed jej powtórzeniem nadal działają |
| N06 | Ograniczony czas oczekiwania na NBP | Pojedyncza próba pobrania danych NBP ma limit 5 sekund; przekroczenie limitu daje rozpoznawalny błąd i nie powoduje częściowej operacji finansowej |
| N07 | Jednoznaczne błędy | Klient odróżnia walidację, brak uwierzytelnienia, brak uprawnień, brak środków i niedostępność źródła na podstawie statusu HTTP oraz kodu błędu |
| N08 | Chroniona komunikacja | W środowisku docelowym API jest dostępne przez HTTPS; lokalne HTTP jest dopuszczone do prac deweloperskich |
| N09 | Możliwość odtworzenia testów | Instrukcja opisuje przygotowanie bazy, uruchomienie backendu i wykonanie testów; wyniki wskazują rewizję Git |

Dla zasilenia kwota oznacza PLN.
Dla wymiany kwota wejściowa oznacza kwotę waluty źródłowej.
Szczegółowy wybór tabeli NBP i kursów kupna/sprzedaży zostanie
ustalony w kontrakcie API przed implementacją wymiany.

## 4. Odczyty i autorytatywne potwierdzenie

Odczyty obejmują portfel, historię, kursy oraz wynik operacji.
Mogą być ponawiane bez wykonania operacji finansowej.

Zasilenie i wymiana wymagają potwierdzenia backendu po zatwierdzeniu
transakcji w bazie. Timeout lub utrata połączenia nie oznaczają,
że operacja została anulowana.

Identyfikator operacji jest ustalany przed pierwszym wysłaniem
i pozostaje ten sam przy sprawdzaniu wyniku oraz ponowieniu.
Jest powiązany z użytkownikiem i parametrami operacji.

Brak znalezionego wyniku nie dowodzi, że poprzedni handler nie działa.
Ponowienie zawsze zachowuje pierwotny identyfikator, a backend
rozstrzyga równoczesne próby bez podwójnego wykonania.

## 5. Decyzje sieciowe i offline

- Nowe zasilenia i wymiany bez sieci są blokowane.
- Kolejka intencji finansowych offline nie jest używana.
- Zablokowana operacja nie wysyła żądania i nie zmienia bazy.
- Dane lokalne służą wyłącznie do odczytu i nie zastępują stanu serwera.
- Po odzyskaniu sieci klient sprawdza operacje o nieznanym wyniku,
  a następnie odświeża portfel i historię.
- Proponowany timeout klienta wynosi 10 sekund.
- Odczyty po błędzie transportowym, timeout lub HTTP 502/503/504
  mogą mieć najwyżej dwa automatyczne ponowienia, po 1 i 2 sekundach.
- Błędy walidacji i odmowy dostępu nie podlegają automatycznemu retry.
- Operacja finansowa nie otrzymuje nowego identyfikatora tylko dlatego,
  że odpowiedź nie dotarła.
- Serwer nie przyjmuje lokalnego salda jako polecenia zastąpienia salda.

Limity klienta wymagają uzgodnienia z osobą odpowiedzialną
za aplikację mobilną.

## 6. Zasady aktualności danych

Odpowiedź kursowa zawiera datę publikacji kursu.
Data pobrania nie jest traktowana jako data obowiązywania kursu.

Jeśli backend udostępnia dane z cache, odpowiedź wskazuje ich
pochodzenie oraz czas pobrania. Dane lokalne klienta również
muszą być rozpoznawalne jako ostatni znany stan.

Polityka dopuszczalnego wieku kursu dla wymiany wymaga doprecyzowania
przed implementacją. Historyczny kurs przesłany przez klienta
nie uprawnia do wykonania wymiany według tego kursu.

## 7. Macierz scenariuszy sieciowych

| ID | Scenariusz | Oczekiwany stan backendu i bazy | Oczekiwany stan widoczny dla klienta | Weryfikacja |
|---|---|---|---|---|
| S01 | Normalny odczyt | Serwer zwraca dane właściciela; brak zmiany sald | Dane pobrane poprawnie | Porównanie odpowiedzi z bazą |
| S02 | Normalna wymiana | Salda i historia zatwierdzone atomowo | Sukces po potwierdzeniu | Sprawdzenie sald, kursu i rekordu operacji |
| S03 | Utrata sieci przed wysłaniem | Brak otrzymanego żądania i zmian | Operacja nie została wysłana | Stan bazy bez zmian |
| S04 | Utrata sieci po wysłaniu | Operacja mogła zostać zatwierdzona; wynik można odtworzyć | Wynik nieznany do czasu sprawdzenia | Zapytanie o wynik i kontrola liczby zapisów |
| S05 | Timeout klienta | Nie oznacza anulowania pracy serwera | Brak fałszywego sukcesu lub odrzucenia | Sprawdzenie wyniku po timeout |
| S06 | Opóźniona odpowiedź | Jeden wynik operacji | Spóźniona odpowiedź nie zastępuje nowszego stanu | Kontrolowana kolejność odpowiedzi w teście integracyjnym |
| S07 | Retry odczytu | Brak zmiany stanu finansowego | Dane albo błąd po wyczerpaniu limitu | Liczba prób zgodna z regułą retry |
| S08 | Retry operacji finansowej | Ten sam identyfikator daje jeden efekt | Odtworzony wynik tej samej operacji | Jedno obciążenie i jeden zapis wykonanej operacji |
| S09 | Równoczesne duplikaty | Jeden efekt mimo równoległych prób | Ten sam wynik końcowy | Równoległe żądania z jednym identyfikatorem |
| S10 | Identyfikator z innymi parametrami | Konflikt; brak dodatkowej zmiany | Czytelny błąd konfliktu | Porównanie sald i historii |
| S11 | NBP niedostępny lub przekroczony limit | Rozpoznawalny błąd; brak wymiany wymagającej niedostępnego kursu | Informacja o niedostępności danych | Symulacja błędu i timeout NBP |
| S12 | Odczyt lokalnego cache offline | Backend nie jest wywoływany | Ostatnie znane dane z datą aktualizacji | Test mobilny oraz brak zmian w bazie |
| S13 | Ponowne połączenie | Dostępny wynik operacji i aktualny stan | Ustalenie wyniku, następnie odświeżenie danych | Porównanie widoku z odpowiedzią API |
| S14 | Konkurencyjne wymiany przekraczające saldo | Tylko operacje pokryte środkami są zatwierdzane | Osobny wynik każdej operacji | Dwa zlecenia po 80 PLN przy saldzie 100 PLN |
| S15 | Awaria podczas zapisu przed commit | Cała transakcja zostaje wycofana | Brak potwierdzenia sukcesu | Wymuszony błąd między zmianami sald |
| S16 | Commit zakończony, odpowiedź utracona | Wynik zapisany trwale; retry nie powtarza wymiany | Wynik odzyskany po identyfikatorze | Utrata odpowiedzi po commit i ponowienie |
| S17 | Operacja zablokowana offline | Brak żądania i zmiany danych | Informacja o wymaganym połączeniu | Kontrola bazy przed i po próbie |
| S18 | Odtwarzanie starego cache | API nie pozwala nadpisać sald kopią klienta | Stan serwera pozostaje rozstrzygający | Próba ustawienia salda jest odrzucana |

## 8. Granica odpowiedzialności

Backend odpowiada za walidację, uprawnienia, obliczenia,
trwałość wyniku, spójność i ochronę przed duplikacją.

Klient odpowiada za wykrywanie braku sieci, timeout własnego żądania,
lokalny cache i prezentację statusu. Te elementy wymagają wspólnych
testów integracyjnych, ale nie są implementowane w backendzie.