# AP-Bau UG (haftungsbeschränkt) – Meisterbetrieb · Website

Statische Firmenwebsite für die **AP-Bau UG (haftungsbeschränkt)**, Weberstraße 20, 65604 Elz.
Kein Build-Prozess, keine Abhängigkeiten – reines HTML, CSS und Vanilla-JavaScript.
Läuft auf jedem Webspace und auf GitHub Pages.

---

## Struktur

```
.
├── index.html            Startseite (Hero, Leistungen, Über uns, Ablauf,
│                         Einsatzgebiet, FAQ, Kontakt)
├── impressum.html        Impressum (§ 5 DDG)
├── datenschutz.html      Datenschutzerklärung (DSGVO)
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/style.css     komplettes Stylesheet
    ├── js/main.js        Menü, Öffnungszeiten-Status, Formular, Animationen
    └── img/
        ├── logo.svg        Logo für helle Flächen (Header)
        ├── logo-light.svg  Logo für dunkle Flächen (Footer)
        └── favicon.svg     Browser-Icon
```

## Lokal ansehen

```bash
python3 -m http.server 8000
# danach http://localhost:8000 im Browser öffnen
```

---

## Vor dem Live-Gang anpassen

### 1. Logo austauschen (wichtig)

`assets/img/logo.svg` und `assets/img/logo-light.svg` sind Platzhalter im Stil der Firma.
Ersetzen Sie beide Dateien durch das Original-Logo – am besten wieder als SVG
(alternativ PNG mit transparentem Hintergrund, mindestens 600 px breit).
Bei einem PNG zusätzlich die Dateiendung in allen drei HTML-Dateien anpassen:

```bash
grep -rn "logo.svg\|logo-light.svg" *.html
```

Die helle Variante (`logo-light.svg`) wird im dunklen Footer verwendet – dort braucht
die Schrift eine helle Farbe.

### 2. E-Mail-Adresse eintragen

Aktuell ist überall die Platzhalter-Adresse `info@ap-bau-ug.de` hinterlegt:

```bash
grep -rn "info@ap-bau-ug.de" . --include="*.html" --include="*.js"
```

Anpassen in `index.html`, `impressum.html`, `datenschutz.html` und in
`assets/js/main.js` (Konstante `EMPFAENGER`).

### 3. Impressum vervollständigen (rechtlich verpflichtend)

In `impressum.html` sind alle noch fehlenden Angaben mit `[…]` markiert:
Geschäftsführer, Registergericht + HRB-Nummer, USt-IdNr., Handwerkskammer,
Handwerksrollen-Nummer und Berufshaftpflichtversicherung.
Ein unvollständiges Impressum ist abmahnfähig.

In `datenschutz.html` fehlt noch der Name des Hosting-Anbieters (Abschnitt 3).

### 4. Domain eintragen

In `index.html` und `sitemap.xml` steht `https://www.ap-bau-ug.de/` als Beispiel-Domain.
Diese in der `<link rel="canonical">`-Zeile, den Open-Graph-Tags, dem JSON-LD-Block
und in `sitemap.xml` durch die echte Domain ersetzen.

### 5. Öffnungszeiten prüfen

Angesetzt sind **Mo–Do 07:00–17:00, Fr 07:00–15:00**, Samstag nach Vereinbarung.
Falls das nicht stimmt, an drei Stellen anpassen:

| Datei | Stelle |
|---|---|
| `index.html` | Tabelle `<ul class="hours" id="hours">` |
| `index.html` | JSON-LD-Block `openingHoursSpecification` (für Google) |
| `assets/js/main.js` | Objekt `HOURS` (Minuten seit Mitternacht, `7*60 = 420`) |

Die Status-Anzeige oben rechts („Jetzt geöffnet · bis 17:00“) berechnet sich daraus automatisch.

---

## Kontaktformular

Ohne Server-Backend kann eine statische Seite keine E-Mails versenden. Das Formular
öffnet deshalb eine fertig ausgefüllte E-Mail im Mailprogramm des Besuchers
(`mailto:`) – funktioniert überall, erfordert aber einen Klick mehr.

**Für echten Direktversand** genügt ein kostenloser Formulardienst, z. B. Formspree:

1. Auf [formspree.io](https://formspree.io) ein Formular anlegen und die Endpoint-URL kopieren.
2. In `index.html` das Form-Tag ändern:
   ```html
   <form class="form reveal" id="contactForm" method="POST"
         action="https://formspree.io/f/IHRE-ID">
   ```
3. In `assets/js/main.js` den kompletten `form.addEventListener('submit', …)`-Block
   entfernen, damit das Formular normal abgeschickt wird.
4. In `datenschutz.html` Abschnitt 4.1 anpassen – der Dienst ist dann Auftragsverarbeiter
   und ein AV-Vertrag ist nötig.

Das versteckte Feld `name="website"` ist eine Spam-Falle (Honeypot) und muss erhalten bleiben.

---

## Google Fonts lokal einbinden (optional, datenschutzfreundlicher)

Spart die Verbindung zu Google-Servern und macht Abschnitt 5 der Datenschutzerklärung überflüssig:

1. Schriftdateien von [gwfh.mranftl.com](https://gwfh.mranftl.com/fonts/inter) als WOFF2 laden
   (Schnitte 400, 600, 700, 800) und nach `assets/fonts/` legen.
2. In allen drei HTML-Dateien die drei Google-Fonts-Zeilen (`preconnect` + `stylesheet`) löschen.
3. Am Anfang von `assets/css/style.css` `@font-face`-Regeln ergänzen.

---

## Veröffentlichen

**Klassischer Webspace:** alle Dateien per FTP in das Web-Verzeichnis hochladen
(Ordnerstruktur beibehalten). Fertig.

**GitHub Pages:** im Repository unter *Settings → Pages* als Quelle den Branch
und den Ordner `/ (root)` wählen.

**Netlify / Vercel:** Repository verbinden, Build-Befehl leer lassen,
Publish-Verzeichnis `.`.

Nach dem Live-Gang: Domain und Sitemap in der
[Google Search Console](https://search.google.com/search-console) eintragen und
das Google-Unternehmensprofil mit denselben Daten (Name, Adresse, Telefon) pflegen –
das ist für die lokale Auffindbarkeit wichtiger als jede Suchmaschinenoptimierung
auf der Seite selbst.

---

## Technisches

- Responsiv ab 320 px, mobile Navigation, feste Anruf-Leiste auf dem Smartphone
- Sprungmarke „Zum Inhalt springen“, sichtbare Fokus-Ringe, ARIA-Attribute an
  Menü und Statusanzeige
- `prefers-reduced-motion` wird respektiert (alle Animationen aus)
- Strukturierte Daten (JSON-LD, `GeneralContractor`) für Google-Rich-Results
- Druck-Stylesheet: Navigation, Formular und Call-to-Action-Bänder werden ausgeblendet
- Keine Cookies, kein Tracking, keine externen Skripte
