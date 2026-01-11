# PCMS Certificate Generator for Google Sheets

Automatically generate PDF certificates from your Google Sheets data and upload them to Dropbox with one click!

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Script to Your Google Sheet

1. **Open your Google Sheet**
2. **Go to Extensions > Apps Script**
3. **Delete any existing code** in the editor
4. **Copy the entire contents** of `Code.gs` from this folder
5. **Paste it** into the Apps Script editor
6. **Click the Save icon** (💾)
7. **Name your project** "PCMS Certificate Generator"

### Step 2: Get Your Dropbox Access Token

1. **Go to:** https://www.dropbox.com/developers/apps
2. **Click "Create app"**
3. **Choose settings:**
   - API: Scoped access
   - Access: Full Dropbox
   - Name: "PCMS Certificates" (or any name you like)
4. **Click "Create app"**

5. **Set Permissions:**
   - Click the **"Permissions"** tab
   - Check the box for **"files.content.write"**
   - Click **"Submit"** at the bottom

6. **Generate Token:**
   - Click the **"Settings"** tab
   - Scroll down to "Generated access token"
   - Click **"Generate"** button
   - **Copy the token** (long string of letters/numbers)
   - ⚠️ **Keep this token secret!** Don't share it publicly

### Step 3: Add Token to Script

1. **Back in Apps Script editor**
2. **Find line 11:**
   ```javascript
   const DROPBOX_ACCESS_TOKEN = 'YOUR_DROPBOX_ACCESS_TOKEN_HERE';
   ```
3. **Replace `YOUR_DROPBOX_ACCESS_TOKEN_HERE`** with your actual token (keep the quotes!)
4. **Should look like:**
   ```javascript
   const DROPBOX_ACCESS_TOKEN = 'sl.abc123xyz789...';
   ```
5. **Click Save** (💾)

### Step 4: Authorize the Script

1. **Refresh your Google Sheet** (close and reopen, or press F5)
2. **You should see a new menu:** "🎓 PCMS Certificates"
3. **Click it** and select "Make the Cert! (Selected Row)"
4. **Google will ask for permissions:**
   - Click "Continue"
   - Choose your Google account
   - Click "Advanced" → "Go to PCMS Certificate Generator (unsafe)"
   - Click "Allow"
5. **Done!** The script is now ready to use

---

## 📋 How to Use

### Super Simple - Just Check the Box!

1. **Fill in your data** in the row
2. **Check the "Make the Cert!" checkbox** in the last column
3. **Wait a few seconds** - the script automatically:
   - Generates the PDF certificate
   - Uploads it to Dropbox
   - Unchecks the box
   - Shows success message
4. **Done!** That's it!

**No menu needed - just check the box and it happens automatically!**

### Where Are My Certificates?

- Open your Dropbox
- Look for folder: **`PCMS_Certificates/`**
- Certificates are named: **`2026-CustomerName-FacilityName.pdf`**

---

## 🔧 Customization

### Update Column Indices

If you add/remove/move columns in your sheet, update the `COLUMNS` object (lines 16-55 in Code.gs):

```javascript
const COLUMNS = {
  date: 0,  // Column A
  customer: 1,  // Column B
  facility: 2,  // Column C
  // etc...
};
```

Column numbers are 0-based (A=0, B=1, C=2, etc.)

### Change Certificate Header

Update the `CERT_HEADER` object (lines 11-16):

```javascript
const CERT_HEADER = {
  company: 'Your Company Name',
  contact: 'your-email@example.com',
  website: 'your-website.com',
  phone: '(555) 123-4567'
};
```

### Change Dropbox Folder

Update line 270 in the `uploadToDropbox` function:

```javascript
path: `/Your_Custom_Folder/${filename}`,
```

---

## ❓ Troubleshooting

### "Please configure your Dropbox Access Token"
- You need to add your Dropbox token to line 11 of the script
- See Step 3 above

### "Exception: Request failed for https://content.dropboxapi.com returned code 401"
- Your Dropbox access token is invalid or expired
- Generate a new token and update the script

### "TypeError: Cannot read property 'X' of undefined"
- Column indices may be wrong
- Check that your data is in the expected columns
- Update the `COLUMNS` object if needed

### Certificates have missing data
- Make sure all required fields are filled in your sheet
- Check that column indices match your sheet structure

### Script runs slowly
- Generating PDFs takes a few seconds per row
- For many rows, use "Make All Checked Certs" and be patient
- Google Apps Script has a 6-minute timeout limit

---

## 🔒 Security Notes

- ⚠️ **Never share your Dropbox Access Token publicly**
- The token gives full access to your Dropbox
- If compromised, revoke it at https://www.dropbox.com/account/connected_apps
- Generate a new token if needed

- Your script code is private to your Google account
- Only people with edit access to your Sheet can see the script
- Don't share edit access with untrusted users

---

## 📝 Features

- ✅ Automatic PDF generation from Google Sheets data
- ✅ Automatic Dropbox upload
- ✅ Support for multiple service types (Closed Pipe, Open Channel, Chart Recorder, Loop Test)
- ✅ Before/After adjustment measurements
- ✅ Professional certificate formatting
- ✅ Custom menu in Google Sheets
- ✅ Batch processing with checkboxes
- ✅ Auto-generated filenames
- ✅ No external dependencies

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the setup steps carefully
3. Check the Apps Script logs: View > Logs in the script editor
4. Make sure all permissions are granted

---

**Happy Certificate Making! 🎓**
