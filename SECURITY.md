# Security Hardening Guide

## 🔒 CRITICAL: Change Default Credentials

### 1. Change Admin Password

**Current Default:**
- Email: `admin@linkedindesign.com`
- Password: `Admin@123456`

**Steps to Change:**

1. Login to admin panel: http://localhost:5000/admin
2. After first login, immediately change password
3. Or run seed script with new password:

```powershell
# Edit backend/.env file first:
ADMIN_PASSWORD=YourNewStrongPassword123!

# Then re-run seed:
npm run seed-admin
```

---

### 2. Update JWT Secrets

**NEVER use default secrets in production!**

Generate strong random secrets:

```powershell
# Generate random strings (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

Update in `.env`:

```env
JWT_SECRET=your_super_secure_random_string_here_64_chars_minimum
JWT_ADMIN_SECRET=another_super_secure_random_string_64_chars_minimum
```

---

### 3. Secure MongoDB

#### Option A: Local MongoDB with Authentication

```bash
# Create admin user in MongoDB
mongo
use admin
db.createUser({
  user: "linkedinAdmin",
  pwd: "strong_password_here",
  roles: [ { role: "readWrite", db: "linkedin-design-tool" } ]
})
```

Update `.env`:
```env
MONGODB_URI=mongodb://linkedinAdmin:strong_password_here@localhost:27017/linkedin-design-tool
```

#### Option B: MongoDB Atlas (Recommended)

1. Create free cluster at https://mongodb.com/cloud/atlas
2. Create database user with strong password
3. Whitelist IP addresses
4. Get connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linkedin-design-tool?retryWrites=true&w=majority
```

---

### 4. Environment Variables Checklist

Update ALL of these in `.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database - CHANGE THIS!
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets - CHANGE THESE!
JWT_SECRET=generate_64_char_random_string_here
JWT_ADMIN_SECRET=generate_another_64_char_random_string
JWT_EXPIRE=7d

# Admin Credentials - CHANGE THESE!
ADMIN_EMAIL=your_admin_email@yourdomain.com
ADMIN_PASSWORD=YourStrongPassword123!@#

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/payment-screenshots
```

---

### 5. HTTPS/SSL Certificate

#### For Production:

1. **Get SSL Certificate:**
   - Let's Encrypt (Free): https://letsencrypt.org/
   - Cloudflare (Free): https://www.cloudflare.com/
   - Or from hosting provider

2. **Update Node.js Server:**

```javascript
// backend/server.js
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(PORT);
```

3. **Or Use Nginx Reverse Proxy (Recommended):**

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 6. Rate Limiting Configuration

Already configured in `server.js`:

```javascript
// Increase/decrease based on your needs
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests
});
```

**Recommended Settings:**

- **Development:** 100 requests / 15 min
- **Production:** 50 requests / 15 min (stricter)
- **API endpoints:** 10 requests / minute (very strict)

---

### 7. CORS Configuration

Update `.env` for production:

```env
# Allow only your domain
FRONTEND_URL=https://yourdomain.com

# Or multiple domains (comma-separated)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```

In `server.js`:

```javascript
const corsOptions = {
    origin: process.env.FRONTEND_URL.split(','),
    credentials: true,
    optionsSuccessStatus: 200
};
```

---

### 8. File Upload Security

**Already Implemented:**
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Files stored outside public folder

**Additional Recommendations:**

1. **Scan uploaded files:**
   - Use ClamAV or similar antivirus
   - Check file headers, not just extensions

2. **Rename uploaded files:**
   - Currently done (UUID naming)
   - Never use original filenames

3. **Serve uploads from separate subdomain:**
   - `uploads.yourdomain.com`
   - Prevents XSS attacks

---

### 9. Database Backup

**Setup Automatic Backups:**

```powershell
# MongoDB backup script (run daily via Task Scheduler)
mongodump --uri="mongodb://localhost:27017/linkedin-design-tool" --out="C:\backups\mongodb\$(Get-Date -Format 'yyyy-MM-dd')"
```

**MongoDB Atlas:**
- Automatic backups included
- Can restore to any point in time

---

### 10. Security Headers

Already implemented via Helmet.js:

```javascript
app.use(helmet());
```

This adds:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection`

---

### 11. Input Validation

**Backend validation already implemented:**
- Email format validation
- Password strength requirements
- File type/size validation
- SQL injection prevention (Mongoose)

**Additional Recommendations:**
- Sanitize all user inputs
- Validate all API requests
- Use express-validator (already installed)

---

### 12. Session Management

**Current Implementation:**
- JWT tokens (7-day expiry)
- Stored in localStorage

**Best Practices:**
- ✅ Use HTTPS only
- ✅ Short token expiry
- ✅ Separate admin/user tokens
- Consider: Refresh tokens for better UX

---

### 13. Error Handling

**Don't expose stack traces in production!**

Already configured in `server.js`:

```javascript
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
```

Set `NODE_ENV=production` in `.env`

---

### 14. Logging & Monitoring

**Recommended Tools:**
- Winston (logging)
- Morgan (HTTP logging)
- PM2 (process management + monitoring)

**Install:**

```powershell
npm install winston morgan pm2 -g
```

---

### 15. Dependency Security

**Check for vulnerabilities:**

```powershell
npm audit
npm audit fix
```

**Keep packages updated:**

```powershell
npm update
npm outdated
```

---

## ✅ Pre-Production Checklist

Before deploying:

- [ ] Changed admin email and password
- [ ] Generated new JWT secrets (64+ characters)
- [ ] Configured MongoDB authentication
- [ ] Set NODE_ENV=production
- [ ] Enabled HTTPS/SSL
- [ ] Configured proper CORS
- [ ] Set up file upload scanning
- [ ] Configured automatic backups
- [ ] Tested all security features
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Set up monitoring/logging
- [ ] Document all credentials securely
- [ ] Create admin user guide
- [ ] Test password reset flow
- [ ] Set up rate limiting
- [ ] Configure firewall rules

---

## 🔐 Secure Credential Storage

**NEVER:**
- Commit `.env` to Git
- Share credentials via email/chat
- Use default passwords in production
- Store passwords in plain text

**DO:**
- Use password managers (1Password, LastPass)
- Use environment variables
- Rotate credentials regularly
- Use different passwords for each service

---

## 📞 Security Incident Response

If compromised:

1. **Immediately:**
   - Change all passwords
   - Rotate JWT secrets
   - Check server logs
   - Revoke all active sessions

2. **Investigate:**
   - Check database for unauthorized changes
   - Review access logs
   - Identify breach source

3. **Notify:**
   - Inform affected users
   - Document the incident
   - Implement fixes

---

## 📚 Additional Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Checklist: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
- MongoDB Security: https://docs.mongodb.com/manual/security/

---

**Security is an ongoing process, not a one-time setup!**

Regularly review and update security measures. 🔒
