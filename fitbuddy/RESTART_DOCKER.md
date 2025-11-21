# 🔄 Docker Restart Instructions

## What Was Fixed

1. ✅ Frontend now points to correct backend port (3001)
2. ✅ Docker compose will auto-seed gyms on startup
3. ✅ Backend configured with correct environment variables

---

## 🚀 Restart Your Docker Containers

Run this command in the `fitbuddy` directory:

```bash
docker-compose down && docker-compose up --build
```

This will:
1. Stop all containers
2. Rebuild with new changes
3. Auto-seed the gyms
4. Start everything fresh

---

## ✅ After Restart

1. Wait for all containers to start (about 30 seconds)
2. Go to: `http://localhost:3000/member/gyms`
3. Click "Allow" for location permission
4. You should see 8 gyms sorted by distance!

---

## 🔍 Verify It's Working

Check backend is responding:
```
http://localhost:3001/api/gyms
```

Should see JSON with gym data.

---

**Status:** Ready to restart!

