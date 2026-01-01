# LinkedIn Design Tool - Backend Quick Setup Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " LinkedIn Design Tool - Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host ""
Write-Host "[2/5] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host ""
Write-Host "[4/5] Checking MongoDB..." -ForegroundColor Yellow
Write-Host "Make sure MongoDB is running on localhost:27017" -ForegroundColor Gray
Write-Host "Or update MONGODB_URI in .env for MongoDB Atlas" -ForegroundColor Gray

# Create default admin
Write-Host ""
Write-Host "[5/5] Creating default admin account..." -ForegroundColor Yellow
npm run seed-admin

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Start the server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Access the admin panel:" -ForegroundColor White
Write-Host "   http://localhost:5000/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor White
Write-Host "   Email: admin@linkedindesign.com" -ForegroundColor Yellow
Write-Host "   Password: Admin@123456" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Change the password after first login!" -ForegroundColor Red
Write-Host ""
