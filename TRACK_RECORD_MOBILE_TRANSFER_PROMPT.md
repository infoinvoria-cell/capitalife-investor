# Prompt: Track-Record Mobile aus Referenzprojekt uebernehmen

Nutze diesen Prompt im anderen Projekt. Ziel ist, die mobile `Track Record`-Seite aus dem Referenzprojekt so exakt wie moeglich zu uebernehmen, inklusive Layout, KPI-Karten, Chart, Tabelle, Donuts, Sparklines, Theme-Verhalten und Datenmodell.

```text
Ich moechte die mobile Track-Record-Seite aus meinem Referenzprojekt exakt in dieses Projekt uebernehmen.

Wichtig:
- Fokus ist Mobile First.
- Uebernimm nicht nur die Optik, sondern auch die verwendete Struktur, Komponentenlogik, Datenaufbereitung, Chart-/Table-Verhalten und Theme-Verhalten.
- Behalte die bestehende Code-Qualitaet des Zielprojekts bei.
- Wenn Shell-/Routing-Strukturen im Zielprojekt anders sind, adaptiere nur die Integration. Die Track-Record-UI selbst soll inhaltlich und visuell moeglichst identisch bleiben.
- Bitte arbeite direkt auf Basis der folgenden Referenzdateien.

Referenzprojekt:
- `C:\Users\joris\Documents\Invoria Dashboard`

Lade und analysiere diese Dateien zuerst:

1. Kernseite / Entry
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\app\track-record\page.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\pages\TrackRecordPage.tsx`

2. Alle Track-Record-Komponenten
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\PerformanceChart.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\PerformanceTable.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\KpiCard.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\DonutChart.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\Sparkline.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\metrics.ts`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\track-record\theme.ts`

3. Datenquellen / Vergleichsdaten
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\lib\trackRecordStore.ts`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\data\track-record-comparison-timeseries.json`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\public\track-record\trades_clean_compounded.csv`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\public\track-record\trades_appended_api.json`

4. Versteckte Abhaengigkeiten fuer Zustand / Layout
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\components\DashboardStateProvider.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\lib\dashboardStore.ts`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\app\layout.tsx`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\styles\globals.css`
- `C:\Users\joris\Documents\Invoria Dashboard\frontend\styles\dashboard.css`

Bitte uebernimm und beachte insbesondere diese Mobile-Verhalten:

- `TrackRecordPage.tsx`
  Das Mobile-Layout ist unter 768px als vertikaler Stack aufgebaut und wechselt erst auf `xl` in die 2-Spalten-Struktur.
- `PerformanceChart.tsx`
  Die Komponente nutzt ein eigenes Mobile-Viewport-Matching via `matchMedia("(max-width: 768px)")`.
  Mobile-spezifisch sind Chart-Margins, Axis-Schriftgroessen, Tick-Abstaende, Wasserzeichen-Groesse und Control-Wrapping.
- `PerformanceTable.tsx`
  Diese Datei ist fuer Mobile besonders wichtig.
  Sie hat:
  - `mobileDense`
  - `compactMode`
  - Fullscreen-Modus auf Mobile
  - 90-Grad-Rotation fuer maximale Handybreite
  - Safe-area-Padding
  - stark komprimierte Tabellen-Typografie und Spaltenbreiten fuer kleine Viewports
- `KpiCard.tsx`
  Mobile-spezifische Typografie, kompakte Abstaende und responsive Sparkline-/Content-Layouts.
- `TrackRecordPage.tsx`
  Die KPI-Karten, Donut-Groessen, Textgroessen und Mini-Visuals sind auf kleine Breiten abgestimmt.
- `dashboard.css`
  Die globalen Klassen `.ivq-terminal-page` und `.ivq-track-record-page` sind relevant, besonders diese Mobile-Regeln:
  - `@media (max-width: 768px) .ivq-terminal-page { padding: 72px 14px 22px; }`
  - `@media (max-width: 768px) .ivq-track-record-page { padding-top: 76px; }`

Wichtige Funktionsbereiche, die erhalten bleiben muessen:

- KPI-Grid mit:
  - Annual Avg Return
  - Total Return
  - Max Drawdown
  - Average Drawdown
  - Average Winning Trade
  - Winrate
  - Trades
  - Long / Short Ratio
  - Risk & Efficiency Metrics
- Performance Chart mit:
  - Multipliers 1x bis 5x
  - Compare Assets
  - Compare-Menu
  - Chart modes:
    `regular`, `warped`, `smooth`, `monthly`, `quarterly`, `yearly`
- Performance Table mit Multiplier-Wechsel
- Dark/Blue Theme-Palette aus `theme.ts`
- Modellberechnung und Datenaufbereitung aus `metrics.ts`
- Laden von historischen und appended Trades aus `trackRecordStore.ts`
- Vergleichsreihen mit S&P 500 und DAX aus `track-record-comparison-timeseries.json`

Abhaengigkeiten, die im Zielprojekt vorhanden sein muessen oder angepasst werden muessen:
- `recharts`
- `lucide-react`
- `tailwindcss`
- `zustand` nur falls der Seitenzustand/Caching wie im Referenzprojekt beibehalten wird

Integrationsregel:
- Wenn das Zielprojekt kein `DashboardStateProvider` / `dashboardStore` hat, extrahiere die Track-Record-Seite so, dass sie lokal mit React State funktioniert.
- Wenn das Zielprojekt kein `ivq`-Shell-Layout hat, ersetze nur die aeussere Shell-Integration, nicht die innere Track-Record-UI.
- Wenn Routing oder Datenpfade anders sind, passe nur die Imports und Loader an.

Bitte liefere am Ende:
1. die uebernommenen oder neu erstellten Dateien,
2. eine kurze Liste der angepassten Integrationsstellen,
3. einen Hinweis, falls irgendein Teil wegen fehlender Shell-/Store-Struktur nur sinngemaess statt 1:1 uebernommen wurde.
```

## Kurznotizen fuer dich

- Wenn du wirklich nur die eigentliche Track-Record-Mobile-UI brauchst, sind die wichtigsten Dateien:
  - `frontend/components/pages/TrackRecordPage.tsx`
  - `frontend/components/track-record/PerformanceChart.tsx`
  - `frontend/components/track-record/PerformanceTable.tsx`
  - `frontend/components/track-record/KpiCard.tsx`
  - `frontend/components/track-record/DonutChart.tsx`
  - `frontend/components/track-record/Sparkline.tsx`
  - `frontend/components/track-record/metrics.ts`
  - `frontend/components/track-record/theme.ts`

- Wenn du es wirklich 1:1 lauffaehig willst, nimm zusaetzlich dazu:
  - `frontend/app/track-record/page.tsx`
  - `frontend/lib/trackRecordStore.ts`
  - `frontend/data/track-record-comparison-timeseries.json`
  - `frontend/public/track-record/trades_clean_compounded.csv`
  - `frontend/public/track-record/trades_appended_api.json`
  - `frontend/components/DashboardStateProvider.tsx`
  - `frontend/lib/dashboardStore.ts`
  - `frontend/styles/dashboard.css`
