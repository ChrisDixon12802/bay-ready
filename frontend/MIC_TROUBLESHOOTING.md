# Microphone Troubleshooting Guide

The microphone isn't working. Here's how to diagnose and fix it:

## **Step 1: Check Browser Permissions**

1. Look for a **microphone icon** in your browser's address bar
2. Click it and ensure microphone access is set to "Allow"
3. If blocked, unblock it and refresh the page

## **Step 2: Check Your Browser**

The Voice Recognition API works best in:

- ✅ **Google Chrome** (Recommended)
- ✅ **Microsoft Edge**
- ❌ **Firefox** (Not supported)
- ❌ **Safari** (Limited support)

**Are you using Chrome or Edge?** If not, switch to one of these browsers.

## **Step 3: Check HTTPS/Localhost**

Speech Recognition ONLY works on:

- `https://` websites (secure)
- `localhost` or `127.0.0.1`

**Current URL:** Check if you're on `http://localhost:5173` or similar.
If you're on `http://192.168.x.x` or another IP, the microphone won't work!

## **Step 4: Test Your Microphone**

1. Open Settings page
2. Click "Test Voice Recognition" button
3. Allow microphone when prompted
4. Say something
5. Check if it shows your speech

## **Step 5: Check Microphone Hardware**

1. Make sure your microphone is plugged in
2. Check Windows Sound settings (search "Sound settings")
3. Under Input, check if your microphone shows green bars when you speak
4. Make sure the microphone isn't muted

## **Step 6: Check for Other Apps Using Microphone**

Close these if they're running:

- Zoom, Teams, Skype
- Discord
- OBS or other recording software
- Other browser tabs using microphone

## **Step 7: Try the Voice Assistant**

If the test works:

1. Enable voice in Settings (toggle switch)
2. Click the microphone button in the top-right header
3. Click the blue "Tap to Listen" button
4. Allow microphone access when prompted
5. Say a command like "what's left?"

## **Common Issues:**

### "Microphone access denied"

- Solution: Check browser permissions (Step 1)

### "Speech recognition not supported"

- Solution: Switch to Chrome or Edge (Step 2)

### Button clicks but nothing happens

- Solution: Open browser console (F12), check for errors
- Look for red error messages

### Works sometimes but not others

- Solution: Only one thing can use the microphone at once
- Close other apps/tabs

## **Still Not Working?**

Press F12 to open Developer Tools → Console tab
Look for any RED error messages and share them with me!

---

**Quick Checklist:**

- [ ] Using Chrome or Edge?
- [ ] On localhost (not IP address)?
- [ ] Microphone allowed in browser?
- [ ] No other apps using microphone?
- [ ] Microphone working in Windows Sound settings?
