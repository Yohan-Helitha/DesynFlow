import {
  getAllManuProductsService,
  getManuProductByIdService,
  addManuProductsService,
  updateManuProductsService,
  deleteManuProductsService
} from '../service/manuProductsService.js';

// Get all manufactured products
export const getAllManuProducts = async (req, res) => {
  try {
    const manu_products = await getAllManuProductsService();
    if (manu_products.length === 0) {
      return res.status(404).json({ message: "Manufactured Products not found" });
    }
    return res.status(200).json({ manu_products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single manufactured product by ID
export const getManuProductById = async (req, res) => {
  try {
    const product = await getManuProductByIdService(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add manufactured product
export const addManuProducts = async (req, res) => {
  try {
    const manu_product = await addManuProductsService(req.body, req.userId);
    return res.status(201).json({ message: "Product added", manu_product });
  } catch (err) {
    console.error(err);
    // if (err.status === 400 && err.errors) {
    //   return res.status(400).json({ message: "Validation failed", errors: err.errors });
    // }
    return res.status(500).json({ message: "Unable to insert data" });
  }
};

// Update manufactured product
export const updateManuProducts = async (req, res) => {
  try {
    const manu_product = await updateManuProductsService(req.params.id, req.body, req.userId);

    if (!manu_product) {
      return res.status(404).json({ message: "Unable to update Manufactured Product" });
    }

    return res.status(200).json({ manu_product });
  } catch (err) {
    console.error(err);
    // if (err.status === 400 && err.errors) {
    //   return res.status(400).json({ message: "Validation failed", errors: err.errors });
    // }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete manufactured product
export const deleteManuProducts = async (req, res) => {
  try {
    const manu_product = await deleteManuProductsService(req.params.id, req.userId);

    if (!manu_product) {
      return res.status(404).json({ message: "Unable to delete Manufactured Product" });
    }

    return res.status(200).json({ manu_product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
