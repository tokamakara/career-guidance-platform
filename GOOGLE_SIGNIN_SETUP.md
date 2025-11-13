# 🔐 Google Sign-In Setup for Production

## Problem
Google sign-in works locally but not in production because Firebase needs to authorize your production domain.

## Solution: Add Authorized Domain in Firebase Console

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **job-int-123**

### Step 2: Add Authorized Domain
1. Click **Authentication** in the left sidebar
2. Click on the **Settings** tab (gear icon)
3. Scroll down to **Authorized domains**
4. Click **Add domain**
5. Enter your production domain: `career-guidance-frontend-96nv.onrender.com`
6. Click **Add**

### Step 3: Verify OAuth Consent Screen (if needed)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **job-int-123**
3. Go to **APIs & Services** → **OAuth consent screen**
4. Make sure:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App name**: Career Guidance Platform (or your app name)
   - **Authorized domains**: Should include `onrender.com`
   - **Scopes**: Should include `email`, `profile`, `openid`

### Step 4: Verify OAuth Client Configuration
1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your **OAuth 2.0 Client ID** (Web application)
3. Under **Authorized JavaScript origins**, add:
   - `https://career-guidance-frontend-96nv.onrender.com`
4. Under **Authorized redirect URIs**, add:
   - `https://career-guidance-frontend-96nv.onrender.com`
   - `https://career-guidance-frontend-96nv.onrender.com/__/auth/handler`

### Step 5: Test
1. Deploy your frontend
2. Try signing in with Google on the production site
3. It should work now!

## Common Issues

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in OAuth Client matches exactly:
- `https://career-guidance-frontend-96nv.onrender.com/__/auth/handler`

### Issue: "This app isn't verified"
**Solution**: 
- For testing, you can add test users in OAuth consent screen
- For production, you'll need to verify your app with Google (takes time)

### Issue: Popup blocked
**Solution**: 
- Check browser popup settings
- Make sure the domain is in authorized domains

## Quick Checklist
- [ ] Added domain to Firebase Authorized domains
- [ ] Added domain to OAuth Client JavaScript origins
- [ ] Added redirect URI to OAuth Client
- [ ] OAuth consent screen configured
- [ ] Tested on production site

