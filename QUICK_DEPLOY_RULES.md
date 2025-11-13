# Quick Guide: Deploy Firestore Rules

## Fastest Method (Firebase Console)

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `job-int-123`
3. **Navigate**: Firestore Database → **Rules** tab
4. **Copy Rules**: Open `firestore.rules` file and copy ALL contents
5. **Paste**: Paste into the Firebase Console rules editor
6. **Publish**: Click **Publish** button

That's it! Rules are now active.

## Verify Rules Are Working

After deploying, try registering a new user. The "Missing or insufficient permissions" error should be gone.

## Alternative: Firebase CLI

If you have Firebase CLI installed:

```bash
# From project root directory
firebase deploy --only firestore:rules
```

## What These Rules Do

✅ **Allow users to create their own profile** during registration  
✅ **Allow companies/institutions to create their own records**  
✅ **Prevent users from changing their role or status** (admin only)  
✅ **Allow users to read/update their own data**  
✅ **Block suspended users from writing**  

## Need Help?

Check `FIRESTORE_RULES_SETUP.md` for detailed instructions and troubleshooting.

