# Use Case Dijagram — Travel Planner App

## Akteri

| Akter | Opis |
|-------|------|
| Korisnik | Registrovani korisnik sistema |
| Admin | Administrator sa dodatnim ovlašćenjima |
| Gost | Neregistrovani korisnik sa share linkom |

---

## Use Cases

### Korisnik

#### Autentikacija
- Registracija (ime, email, lozinka)
- Login
- Logout

#### Upravljanje putovanjima
- Kreiranje putovanja
- Pregled liste putovanja
- Pregled detalja putovanja
- Izmjena putovanja
- Brisanje putovanja (cascade delete)

#### Upravljanje destinacijama
- Dodavanje destinacije
- Pregled destinacija
- Izmjena destinacije
- Brisanje destinacije

#### Upravljanje aktivnostima
- Dodavanje aktivnosti
- Pregled aktivnosti grupisanih po datumu
- Izmjena aktivnosti
- Brisanje aktivnosti
- Prikaz na kalendaru
- Prikaz na mapi (ruta kretanja)

#### Upravljanje troškovima
- Dodavanje troška
- Pregled troškova po kategorijama
- Pregled budžeta i preostalog iznosa
- Brisanje troška

#### Checklist
- Dodavanje stavke
- Označavanje stavke kao završene
- Brisanje stavke

#### Dijeljenje putovanja
- Generisanje QR koda sa VIEW pristupom
- Generisanje QR koda sa EDIT pristupom
- Revokovanje tokena

---

### Admin
- Sve što može Korisnik +
- Pregled svih korisnika
- Izmjena uloge korisnika (User/Admin)
- Brisanje korisnika

---

### Gost (Share link)
- Pregled putovanja sa VIEW tokenom
- Izmjena aktivnosti sa EDIT tokenom
- Backend validira token pri svakom zahtjevu

---

## Dijagram

```
+------------------+          +--------------------------------+
|                  |          |     Travel Planner System      |
|    Korisnik      |--------->| Registracija / Login / Logout  |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Kreiranje/pregled/izmjena/     |
|                  |          | brisanje putovanja             |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Upravljanje destinacijama      |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Aktivnosti / Kalendar / Mapa   |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Troškovi / Budžet              |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Checklist                      |
|                  |          +--------------------------------+
|                  |          +--------------------------------+
|                  |--------->| Dijeljenje / QR kod            |
+------------------+          +--------------------------------+

+------------------+          +--------------------------------+
|                  |          |     Travel Planner System      |
|     Admin        |--------->| Sve što može Korisnik +        |
|                  |          | Upravljanje korisnicima        |
+------------------+          +--------------------------------+

+------------------+          +--------------------------------+
|                  |          |     Travel Planner System      |
|      Gost        |--------->| Pregled putovanja (VIEW)       |
|   (share link)   |--------->| Izmjena aktivnosti (EDIT)      |
+------------------+          +--------------------------------+
```