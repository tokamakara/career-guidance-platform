# Render.com Environment Variables Setup

## ✅ Currently Configured Variables

You have these variables set:
- ✅ Firebase configuration (all variables)
- ✅ NODE_ENV=production
- ✅ PORT=1000

## ❌ Missing Variables (REQUIRED)

You need to add these two variables for email verification to work:

### 1. EMAIL_USER
- **Key:** `EMAIL_USER`
- **Value:** Your Gmail address (e.g., `yourname@gmail.com`)
- **Example:** `myemail@gmail.com`

### 2. EMAIL_PASS
- **Key:** `EMAIL_PASS`
- **Value:** Gmail App Password (16 characters, no spaces)
- **How to get it:**
  1. Go to [Google Account Settings](https://myaccount.google.com/)
  2. Enable **2-Step Verification** (if not already enabled)
  3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
  4. Select "Mail" and your device
  5. Click "Generate"
  6. Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)
  7. Remove spaces when pasting: `abcdefghijklmnop`

## 📝 How to Add Variables in Render.com

1. Go to your Render.com dashboard
2. Select your service: `career-guidance-backend-70ny`
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable:
   - **Key:** `EMAIL_USER`
   - **Value:** `your-email@gmail.com`
   - Click **Save Changes**
6. Repeat for `EMAIL_PASS`
7. **Restart your service** after adding variables

## ⚠️ Important Notes

- **PORT:** Your PORT is set to `1000`, but Render.com usually auto-assigns ports. This should be fine, but if you have issues, you can remove it and let Render assign automatically.
- **EMAIL_PASS:** Must be an App Password, NOT your regular Gmail password
- **After adding variables:** You MUST restart your service for changes to take effect
- **Test:** After restarting, check your server logs. You should see: `✅ Email service configured and verified`

## 🔍 Verification

After adding the variables and restarting, check your Render.com logs. You should see:
- `✅ Email service configured and verified` (if configured correctly)
- `⚠️ Email service not configured` (if variables are missing or incorrect)

## 🚨 Current Issues

1. **Timeout Error:** Registration is timing out because Render.com free tier can be slow on cold starts. I've increased the timeout to 60 seconds.
2. **Email Not Sending:** This is because `EMAIL_USER` and `EMAIL_PASS` are not configured.

## ✅ After Setup

Once you add the email variables and restart:
1. Registration should work (no more timeouts)
2. Verification emails will be sent automatically
3. Users can verify their email and log in

