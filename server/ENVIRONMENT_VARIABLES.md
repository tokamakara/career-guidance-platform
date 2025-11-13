# Environment Variables Quick Reference

Copy and paste these into your Render.com environment variables section.

## 🔥 Firebase Configuration

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_CLIENT_ID=
FIREBASE_CLIENT_CERT_URL=
```

## 📧 Email Configuration

```
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=
```

## 🌍 Server Configuration

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://career-guidance-frontend-96nv.onrender.com
API_URL=https://your-service-name.onrender.com
```

---

## 📝 How to Fill These Values

### Firebase Values (from serviceAccountKey.json):

1. **FIREBASE_PROJECT_ID**: `project_id` field
2. **FIREBASE_CLIENT_EMAIL**: `client_email` field
3. **FIREBASE_PRIVATE_KEY**: `private_key` field (replace `\n` with actual newlines)
4. **FIREBASE_PRIVATE_KEY_ID**: `private_key_id` field
5. **FIREBASE_CLIENT_ID**: `client_id` field
6. **FIREBASE_CLIENT_CERT_URL**: `client_x509_cert_url` field

### Email Values:

1. **EMAIL_USER**: Your Gmail address (e.g., `yourname@gmail.com`)
2. **EMAIL_PASS**: 16-character App Password from Google Account settings

### Server Values:

1. **API_URL**: Replace `your-service-name` with your actual Render service name

---

## ⚠️ Important Notes

- **FIREBASE_PRIVATE_KEY**: Must have actual line breaks, not `\n` text
- **EMAIL_PASS**: Use App Password, not your regular Gmail password
- **CLIENT_URL**: Must match your frontend URL exactly (including `https://`)
- All values are case-sensitive

