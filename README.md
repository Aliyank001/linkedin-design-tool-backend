# LinkedIn Design Tool - Backend API

RESTful API backend for the LinkedIn Design Tool web application with user authentication, admin panel, and payment verification system.

## 🌟 Features

### Core Functionality
- **User Authentication** - JWT-based login/register
- **Payment Verification** - Manual approval workflow with screenshot upload
- **Admin Panel** - Dashboard for user management
- **Role-Based Access** - User and admin roles
- **Subscription Tracking** - 30-day renewal system
- **File Upload** - Secure payment screenshot storage
- **MongoDB Database** - User and admin data persistence

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration with payment upload
- `POST /login` - User login
- `GET /status` - Check authentication status

#### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /design-access` - Verify designer access permission

#### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `GET /dashboard` - Dashboard analytics
- `GET /users` - List all users (with filters)
- `GET /users/:id` - Get specific user
- `POST /users/:id/approve` - Approve user (sets 30-day subscription)
- `POST /users/:id/reject` - Reject user with reason
- `DELETE /users/:id` - Delete user

### Admin Panel
- **Login Page** - Secure admin authentication
- **Dashboard** - Analytics and pending approvals
- **User Management** - View, approve, reject, delete users
- **Subscription Tracking** - View renewal dates and days remaining

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/linkedin-design-tool-backend.git
cd linkedin-design-tool-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure `.env` file**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/linkedin-design-tool

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
ADMIN_JWT_SECRET=your-admin-jwt-secret-here

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Admin Name

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

5. **Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

6. **Create admin account**
```bash
npm run seed
```

7. **Start the server**
```bash
npm start
```

Server runs at: `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── server.js                  # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore               # Git ignore rules
│
├── config/
│   └── db.js                # MongoDB connection
│
├── models/
│   ├── User.js              # User schema
│   └── Admin.js             # Admin schema
│
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── userController.js    # User operations
│   └── adminController.js   # Admin operations
│
├── middleware/
│   ├── auth.js              # User JWT verification
│   ├── adminAuth.js         # Admin JWT verification
│   └── upload.js            # File upload config
│
├── routes/
│   ├── auth.js              # Auth routes
│   ├── user.js              # User routes
│   └── admin.js             # Admin routes
│
├── scripts/
│   └── seedAdmin.js         # Create admin user
│
├── uploads/
│   └── payment-screenshots/ # Uploaded files
│
└── admin-panel/
    ├── index.html           # Admin login
    ├── dashboard.html       # Dashboard
    ├── users.html          # User management
    ├── css/
    │   └── admin.css       # Admin styles
    └── js/
        ├── login.js        # Login handler
        ├── dashboard.js    # Dashboard logic
        └── users.js        # User management logic
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  paymentMethod: Enum ['binance', 'easypaisa', 'nayapay'],
  paymentScreenshot: String (file path),
  isApproved: Boolean,
  status: Enum ['pending', 'approved', 'rejected'],
  rejectionReason: String,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date (30 days from approval),
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (default: 'admin'),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

### JWT Tokens
- **User Token**: 7-day expiration
- **Admin Token**: 7-day expiration
- Stored in `localStorage` on frontend

### Password Security
- Hashed with bcryptjs (10 rounds)
- Never returned in API responses
- Password strength requirements enforced

### Protected Routes
```javascript
// User routes require protect middleware
router.get('/profile', protect, getProfile);

// Admin routes require protectAdmin middleware
router.get('/dashboard', protectAdmin, getDashboard);
```

## 📤 File Upload

### Configuration
- **Max File Size**: 5MB
- **Allowed Types**: JPEG, PNG
- **Storage**: `uploads/payment-screenshots/`
- **Naming**: UUID + original extension

### Security
- File type validation
- File size limits
- Sanitized filenames
- Served via static middleware

## 🔒 Security Features

### Helmet.js
- Content Security Policy configured
- XSS protection
- MIME type sniffing prevention
- Clickjacking protection

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to `/api/*` routes

### CORS
- Configurable origin
- Credentials support
- Options pre-flight handling

### Input Validation
- Email format validation
- Password strength requirements
- File type checking
- Request body sanitization

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "token": "jwt-token-here"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔧 NPM Scripts

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm run seed       # Create admin user
```

## 🌐 Admin Panel Access

**URL:** `http://localhost:5000/admin`

**Features:**
- Secure login page
- Dashboard with analytics:
  - Total users
  - Approved users
  - Pending approvals
  - Rejected users
  - Active users (7 days)
  - Approval rate
- Pending users table with approve/reject
- All users management with filters
- User details modal
- Subscription renewal tracking

## 📈 Dashboard Analytics

- **Total Users**: All registered users
- **Approved Users**: Users with access
- **Pending Users**: Awaiting approval
- **Rejected Users**: Denied access
- **Active Users**: Logged in last 7 days
- **Approval Rate**: Percentage approved

## 🔄 User Approval Workflow

1. User registers with payment screenshot
2. Status set to `pending`
3. Admin reviews in dashboard
4. Admin approves or rejects:
   - **Approve**: Sets `status='approved'`, `subscriptionStartDate=now`, `subscriptionEndDate=now+30days`
   - **Reject**: Sets `status='rejected'`, stores reason
5. User can login if approved

## 📅 Subscription System

- **Duration**: 30 days from approval
- **Start Date**: When admin approves
- **End Date**: Start date + 30 days
- **Renewal**: Manual (admin re-approves)
- **Display**: Shows days left in admin panel

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB service
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### Admin Can't Login
```bash
# Re-run seed script
npm run seed
```

### File Upload Fails
- Check `uploads/` folder exists
- Verify file size < 5MB
- Ensure file is JPEG/PNG

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in `.env`
2. Change all secrets and passwords
3. Use MongoDB Atlas for production database
4. Set strong JWT secrets
5. Configure CORS for production domain

### Platform Guides

#### DigitalOcean (Recommended)
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone YOUR_REPO
cd backend
npm install
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name linkedin-backend
pm2 save
pm2 startup
```

#### Heroku
```bash
# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set ADMIN_EMAIL=admin@example.com

# Deploy
git push heroku main
```

### SSL/HTTPS
Use Let's Encrypt with Nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🔐 Production Security Checklist

- [ ] Change all `.env` secrets
- [ ] Change admin password
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable MongoDB authentication
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular backups
- [ ] Monitor server logs
- [ ] Update dependencies regularly
- [ ] Use environment variables (never hardcode)

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | Database connection string | mongodb://localhost:27017/dbname |
| JWT_SECRET | User token secret | random-32-char-string |
| JWT_EXPIRE | Token expiration | 7d |
| ADMIN_JWT_SECRET | Admin token secret | random-32-char-string |
| ADMIN_EMAIL | Default admin email | admin@example.com |
| ADMIN_PASSWORD | Default admin password | SecurePassword123! |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| FRONTEND_URL | Frontend domain | http://localhost:5000 |

## 🛠️ Technologies Used

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Express Rate Limit** - API throttling
- **dotenv** - Environment config

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Developer Notes

### Adding New Routes
```javascript
// 1. Create controller
exports.newFeature = async (req, res) => { ... };

// 2. Add to routes file
router.post('/feature', protect, newFeature);

// 3. Test endpoint
```

### Database Queries
```javascript
// Always use try-catch
try {
  const users = await User.find({ status: 'approved' });
  res.json({ success: true, data: users });
} catch (error) {
  res.status(500).json({ success: false, error: error.message });
}
```

## 🔍 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/health

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test@123"}'

# User login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Built with ❤️ for LinkedIn content creators**
