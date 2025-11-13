# Render Deployment Guide - Firebase Configuration

## Issue: Firebase Admin Initialization Error

If you see this error during deployment:
```
❌ Firebase Admin initialization error: Service account object must contain a string "private_key" property.
```

This means the Firebase environment variables are not set in Render.

---

## Solution: Set Environment Variables in Render

### Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **Settings** gear icon → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (e.g., `serviceAccountKey.json`)

### Step 2: Extract Values from the JSON File

Open the downloaded JSON file. You'll see something like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/..."
}
```

### Step 3: Set Environment Variables in Render

1. Go to your Render dashboard
2. Select your **Web Service** (the backend service)
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add the following variables:

#### Required Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `FIREBASE_PROJECT_ID` | `your-project-id` | From the JSON file |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` | **IMPORTANT**: Copy the entire private key including `-----BEGIN` and `-----END` lines. Keep the `\n` characters. |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com` | From the JSON file |

#### Optional Variables (if available):

| Variable Name | Value |
|--------------|-------|
| `FIREBASE_PRIVATE_KEY_ID` | From JSON file |
| `FIREBASE_CLIENT_ID` | From JSON file |
| `FIREBASE_CLIENT_CERT_URL` | From JSON file |

### Step 4: Important Notes for FIREBASE_PRIVATE_KEY

When copying the `private_key` value:

1. **Copy the ENTIRE key** including:
   - `-----BEGIN PRIVATE KEY-----`
   - All the key content
   - `-----END PRIVATE KEY-----`

2. **Keep the `\n` characters** - They represent newlines. The code will automatically convert them.

3. **Example format**:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
   ```

4. **If you're having issues**, try:
   - Copy the entire private_key value from the JSON file
   - Paste it directly into Render's environment variable
   - Make sure there are no extra spaces or quotes

### Step 5: Other Required Environment Variables

Also make sure these are set:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` (Render sets this automatically) |
| `JWT_SECRET` | Secret for JWT tokens | Any long random string |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | Your email password or app password |

### Step 6: Redeploy

After setting all environment variables:

1. Go to your Render service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Or push a new commit to trigger automatic deployment

### Step 7: Verify

After deployment, check the logs. You should see:
```
✅ Firebase Admin initialized with environment variables
```

Instead of:
```
❌ Firebase Admin initialization error
```

---

## Troubleshooting

### Issue: Still getting the error after setting variables

**Solution:**
1. Double-check that `FIREBASE_PRIVATE_KEY` includes the `-----BEGIN` and `-----END` lines
2. Make sure there are no extra quotes around the value
3. Verify all three required variables are set: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
4. Try redeploying after setting the variables

### Issue: Private key format error

**Solution:**
- The private key should have `\n` characters in it
- Don't manually replace `\n` with actual newlines
- Copy it exactly as it appears in the JSON file

### Issue: Firebase operations not working

**Solution:**
- Check if Firebase Admin initialized successfully in logs
- Verify all environment variables are set correctly
- Make sure your Firebase project has the correct permissions

---

## Security Best Practices

1. **Never commit** the `serviceAccountKey.json` file to Git
2. **Always use** environment variables in production
3. **Rotate keys** periodically for security
4. **Limit access** to environment variables in Render

---

## Quick Checklist

- [ ] Downloaded Firebase service account key JSON
- [ ] Extracted `project_id` → Set as `FIREBASE_PROJECT_ID`
- [ ] Extracted `private_key` → Set as `FIREBASE_PRIVATE_KEY` (with BEGIN/END lines)
- [ ] Extracted `client_email` → Set as `FIREBASE_CLIENT_EMAIL`
- [ ] Set `NODE_ENV=production`
- [ ] Set `JWT_SECRET`
- [ ] Set email configuration variables
- [ ] Redeployed the service
- [ ] Verified logs show successful Firebase initialization

---

## Need Help?

If you're still having issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure the Firebase project is active and accessible
4. Test Firebase Admin locally first before deploying

