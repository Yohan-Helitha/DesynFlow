# Puppeteer PDF Generation Fix

## Problem
The error occurs because Puppeteer cannot find Chrome/Chromium to generate PDFs:
```
Could not find Chrome (ver. 121.0.6167.85)
```

## Solutions (Try in order)

### Solution 1: Use System Chrome (Recommended)
If you have Google Chrome installed:

```powershell
# Find your Chrome installation
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
# Or for 32-bit systems:
# $env:CHROME_PATH = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

# Restart the server
npm run dev
```

To make this permanent, add to your system environment variables:
- Variable: `CHROME_PATH`
- Value: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### Solution 2: Test and Fix Automatically
Run our diagnostic script:

```powershell
cd server
npm run fix-puppeteer
```

This will:
- Check if Puppeteer works
- Find system Chrome installations
- Test each Chrome path
- Give you the exact command to fix it

### Solution 3: Reinstall Puppeteer with Chromium
If no system Chrome is available:

```powershell
cd server
npm uninstall puppeteer
npm install puppeteer
```

This downloads a bundled Chromium (~150MB).

### Solution 4: Force Install Chromium
If Puppeteer is installed but Chromium is missing:

```powershell
cd server
npm run install-chromium
```

### Solution 5: Install Google Chrome
If nothing else works:
1. Download and install Google Chrome from https://www.google.com/chrome/
2. Use Solution 1 above

## How the Fix Works

The updated code now:
1. ✅ Tries multiple Chrome paths automatically
2. ✅ Falls back to bundled Chromium if no system Chrome found
3. ✅ Adds extra Chrome arguments for better compatibility
4. ✅ Provides better error messages

## Testing
After applying any solution, test by generating a PDF report in the application.

## Troubleshooting

### Error: "Protocol error (Runtime.callFunctionOn)"
- This means Chrome launched but crashed
- Try Solution 1 with different Chrome path
- Or use Solution 3 to get bundled Chromium

### Error: "Failed to launch the browser process"
- Chrome path is wrong or Chrome is corrupted
- Try running the diagnostic script (Solution 2)
- Or reinstall Chrome

### Error: "No usable sandbox"
- This is normal on some Windows configurations
- The code already includes `--no-sandbox` flag to handle this

## Docker Usage
If running in Docker, use our Dockerfile which includes Chromium:

```dockerfile
# Add to your Dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends
```

Then set the environment variable:
```bash
ENV CHROME_PATH=/usr/bin/chromium
```