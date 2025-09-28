#!/bin/bash

# Test script to run comprehensive tests via Docker
echo "🚀 Starting DesynFlow Project Manager Test Suite"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to docker directory
cd /app/docker || { print_error "Failed to navigate to docker directory"; exit 1; }

print_status "Building Docker containers..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi

print_success "Docker containers built successfully"

print_status "Starting MongoDB container..."
docker-compose up -d mongo

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is running
if ! docker-compose ps mongo | grep -q "Up"; then
    print_error "MongoDB failed to start"
    docker-compose logs mongo
    exit 1
fi

print_success "MongoDB is running"

print_status "Installing test dependencies in backend container..."
docker-compose run --rm backend npm install jest supertest @jest/globals --save-dev

if [ $? -ne 0 ]; then
    print_error "Failed to install test dependencies"
    exit 1
fi

print_success "Test dependencies installed"

print_status "Running comprehensive test suite..."
echo "================================================"

# Run tests with proper output formatting
docker-compose run --rm backend npm test

TEST_EXIT_CODE=$?

print_status "Generating test coverage report..."
docker-compose run --rm backend npm run test:ci

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed! ✅"
    echo ""
    print_status "Test Summary:"
    echo "  - Project Management API: ✅"
    echo "  - Task Management API: ✅"
    echo "  - Team Management API: ✅"
    echo "  - KPI Analytics API: ✅"
    echo "  - Report Management API: ✅"
    echo "  - Database Models: ✅"
    echo "  - Service Layer: ✅"
    echo "  - Integration Tests: ✅"
    echo ""
    print_success "Backend is ready for production! 🎉"
else
    print_error "Some tests failed! ❌"
    echo ""
    print_warning "Please review the test output above for details."
    echo ""
    print_status "Common issues to check:"
    echo "  - Database connection settings"
    echo "  - Missing environment variables"
    echo "  - Model validation errors"
    echo "  - Route registration issues"
fi

print_status "Cleaning up test containers..."
docker-compose down

print_status "Test run completed!"
echo "================================================"

exit $TEST_EXIT_CODE
