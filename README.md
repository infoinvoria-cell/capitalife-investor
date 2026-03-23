# CAPITALIFE Investor Web App

Diese Anwendung ist als produktionsfaehige Next.js Investor App mit App Router, Tailwind CSS und TypeScript vorbereitet. Die Struktur ist auf GitHub und Vercel Deployment ausgelegt.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Lucide
- Figtree

## Installation

```powershell
npm install
```

## Production Scripts

```powershell
npm run dev
npm run build
npm run start
npm run typecheck
```

## Struktur

```text
app/
api/
components/
data/
styles/
public/
  assets/
```

Hinweis:
Die App nutzt den Next.js App Router, daher ist kein separates `pages/` Verzeichnis noetig.

## Deployment

1. `npm install`
2. `npm run build`
3. Ordner nach GitHub hochladen
4. Repository in Vercel importieren

## Hinweise

- Alle statischen Assets liegen unter `public/assets`.
- Es gibt keine hardcodierten lokalen Dev-Hosts oder festen Build-IDs mehr.
- Track Record, Zukunft, Sicherheit und Strategie sind als eigene Routen vorbereitet.
