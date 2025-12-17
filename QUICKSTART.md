# ⚡ Quick Start Guide

## 🎮 Play Locally

Simply open `idle-garden/index.html` in your web browser!

## 🚀 Deploy to GitHub Pages (5 minutes)

### 1. Create GitHub Repository
- Go to https://github.com/new
- Name: `idle-garden`
- Visibility: Public
- Click "Create repository"

### 2. Push Your Code

```bash
git init
git add .
git commit -m "🌱 Initial commit: Idle Garden"
git remote add origin https://github.com/YOUR_USERNAME/idle-garden.git
git push -u origin main
```

### 3. Enable GitHub Pages
- Go to repository **Settings** → **Pages**
- Source: **main** branch
- Click **Save**

### 4. Play Online! 🎉
Your game will be live at:
```
https://YOUR_USERNAME.github.io/idle-garden/idle-garden/
```

## 📝 Update Your Game

```bash
git add .
git commit -m "Your update description"
git push
```

Changes go live in ~2 minutes!

## 🎯 Game Features

- ✅ **35+ Plants** - Progressive unlocking system
- ✅ **5 Resources** - Coins, Seeds, Water, Gems, Fertilizer
- ✅ **8 Upgrades** - Boost your garden's productivity
- ✅ **Auto-Save** - Never lose progress
- ✅ **Offline Progress** - Earn while away
- ✅ **Player Profiles** - Unique identity for each player

## 🔧 Development

```bash
# Install dependencies (for testing)
npm install

# Run tests
npm test

# Run specific test
npm test -- Plant.test.js
```

## 📱 Mobile Friendly

The game is fully responsive and works great on:
- 📱 Phones
- 📱 Tablets
- 💻 Desktops

## 🎨 Customization

Want to customize? Edit these files:
- `idle-garden/styles.css` - Visual styling
- `idle-garden/js/PlantConfig.js` - Plant properties
- `idle-garden/js/UpgradeSystem.js` - Upgrade effects

## 🐛 Troubleshooting

**Game won't load?**
- Check browser console (F12)
- Make sure all files are in correct folders
- Try hard refresh (Ctrl+Shift+R)

**Progress not saving?**
- Check if localStorage is enabled
- Don't use incognito/private mode
- Check browser storage settings

**GitHub Pages not working?**
- Wait 2-5 minutes after enabling
- Check repository is Public
- Verify path: `/idle-garden/idle-garden/`

## 📚 Learn More

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOY.md)
- [GitHub Pages Docs](https://pages.github.com/)

---

**Need help? Open an issue on GitHub!** 💚
