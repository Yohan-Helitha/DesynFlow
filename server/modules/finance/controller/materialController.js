import Material from '../model/material.js';
import SupplierMaterialCatalog from '../model/supplier_material_catalog.js';

export async function getAllMaterials(req, res) {
  try {
    const mats = await Material.find().lean();
    res.json(mats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Materials with a default unitPrice derived from SupplierMaterialCatalog (min active price per material)
export async function getMaterialsWithPrices(req, res) {
  try {
    const priced = await SupplierMaterialCatalog.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$materialId', unitPrice: { $min: '$pricePerUnit' } } },
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: '_id',
          as: 'material'
        }
      },
      { $unwind: '$material' },
      {
        $project: {
          _id: '$material._id',
          materialId: '$material.materialId',
          materialName: '$material.materialName',
          unit: '$material.unit',
          type: '$material.type',
          category: '$material.category',
          unitPrice: 1
        }
      }
    ]);

    // Fallback: include any materials missing from catalog with unitPrice = 0
    const all = await Material.find().lean();
    const have = new Set(priced.map(p => String(p._id)));
    const missing = all
      .filter(m => !have.has(String(m._id)))
      .map(m => ({
        _id: m._id,
        materialId: m.materialId,
        materialName: m.materialName,
        unit: m.unit,
        type: m.type,
        category: m.category,
        unitPrice: 0
      }));

    res.json([...priced, ...missing]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { getAllMaterials };
