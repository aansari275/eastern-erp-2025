# Eastern ERP - Development Setup Guide

## 🚀 Quick Start (Most Reliable)

### Option 1: Enhanced Startup Script (Recommended)
```bash
npm run dev:stable
```
This uses the enhanced startup script with automatic port clearing and error recovery.

### Option 2: Quick Restart Anytime
```bash
npm run dev:restart
```
Instantly kills any conflicting processes and restarts fresh.

### Option 3: Standard Development
```bash
npm run dev
```
Basic development server (may have port conflicts).

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev:stable` | **Recommended**: Enhanced startup with port management |
| `npm run dev:restart` | Quick restart - kills ports and starts fresh |
| `npm run dev` | Basic development server |
| `npm run dev:pm2` | Use PM2 process manager (install PM2 first) |
| `npm run dev:stop` | Stop PM2 managed server |
| `npm run dev:logs` | View PM2 server logs |
| `npm run dev:monitor` | View PM2 process monitor |
| `npm run kill-ports` | Kill processes on ports 3000, 5000, 5001 |
| `npm run setup` | Install dependencies and create log directories |

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **API Endpoint**: http://localhost:5000/api
- **Rug Gallery**: http://localhost:3000 (Sampling Department tab)

## 🔧 Troubleshooting

### Problem: "Port already in use" or localhost:3000 not working

**Solution 1: Quick Fix**
```bash
npm run dev:restart
```

**Solution 2: Manual Port Clearing**
```bash
npm run kill-ports
npm run dev
```

**Solution 3: Enhanced Script**
```bash
npm run dev:stable
```

### Problem: Server crashes or becomes unresponsive

**Solution: Use Process Manager**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run dev:pm2

# Monitor
npm run dev:monitor

# View logs
npm run dev:logs
```

### Problem: Changes not reflecting

**Solution: Hard Restart**
```bash
npm run dev:restart
```

## 🔍 Health Monitoring

### Automatic Health Check
```bash
./server-monitor.sh
```
This script:
- Monitors both frontend (port 3000) and API (port 5000)
- Automatically restarts if either service goes down
- Logs all activities to `logs/monitor.log`
- Runs health checks every 30 seconds

### Manual Health Check
```bash
# Check if frontend is running
curl http://localhost:3000

# Check if API is running  
curl http://localhost:5000/api/rugs
```

## 📁 Important Files

- `start-dev.sh` - Enhanced development server script
- `quick-start.sh` - Quick restart script
- `server-monitor.sh` - Health monitoring script
- `ecosystem.config.js` - PM2 configuration
- `logs/` - All log files (created automatically)

## 🎯 Best Practices

### For Stable Development:
1. **Always use**: `npm run dev:stable` for new sessions
2. **Quick restarts**: `npm run dev:restart` when things get stuck
3. **Monitor logs**: Check `logs/` directory for issues
4. **Clean restarts**: Kill ports before starting if needed

### For Production-like Testing:
1. **Use PM2**: `npm run dev:pm2` for process management
2. **Monitor**: `npm run dev:monitor` to watch resource usage
3. **Health checks**: Run `./server-monitor.sh` in background

## 🆘 Emergency Recovery

If everything is broken:
```bash
# Nuclear option - kill everything and start fresh
pkill -f "node"
pkill -f "tsx" 
npm run kill-ports
npm run setup
npm run dev:stable
```

## 💡 Tips

1. **Bookmark**: http://localhost:3000 for quick access
2. **Auto-restart**: The server watches for file changes and restarts automatically
3. **Logs**: Check `logs/` directory if something seems wrong
4. **Multiple terminals**: You can run monitoring in one terminal and development in another
5. **Port conflicts**: The scripts automatically handle port conflicts

## 🔥 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "EADDRINUSE" error | `npm run kill-ports` then restart |
| White screen on localhost:3000 | `npm run dev:restart` |
| API not responding | Check `logs/error.log` and restart |
| Changes not showing | Hard refresh browser (Cmd+Shift+R) |
| Server won't start | Check Firebase credentials in `server/serviceAccountKey.json` |

---

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Server running on http://localhost:5000
- ✅ Frontend served on http://localhost:3000  
- ✅ Firebase connection established
- ✅ Sample rugs visible in the gallery
- ✅ All form fields visible in "Create rug"

**Happy coding! 🚀**