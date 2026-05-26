import crypto from 'crypto';

import Material from '../../supplier/model/material.model.js';
import MaterialCatalog from '../../supplier/model/materialCatalog.model.js';
import MaterialRequest from '../../project/model/material.model.js';

function normalizeItemName(name) {
  return String(name || '').trim().toLowerCase();
}

async function ensureMaterialForRequestItem(itemName) {
  const trimmedName = String(itemName || '').trim();
  if (!trimmedName) return null;

  // Prefer exact (case-insensitive) match on materialName
  const existing = await Material.findOne({ materialName: trimmedName })
    .collation({ locale: 'en', strength: 2 })
    .lean();
  if (existing) return existing;

  // Create a minimal Material record so finance quotations can reference a valid ObjectId.
  const hash = crypto.createHash('sha1').update(trimmedName).digest('hex').slice(0, 8);
  let candidateId = `REQ-${hash}`;
  let suffix = 1;

  // Ensure materialId is unique
  while (await Material.exists({ materialId: candidateId })) {
    candidateId = `REQ-${hash}-${suffix}`;
    suffix += 1;
  }

  const created = await Material.create({
    materialId: candidateId,
    materialName: trimmedName,
    category: 'Requested',
    type: 'Requested',
    unit: 'unit'
  });

  return created.toObject();
}

async function getRequestedMaterialsWithPrices(projectId) {
  const requests = await MaterialRequest.find({
    projectId,
    status: { $in: ['Approved', 'PartiallyApproved', 'Fulfilled'] }
  }).lean();

  const itemMap = new Map();
  for (const req of requests) {
    for (const item of (req.items || [])) {
      const key = normalizeItemName(item.itemName);
      if (!key) continue;
      const prev = itemMap.get(key) || { itemName: String(item.itemName || '').trim(), requestedQty: 0 };
      prev.requestedQty += Number(item.qty || 0);
      if (!prev.itemName) prev.itemName = String(item.itemName || '').trim();
      itemMap.set(key, prev);
    }
  }

  const requestedItems = Array.from(itemMap.values()).filter(i => i.itemName);
  if (requestedItems.length === 0) return [];

  const materialDocs = await Promise.all(requestedItems.map(i => ensureMaterialForRequestItem(i.itemName)));
  const materialByNameKey = new Map();
  for (const m of materialDocs) {
    if (!m) continue;
    materialByNameKey.set(normalizeItemName(m.materialName), m);
  }

  const materialIds = materialDocs.filter(Boolean).map(m => m._id);

  const priced = await MaterialCatalog.aggregate([
    { $match: { active: true, materialId: { $in: materialIds } } },
    { $group: { _id: '$materialId', unitPrice: { $min: '$pricePerUnit' } } },
  ]);
  const priceByMaterialId = new Map(priced.map(p => [String(p._id), Number(p.unitPrice || 0)]));

  const result = requestedItems
    .map(i => {
      const material = materialByNameKey.get(normalizeItemName(i.itemName));
      if (!material) return null;
      return {
        _id: material._id,
        materialId: material.materialId,
        materialName: material.materialName,
        unit: material.unit,
        type: material.type,
        category: material.category,
        unitPrice: priceByMaterialId.get(String(material._id)) || 0,
        requestedQty: i.requestedQty,
      };
    })
    .filter(Boolean);

  return result;
}

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
    const { projectId } = req.query;
    if (projectId) {
      const requested = await getRequestedMaterialsWithPrices(projectId);
      return res.json(requested);
    }

    const priced = await MaterialCatalog.aggregate([
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
