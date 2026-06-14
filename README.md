# TravelPlanner App

Web aplikacija za planiranje putovanja razvijena kao mikroservisna arhitektura koristeći Microsoft Service Fabric, React i SQL Server.

## Tehnologije

**Backend:**
- Microsoft Service Fabric
- ASP.NET Core 8
- Entity Framework Core 8
- SQL Server Express
- JWT autentikacija
- BCrypt

**Frontend:**
- React 19
- Vite
- React Router DOM
- Axios
- Leaflet (mapa)

## Arhitektura

Sistem se sastoji od 4 mikroservisa:

| Servis | Tip | Port | Opis |
|--------|-----|------|------|
| UserService | Stateless | 5199 | Registracija, login, upravljanje korisnicima |
| TripService | Stateless | 5195 | Upravljanje putovanjima i destinacijama |
| ActivityService | Stateless | 5164 | Aktivnosti, troškovi, checklist |
| SharingService | Stateful | 5200 | Dijeljenje putovanja, QR kod, audit log |

## Preduslovi

Prije pokretanja instaliraj:

- [Visual Studio 2022](https://visualstudio.microsoft.com/) sa **Azure development** workload-om
- [Service Fabric SDK](https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- [Node.js LTS](https://nodejs.org/)

## Pokretanje projekta

### Korak 1 — Podesi SQL Server

Otvori SSMS i pokreni:

```sql
USE master;
GO
CREATE LOGIN travelplanner WITH PASSWORD = 'Travel123!';
ALTER SERVER ROLE sysadmin ADD MEMBER travelplanner;
GO
```

U SSMS desni klik na server → **Properties** → **Security** → izaberi **SQL Server and Windows Authentication mode** → restart SQL Server.

### Korak 2 — Pokreni Service Fabric klaster

Otvori **PowerShell kao Administrator**:

```powershell
Start-Service FabricHostSvc
```

Provjeri da klaster radi:
http://localhost:19080/Explorer

Treba da vidiš 5 zelenih čvorova.

### Korak 3 — Pokreni backend

Otvori `TravelPlannerApp.sln` u **Visual Studio 2022 kao Administrator** i pritisni **F5**.

Sačekaj da se deploy završi. Provjeri u SF Explorer da su svi servisi zeleni.

Swagger UI:
http://localhost:5199/swagger  → UserService
http://localhost:5195/swagger  → TripService
http://localhost:5164/swagger  → ActivityService
http://localhost:5200/swagger  → SharingService

### Korak 4 — Pokreni frontend

```bash
cd travel-planner-frontend
npm install
npm run dev
```

Otvori browser:
http://localhost:5173

## Funkcionalnosti

- ✅ Registracija i login korisnika
- ✅ Kreiranje, pregled, izmjena i brisanje putovanja
- ✅ Upravljanje destinacijama
- ✅ Organizacija aktivnosti po danima
- ✅ Evidencija troškova i budžet
- ✅ Packing checklist
- ✅ Dijeljenje putovanja putem QR koda (VIEW/EDIT pristup)
- ✅ Prikaz rute na interaktivnoj mapi
- ✅ Kalendar prikaz aktivnosti
- ✅ Admin panel za upravljanje korisnicima

## Nadogradnja

Implementiran prikaz plana putovanja na interaktivnoj mapi koristeći **Leaflet** i **OpenStreetMap**:
- Markeri za svaku lokaciju aktivnosti
- Numerisani redoslijed obilaska po datumu
- Linija rute između lokacija

## Git repozitorijum
https://github.com/Majaaa3/TravelPlannerApp