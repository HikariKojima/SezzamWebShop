# Vodič za puštanje u rad (Hosting & Domena) i OLX.ba integraciju za Sezzam

Ovaj dokument je pripremljen za vas i vašeg klijenta kako biste imali jasan pregled svih tehničkih detalja za puštanje aplikacije u produkciju i povezivanje sa OLX.ba platformom.

---

## 1. Hosting i server za klijenta (Zašto je SvelteKit idealan za mali paket?)

Vaš klijent je spomenuo da već ima server i domenu, ali se brine da li je paket "premalen" za promet.

### Dobra vijest:
SvelteKit je **jedan od najbržih i memorijski najefikasnijih web frameworka današnjice**. 
- Za razliku od teških WordPress/PHP sistema ili glomaznih Java servera, kompajlirana SvelteKit aplikacija zauzima **manje od 60-90 MB RAM memorije** u radu.
- Stranice se renderuju u milisekundama, a asseti (CSS/JS) su izuzetno mali.
- Baza podataka (Neon PostgreSQL) je cloud/serverless, što znači da ne troši resurse klijentovog servera!

---

## 2. Načini postavljanja na server

### Opcija A: Standardni VPS server (Ubuntu / Debian - Preporučeno)
Ako klijent ima VPS (npr. Hetzner, DigitalOcean, Contabo, Linode):

1. **Instalacija Node.js i PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Prebacivanje na `@sveltejs/adapter-node`**:
   U `package.json` i `svelte.config.js` zamijeniti `@sveltejs/adapter-auto` sa `@sveltejs/adapter-node`.
   ```bash
   npm install -D @sveltejs/adapter-node
   ```

3. **Build aplikacije**:
   ```bash
   npm run build
   ```

4. **Pokretanje servisa putem PM2**:
   ```bash
   pm2 start build/index.js --name "sezzam-webshop" --env PORT=3000
   pm2 save
   pm2 startup
   ```

5. **Nginx Reverse Proxy & SSL (Besplatan HTTPS certifikat)**:
   ```nginx
   server {
       server_name sezzam.ba www.sezzam.ba;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Aktivacija SSL-a: `sudo certbot --nginx -d sezzam.ba -d www.sezzam.ba`

---

### Opcija B: cPanel Hosting sa "Setup Node.js App" opcijom
Ako klijent ima cPanel shared hosting koji podržava Node.js:
1. U cPanelu otvorite **"Setup Node.js App"**.
2. Odaberite Node verziju (Node 20 ili 22 LTS).
3. Postavite *Application root* (folder projekta) i *Application startup file* (`build/index.js`).
4. Upišite Environment varijable u cPanel interfejsu:
   - `DATABASE_URL` = Vaš Neon PostgreSQL connection string
   - `ADMIN_PASSWORD` = Sigurna lozinka za gazdu/admina
   - `ADMIN_SESSION_SECRET` = Nasumični tajni string od 32+ karaktera
   - `ORIGIN` = `https://sezzam.ba`
5. Pokrenite aplikaciju klikom na "Run NPM Install" i "Start App".

---

## 3. Povezivanje domene (DNS postavke)

U panelu gdje je kupljena domena (npr. BHTelecom, Domene.ba, Namecheap, Cloudflare), postavite sledeće DNS zapise:

| Tip | Naziv (Host) | Vrijednost (Points to) | TTL |
|---|---|---|---|
| **A** | `@` (ili sezzam.ba) | `IP_ADRESA_SERVERA` | Automatski / 3600 |
| **CNAME** | `www` | `sezzam.ba` | Automatski / 3600 |

---

## 4. OLX.ba integracija (Automatsko dodavanje artikala)

Kada gazda doda proizvod na webshop (npr. Decking, Laminat, Cement), proizvod može automatski otići i na OLX.ba profil radnje.

### Kako funkcioniše OLX.ba API:
1. **OLX Pro račun**: Potrebno je da klijent ima verifikovan **OLX Pro / OLX Radnja** nalog.
2. **Kreiranje API tokena**:
   - U postavkama OLX radnje zatraži se API pristup (Bearer Token / API Key).
3. **Endpoint za objavu artikla**:
   - `POST https://api.olx.ba/v1/articles`
   - Šalju se podaci:
     - `title`: Naziv proizvoda
     - `category_id`: ID kategorije na OLX-u (npr. Građevinski materijali / Podne obloge)
     - `price`: Cijena u KM
     - `state`: Novo (`1`)
     - `description`: Opis proizvoda sa webshopa + link na webshop
     - `images`: Slike artikla

### Plan za fazu aktivacije:
- U formi za unos/uređivanje proizvoda u adminu (`/admin/products/new` i `/admin/products/[id]`) dodaje se prekidač:
  - `[x] Objavi i na OLX.ba`
  - Polje: `OLX Kategorija ID`
- Prilikom klika na "Sačuvaj proizvod", server šalje HTTP POST na OLX API i vraća link objavljenog artikla na OLX-u.

---

## 5. Kontrolna lista prije puštanja u rad (Checklist)

- [ ] Promijeniti `ADMIN_PASSWORD` u `.env` na produkcijskom serveru.
- [ ] Postaviti novu nasumičnu vrijednost za `ADMIN_SESSION_SECRET`.
- [ ] Provjeriti da `DATABASE_URL` vodi na Neon bazu sa SSL parametrom (`?sslmode=require`).
- [ ] Postaviti `ORIGIN=https://sezzam.ba` kako bi SvelteKit CSRF zaštita radila ispravno.
- [ ] Testirati slanje jedne testne narudžbe za Gotovinu i jedne za Žiro račun.
