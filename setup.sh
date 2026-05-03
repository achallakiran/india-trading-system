#!/bin/bash
# India Trading System — One-shot setup & deploy
# Run this ONCE after creating your GitHub repo

echo "🇮🇳 India Trading System — Setup"
echo "=================================="
echo ""
echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Initializing git..."
git init
git add .
git commit -m "🚀 Initial: India Trading System v1.0"
git branch -M main

echo ""
echo "Step 3: Connecting to GitHub..."
git remote add origin https://github.com/achallakiran/india-trading-system.git
git push -u origin main

echo ""
echo "✅ Done! Your site will be live in ~2 minutes at:"
echo "   https://achallakiran.github.io/india-trading-system"
echo ""
echo "📋 Remember to:"
echo "   1. Go to GitHub repo → Settings → Pages"
echo "   2. Set Source to 'GitHub Actions'"
echo "   3. Save"
