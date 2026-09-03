# Praktični Vodič za Google Rangiranje i SEO za Sezzam WebShop

Ovaj dokument služi vama i vašem klijentu kao detaljan vodič: šta je urađeno u kodu web aplikacije i koje jednostavne korake klijent treba preduzeti kako bi se **Sezzam** pojavio na prvom mjestu Google pretrage.

---

## 1. Kako saznati i provjeriti tačnu domenu?

Klijent se možda pita: _"Koja je tačno naša zvanična internet adresa (domena)?"_

Evo kako to možete 100% provjeriti:

1. **Faktura / Email od hosting provajdera**:
   - Provjerite email gdje je domena kupljena (npr. Leftor, UTIC / ba.nic.ba, Hostinger, GoDaddy, itd.). Tamo piše tačan naziv, npr. `sezzam.ba`.
2. **Hosting kontrolni panel (cPanel / Plesk / Cloudflare)**:
   - Kada se klijent prijavi na svoj hosting račun, pod sekcijom **"Domains"** (Domene) nalazi se tačan naziv.
3. **Nginx serverska konfiguracija**:
   - Na samom serveru (kako je definisano u našem vodiču za deployment), domena je postavljena kao:
     - Primarna: `https://sezzam.ba`
     - Alternativna (sa www): `https://www.sezzam.ba`

_Napomena u kodu:_ Aplikacija automatski koristi `https://sezzam.ba`, a po želji u `.env` fajlu na serveru možete podesiti `PUBLIC_SITE_URL=https://vasadomena.ba` ukoliko koristite testnu ili drugu adresu.

---

## 2. Šta je sve implementirano u webshop aplikaciji?

U aplikaciji je pripremljena kompletna tehnička SEO optimizacija:

1. **Meta Naslovi i Opisi (Title & Description)**:
   - Svaka stranica sada ima optimizovane naslove i opise prilagođene bh. tržištu.
   - Uključene su ključne riječi: **WPC Decking sistemi, daske za terase i bazene, SPC podovi, LVT podovi, podne obloge, Sezzam, Sarajevo, Bosna i Hercegovina**.
2. **Google Rich Snippets (Strukturirani podaci - Schema.org JSON-LD)**:
   - Implementiran je Google standard za lokalne biznise (`HomeAndConstructionBusiness`) sa brojem telefona (`+387 61 069 798`), lokacijom i radnim vremenom.
   - Google robotima se direktno šalje katalog artikala sa cijenama u **BAM (KM)** i oznakama dostupnosti (Dostupno odmah / Po narudžbi).
3. **Automatski `sitemap.xml`**:
   - Google robotima je na adresi `https://sezzam.ba/sitemap.xml` dostupan dinamički indeks svih kategorija i proizvoda.
4. **Zaštićen `robots.txt`**:
   - Pretraživačima je dozvoljeno indeksiranje svih javnih stranica i proizvoda, dok je administratorski dio (`/admin`) blokiran kako bi se zaštitila privatnost i sačuvao budžet indeksiranja.
5. **Open Graph & Društvene mreže**:
   - Kada neko pošalje link na WhatsApp, Viber, Facebook ili Messenger, automatski se prikazuje lijepa sličica, tačan naslov i opis brenda.

---

## 3. Korak-po-korak: Prijava na Google Search Console (Besplatno i obavezno)

Da Google ne bi čekao sedmicama da sam "otkrije" sajt, vlasnik domene treba uraditi sljedeće:

1. Otvorite **[Google Search Console](https://search.google.com/search-console)** i prijavite se sa Google (Gmail) računom firme.
2. Kliknite na **"Add property"** (Dodaj svojstvo).
3. Odaberite **URL prefix** i unesite: `https://sezzam.ba`.
4. **Verifikacija vlasništva**:
   - Najlakši način je preko **HTML tag-a** ili postavljanja verifikacionog fajla na server, ili preko DNS TXT zapisa kod provajdera domene.
5. **Slanje Sitemapa**:
   - U lijevom meniju kliknite na **"Sitemaps"** (Mape sajta).
   - U polje unesite: `sitemap.xml` i kliknite **Submit** (Pošalji).
   - _Rezultat:_ Google će u roku od 24–72 sata posjetiti sve stranice i uvrstiti ih u pretragu!

---

## 4. Kako do 1. mjesta na Google-u za lokalne kupce? (Google Business Profile)

Najbrži način da se Sezzam prikaže **na samom vrhu Google pretrage i Google Mapa** (iznad svih običnih web sajtova):

1. Otvorite **[Google Business Profile](https://www.google.com/business/)**.
2. Upišite naziv firme: **Sezzam - Građevinski materijali & WPC Decking**.
3. Odaberite primarnu kategoriju: _Građevinski materijal (Building materials store)_ ili _Podopolagački radovi / Podne obloge_.
4. Povežite već postojeću lokaciju na Google Mapama:
   - Skladište i prodajno mjesto u BiH.
5. Unesite zvanični web sajt: `https://sezzam.ba`.
6. Unesite telefon: `+387 61 069 798`.
7. **Fotografije i Recenzije**:
   - Postavite slike skladišta, WPC dasaka, SPC i LVT uzoraka.
   - Zamolite prvih nekoliko zadovoljnih kupaca da ostave ocjenu sa 5 zvjezdica. Firme sa recenzijama Google automatski stavlja na 1. mjesto!

---

## 5. Povezivanje sa OLX.ba i društvenim mrežama (Backlink strategija)

Google rangira stranice na osnovu **povjerenja**. Što više relevantnih sajtova ima link koji vodi na `sezzam.ba`, to je stranica jača na pretrazi:

- **OLX.ba**: U svakom oglasu (za WPC, podove, izolaciju) dodajte rečenicu:
  > _"Pogledajte kompletan asortiman i trenutno stanje zaliha na našem webshopu: https://sezzam.ba"_
- **Instagram & Facebook**: U opis profila (Bio) stavite link `https://sezzam.ba`.
- **Lokalni portali i poslovni registri**: Uvrstite firmu u bosanskohercegovačke poslovne imenike.

---

## 6. Ako klijent želi garantovano 1. mjesto odmah danas: Google Ads

Ako klijent želi da se za pretragu _"WPC decking BiH"_ ili _"prodaja građevinskog materijala"_ pojavi na 1. poziciji istog momenta:

- Pokretanjem jednostavne **Google Search kampanje** (Google Ads) sa budžetom od npr. 5 do 10 KM dnevno, webshop se prikazuje na vrhu iznad svih organskih rezultata sa oznakom "Sponzorisano".
