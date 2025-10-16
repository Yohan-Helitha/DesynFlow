# Material Catalog Seed File

## Overview
The `seedMaterialCatalog.js` file populates the MaterialCatalog collection with relationships between suppliers and materials, including pricing and lead time information.

## Purpose
The MaterialCatalog acts as a junction table that links:
- **Suppliers** (from the Supplier model)
- **Materials** (from the Material model)

It stores:
- Price per unit for each supplier-material combination
- Lead time in days
- Active/inactive status

## Usage

### Prerequisites
1. MongoDB must be running
2. Suppliers must exist in the database (run `seedComprehensiveData.js` first)
3. Materials must exist in the database (run `seedComprehensiveData.js` first)

### Running the Seed
```bash
cd server
node seed/seedMaterialCatalog.js
```

## Data Structure

### MaterialCatalog Schema
```javascript
{
  supplierId: ObjectId (ref: 'Supplier'),
  materialId: ObjectId (ref: 'Material'),
  pricePerUnit: Number,
  leadTimeDays: Number,
  active: Boolean (default: true)
}
```

### Unique Index
- Combination of `supplierId` + `materialId` must be unique
- Prevents duplicate entries for the same supplier-material pair

## Seeding Logic

### Supplier Specializations
Each supplier is assigned materials based on their business type:
- **Lanka Building Supplies**: Cement, Steel, Sand, Granite
- **Colombo Hardware Store**: PVC Pipes, Wire, Door Hardware
- **Keells Building Materials**: Tiles, Paint, Bathroom Fixtures
- **Dimo Construction Supplies**: Roofing, Timber
- **Singer Building Solutions**: Electrical Wire, LED Fixtures
- **Ceylon Glass & Aluminum**: Aluminum Frames, Glass Panels

### Pricing Strategy
Each material has a base price with variance:
- Portland Cement: LKR 1,850 ± 150
- Steel Bars: LKR 185 ± 20
- Ceramic Tiles: LKR 1,250 ± 200
- Aluminum Frames: LKR 12,500 ± 1,500
- (See full pricing in the seed file)

### Lead Times
- Random lead times between 3-16 days
- Non-specialty items get +3 days additional lead time
- Reflects realistic supply chain variability

### Availability
- 90% of specialty items are active
- 80% of non-specialty items are active
- Simulates real-world discontinued or out-of-stock scenarios

### Additional Materials
- 50% chance suppliers carry 1-2 additional non-specialty materials
- Creates realistic cross-inventory scenarios
- Enables price comparison across suppliers

## Expected Output

### Statistics Generated
1. **Entries per Supplier**: Shows how many materials each supplier offers
2. **Suppliers per Material**: Shows market competition for each material
3. **Price Statistics**: Average, minimum, and maximum prices
4. **Lead Time Statistics**: Average, minimum, and maximum delivery times
5. **Availability Status**: Active vs Inactive entries percentage
6. **Sample Entries**: First 5 catalog entries with details

### Typical Results
- **Total Entries**: 40-60 supplier-material combinations
- **Average Materials per Supplier**: 5-8 materials
- **Average Suppliers per Material**: 2-4 suppliers
- **Active Rate**: 85-90%

## Integration with Other Models

### Used By
1. **Purchase Orders**: Reference MaterialCatalog for pricing
2. **Quotations**: Pull supplier prices for material estimates
3. **Material Controller**: Query available suppliers for materials
4. **Supplier Service**: Auto-populate catalog when creating/updating suppliers

### Related Seed Files
- `seedComprehensiveData.js`: Creates base suppliers and materials
- `seedSupplierModels.js`: Creates purchase orders using catalog data
- `seedAllModelsComplete.js`: Runs all seeds including this one

## Maintenance

### Re-running the Seed
- Clears all existing MaterialCatalog entries before seeding
- Safe to run multiple times
- Always creates fresh data based on current suppliers and materials

### Adding New Materials
1. Add material to Material collection
2. Re-run this seed file
3. Material will be assigned to relevant suppliers automatically

### Adding New Suppliers
1. Add supplier to Supplier collection
2. Re-run this seed file
3. Supplier will get appropriate materials assigned

## Troubleshooting

### "No suppliers or materials found"
**Solution**: Run `seedComprehensiveData.js` first to create base data

### "Duplicate key error"
**Solution**: The seed clears existing data, but if interrupted, run:
```bash
db.materialcatalogs.deleteMany({})
```

### Prices seem incorrect
**Check**: Base prices and variance in the `materialPricing` object
**Adjust**: Modify base prices to match current market rates

### Too few/many entries
**Check**: Supplier specializations and additional materials logic
**Adjust**: Modify the random material assignment probability

## Future Enhancements

### Potential Additions
1. **Historical Pricing**: Track price changes over time
2. **Bulk Discounts**: Add quantity-based pricing tiers
3. **Seasonal Pricing**: Vary prices by season/demand
4. **Quality Ratings**: Add quality metrics per supplier-material
5. **Minimum Order Quantities**: Add MOQ constraints
6. **Delivery Zones**: Different prices for different delivery regions

## Notes
- All prices are in LKR (Sri Lankan Rupees)
- Lead times are in business days
- Active status can be toggled via supplier management UI
- Pricing variance creates realistic market competition
