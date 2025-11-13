# Email Service Setup for Render.com

## Current Status
❌ **EMAIL_USER and EMAIL_PASS are NOT configured on Render.com**

## How to Add Email Configuration

### Step 1: Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and your device
5. Click "Generate"
6. Copy the **16-character password** (no spaces)

### Step 2: Add to Render.com

1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Select your service: **career-guidance-backend-70ny**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these two variables:

   **Variable 1:**
   - Key: `EMAIL_USER`
   - Value: `your-email@gmail.com` (your Gmail address)

   **Variable 2:**
   - Key: `EMAIL_PASS`
   - Value: `xxxxxxxxxxxxxxxx` (the 16-character App Password from Step 1)

6. Click **Save Changes**
7. **Restart your service** (Render will auto-restart, but you can manually restart from the dashboard)

### Step 3: Verify Configuration

After restarting, check your Render.com logs. You should see:

```
✅ Email service configured and verified
```

If you see:
```
⚠️  Email service not configured: EMAIL_USER or EMAIL_PASS missing
```

Then the variables weren't saved correctly. Double-check:
- Variable names are exactly `EMAIL_USER` and `EMAIL_PASS` (case-sensitive)
- No extra spaces in the values
- App Password is 16 characters (no spaces)

## Current Environment Variables on Render.com

✅ **Configured:**
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_PRIVATE_KEY_ID
- FIREBASE_CLIENT_ID
- FIREBASE_CLIENT_X509_CERT_URL
- NODE_ENV
- PORT

❌ **Missing:**
- EMAIL_USER
- EMAIL_PASS

## After Configuration

Once configured, verification emails will be sent automatically when users register. Users will receive an email with a verification link to activate their account.

## Troubleshooting

### Email not sending?
1. Check Render.com logs for email errors
2. Verify EMAIL_USER and EMAIL_PASS are set correctly
3. Make sure you're using App Password, not regular Gmail password
4. Check spam folder - emails might be going there

### Still not working?
Check server logs for:
- `❌ Email sending error:` - Shows specific error
- `❌ Email transporter verification failed:` - Configuration issue
- `✅ Email sent successfully:` - Email was sent

