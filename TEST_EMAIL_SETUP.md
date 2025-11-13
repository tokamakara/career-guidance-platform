# Testing Email Configuration

## Step 1: Check Render.com Logs

1. Go to your Render.com dashboard
2. Select service: `career-guidance-backend-70ny`
3. Click on **Logs** tab
4. Look for one of these messages:

### ✅ Success Message:
```
✅ Email service configured and verified
```

### ❌ Error Messages:
```
⚠️  Email service not configured: EMAIL_USER or EMAIL_PASS missing
❌ Email transporter verification failed
```

## Step 2: Test Registration

1. Go to your live site: `https://career-guidance-frontend-96nv.onrender.com`
2. Click "Sign Up" or "Register"
3. Fill out the registration form
4. Submit the form

## Step 3: What Should Happen

### If Email is Configured Correctly:
- ✅ Registration completes successfully
- ✅ User receives verification email at their registered email address
- ✅ Email is sent from: `tokamakara4@gmail.com`
- ✅ Email subject: "Verify Your Email - Career & Education Gateway"

### If Email is NOT Configured:
- ✅ Registration still completes (user is created)
- ❌ No verification email is sent
- ⚠️ Server logs show: "Email service not configured"

## Step 4: Check Email Inbox

1. Check the inbox of the email used for registration
2. Check **Spam/Junk folder** (emails might go there)
3. Look for email from: `tokamakara4@gmail.com`
4. Subject: "Verify Your Email - Career & Education Gateway"

## Step 5: Verify Email

1. Open the verification email
2. Click the "Verify Email Address" button
3. Or copy the verification link and paste in browser
4. User should be redirected to login page
5. User can now log in

## Troubleshooting

### No Email Received?
1. Check Render.com logs for email sending errors
2. Check spam folder
3. Verify EMAIL_USER and EMAIL_PASS are correct in Render.com
4. Make sure service was restarted after adding variables

### Registration Timeout?
- I've increased timeout to 60 seconds for Render.com
- If still timing out, the server might be starting up (cold start)
- Try again in a few seconds

### Email Service Not Verified?
- Double-check EMAIL_PASS has no spaces
- Verify EMAIL_USER is correct Gmail address
- Make sure you're using App Password, not regular password
- Restart the service after adding variables

