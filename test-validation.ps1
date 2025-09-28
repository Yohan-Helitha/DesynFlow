# Test 1: Missing all required fields
Write-Host "=== Test 1: Missing all required fields ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -ContentType "multipart/form-data" -Form @{}
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode) - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 2: Invalid project name (too short)
Write-Host "`n=== Test 2: Invalid project name (too short) ===" -ForegroundColor Yellow
try {
    $form = @{
        name = "ab"
        clientId = "60d5ec49f1b2c8b1f8e4e1a1"
        assignedTeamId = "60d5ec49f1b2c8b1f8e4e1a2"
        startDate = "2025-09-27"
        dueDate = "2025-10-27"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -Form $form
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode) - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 3: Invalid dates (start date in past)
Write-Host "`n=== Test 3: Invalid dates (start date in past) ===" -ForegroundColor Yellow
try {
    $form = @{
        name = "Valid Project Name"
        clientId = "60d5ec49f1b2c8b1f8e4e1a1"
        assignedTeamId = "60d5ec49f1b2c8b1f8e4e1a2"
        startDate = "2025-09-01"
        dueDate = "2025-10-27"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -Form $form
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode) - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 4: Due date before start date
Write-Host "`n=== Test 4: Due date before start date ===" -ForegroundColor Yellow
try {
    $form = @{
        name = "Valid Project Name"
        clientId = "60d5ec49f1b2c8b1f8e4e1a1"
        assignedTeamId = "60d5ec49f1b2c8b1f8e4e1a2"
        startDate = "2025-10-27"
        dueDate = "2025-10-01"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -Form $form
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode) - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 5: Missing inspection report
Write-Host "`n=== Test 5: Missing inspection report ===" -ForegroundColor Yellow
try {
    $form = @{
        name = "Valid Project Name"
        clientId = "60d5ec49f1b2c8b1f8e4e1a1"
        assignedTeamId = "60d5ec49f1b2c8b1f8e4e1a2"
        startDate = "2025-09-27"
        dueDate = "2025-10-27"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -Form $form
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode) - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n=== Validation Tests Complete ===" -ForegroundColor Cyan