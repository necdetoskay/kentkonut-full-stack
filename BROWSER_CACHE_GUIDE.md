# 🧹 Browser Cache Clearing Guide for Kent Konut

## 🚨 **Critical Steps After Docker Rebuild**

After rebuilding the Docker containers, you **MUST** clear your browser cache to avoid the MIME type errors.

## 🔧 **Method 1: Complete Cache Clear (Recommended)**

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select **"All time"** as time range
3. Check these boxes:
   - ✅ Browsing history
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Click **"Clear data"**

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select **"Everything"** as time range
3. Check these boxes:
   - ✅ Browsing & Download History
   - ✅ Cookies
   - ✅ Cache
4. Click **"Clear Now"**

## 🔧 **Method 2: Developer Tools (Quick)**

### For All Browsers:
1. Open Developer Tools (`F12`)
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

## 🔧 **Method 3: Incognito/Private Mode (Testing)**

### Test in Private Mode:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`

## 🔧 **Method 4: Disable Cache During Development**

### In Developer Tools:
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while testing

## 🔍 **Verification Steps**

After clearing cache:

1. **Test Normal Refresh (F5)**:
   - Should load without MIME type errors
   - Check console for any red errors

2. **Test Hard Refresh (Ctrl+Shift+R)**:
   - Should load consistently
   - Verify all assets load properly

3. **Test Different Routes**:
   - Navigate to different pages
   - Use browser back/forward buttons
   - Direct URL access

## 🚨 **If Problems Persist**

### Check These:
1. **Service Worker**: Clear in DevTools > Application > Storage
2. **Local Storage**: Clear in DevTools > Application > Local Storage
3. **Session Storage**: Clear in DevTools > Application > Session Storage
4. **IndexedDB**: Clear in DevTools > Application > IndexedDB

### Nuclear Option:
```bash
# Reset browser profile (Chrome example)
# Close Chrome completely, then:
chrome.exe --user-data-dir=temp-profile
```

## 📊 **Expected Console Behavior**

### ✅ **After Successful Fix**:
- No red MIME type errors
- No 404 errors for JS/CSS files
- Clean console on both F5 and Ctrl+Shift+R

### ❌ **Signs of Remaining Issues**:
- "Expected JavaScript module" errors
- 404 errors for static assets
- Mixed content warnings

## 🔄 **Development Workflow**

### For Ongoing Development:
1. Keep DevTools open with cache disabled
2. Use hard refresh when testing changes
3. Clear cache after major updates
4. Test in incognito mode for clean state

## 📞 **Troubleshooting**

If cache clearing doesn't resolve the issue:

1. **Check Docker logs**:
   ```bash
   docker-compose logs kentkonut-frontend
   ```

2. **Verify Nginx config**:
   ```bash
   docker exec kentkonut-frontend nginx -t
   ```

3. **Check file permissions**:
   ```bash
   docker exec kentkonut-frontend ls -la /usr/share/nginx/html/
   ```

4. **Restart containers**:
   ```bash
   docker-compose restart
   ```
