# LinkedIn Design Tool - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - Local: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Cloud: [Free MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional) - For version control

## 🚀 Installation Steps

### Step 1: Install Dependencies

Open PowerShell in the `backend` folder and run:

```powershell
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- multer
- helmet
- express-validator
- express-rate-limit

### Step 2: Configure MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`
4. The `.env` file is already configured for local MongoDB

#### Option B: MongoDB Atlas (Cloud - Recommended for production)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linkedin-design-tool
   ```

### Step 3: Create Default Admin

Run the seed script to create the default admin account:

```powershell
npm run seed-admin
```

You should see:
```
✅ Default admin created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@linkedindesign.com
Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Start the Server

#### Development Mode (with auto-reload):
```powershell
npm run dev
```

#### Production Mode:
```powershell
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   LinkedIn Design Tool - Backend API Server          ║
║                                                       ║
║   Server running on: http://localhost:5000           ║
║   Admin Panel: http://localhost:5000/admin           ║
║   Environment: development                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

MongoDB Connected: localhost
Database: linkedin-design-tool
```

## 🎯 Quick Setup Script

For automated setup, run:

```powershell
.\setup.ps1
```

This script will:
- Check Node.js and npm installation
- Install all dependencies
- Create default admin account
- Display next steps

## 🔐 Access Admin Panel

1. Open your browser
2. Navigate to: `http://localhost:5000/admin`
3. Login with:
   - **Email:** admin@linkedindesign.com
   - **Password:** Admin@123456
4. **⚠️ IMPORTANT:** Change password immediately after first login!

## 📡 Testing the API

### Health Check
```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "LinkedIn Design Tool API is running",
  "timestamp": "2025-12-29T..."
}
```

### Test Registration (using PowerShell)
```powershell
# Create a test image file first
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = "path\to\test-image.jpg"

$body = @"
--$boundary
Content-Disposition: form-data; name="name"

Test User
--$boundary
Content-Disposition: form-data; name="email"

test@example.com
--$boundary
Content-Disposition: form-data; name="password"

Password123
--$boundary
Content-Disposition: form-data; name="paymentMethod"

binance
--$boundary
Content-Disposition: form-data; name="paymentScreenshot"; filename="screenshot.jpg"
Content-Type: image/jpeg

$(Get-Content $filePath -Raw)
--$boundary--
"@

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
```

## 📁 Project Structure After Setup

```
backend/
├── node_modules/           # Installed dependencies
├── uploads/
│   └── payment-screenshots/ # User payment uploads
├── .env                    # Environment configuration
├── server.js              # Running server
└── admin-panel/           # Admin dashboard
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Error
**Error:** `MongoNetworkError: failed to connect to server`

**Solutions:**
1. Ensure MongoDB is running:
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   
   # Start MongoDB service
   Start-Service MongoDB
   ```

2. If using MongoDB Atlas:
   - Check internet connection
   - Verify connection string in `.env`
   - Whitelist your IP address in Atlas dashboard

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change port in `.env`:
   ```
   PORT=5001
   ```

2. Or find and kill the process using port 5000:
   ```powershell
   # Find process
   netstat -ano | findstr :5000
   
   # Kill process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

### Issue: npm install fails
**Error:** Various dependency errors

**Solutions:**
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. Use Node.js v14 or higher:
   ```powershell
   node --version
   ```

### Issue: Admin already exists
**Error:** When running `npm run seed-admin`

**Solution:**
This is normal if you've already created an admin. To reset:
1. Connect to MongoDB
2. Delete the admin collection
3. Run seed script again

## 🌐 Connecting Frontend

### Update Frontend API Configuration

In your frontend JavaScript files (register.js, login.js, designer.js):

```javascript
// Add at the top of each file
const API_BASE = 'http://localhost:5000';

// Registration
const formData = new FormData();
formData.append('name', name);
formData.append('email', email);
formData.append('password', password);
formData.append('paymentMethod', paymentMethod);
formData.append('paymentScreenshot', screenshotFile);

const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    body: formData
});
```

### Enable CORS for Frontend

If your frontend runs on a different port, update `.env`:

```env
FRONTEND_URL=http://localhost:3000
```

Or allow all origins (development only):
```env
FRONTEND_URL=*
```

## 📊 Monitoring & Logs

### View Server Logs
All logs appear in the console where you ran `npm run dev`

### Check Database
Use MongoDB Compass (GUI) or mongo shell:

```powershell
# Connect to MongoDB
mongo

# Use database
use linkedin-design-tool

# View users
db.users.find().pretty()

# Count users by status
db.users.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

## 🔒 Security Checklist

Before going to production:

- [ ] Change JWT secrets in `.env`
- [ ] Change admin password
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up MongoDB authentication
- [ ] Use strong passwords
- [ ] Enable rate limiting (already configured)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Review and test all endpoints

## 📞 Need Help?

1. **Check logs:** Console output when server is running
2. **MongoDB:** Ensure it's running and accessible
3. **Environment:** Verify `.env` configuration
4. **Dependencies:** Ensure all packages are installed
5. **Port:** Make sure port 5000 is not in use

## 🎉 Success Indicators

You know everything is working when:

✅ Server starts without errors  
✅ MongoDB connection successful  
✅ Admin panel loads at http://localhost:5000/admin  
✅ Can login to admin panel  
✅ Dashboard shows analytics  
✅ Can register test user via API  
✅ Payment screenshots upload successfully  

## 📖 Next Steps

1. ✅ Backend is running
2. ✅ Admin panel accessible
3. ➡️ Test user registration
4. ➡️ Approve users via admin panel
5. ➡️ Integrate with frontend
6. ➡️ Test complete user flow
7. ➡️ Deploy to production

---

**Ready to use!** Your LinkedIn Design Tool backend is now fully operational! 🚀
