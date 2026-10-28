# Greenfabric: Shopify-Theme

Eigenes Shopify-Theme für Green Fabric, gebaut auf [Dawn 16.0.0](https://github.com/Shopify/dawn)
(Original-Readme: [DAWN-README.md](DAWN-README.md)). Shopify bleibt die einzige Quelle für
Produkte, Preise, Checkout und Zahlungen. Aussehen und Bewegung folgen der Dr.-Sleep-Seite,
in Grün statt Nachtblau.

## Was dazugekommen ist

| Datei | Inhalt |
| --- | --- |
| `assets/gf-signatur.css` | Farben, Schriften, Bausteine für Bewegung, Aussehen aller gf-Sektionen |
| `assets/gf-bewegung.js` | Einblenden, Parallax, Hero, Linien, Zähler; meldet Sektionen im Theme-Editor neu an |
| `snippets/gf-schriften.liquid` | EB Garamond und Inter, selbst gehostet, mit Kyrillisch |
| `sections/gf-hero.liquid` | Vollbild-Hero mit Vorhang, Zeilen-Auftritt, Parallax |
| `sections/gf-doppelbelichtung.liquid` | dunkler Abschnitt, schiebt sich weich ins Bild davor |
| `sections/gf-schritte.liquid` | Schritte mit Linie, die sich beim Scrollen zeichnet |
| `sections/gf-beratung.liquid` | Schlussabschnitt mit Bild und zwei Knöpfen |
| `templates/index.json` | Startseite: Hero, Doppelbelichtung, Modelle (Dawn), Schritte, Beratung |
| `config/settings_data.json` | Farbschemata in Greenfabric-Farben, runde Knöpfe |

Die Sektionen heißen im Theme-Editor „GF …“. Texte, Bilder, Links und Reihenfolge lassen sich
dort ohne Code ändern.

## Sprachen

Bulgarisch ist die Hauptsprache des Shops (Einstellungen, Sprachen). Englisch und Deutsch
kommen als weitere Sprachen dazu; feste Texte übersetzt Dawn schon (`locales/bg.json`,
`de.json`, `en.default.json`), Inhalte übersetzt die kostenlose App „Translate & Adapt“.

## Ablauf

* `main` ist mit dem Live-Theme verbunden (Onlineshop, Themes, „Von GitHub verbinden“).
* Änderungen kommen über Branches und Pull Requests, eine Vorschau über ein zweites,
  unveröffentlichtes Theme auf einem Vorschau-Branch.
* Prüfung vor jedem Merge: `shopify theme check` (oder `@shopify/theme-check-node`).
