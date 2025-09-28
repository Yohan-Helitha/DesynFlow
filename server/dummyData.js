
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Supplier from './modules/supplier/model/supplier.model.js';
import Material from './modules/supplier/model/material.model.js';
import MaterialCatalog from './modules/supplier/model/materialCatalog.model.js';
import PurchaseOrder from './modules/supplier/model/purchaseOrder.model.js';
import SampleOrder from './modules/supplier/model/sampleOrder.model.js';
import SupplierRating from './modules/supplier/model/supplierRating.model.js';
import SupplierStatusUpdate from './modules/supplier/model/supplierStatusUpdate.model.js';
import SupplierRequestNotification from './modules/supplier/model/supplierRequestNotification.model.js';

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('🔗 Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });


// Clear all existing data and seed comprehensive meaningful data
async function clearAndSeedData() {
  try {
    console.log('🧹 Clearing all existing data from MongoDB...');
    
    // Clear all collections
    await Supplier.deleteMany({});
    await Material.deleteMany({});
    await MaterialCatalog.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await SampleOrder.deleteMany({});
    await SupplierRating.deleteMany({});
    await SupplierStatusUpdate.deleteMany({});
    await SupplierRequestNotification.deleteMany({});
    
    console.log('✅ All existing data cleared successfully!');
    
    // Interior Design Materials Data for Sri Lanka
    console.log('📦 Creating interior design materials...');
    const materialsData = [
      {
        materialId: "MAT001",
        materialName: "Teak Wood Planks",
        category: "Natural Wood", 
        type: "Raw Material",
        unit: "sq.ft",
        warrantyPeriod: "36 months"
      },
      {
        materialId: "MAT002",
        materialName: "Italian Marble Slabs", 
        category: "Natural Stone",
        type: "Finished Product",
        unit: "sq.ft",
        warrantyPeriod: "24 months"
      },
      {
        materialId: "MAT003",
        materialName: "Designer Ceramic Tiles",
        category: "Floor & Wall Finishes",
        type: "Finished Product", 
        unit: "sq.ft",
        warrantyPeriod: "18 months"
      },
      {
        materialId: "MAT004",
        materialName: "Premium Fabric Upholstery",
        category: "Soft Furnishings",
        type: "Raw Material", 
        unit: "yard",
        warrantyPeriod: "24 months"
      },
      {
        materialId: "MAT005",
        materialName: "Glass Partition Panels",
        category: "Glass & Glazing",
        type: "Component",
        unit: "sq.ft",
        warrantyPeriod: "60 months"
      },
      {
        materialId: "MAT006",
        materialName: "Decorative Wall Paint",
        category: "Paints & Finishes",
        type: "Raw Material",
        unit: "liter",
        warrantyPeriod: "12 months"
      },
      {
        materialId: "MAT007",
        materialName: "Designer Light Fixtures", 
        category: "Lighting Solutions",
        type: "Finished Product",
        unit: "piece",
        warrantyPeriod: "36 months"
      },
      {
        materialId: "MAT008",
        materialName: "Luxury Vinyl Flooring",
        category: "Synthetic Flooring",
        type: "Finished Product",
        unit: "sq.ft",
        warrantyPeriod: "24 months"
      },
      {
        materialId: "MAT009",
        materialName: "Custom Cabinet Hardware",
        category: "Hardware & Fittings",
        type: "Component", 
        unit: "set",
        warrantyPeriod: "18 months"
      },
      {
        materialId: "MAT010",
        materialName: "Acoustic Wall Panels",
        category: "Specialty Materials",
        type: "Finished Product",
        unit: "sq.ft",
        warrantyPeriod: "24 months"
      }
    ];
    
    const createdMaterials = await Material.insertMany(materialsData);
    console.log(`✅ Created ${createdMaterials.length} materials`);

    // Interior Design Suppliers Data for Sri Lanka  
    console.log('🏢 Creating Sri Lankan interior design suppliers...');
    const suppliersData = [
      {
        companyName: "Lanka Teak Suppliers (Pvt) Ltd",
        contactName: "Sunil Perera",
        email: "info@lankateak.lk", 
        phone: "+94-11-2345678",
        materialTypes: ["Teak Wood", "Natural Wood"],
        deliveryRegions: ["Colombo", "Gampaha", "Kalutara"],
        rating: 4.8,
        materials: [
          { name: "Teak Wood Planks", pricePerUnit: 8500.00 },
          { name: "Custom Cabinet Hardware", pricePerUnit: 2500.00 }
        ]
      },
      {
        companyName: "Royal Stone & Marble Co.",
        contactName: "Chaminda Silva",
        email: "sales@royalstone.lk",
        phone: "+94-81-2234567",
        materialTypes: ["Marble", "Natural Stone"],
        deliveryRegions: ["Kandy", "Matale", "Nuwara Eliya"],
        rating: 4.5,
        materials: [
          { name: "Italian Marble Slabs", pricePerUnit: 12500.00 },
          { name: "Designer Ceramic Tiles", pricePerUnit: 3200.00 }
        ]
      },
      {
        companyName: "Ceylon Ceramic Solutions",
        contactName: "Anura Jayawardena", 
        email: "orders@ceylonceramics.lk",
        phone: "+94-91-2345789",
        materialTypes: ["Tiles", "Ceramics"],
        deliveryRegions: ["Galle", "Matara", "Hambantota"],
        rating: 4.6,
        materials: [
          { name: "Designer Ceramic Tiles", pricePerUnit: 2800.00 },
          { name: "Decorative Wall Paint", pricePerUnit: 1850.00 }
        ]
      },
      {
        companyName: "Fabric House Colombo",
        contactName: "Malini Rodrigo",
        email: "info@fabrichousecmb.lk",
        phone: "+94-11-2678901",
        materialTypes: ["Fabrics", "Upholstery"],
        deliveryRegions: ["Colombo", "Mount Lavinia", "Dehiwala"],
        rating: 4.4,
        materials: [
          { name: "Premium Fabric Upholstery", pricePerUnit: 4200.00 },
          { name: "Acoustic Wall Panels", pricePerUnit: 6500.00 }
        ]
      },
      {
        companyName: "Crystal Glass Works Lanka",
        contactName: "Roshan Fernando",
        email: "sales@crystalglasslk.com",
        phone: "+94-33-2234567",
        materialTypes: ["Glass", "Glazing"],
        deliveryRegions: ["Kurunegala", "Puttalam", "Chilaw"],
        rating: 4.3,
        materials: [
          { name: "Glass Partition Panels", pricePerUnit: 7800.00 },
          { name: "Designer Light Fixtures", pricePerUnit: 15500.00 }
        ]
      },
      {
        companyName: "Dulux Paints Sri Lanka",
        contactName: "Priyanka Mendis",
        email: "orders@duluxlanka.lk",
        phone: "+94-37-2345678",
        materialTypes: ["Paints", "Wall Finishes"],
        deliveryRegions: ["Ratnapura", "Kegalle", "Avissawella"],
        rating: 4.7,
        materials: [
          { name: "Decorative Wall Paint", pricePerUnit: 1650.00 }
        ]
      },
      {
        companyName: "Lighting Solutions Lanka",
        contactName: "Buddhika Amarasinghe",
        email: "contact@lightinglanka.com", 
        phone: "+94-45-2234567",
        materialTypes: ["Lighting", "Electrical"],
        deliveryRegions: ["Anuradhapura", "Polonnaruwa", "Dambulla"],
        rating: 4.2,
        materials: [
          { name: "Designer Light Fixtures", pricePerUnit: 12500.00 }
        ]
      },
      {
        companyName: "EcoFloor Lanka (Pvt) Ltd",
        contactName: "Sanduni Wickramasinghe", 
        email: "info@ecofloorlanka.lk",
        phone: "+94-47-2345678",
        materialTypes: ["Vinyl Flooring", "Synthetic Materials"],
        deliveryRegions: ["Trincomalee", "Batticaloa", "Ampara"],
        rating: 4.1,
        materials: [
          { name: "Luxury Vinyl Flooring", pricePerUnit: 5500.00 }
        ]
      },
      {
        companyName: "Premium Hardware Solutions",
        contactName: "Lasantha Gunasekara",
        email: "sales@premiumhardware.lk",
        phone: "+94-63-2234567",
        materialTypes: ["Hardware", "Fittings"],
        deliveryRegions: ["Badulla", "Monaragala", "Bandarawela"],
        rating: 4.0,
        materials: [
          { name: "Custom Cabinet Hardware", pricePerUnit: 3200.00 }
        ]
      },
      {
        companyName: "Island Acoustic Systems",
        contactName: "Thilak Rajapaksha",
        email: "procurement@islandacoustic.lk",
        phone: "+94-55-2345678",
        materialTypes: ["Acoustic Materials", "Specialty Products"],
        deliveryRegions: ["Jaffna", "Mannar", "Vavuniya"],
        rating: 4.4,
        materials: [
          { name: "Acoustic Wall Panels", pricePerUnit: 7200.00 },
          { name: "Glass Partition Panels", pricePerUnit: 8500.00 }
        ]
      }
    ];
    
    const createdSuppliers = await Supplier.insertMany(suppliersData);
    console.log(`✅ Created ${createdSuppliers.length} suppliers`);

    // Create Material Catalog entries for supplier-material-price mapping
    console.log('🔗 Creating material catalog entries...');
    const materialCatalogEntries = [];
    
    for (const supplier of createdSuppliers) {
      for (const materialInfo of supplier.materials) {
        const material = createdMaterials.find(m => m.materialName === materialInfo.name);
        if (material) {
          // Set appropriate minimum order quantities for interior design materials
          let minOrderQty;
          const materialName = material.materialName;
          
          if (materialName.includes('Paint')) {
            minOrderQty = Math.floor(Math.random() * 5) + 2; // 2-7 liters minimum
          } else if (materialName.includes('Light Fixtures') || materialName.includes('Hardware')) {
            minOrderQty = Math.floor(Math.random() * 3) + 1; // 1-4 pieces/sets minimum
          } else if (materialName.includes('Fabric')) {
            minOrderQty = Math.floor(Math.random() * 10) + 5; // 5-15 yards minimum
          } else {
            minOrderQty = Math.floor(Math.random() * 20) + 10; // 10-30 sq.ft minimum for tiles, wood, etc.
          }

          materialCatalogEntries.push({
            supplierId: supplier._id,
            materialId: material._id,
            pricePerUnit: Math.round(materialInfo.pricePerUnit), // Ensure LKR amounts are whole numbers
            availability: true,
            minimumOrderQuantity: minOrderQty,
            leadTimeDays: Math.floor(Math.random() * 21) + 7 // 7-28 days lead time for interior materials
          });
        }
      }
    }
    
    const createdCatalogEntries = await MaterialCatalog.insertMany(materialCatalogEntries);
    console.log(`✅ Created ${createdCatalogEntries.length} material catalog entries`);
    
    // Create comprehensive Purchase Orders
    console.log('📋 Creating purchase orders...');
    const purchaseOrdersData = [];
    
    for (let i = 0; i < 15; i++) {
      const randomSupplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      const statuses = ['Draft', 'Approved', 'Rejected', 'SentToSupplier', 'Delivered'];
      const approvalStatuses = ['Pending', 'Approved', 'Rejected'];
      const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const approvalStatus = orderStatus === 'Draft' ? 'Pending' : approvalStatuses[Math.floor(Math.random() * 2)];
      
      // Get supplier's materials for order items
      const supplierCatalogEntries = materialCatalogEntries.filter(entry => 
        entry.supplierId.toString() === randomSupplier._id.toString()
      );
      
      const numberOfItems = Math.min(Math.floor(Math.random() * 3) + 1, supplierCatalogEntries.length);
      let orderTotal = 0;
      const orderItems = [];
      
      for (let j = 0; j < numberOfItems; j++) {
        const catalogEntry = supplierCatalogEntries[j];
        const material = createdMaterials.find(m => m._id.toString() === catalogEntry.materialId.toString());
        
        // Quantity appropriate for interior design materials
        let quantity;
        const materialName = material ? material.materialName : '';
        
        if (materialName.includes('Paint')) {
          quantity = Math.floor(Math.random() * 20) + 5; // 5-25 liters
        } else if (materialName.includes('Light Fixtures') || materialName.includes('Hardware')) {
          quantity = Math.floor(Math.random() * 15) + 2; // 2-17 pieces/sets
        } else if (materialName.includes('Fabric')) {
          quantity = Math.floor(Math.random() * 50) + 10; // 10-60 yards
        } else {
          quantity = Math.floor(Math.random() * 200) + 50; // 50-250 sq.ft for tiles, wood, etc.
        }
        
        const unitPriceLKR = catalogEntry.pricePerUnit; // Already in LKR
        const totalItemPrice = quantity * unitPriceLKR;
        orderTotal += totalItemPrice;
        
        orderItems.push({
          materialId: catalogEntry.materialId,
          materialName: material ? material.materialName : 'Unknown Material',
          qty: quantity,
          unitPrice: Math.round(unitPriceLKR) // Round to nearest LKR
        });
      }
      
      const sriLankanLocations = [
        "No. 125, Galle Road, Colombo 03",
        "456 Peradeniya Road, Kandy",
        "78 Wakwella Road, Galle",
        "234 Matara Road, Akuressa",
        "89 Main Street, Negombo",
        "567 Kurunegala Road, Puttalam",
        "123 Hospital Road, Badulla",
        "345 Ratnapura Road, Kegalle",
        "678 Anuradhapura Road, Dambulla",
        "901 Jaffna Road, Vavuniya"
      ];

      const purchaseOrder = {
        requestOrigin: ['ReorderAlert', 'Manual', 'ProjectMR'][Math.floor(Math.random() * 3)],
        projectId: new mongoose.Types.ObjectId(),
        supplierId: randomSupplier._id,
        requestedBy: new mongoose.Types.ObjectId(),
        status: orderStatus,
        items: orderItems,
        totalAmount: Math.round(orderTotal), // Round to nearest LKR
        financeApproval: {
          approverId: new mongoose.Types.ObjectId(),
          status: approvalStatus,
          note: `Interior Design Project Order #${String(i + 1).padStart(4, '0')} - Finance review`,
          approvedAt: approvalStatus === 'Approved' ? orderDate : null
        }
      };
      
      purchaseOrdersData.push(purchaseOrder);
    }
    
    const createdOrders = await PurchaseOrder.insertMany(purchaseOrdersData);
    console.log(`✅ Created ${createdOrders.length} purchase orders`);
    
    // Create Sample Orders
    console.log('🧪 Creating sample orders...');
    const sampleOrdersData = [];
    
    for (let i = 0; i < 8; i++) {
      const randomSupplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
      const randomMaterial = createdMaterials[Math.floor(Math.random() * createdMaterials.length)];
      
      const statuses = ['Requested', 'Submitted', 'Approved', 'Rejected'];
      const sampleStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      sampleOrdersData.push({
        supplierId: randomSupplier._id,
        materialId: randomMaterial._id,
        requestedBy: new mongoose.Types.ObjectId(), // Generate random ObjectId for user
        status: sampleStatus,
        files: [`sample_${i + 1}.pdf`],
        reviewNote: sampleStatus === 'Approved' ? 'Sample quality meets requirements' : 
                   sampleStatus === 'Rejected' ? 'Sample quality does not meet standards' : null
      });
    }
    
    const createdSampleOrders = await SampleOrder.insertMany(sampleOrdersData);
    console.log(`✅ Created ${createdSampleOrders.length} sample orders`);
    
    // Create Supplier Ratings
    console.log('⭐ Creating supplier ratings...');
    const ratingsData = [];
    
    for (const supplier of createdSuppliers.slice(0, 7)) { // Rate first 7 suppliers
      const numberOfRatings = Math.floor(Math.random() * 3) + 2; // 2-4 ratings per supplier
      
      for (let i = 0; i < numberOfRatings; i++) {
        const timeliness = Math.floor(Math.random() * 3) + 3; // 3-5
        const quality = Math.floor(Math.random() * 3) + 3; // 3-5
        const communication = Math.floor(Math.random() * 3) + 3; // 3-5
        const weightedScore = (timeliness + quality + communication) / 3;
        
        ratingsData.push({
          supplierId: supplier._id,
          ratedBy: new mongoose.Types.ObjectId(), // Generate random ObjectId for user
          criteria: {
            timeliness: timeliness,
            quality: quality,
            communication: communication
          },
          weightedScore: weightedScore
        });
      }
    }
    
    const createdRatings = await SupplierRating.insertMany(ratingsData);
    console.log(`✅ Created ${createdRatings.length} supplier ratings`);
    
    // Create Status Updates
    console.log('📊 Creating supplier status updates...');
    const statusUpdatesData = [];
    
    for (const order of createdOrders.slice(0, 10)) { // Status updates for first 10 orders
      const statuses = ['Accepted', 'Rejected', 'In Progress', 'Dispatched', 'Delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const statusNotes = {
        'Accepted': 'Interior design materials order confirmed and accepted',
        'Rejected': 'Order rejected due to unavailability or specifications mismatch',
        'In Progress': 'Materials being prepared and quality checked for interior project',
        'Dispatched': 'Interior design materials dispatched for delivery',
        'Delivered': 'Materials successfully delivered to interior design project site'
      };

      statusUpdatesData.push({
        purchaseOrderId: order._id,
        supplierId: order.supplierId,
        status: randomStatus,
        note: statusNotes[randomStatus]
      });
    }
    
    const createdStatusUpdates = await SupplierStatusUpdate.insertMany(statusUpdatesData);
    console.log(`✅ Created ${createdStatusUpdates.length} status updates`);
    
    // Create Notifications
    console.log('🔔 Creating supplier notifications...');
    const notificationsData = [];
    
    for (const order of createdOrders.slice(0, 8)) {
      notificationsData.push({
        supplierId: order.supplierId,
        purchaseOrderId: order._id,
        status: ['New', 'Read', 'Actioned'][Math.floor(Math.random() * 3)]
      });
    }
    
    const createdNotifications = await SupplierRequestNotification.insertMany(notificationsData);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📈 Summary of inserted data for Sri Lankan Interior Design Company:');
    console.log(`   • ${createdMaterials.length} Interior Design Materials`);
    console.log(`   • ${createdSuppliers.length} Sri Lankan Suppliers`);
    console.log(`   • ${createdCatalogEntries.length} Material Catalog Entries (Prices in LKR)`);
    console.log(`   • ${createdOrders.length} Purchase Orders (Amounts in LKR)`);
    console.log(`   • ${createdSampleOrders.length} Sample Orders`);
    console.log(`   • ${createdRatings.length} Supplier Ratings`);
    console.log(`   • ${createdStatusUpdates.length} Status Updates`);
    console.log(`   • ${createdNotifications.length} Notifications`);
    console.log('\n🇱🇰 All pricing in Sri Lankan Rupees (LKR)');
    console.log('✨ Your DesynFlow system is ready for Sri Lankan interior design operations!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

// Execute the seeding function
clearAndSeedData();
