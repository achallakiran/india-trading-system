# 🇮🇳 India Trading System
> Paper trading journal, backtester, screener, knowledge repo & news tracker for Indian equity markets.
> Live at: **https://achallakiran.github.io/india-trading-system**

---

## 🚀 One-Time Setup (4 commands)

### Prerequisites
- [Git](https://git-scm.com/downloads) installed
- [Node.js](https://nodejs.org/) (v18+) installed
- GitHub account: `achallakiran`

### Step 1 — Create GitHub Repo
1. Go to https://github.com/new
2. Repository name: `india-trading-system`
3. Set to **Public**
4. Click **Create repository**

### Step 2 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 3 — Push this code

```bash
# Unzip the downloaded folder, then open terminal inside it:

git init
git add .
git commit -m "Initial: India Trading System"
git branch -M main
git remote add origin https://github.com/achallakiran/india-trading-system.git
git push -u origin main
```

### Step 4 — Wait ~2 minutes
GitHub Actions will automatically build and deploy.
Your site will be live at: **https://achallakiran.github.io/india-trading-system**

---

## 📱 How to Use

| Page | Purpose |
|---|---|
| **Dashboard** | Overview of your paper trading performance |
| **Journal** | Log every paper trade — intraday, swing, long-term |
| **Backtester** | Simulate strategies before trading |
| **Screener** | Strategy playbook + Nifty 50 watchlist |
| **Knowledge** | Your growing Indian markets curriculum |
| **News & Events** | Track macro events and their trade impact |

---

## 🔄 Updating the Site

Every time you push code to `main`, the site auto-deploys:

```bash
git add .
git commit -m "Update: [what you changed]"
git push
```

---

## 📊 Data Storage
All your trade data is stored in your browser's localStorage.
To back it up, use the Export feature (coming in Phase 2).

---

## 🗺️ Roadmap
- **Phase 1** (Now): Paper trading journal + learning tools
- **Phase 2**: Groww API integration for live data
- **Phase 3**: Automated screener + alerts
- **Phase 4**: Real money trading with proven strategy
