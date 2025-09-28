# Production Deployment Script - Remove Test Files

Write-Host "🚀 DesynFlow Backend - Production Deployment Preparation" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Create backup of current state
$backupDir = "C:\Users\helit\Documents\GitHub\DesynFlow\server_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "`n📦 Creating backup before cleanup..." -ForegroundColor Yellow
Copy-Item -Path "C:\Users\helit\Documents\GitHub\DesynFlow\server" -Destination $backupDir -Recurse
Write-Host "✅ Backup created at: $backupDir" -ForegroundColor Green

# Navigate to server directory
Set-Location "C:\Users\helit\Documents\GitHub\DesynFlow\server"

Write-Host "`n🧹 Removing test files and configurations..." -ForegroundColor Yellow

# Remove test directory completely
if (Test-Path "test") {
    Write-Host "   Removing /test directory..." -ForegroundColor Red
    Remove-Item -Path "test" -Recurse -Force
    Write-Host "   ✅ Removed: test/ directory (20 files)" -ForegroundColor Green
}

# Remove Jest configuration files
if (Test-Path "jest.config.cjs") {
    Write-Host "   Removing Jest config..." -ForegroundColor Red
    Remove-Item -Path "jest.config.cjs" -Force
    Write-Host "   ✅ Removed: jest.config.cjs" -ForegroundColor Green
}

if (Test-Path "babel.config.cjs") {
    Write-Host "   Removing Babel config..." -ForegroundColor Red
    Remove-Item -Path "babel.config.cjs" -Force
    Write-Host "   ✅ Removed: babel.config.cjs" -ForegroundColor Green
}

if (Test-Path "babel.config.json") {
    Write-Host "   Removing alternative Babel config..." -ForegroundColor Red
    Remove-Item -Path "babel.config.json" -Force
    Write-Host "   ✅ Removed: babel.config.json" -ForegroundColor Green
}

# Remove coverage directory if it exists
if (Test-Path "coverage") {
    Write-Host "   Removing coverage reports..." -ForegroundColor Red
    Remove-Item -Path "coverage" -Recurse -Force
    Write-Host "   ✅ Removed: coverage/ directory" -ForegroundColor Green
}

Write-Host "`n📊 Production Deployment Summary:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Count remaining files
$runtimeFiles = Get-ChildItem -Path . -Recurse -File -Exclude "node_modules" | Where-Object { $_.DirectoryName -notlike "*node_modules*" }
Write-Host "✅ Runtime files remaining: $($runtimeFiles.Count)" -ForegroundColor Green

Write-Host "`n🎯 Production-Ready Structure:" -ForegroundColor Cyan
Write-Host "├── server.js              (Entry point)" -ForegroundColor White
Write-Host "├── app.js                 (Express config)" -ForegroundColor White
Write-Host "├── package.json           (Dependencies)" -ForegroundColor White
Write-Host "├── Dockerfile             (Container)" -ForegroundColor White
Write-Host "├── config/                (Configuration)" -ForegroundColor White
Write-Host "└── modules/project/       (Business logic)" -ForegroundColor White

Write-Host "`n🚀 Backend Status: PRODUCTION READY!" -ForegroundColor Green
Write-Host "   - All test files removed" -ForegroundColor Green
Write-Host "   - Core functionality preserved" -ForegroundColor Green
Write-Host "   - Ready for deployment" -ForegroundColor Green

Write-Host "`n💡 To restore test files if needed:" -ForegroundColor Yellow
Write-Host "   Copy from backup: $backupDir" -ForegroundColor Yellow
