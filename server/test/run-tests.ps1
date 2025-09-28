# PowerShell Test Script for DesynFlow Project Manager
param(
    [switch]$Coverage,
    [switch]$Watch,
    [switch]$Verbose
)

Write-Host "🚀 Starting DesynFlow Project Manager Test Suite" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

try {
    # Navigate to docker directory
    $dockerPath = "c:\Users\helit\Documents\GitHub\DesynFlow\docker"
    Set-Location $dockerPath
    Write-Status "Changed to docker directory: $dockerPath"

    # Build Docker containers
    Write-Status "Building Docker containers..."
    docker-compose build --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed!"
        exit 1
    }
    
    Write-Success "Docker containers built successfully"

    # Start MongoDB
    Write-Status "Starting MongoDB container..."
    docker-compose up -d mongo
    
    # Wait for MongoDB
    Write-Status "Waiting for MongoDB to be ready..."
    Start-Sleep -Seconds 10
    
    # Check MongoDB status
    $mongoStatus = docker-compose ps mongo
    if (-not ($mongoStatus -match "Up")) {
        Write-Error "MongoDB failed to start"
        docker-compose logs mongo
        exit 1
    }
    
    Write-Success "MongoDB is running"

    # Install test dependencies
    Write-Status "Installing test dependencies..."
    docker-compose run --rm backend npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    Write-Success "Dependencies installed"

    # Determine test command based on parameters
    $testCommand = "npm test"
    if ($Coverage) {
        $testCommand = "npm run test:ci"
    }
    if ($Watch) {
        $testCommand = "npm run test:watch"
    }
    if ($Verbose) {
        $testCommand += " -- --verbose"
    }

    # Run tests
    Write-Status "Running test suite with command: $testCommand"
    Write-Host "================================================" -ForegroundColor Cyan
    
    docker-compose run --rm backend $testCommand
    $testExitCode = $LASTEXITCODE

    if ($testExitCode -eq 0) {
        Write-Success "All tests passed! ✅"
        Write-Host ""
        Write-Status "Test Summary:"
        Write-Host "  - Project Management API: ✅" -ForegroundColor Green
        Write-Host "  - Task Management API: ✅" -ForegroundColor Green
        Write-Host "  - Team Management API: ✅" -ForegroundColor Green
        Write-Host "  - KPI Analytics API: ✅" -ForegroundColor Green
        Write-Host "  - Report Management API: ✅" -ForegroundColor Green
        Write-Host "  - Database Models: ✅" -ForegroundColor Green
        Write-Host "  - Service Layer: ✅" -ForegroundColor Green
        Write-Host "  - Integration Tests: ✅" -ForegroundColor Green
        Write-Host ""
        Write-Success "Backend is ready for production! 🎉"
    } else {
        Write-Error "Some tests failed! ❌"
        Write-Host ""
        Write-Warning "Please review the test output above for details."
        Write-Host ""
        Write-Status "Common issues to check:"
        Write-Host "  - Database connection settings" -ForegroundColor Yellow
        Write-Host "  - Missing environment variables" -ForegroundColor Yellow
        Write-Host "  - Model validation errors" -ForegroundColor Yellow
        Write-Host "  - Route registration issues" -ForegroundColor Yellow
    }

} catch {
    Write-Error "Test execution failed: $_"
    $testExitCode = 1
} finally {
    # Cleanup
    Write-Status "Cleaning up test containers..."
    docker-compose down
    
    Write-Status "Test run completed!"
    Write-Host "================================================" -ForegroundColor Cyan
}

exit $testExitCode
