# Pre-Deployment Checklist Script
# Run this before deploying to production

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check if in backend directory
if (!(Test-Path "server.js")) {
    Write-Host "❌ ERROR: Must run from backend directory" -ForegroundColor Red
    exit 1
}

# Check .env file exists
Write-Host "[1/10] Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    
    # Check critical env variables
    $envContent = Get-Content ".env" -Raw
    
    $criticalVars = @(
        "MONGODB_URI",
        "JWT_SECRET",
        "JWT_ADMIN_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD"
    )
    
    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=\s*$" -or $envContent -notmatch $var) {
            Write-Host "  ⚠ Warning: $var is not set or empty" -ForegroundColor Yellow
            $warnings++
        }
    }
    
    # Check for default secrets
    if ($envContent -match "linkedin_design_tool_secret_key_12345") {
        Write-Host "  ❌ ERROR: Using default JWT_SECRET! CHANGE IT!" -ForegroundColor Red
        $errors++
    }
    
    if ($envContent -match "Admin@123456") {
        Write-Host "  ⚠ Warning: Using default admin password" -ForegroundColor Yellow
        $warnings++
    }
    
    # Check NODE_ENV
    if ($envContent -match "NODE_ENV=production") {
        Write-Host "  ✓ NODE_ENV is set to production" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: NODE_ENV should be 'production'" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    $errors++
}

# Check node_modules
Write-Host ""
Write-Host "[2/10] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Run 'npm install' first" -ForegroundColor Red
    $errors++
}

# Run npm audit
Write-Host ""
Write-Host "[3/10] Checking for security vulnerabilities..." -ForegroundColor Yellow
$auditResult = npm audit --json 2>$null | ConvertFrom-Json
if ($auditResult.metadata.vulnerabilities.total -gt 0) {
    Write-Host "  ⚠ Warning: Found $($auditResult.metadata.vulnerabilities.total) vulnerabilities" -ForegroundColor Yellow
    Write-Host "  Run 'npm audit fix' to fix them" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✓ No vulnerabilities found" -ForegroundColor Green
}

# Check uploads directory
Write-Host ""
Write-Host "[4/10] Checking uploads directory..." -ForegroundColor Yellow
if (Test-Path "uploads/payment-screenshots") {
    Write-Host "✓ Uploads directory exists" -ForegroundColor Green
} else {
    Write-Host "  Creating uploads directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path "uploads/payment-screenshots" -Force | Out-Null
    Write-Host "✓ Uploads directory created" -ForegroundColor Green
}

# Check frontend files
Write-Host ""
Write-Host "[5/10] Checking frontend files..." -ForegroundColor Yellow
$requiredFiles = @(
    "../index.html",
    "../designer.html",
    "../login.html",
    "../register.html",
    "../js/main.js",
    "../js/designer.js",
    "../js/login.js",
    "../js/register.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✓ All frontend files present" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Warning: Missing files:" -ForegroundColor Yellow
    $missingFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    $warnings++
}

# Test MongoDB connection
Write-Host ""
Write-Host "[6/10] Testing MongoDB connection..." -ForegroundColor Yellow
try {
    $env:NODE_ENV = "test"
    $testResult = node -e "require('./config/db')().then(() => { console.log('OK'); process.exit(0); }).catch(() => process.exit(1));" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Cannot connect to MongoDB" -ForegroundColor Red
        Write-Host "  Check MONGODB_URI in .env" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "⚠ Warning: Could not test MongoDB connection" -ForegroundColor Yellow
    $warnings++
}

# Check for console.log in production code
Write-Host ""
Write-Host "[7/10] Checking for console.log statements..." -ForegroundColor Yellow
$consoleLogFiles = Get-ChildItem -Recurse -Include "*.js" -Exclude "node_modules","scripts" | Select-String -Pattern "console\.log" -SimpleMatch
if ($consoleLogFiles) {
    Write-Host "  ⚠ Warning: Found console.log in production code" -ForegroundColor Yellow
    Write-Host "  Consider removing for production" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✓ No console.log found" -ForegroundColor Green
}

# Check CORS configuration
Write-Host ""
Write-Host "[8/10] Checking CORS configuration..." -ForegroundColor Yellow
$serverContent = Get-Content "server.js" -Raw
if ($serverContent -match "origin:.*\*") {
    Write-Host "  ⚠ Warning: CORS allows all origins (*)" -ForegroundColor Yellow
    Write-Host "  Set FRONTEND_URL to your domain in production" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✓ CORS configured with specific origins" -ForegroundColor Green
}

# Check admin panel files
Write-Host ""
Write-Host "[9/10] Checking admin panel..." -ForegroundColor Yellow
if (Test-Path "admin-panel/index.html") {
    Write-Host "✓ Admin panel files present" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Admin panel files missing" -ForegroundColor Red
    $errors++
}

# Check for .gitignore
Write-Host ""
Write-Host "[10/10] Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env" -and $gitignoreContent -match "node_modules") {
        Write-Host "✓ .gitignore properly configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: .gitignore may be incomplete" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "⚠ Warning: No .gitignore file" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 All checks passed! Ready for deployment!" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠ $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "Review warnings before deploying" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ $errors error(s) and $warnings warning(s) found" -ForegroundColor Red
    Write-Host "Fix errors before deploying!" -ForegroundColor Red
    exit 1
}
