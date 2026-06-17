# Stationfall — datový balík (CZ)

Strukturovaná data pro mobilního pravidlového průvodce hrou **Stationfall / Zkáza na orbitě**
(Matt Eklund, Fox in the Box). Veškerý obsah je v češtině a citován co nejvěrněji oficiálním
materiálům. Slouží jako stack-nezávislý zdroj pravdy pro MVP (pilíře: Reference postav,
Glosář, Interaktivní průvodci).

## Soubory

| Soubor | Obsah | Počet |
|---|---|---|
| `schema.ts` | TypeScript typy (zdroj pravdy pro tvary dat) | — |
| `characters.json` | Postavy: schopnosti, reveal, úkoly s body, zvláštnosti, tipy | 28 |
| `glossary.json` | Pojmy, stavy, předměty, data, nebezpečí, systémy, sekce, akce, sdílené schopnosti | 109 |
| `flows.json` | Procedurální kauzální průvodci (krokové) | 4 |
| `faq.json` | Kurátorované Otázky & kauzality (how/can/does) | 31 |
| `projectsX.json` | Karty Projektů X | 8 |

### Flows (průvodci)
1. `konec-hry-scoring` — Pád stanice a počítání bodů (závěrečná sekvence)
2. `detonace-antihmoty` — odjištění + 3 výsledky dle pozice
3. `uroven-energie-blackout` — Běžná → Záložní → Blackout + obnovení
4. `spusteni-projektu-x-flow` — spouštěče + nestvůra

## Zdroje (provenance)

- **Referenční příručka** (`CZ_Stationfall_manual.pdf`) — kanonická pravidla, klauzule 1–18.
  Čísla klauzulí jsou v polích `ruleRefs`.
- **Složky postav** (`CZ_Stationfall_postavy.pdf`) — zdroj pro `characters.json` a `projectsX.json`
  (setup, schopnosti, úkoly, zvláštnosti, tipy).
- **Ultimate Character Guide** (EN), str. 1 — **autoritativní barevná tabulka kategorií** pro
  VŠECHNY schopnosti (základní i po odhalení); zdroj pravdy pro pole `category`.
- **Přehled postav a schopností** (`Stationfall_CZ-characters-sheet.pdf`) — křížová kontrola
  barev základních schopností.
- **Cheatsheet** + **Player Aid** — glosář (stavy, předměty, akce, systémy).
- **BGG rules fórum** — `faq.json`: zejm. vlákno „Massive FAQ" (Petr Pospíšil, autor CZ překladu)
  + designerova upřesnění (Andy Mesa). Každá Q&A má pole `source` a křížově ověřena proti příručce.

## Konvence

- `id`: kebab-case bez diakritiky.
- `category` (6 barev): `pohybove` (žlutá), `obranne` (zelená), `utocne` (červená),
  `konspiracni` (fialová), `ovladaci-panel` (oranžová), `doplnkove` (růžová).
- `ruleRefs`: čísla klauzulí referenční příručky pro hloubkový odkaz.
- `seeAlso`: id jiných pojmů v glosáři **nebo** id flow — pro cross-linking v UI.
- `relatedCharacterIds`: postavy, u kterých se sdílená schopnost objevuje.
- `agendas[].isPlus`: řádek úkolu se znaménkem „+“ (zisk vyžaduje i nejbližší předchozí řádek bez „+“).

## Poznámky k jistotě a known caveaty

- **Kategorie schopností** (základní i reveal): autoritativní — odečteno z barevné tabulky
  Ultimate Character Guide (str. 1), která barevně odlišuje všech 6 kategorií. Zkalibrováno na
  jistých případech; opraveno 13 kategorií oproti první (renderem zkreslené) extrakci.
- **Kyborg** `type`: karta uvádí „Člověk a robot"; uloženo jako `clovek` dle zvláštnosti
  (pro útoky/okradení/nebezpečí je považován za člověka). Dualita popsána v `edgeCases`.
- **Drony**: nemají limit vlivu (uloženo `0`), úkoly ani reveal schopnost; dvě startovní lokace.
- **Postavy s více startovními lokacemi** (Miliardář, Drony, Údržbářské klony): `startSection`
  vynecháno, lokace popsány v `setup`.
- **Právník `startSection`**: „Záďový uzel" (od „záď" = zadní část stanice).
- **Řazení `characters.json`**: ASCII (Č, Ú na konci). Aplikace nechť řadí dle `cs` locale za běhu.
- Sdílené schopnosti mají kanonickou definici v `glossary.json`; per-postava text je v
  `characters.json` (může se drobně lišit formulací dle karty).

## Validace

`characters.json`, `glossary.json`, `flows.json`, `projectsX.json` prošly kontrolou:
unikátní `id`, platné `type`/`kind`/`category`, všechny `relatedCharacterIds` a `seeAlso`
ukazují na existující cíle (0 chyb, 0 dangling).
