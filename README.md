# PCMS Field Data Collector - PWA (iOS App)

A Progressive Web App for field data collection and automatic certificate generation with Dropbox integration.

## ✨ Features

- 📱 **Install on iPhone** - Works like a native app
- 🎓 **"Make the Cert!" Button** - Automatically generates and uploads certificates to Dropbox
- 📸 **Camera Integration** - Capture photos directly from your device
- 💾 **Works Offline** - Data persists even without internet
- ☁️ **Dropbox Auto-Upload** - Certificates automatically saved to your Dropbox
- 📊 **Excel Export** - Export your data to spreadsheets

---

## 🚀 Quick Start Guide

### Step 1: Set Up Dropbox Integration

1. **Create a Dropbox App:**
   - Go to https://www.dropbox.com/developers/apps
   - Click "Create app"
   - Choose "Scoped access"
   - Choose "Full Dropbox" access
   - Name your app (e.g., "PCMS Certificate Uploader")
   - Click "Create app"

2. **Get Your App Key:**
   - On your app's settings page, find the "App key" (looks like `abc123xyz789`)
   - Copy this key

3. **Add the Key to Your App:**
   - Open `www/index.html`
   - Find line ~490: `data-app-key="PASTE_YOUR_DROPBOX_APP_KEY_HERE"`
   - Replace `PASTE_YOUR_DROPBOX_APP_KEY_HERE` with your actual Dropbox App Key
   - Save the file

### Step 2: Generate App Icons

1. Open `www/generate-icons.html` in your web browser
2. Click "Download 192x192 Icon" and save as `icon-192.png` in the `www/` folder
3. Click "Download 512x512 Icon" and save as `icon-512.png` in the `www/` folder

### Step 3: Deploy Your App

You need to host your app on a web server with HTTPS. Here are the easiest options:

#### Option A: GitHub Pages (Free & Easy)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add PWA configuration"
   git push origin claude/automate-cert-generation-NBb2f
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository settings
   - Scroll to "Pages" section
   - Source: Deploy from branch
   - Branch: Select your branch and `/www` folder
   - Click Save

3. **Your app will be available at:**
   `https://[your-username].github.io/pcms-app/`

#### Option B: Netlify (Free, No Git Required)

1. Go to https://app.netlify.com/drop
2. Drag and drop your `www/` folder
3. Get your instant URL (e.g., `https://random-name.netlify.app`)

#### Option C: Vercel (Free)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `cd www && vercel`
3. Follow the prompts to deploy

---

## 📱 Installing on iPhone

### Once your app is deployed:

1. **Open Safari** on your iPhone (must be Safari, not Chrome)
2. **Navigate to your app URL** (from deployment step above)
3. **Tap the Share button** (box with arrow pointing up)
4. **Scroll down and tap "Add to Home Screen"**
5. **Tap "Add"** in the top right

🎉 **Done!** The app now appears on your home screen like a native app!

---

## 🎓 Using "Make the Cert!" Button

### How it works:

1. **Enter your data** in the spreadsheet:
   - Add rows using "+ Add Row" button
   - Fill in fields (service type, customer, facility, etc.)
   - Optionally attach photos

2. **Tap "Make the Cert!" button** (the gold pulsing button)

3. **What happens:**
   - Generates PDF certificates for all rows
   - Automatically uploads each certificate to Dropbox
   - Shows success message when complete
   - Certificates are named: `[year]-[customer]-[facility].pdf`

4. **Find your certificates:**
   - Open Dropbox
   - They'll be in the folder you selected during first upload
   - Share, print, or email them from there

---

## 🔧 Troubleshooting

### "Dropbox SDK not loaded" error
- Make sure you added your Dropbox App Key to `index.html`
- The app key should look like a long string of letters and numbers
- Line should be: `data-app-key="abc123xyz789"` (your actual key)

### App won't install on iPhone
- Must use **Safari browser** (not Chrome or others)
- Site must be served over **HTTPS** (http:// won't work)
- Make sure icons are present in the `www/` folder

### Certificates not uploading
- Check your internet connection
- Make sure you granted Dropbox permissions when prompted
- Check Dropbox app permissions at https://www.dropbox.com/account/connected_apps

### Camera not working on iPhone
- First time: tap "Allow" when prompted for camera permission
- If denied: Go to Settings > Safari > Camera > Allow

---

## 📁 File Structure

```
pcms-app/
├── www/                          # PWA app files (deploy this folder)
│   ├── index.html               # Main app
│   ├── manifest.json            # PWA configuration
│   ├── service-worker.js        # Offline support
│   ├── generate-icons.html      # Icon generator
│   ├── icon-192.png            # App icon (generate this)
│   └── icon-512.png            # App icon (generate this)
├── package.json                 # Node dependencies
└── README.md                    # This file
```

---

## 🎨 Customization

### Change App Name
Edit `www/manifest.json`:
```json
{
  "name": "Your Custom Name",
  "short_name": "Custom"
}
```

### Change Colors
Edit `www/index.html` CSS variables (around line 14):
```css
:root {
  --forest: #1a4d2e;  /* Primary color */
  --gold: #ffd60a;    /* Accent color */
}
```

---

## 🆘 Support

For issues or questions:
- Check the troubleshooting section above
- Review your browser console for error messages
- Ensure all steps were followed in order
- Verify Dropbox App Key is correct

---

## 📋 Next Steps

1. ✅ Set up Dropbox integration
2. ✅ Generate app icons
3. ✅ Deploy to a hosting service
4. ✅ Install on your iPhone
5. ✅ Start collecting data and making certs!

**Happy certificate making! 🎓**
