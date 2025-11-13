# Firestore Security Rules Setup Guide

## Overview
This guide explains how to set up Firestore security rules for the Career & Education Gateway platform.

## Rules File
The security rules are defined in `firestore.rules` in the project root.

## How to Deploy Rules

### Option 1: Using Firebase Console (Recommended for Quick Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`job-int-123`)
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Using Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Use the existing `firestore.rules` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 3: Using Firebase CLI from Project Root

If you have Firebase CLI installed and configured:

```bash
# From project root
firebase deploy --only firestore:rules
```

## Rules Summary

### Users Collection
- ✅ **Create**: Authenticated users can create their own profile during registration
- ✅ **Read**: Users can read their own profile; admins can read all
- ✅ **Update**: Users can update their own profile (with restrictions on role/status)
- ✅ **Delete**: Admin only

### Companies Collection
- ✅ **Create**: Authenticated users can create their own company record during registration
- ✅ **Read**: Company owners, students, and admins can read
- ✅ **Update**: Company owners can update their own data
- ✅ **Delete**: Admin only

### Institutions Collection
- ✅ **Create**: Authenticated users can create their own institution record during registration
- ✅ **Read**: Institution owners, students, and admins can read
- ✅ **Update**: Institution owners can update their own data
- ✅ **Delete**: Admin only

### Jobs Collection
- ✅ **Create**: Companies can create jobs
- ✅ **Read**: Company owners, students, and admins can read
- ✅ **Update/Delete**: Company owners can manage their own jobs

### Applications Collections
- ✅ **Create**: Students can create applications
- ✅ **Read**: Students can read their own applications; companies/institutions can read applications for their jobs/courses
- ✅ **Update**: Students can update their own applications; companies/institutions can update applications for their jobs/courses

### Notifications Collection
- ✅ **Read**: Users can read their own notifications
- ✅ **Create**: System can create notifications for users
- ✅ **Update**: Users can mark their notifications as read

## Security Features

1. **Email Verification**: Users must use their authenticated email when creating profiles
2. **Status Restrictions**: New company/institution registrations must have 'pending' status
3. **Role Restrictions**: Users cannot change their own role or status (admin only)
4. **Active Check**: Suspended users cannot perform write operations
5. **Ownership Validation**: Users can only create/update their own records

## Testing Rules

You can test your rules using the Firebase Console Rules Playground:

1. Go to Firestore Database → Rules tab
2. Click **Rules Playground**
3. Select a collection and operation
4. Test different scenarios

## Troubleshooting

### "Missing or insufficient permissions" Error

If you still get permission errors after deploying rules:

1. **Check Rule Syntax**: Ensure rules are valid (no syntax errors)
2. **Verify User Authentication**: Make sure user is authenticated (`request.auth != null`)
3. **Check Email Match**: For profile creation, email must match `request.auth.token.email`
4. **Verify Status**: User account must not be suspended
5. **Check Field Requirements**: Ensure all required fields are present

### Common Issues

- **Rules not updating**: Clear browser cache and wait a few minutes
- **Syntax errors**: Use Firebase Console to validate rules before publishing
- **Permission denied**: Check that user is authenticated and has the correct role

## Important Notes

⚠️ **Never commit sensitive data** in security rules
⚠️ **Test rules thoroughly** before deploying to production
⚠️ **Review rules regularly** to ensure they match your application's needs
⚠️ **Monitor Firestore usage** in Firebase Console for any unauthorized access attempts

## Support

If you encounter issues:
1. Check Firebase Console → Firestore → Rules for syntax errors
2. Review the rules in `firestore.rules` file
3. Test in Rules Playground
4. Check Firebase documentation: https://firebase.google.com/docs/firestore/security/get-started

