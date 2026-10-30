1. Cel projektu
   Celem projektu jest zaprojektowanie i implementacja mobilnego systemu umożliwiającego użytkownikowi wykonywanie podstawowych operacji związanych z wymianą walut.

Projekt ma służyć praktycznemu zastosowaniu zagadnień związanych z:

tworzeniem aplikacji mobilnych,
komunikacją aplikacji mobilnej z usługą sieciową,
projektowaniem i wykorzystaniem bazy danych,
realizacją logiki biznesowej po stronie serwera,
integracją z zewnętrznym API,
uwierzytelnianiem i autoryzacją użytkowników.
Źródłem danych dotyczących kursów walut powinno być publiczne API Narodowego Banku Polskiego.

2. Zakres projektu
   A. Aplikacja mobilna
   Aplikacja mobilna powinna umożliwiać:

rejestrację użytkownika,
logowanie użytkownika,
zasilenie konta za pomocą symulowanego przelewu wirtualnego,
podgląd aktualnych kursów walut pobieranych z API NBP,
podgląd archiwalnych kursów walut,
realizację transakcji kupna i sprzedaży waluty,
podgląd aktualnego stanu portfela walutowego,
podgląd historii wykonanych transakcji.
B. Web Service
Usługa sieciowa powinna odpowiadać za:

realizację logiki biznesowej kantoru,
komunikację z aplikacją mobilną,
integrację z API NBP w celu pobierania kursów walut,
obsługę kont użytkowników,
uwierzytelnianie i autoryzację użytkowników,
walidację danych przesyłanych przez aplikację mobilną,
realizację operacji na portfelach walutowych użytkowników,
rejestrowanie wykonanych transakcji.
Logika dotycząca salda użytkownika oraz realizacji transakcji powinna znajdować się po stronie serwera. Aplikacja mobilna nie może samodzielnie ustalać ani modyfikować stanu środków użytkownika.

C. Baza danych
Baza danych powinna przechowywać co najmniej:

informacje o użytkownikach,
informacje o posiadanych przez użytkownika środkach,
historię wykonanych transakcji,
kurs waluty wykorzystany podczas wykonania konkretnej transakcji,
datę i czas wykonania transakcji.
Ważne: operacja wymiany waluty oraz odpowiadające jej zmiany sald powinny być realizowane w sposób zapewniający spójność danych. 3. Etapy realizacji
Część 1 — projekt koncepcyjny
Etap analityczno-projektowy obejmuje:

opracowanie wymagań funkcjonalnych i niefunkcjonalnych systemu,
przygotowanie diagramu przypadków użycia UML,
przygotowanie diagramu klas dla projektowanego systemu,
zaprojektowanie modelu bazy danych i przygotowanie diagramu ERD,
opis proponowanej architektury systemu i sposobu komunikacji pomiędzy komponentami.
Forma oddania: raport w formacie PDF oraz pliki źródłowe przygotowanych diagramów.

Część 2 — implementacja
Etap programistyczny obejmuje:

implementację aplikacji mobilnej w wybranym języku lub środowisku, np. Kotlin, Flutter lub React Native,
implementację Web Service, np. z wykorzystaniem Java Spring Boot, Node.js lub .NET,
implementację bazy danych, np. PostgreSQL, MySQL lub SQLite,
integrację aplikacji mobilnej, Web Service, bazy danych oraz API NBP,
przetestowanie podstawowych scenariuszy działania systemu,
przygotowanie krótkiej dokumentacji użytkownika oraz instrukcji uruchomienia systemu.
Forma zaliczenia: prezentacja projektu połączona z demonstracją działania aplikacji.

4. Wymagania dotyczące realizacji transakcji
   Student powinien jednoznacznie określić sposób wykorzystania kursów pobieranych z API NBP podczas realizacji operacji kupna i sprzedaży walut.

Każda wykonana transakcja powinna zawierać co najmniej:

rodzaj operacji,
walutę źródłową,
walutę docelową,
kwotę transakcji,
kurs zastosowany podczas transakcji,
datę i czas wykonania transakcji.
Kurs zastosowany podczas transakcji powinien zostać zapisany razem z transakcją. Późniejsza zmiana kursów walut nie może zmieniać danych historycznych dotyczących wcześniej wykonanych operacji.
