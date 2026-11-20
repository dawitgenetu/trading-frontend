# Elite Trade Journal - Frontend UI ⚡

A high-performance, dark-mode-first trading journal interface built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Features
- **Streamlined Trade Entry**: 5-second entry form with 1-click presets for XAUUSD (Gold), EURUSD, GBPUSD, and live leverage / risk calculators.
- **Journal & Trade Drawer**: View open and closed trades, edit trades, and execute 1-click **Quick Close** with instant realized P&L calculations.
- **Performance Analytics**: Win rate, profit factor, drawdown tracking, calendar views, and strategy breakdown.
- **Single-Trader Personal Workspace**: Bypasses login gates directly into the journal for the master trader.
- **Multi-Account & Strategy Management**: Track live and demo accounts with real-time balance sync.

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/dawitgenetu/trading-frontend.git
   cd trading-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   VITE_API_BASE=https://your-backend.onrender.com/api
   ```
   *(Note: When developing locally with Vite proxy, `VITE_API_BASE=/api` connects directly to local port 5000).*

4. Run locally:
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   ```

## Deploy to Vercel / Netlify
This repository includes a pre-configured `vercel.json` for client-side SPA routing.
1. Import repository to [Vercel](https://vercel.com).
2. Set Environment Variable: `VITE_API_BASE` pointing to your deployed backend (e.g. `https://your-backend.onrender.com/api`).
3. Deploy!
