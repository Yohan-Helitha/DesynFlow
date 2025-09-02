// src/services/FstockMovementService.js
export const fetchStockMovements = async () => {
  try {
    const res = await fetch("http://localhost:5000/stock_movement");
    if (!res.ok) throw new Error("Failed to fetch stock movements");
    const data = await res.json();
    return data.stock_movement;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addStockMovement = async (movementData) => {
  try {
    const res = await fetch(`http://localhost:5000/stock_movement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movementData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to stock movement");
    }

    const newMovement = await res.json();
    return newMovement;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchStockMovementById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/stock_movement/${id}`);
    if (!res.ok) throw new Error("Failed to fetch stock movement");
    const data = await res.json();
    console.log("Fetched movement:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateStockMovement = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/stock_movement/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update stock movement');
    }

    const updatedMovement = await res.json();
    return updatedMovement;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete product
export const deleteStockMovement = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/stock_movement/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete movement");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};