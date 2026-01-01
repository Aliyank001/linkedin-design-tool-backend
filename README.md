# LinkedIn Design Tool - Backend & Admin Panel

Complete backend API and admin panel for the LinkedIn Design Tool application.

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js             # User model
│   └── Admin.js            # Admin model
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── adminAuth.js        # Admin authentication
│   └── upload.js           # File upload handler
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── user.js             # User routes
│   └── admin.js            # Admin routes
├── controllers/
│   ├── authController.js   # Auth logic
│   ├── userController.js   # User logic
│   └── adminController.js  # Admin logic
├── scripts/
│   └── seedAdmin.js        # Create default admin
├── uploads/
│   └── payment-screenshots/ # Uploaded payment screenshots
└── admin-panel/            # Admin panel frontend
    ├── index.html          # Admin login
    ├── dashboard.html      # Dashboard
    ├── users.html          # User management
    ├── css/
    │   └── admin.css
    └── js/
        ├── login.js
        ├── dashboard.js
        └── users.js
```

## 🚀 Quick Start

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

#### Alternative: Use MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Use it in `.env` file

### 2. Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env and configure:
# - MONGODB_URI (if using Atlas, update the connection string)
# - JWT_SECRET (change to a random string)
# - JWT_ADMIN_SECRET (change to a different random string)
# - ADMIN_EMAIL and ADMIN_PASSWORD (default admin credentials)
```

### 3. Create Default Admin

```powershell
npm run seed-admin
```

This will create an admin account with:
- Email: `admin@linkedindesign.com`
- Password: `Admin@123456`

**⚠️ IMPORTANT: Change the password after first login!**

### 4. Start the Server

```powershell
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on: **http://localhost:5000**

### 5. Access Admin Panel

Open your browser and go to:
```
http://localhost:5000/admin
```

Login with default credentials and change the password immediately.

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: multipart/form-data

Fields:
- name: string
- email: string
- password: string
- paymentMethod: "binance" | "easypaisa" | "nayapay"
- paymentScreenshot: file (image)
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Status
```http
GET /api/auth/status?email=user@example.com
```

### User Routes (`/api/user`) - Requires Auth

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Check Design Access
```http
GET /api/user/design-access
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name"
}
```

### Admin Routes (`/api/admin`)

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@linkedindesign.com",
  "password": "Admin@123456"
}
```

#### Get Dashboard (requires admin auth)
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users
```http
GET /api/admin/users?status=pending&page=1&limit=20&search=email
Authorization: Bearer <admin_token>
```

#### Approve User
```http
POST /api/admin/users/:userId/approve
Authorization: Bearer <admin_token>
```

#### Reject User
```http
POST /api/admin/users/:userId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Payment screenshot is invalid"
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

## 🔐 User Access Flow

### 1. Visitor (No Login)
- Can view main website
- Cannot access designer page
- Can register

### 2. Registered User (Pending Approval)
- Status: `pending`
- isApproved: `false`
- Cannot login to designer
- Sees: "Your account is under review"

### 3. Approved User
- Admin approves via admin panel
- Status: `approved`
- isApproved: `true`
- Can login and access designer
- Can download designs

### 4. Rejected User
- Admin rejects with reason
- Status: `rejected`
- Cannot access system
- Sees rejection reason

## 👨‍💼 Admin Panel Features

### Dashboard
- **Analytics Cards:**
  - Total users
  - Approved users
  - Pending approvals
  - Rejected users
  - Active users (last 7 days)
  - Approval rate

- **Pending Users Table:**
  - View all users waiting for approval
  - See payment screenshots
  - Quick approve/reject

- **Recent Registrations:**
  - Latest user signups
  - Status overview

### User Management
- **Filter Users:**
  - All users
  - Pending
  - Approved
  - Rejected

- **Search:**
  - Search by name or email

- **User Actions:**
  - View full details
  - View payment screenshot
  - Approve user
  - Reject user (with reason)
  - Delete user

- **Pagination:**
  - 20 users per page
  - Navigate through pages

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Separate admin and user tokens
- ✅ Route protection middleware
- ✅ Input validation
- ✅ File upload validation (images only, max 5MB)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ CORS protection

## 📊 Database Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  paymentMethod: Enum ["binance", "easypaisa", "nayapay"],
  paymentScreenshot: String (file path),
  isApproved: Boolean (default: false),
  status: Enum ["pending", "approved", "rejected"],
  rejectionReason: String,
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Schema
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String,
  role: String (default: "admin"),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/linkedin-design-tool

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_ADMIN_SECRET=your_admin_jwt_secret_key_change_this
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@linkedindesign.com
ADMIN_PASSWORD=Admin@123456

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/payment-screenshots

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 📝 Common Tasks

### View Logs
```powershell
# Server logs will appear in console
# Check MongoDB connection status
# API request logs
```

### Reset Admin Password
1. Delete admin from database
2. Update `.env` with new password
3. Run `npm run seed-admin`

### Clear All Users
```javascript
// Connect to MongoDB shell or use MongoDB Compass
db.users.deleteMany({})
```

### View Uploaded Screenshots
Files are stored in: `backend/uploads/payment-screenshots/`

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Cannot Upload Files
- Check `uploads/payment-screenshots/` directory exists
- Verify file size < 5MB
- Ensure file is an image (jpg, png, gif)

### JWT Token Errors
- Token expired - user must login again
- Invalid token - check JWT_SECRET matches

### Admin Cannot Login
- Verify admin exists: `npm run seed-admin`
- Check admin credentials in `.env`
- Clear browser localStorage

## 🔄 Integration with Frontend

### Update Frontend URLs
In your frontend JavaScript files, update the API base URL:

```javascript
const API_BASE = 'http://localhost:5000';
```

### Register Form Integration
```javascript
const formData = new FormData();
formData.append('name', name);
formData.append('email', email);
formData.append('password', password);
formData.append('paymentMethod', paymentMethod);
formData.append('paymentScreenshot', file);

const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    body: formData
});
```

### Login Integration
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('userToken', data.token);
```

### Protect Designer Page
```javascript
const token = localStorage.getItem('userToken');

const response = await fetch('http://localhost:5000/api/user/design-access', {
    headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) {
    // Redirect to login or show error
    window.location.href = 'login.html';
}
```

## 📦 Production Deployment

### 1. Update Environment Variables
```env
NODE_ENV=production
MONGODB_URI=<your_production_mongodb_url>
JWT_SECRET=<strong_random_secret>
JWT_ADMIN_SECRET=<strong_random_secret>
FRONTEND_URL=<your_frontend_domain>
```

### 2. Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set secure CORS policy
- [ ] Configure MongoDB authentication
- [ ] Set up proper logging
- [ ] Configure backup strategy

### 3. Deployment Options
- **Heroku:** Easy deployment with MongoDB Atlas
- **DigitalOcean:** VPS with PM2 process manager
- **AWS:** EC2 + RDS/DocumentDB
- **Railway/Render:** Simple deployment platforms

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB connection
4. Verify environment variables

## 📄 License

This backend system is part of the LinkedIn Design Tool project.

---

**Built with Node.js, Express, MongoDB, and JWT Authentication**
