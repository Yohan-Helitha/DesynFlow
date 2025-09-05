import {
    getAllStockMovementService,
    getStockMovementByIdService,
    addStockMovementService,
    updateStockMovementService,
    deleteStockMovementService
} from "../service/stockMovementService.js";

// import {
//     validateStockMovementInsert,
//     validateStockMovementUpdate
// } from "../validators/stockMovementValidator.js";

// Get all stock movements
export const getAllStockMovement = async (req, res) => {
    try {
        const stock_movement = await getAllStockMovementService();
        if (stock_movement.length === 0) {
            return res.status(404).json({ message: "Stock Movement not found" });
        }
        return res.status(200).json({ stock_movement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get  by ID
export const getStockMovementById = async (req, res) => {
  try {
    const movement = await getStockMovementByIdService(req.params.id);
    if (!movement) return res.status(404).json({ message: "Stock Movement not found" });
    return res.status(200).json(movement);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new stock movement
export const addStockMovement = async (req, res) => {
    try {
        // Validate
        // const errors = await validateStockMovementInsert(req.body);
        // if (errors.length > 0) {
        //     return res.status(400).json({ errors });
        // }

        const stock_movement = await addStockMovementService(req.body, req.warehouseManagerName, req.managerName);
        return res.status(201).json({ message: "Stock Movement added", stock_movement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to insert data" });
    }
};

// Update stock movement
export const updateStockMovement = async (req, res) => {
    try {
        // Validate
        // const errors = await validateStockMovementUpdate(req.body);
        // if (errors.length > 0) {
        //     return res.status(400).json({ errors });
        // }

        const stock_movement = await updateStockMovementService(req.params.id, req.body, req.warehouseManagerName);
        if (!stock_movement) {
            return res.status(404).json({ message: "Unable to update Stock Movement" });
        }
        return res.status(200).json({ stock_movement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete stock movement
export const deleteStockMovement = async (req, res) => {
    try {
        const stock_movement = await deleteStockMovementService(req.params.id, req.warehouseManagerName);
        if (!stock_movement) {
            return res.status(404).json({ message: "Unable to delete Stock Movement" });
        }
        return res.status(200).json({ stock_movement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
