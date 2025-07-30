# 🚀 Eastern ERP - Quick Access Guide

## ⚡ Instant Startup (Always Works)

```bash
npm run dev:restart
```

**Your app is ready at**: http://localhost:5001 (or check the terminal output for the correct port)

---

## 🔧 If Problems Occur

### 1. Server Won't Start
```bash
npm run kill-ports
npm run dev:restart
```

### 2. Page Shows Error or White Screen
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or restart: `npm run dev:restart`

### 3. "Create Rug" Form Missing Fields
- This usually means the server is using a cached version
- Solution: `npm run dev:restart`

### 4. No Sample Rugs in Gallery
- The rugs are already populated in Firebase
- If not showing, restart: `npm run dev:restart`

---

## 📱 Quick Links

Once server is running:
- **Main App**: http://localhost:5001
- **Rug Gallery**: http://localhost:5001 → Click "Sampling Department" → "Rug Gallery" tab
- **Create Rug**: http://localhost:5001 → Click "Sampling Department" → "Create New" tab

---

## 🎯 One-Command Solution

**For instant, reliable startup every time:**
```bash
npm run dev:restart
```

This command:
- ✅ Kills any conflicting processes
- ✅ Clears ports 3000, 5000, 5001
- ✅ Starts fresh server
- ✅ Shows you the correct URL to visit

**Just run it and go to the URL shown in the terminal!**