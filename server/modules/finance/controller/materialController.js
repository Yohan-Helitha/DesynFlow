import Material from '../model/material.js';

export async function getAllMaterials(req, res) {
  try {
    const mats = await Material.find().lean();
    res.json(mats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { getAllMaterials };
