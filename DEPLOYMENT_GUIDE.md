# 🚀 Complete Server Deployment Guide

## Deployment Platform: Render.com

This guide will walk you through deploying your Career Guidance Platform backend server to Render.com.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render.com Account** - Sign up at https://render.com (free tier available)
3. **Firebase Project** - You need access to your Firebase project
4. **Gmail Account** - For sending emails (or another email service)

---

## 🔧 Step 1: Prepare Your Firebase Service Account

### 1.1 Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **Settings gear icon** ⚙️ → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (e.g., `serviceAccountKey.json`)

### 1.2 Extract Required Values from JSON

Open the downloaded JSON file and note these values:

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
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**⚠️ IMPORTANT:** 
- Copy the `private_key` exactly as it appears (including `\n` characters)
- You'll need to replace `\n` with actual newlines when setting the environment variable

---

## 📧 Step 2: Set Up Gmail App Password (for Email Service)

### 2.1 Enable 2-Factor Authentication
1. Go to your [Google Account](https://myaccount.google.com/)
2. Go to **Security**
3. Enable **2-Step Verification** if not already enabled

### 2.2 Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter "Career Guidance Platform"
4. Click **Generate**
5. **Copy the 16-character password** (you'll use this as `EMAIL_PASS`)

---

## 🌐 Step 3: Deploy to Render.com

### 3.1 Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository containing your project

### 3.2 Configure Build Settings

**Name:** `career-guidance-api` (or your preferred name)

**Region:** Choose closest to your users (e.g., `Oregon (US West)`)

**Branch:** `main` (or your production branch)

**Root Directory:** `server` (important!)

**Environment:** `Node`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

### 3.3 Set Environment Variables

Click on **Environment** tab and add the following variables:

#### 🔥 Firebase Configuration (REQUIRED)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

**⚠️ CRITICAL for FIREBASE_PRIVATE_KEY:**
- Copy the entire private key from your JSON file
- Replace all `\n` with actual newlines (press Enter)
- The key should look like:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(multiple lines)
...
-----END PRIVATE KEY-----
```

#### 📧 Email Configuration (REQUIRED)

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Example:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=careerguidance@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

#### 🌍 Server Configuration (REQUIRED)

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://career-guidance-frontend-96nv.onrender.com
```

**Note:** Render automatically sets `PORT`, but you can set it explicitly. Render uses port `10000` by default.

#### 🔗 API URL (Optional - for Swagger docs)

```
API_URL=https://your-service-name.onrender.com
```

Replace `your-service-name` with your actual Render service name.

---

## 📝 Complete Environment Variables Checklist

Copy and paste this checklist. Fill in each value:

```
✅ FIREBASE_PROJECT_ID=_________________________
✅ FIREBASE_CLIENT_EMAIL=_________________________
✅ FIREBASE_PRIVATE_KEY=_________________________
✅ FIREBASE_PRIVATE_KEY_ID=_________________________
✅ FIREBASE_CLIENT_ID=_________________________
✅ FIREBASE_CLIENT_CERT_URL=_________________________
✅ EMAIL_SERVICE=gmail
✅ EMAIL_USER=_________________________
✅ EMAIL_PASS=_________________________
✅ NODE_ENV=production
✅ PORT=10000
✅ CLIENT_URL=https://career-guidance-frontend-96nv.onrender.com
✅ API_URL=https://your-service-name.onrender.com
```

---

## 🔍 Step 4: Verify Deployment

### 4.1 Check Build Logs

1. After clicking **Create Web Service**, Render will start building
2. Watch the build logs for any errors
3. The build should complete successfully

### 4.2 Test the API

Once deployed, your API will be available at:
```
https://your-service-name.onrender.com
```

**Test endpoints:**
1. **Health Check:**
   ```
   https://your-service-name.onrender.com/health
   ```
   Should return: `{"status":"OK",...}`

2. **API Docs:**
   ```
   https://your-service-name.onrender.com/api-docs
   ```

### 4.3 Check Server Logs

1. Go to **Logs** tab in Render dashboard
2. Look for:
   - ✅ `Firebase Admin initialized with environment variables`
   - ✅ `Server running on port 10000`
   - ✅ `Allowed CORS Origins:`
   - ✅ `✓ https://career-guidance-frontend-96nv.onrender.com`

---

## 🐛 Troubleshooting

### Issue: Firebase Admin Not Initializing

**Error:** `Firebase Admin initialization error`

**Solution:**
1. Check that `FIREBASE_PRIVATE_KEY` has actual newlines (not `\n` text)
2. Verify all Firebase environment variables are set correctly
3. Check that `FIREBASE_PROJECT_ID` matches your Firebase project

### Issue: Email Not Sending

**Error:** `Invalid login` or `Authentication failed`

**Solution:**
1. Verify `EMAIL_USER` is your full Gmail address
2. Ensure `EMAIL_PASS` is the 16-character App Password (not your regular password)
3. Make sure 2-Factor Authentication is enabled on your Google account

### Issue: CORS Errors

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Verify `CLIENT_URL` matches your frontend URL exactly
2. Check server logs to see which origins are allowed
3. Ensure the frontend URL in CORS config matches your deployed frontend

### Issue: Server Crashes on Start

**Error:** `Port already in use` or `Cannot find module`

**Solution:**
1. Ensure `PORT` is set to `10000` (Render's default)
2. Check that all dependencies are in `package.json`
3. Verify `Root Directory` is set to `server`

### Issue: Environment Variables Not Loading

**Error:** `undefined` values in logs

**Solution:**
1. Make sure environment variables are set in Render dashboard (not in `.env` file)
2. Restart the service after adding environment variables
3. Check for typos in variable names (they're case-sensitive)

---

## 🔄 Step 5: Update Frontend API URL

After deployment, update your frontend to use the new API URL:

1. In your frontend deployment (Render), set environment variable:
   ```
   REACT_APP_API_URL=https://your-service-name.onrender.com/api
   ```

2. Or update `client/src/utils/apiConfig.js` if you want to hardcode it for production.

---

## 📊 Step 6: Monitor Your Deployment

### 6.1 Set Up Auto-Deploy

1. In Render dashboard, go to **Settings**
2. Under **Auto-Deploy**, ensure it's set to **Yes**
3. This will automatically deploy when you push to your main branch

### 6.2 Monitor Logs

1. Regularly check the **Logs** tab
2. Look for errors or warnings
3. Monitor API response times

### 6.3 Set Up Alerts (Optional)

1. Go to **Settings** → **Alerts**
2. Add email notifications for:
   - Service crashes
   - High error rates
   - Slow response times

---

## 🔐 Security Best Practices

1. **Never commit** `.env` files or `serviceAccountKey.json` to Git
2. **Use environment variables** for all sensitive data
3. **Rotate credentials** periodically
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated** (`npm audit`)

---

## 📦 Quick Reference: Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | ✅ Yes | Firebase project ID | `my-project-123` |
| `FIREBASE_CLIENT_EMAIL` | ✅ Yes | Firebase service account email | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | ✅ Yes | Firebase private key (with newlines) | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_PRIVATE_KEY_ID` | ✅ Yes | Firebase private key ID | `abc123...` |
| `FIREBASE_CLIENT_ID` | ✅ Yes | Firebase client ID | `123456789` |
| `FIREBASE_CLIENT_CERT_URL` | ✅ Yes | Firebase cert URL | `https://...` |
| `EMAIL_SERVICE` | ✅ Yes | Email service provider | `gmail` |
| `EMAIL_USER` | ✅ Yes | Email address for sending | `your-email@gmail.com` |
| `EMAIL_PASS` | ✅ Yes | App password (16 chars) | `abcd efgh ijkl mnop` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `PORT` | ✅ Yes | Server port | `10000` |
| `CLIENT_URL` | ✅ Yes | Frontend URL | `https://career-guidance-frontend-96nv.onrender.com` |
| `API_URL` | ⚠️ Optional | API URL for docs | `https://your-service.onrender.com` |

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] All environment variables are set in Render
- [ ] Firebase Admin initializes successfully (check logs)
- [ ] Email service is configured and tested
- [ ] Health check endpoint returns `200 OK`
- [ ] CORS is configured correctly
- [ ] Frontend can connect to backend API
- [ ] API documentation is accessible
- [ ] Server logs show no errors
- [ ] Auto-deploy is enabled
- [ ] Monitoring/alerts are set up

---

## 🎉 You're Done!

Your backend server should now be live and accessible. The API will be available at:
```
https://your-service-name.onrender.com/api
```

**Next Steps:**
1. Test all API endpoints
2. Update frontend to use the new API URL
3. Monitor logs for the first few days
4. Set up backups if needed

---

## 📞 Need Help?

If you encounter issues:
1. Check the **Logs** tab in Render dashboard
2. Review the troubleshooting section above
3. Verify all environment variables are set correctly
4. Test locally first to ensure code works

---

**Last Updated:** 2024
**Platform:** Render.com
**Node Version:** Check your `package.json` for required version

