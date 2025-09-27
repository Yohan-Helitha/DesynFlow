// Test script to verify supplier material pricing functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/suppliers';

// Test supplier data with materials and pricing
const testSupplier = {
  companyName: "Premium Materials Inc",
  contactName: "John Doe",
  email: "john@premium.com",
  phone: "+1-555-123-4567",
  deliveryRegions: ["North", "Central", "South"],
  materials: [
    { name: "Premium Wood", pricePerUnit: 25.50 },
    { name: "High-Grade Steel", pricePerUnit: 45.75 },
    { name: "Quality Glass", pricePerUnit: 12.25 },
    { name: "Aluminum Sheets", pricePerUnit: 35.00 }
  ],
  materialTypes: ["Premium Wood", "High-Grade Steel", "Quality Glass", "Aluminum Sheets"]
};

async function testSupplierCreation() {
  try {
    console.log('Testing supplier creation with materials and pricing...');
    
    // Create supplier
    const response = await axios.post(API_BASE, testSupplier);
    console.log('✅ Supplier created successfully:', response.data);
    
    // Fetch supplier to verify data
    const supplierId = response.data._id;
    const fetchResponse = await axios.get(`${API_BASE}`);
    const createdSupplier = fetchResponse.data.find(s => s._id === supplierId);
    
    console.log('✅ Supplier verification:');
    console.log('  Company:', createdSupplier.companyName);
    console.log('  Materials with pricing:', createdSupplier.materials);
    console.log('  Material types:', createdSupplier.materialTypes);
    
    // Test fetching materials from catalog
    console.log('\nTesting material catalog...');
    const materialsResponse = await axios.get(`http://localhost:3000/api/materials?supplierId=${supplierId}`);
    console.log('✅ Material catalog entries:', materialsResponse.data.length);
    materialsResponse.data.forEach(item => {
      console.log(`  - ${item.materialId?.materialName || 'Unknown'}: $${item.pricePerUnit}/unit`);
    });
    
    return supplierId;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSupplierUpdate(supplierId) {
  try {
    console.log('\nTesting supplier update with new materials...');
    
    const updateData = {
      ...testSupplier,
      materials: [
        { name: "Premium Wood", pricePerUnit: 28.00 }, // Updated price
        { name: "High-Grade Steel", pricePerUnit: 45.75 },
        { name: "Titanium Alloy", pricePerUnit: 125.50 }, // New material
        { name: "Carbon Fiber", pricePerUnit: 89.75 } // New material
      ],
      materialTypes: ["Premium Wood", "High-Grade Steel", "Titanium Alloy", "Carbon Fiber"]
    };
    
    const response = await axios.put(`${API_BASE}/${supplierId}`, updateData);
    console.log('✅ Supplier updated successfully');
    
    // Verify updated materials
    const materialsResponse = await axios.get(`http://localhost:3000/api/materials?supplierId=${supplierId}`);
    console.log('✅ Updated material catalog entries:', materialsResponse.data.length);
    materialsResponse.data.forEach(item => {
      console.log(`  - ${item.materialId?.materialName || 'Unknown'}: $${item.pricePerUnit}/unit`);
    });
    
  } catch (error) {
    console.error('❌ Update error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting supplier materials testing...\n');
  
  const supplierId = await testSupplierCreation();
  
  if (supplierId) {
    await testSupplierUpdate(supplierId);
    
    console.log('\n✨ All tests completed!');
    console.log('You can now check the frontend at http://localhost:3002 to see the materials with pricing.');
  } else {
    console.log('\n❌ Tests failed - could not create supplier');
  }
}

// Handle both CommonJS and ES Module environments
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}

module.exports = { runTests };