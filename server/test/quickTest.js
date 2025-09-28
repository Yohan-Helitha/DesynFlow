import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

console.log('🚀 Starting backend functionality tests...\n');

// Test 1: Health endpoint
async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health endpoint test:', response.status === 200 ? 'PASSED' : 'FAILED');
    console.log('   Response:', JSON.stringify(data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.log('❌ Health endpoint test: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 2: Projects endpoint
async function testProjects() {
  try {
    const response = await fetch(`${BASE_URL}/api/projects`);
    const data = await response.json();
    console.log('✅ Projects GET test:', response.status === 200 ? 'PASSED' : 'FAILED');
    console.log('   Response:', Array.isArray(data) ? `Array with ${data.length} items` : JSON.stringify(data));
    return response.status === 200;
  } catch (error) {
    console.log('❌ Projects GET test: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 3: Create a project
async function testCreateProject() {
  try {
    const mongoose = await import('mongoose');
    const projectData = {
      projectName: 'Test Project',
      clientId: new mongoose.Types.ObjectId(),
      inspectionId: new mongoose.Types.ObjectId()
    };

    const response = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });

    const data = await response.json();
    console.log('✅ Projects POST test:', response.status === 201 ? 'PASSED' : 'FAILED');
    console.log('   Response:', response.status, data._id ? 'Project created with ID' : 'No ID returned');
    return { success: response.status === 201, projectId: data._id };
  } catch (error) {
    console.log('❌ Projects POST test: FAILED');
    console.log('   Error:', error.message);
    return { success: false, projectId: null };
  }
}

// Test 4: Tasks endpoint (with project ID)
async function testTasks(projectId) {
  if (!projectId) {
    console.log('⚠️  Skipping tasks test - no project ID');
    return false;
  }

  try {
    const taskData = {
      name: 'Test Task',
      description: 'A test task',
      projectId: projectId,
      status: 'Pending',
      weight: 1
    };

    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    const data = await response.json();
    console.log('✅ Tasks POST test:', response.status === 201 ? 'PASSED' : 'FAILED');
    console.log('   Response:', response.status, data._id ? 'Task created with ID' : 'No ID returned');
    return response.status === 201;
  } catch (error) {
    console.log('❌ Tasks POST test: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  let passed = 0;
  let total = 0;

  console.log('Testing backend endpoints...\n');

  // Test health endpoint
  total++;
  if (await testHealth()) passed++;
  console.log();

  // Test projects GET
  total++;
  if (await testProjects()) passed++;
  console.log();

  // Test projects POST
  total++;
  const createResult = await testCreateProject();
  if (createResult.success) passed++;
  console.log();

  // Test tasks POST
  total++;
  if (await testTasks(createResult.projectId)) passed++;
  console.log();

  // Summary
  console.log('🏁 Test Summary:');
  console.log(`   Passed: ${passed}/${total} tests`);
  console.log(`   Success rate: ${Math.round((passed/total)*100)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
}

runTests().catch(console.error);
