// src/services/FmanuProductsService.js
export const fetchManuProducts = async () => {
  try {
    const res = await fetch("http://localhost:5000/manu_products");
    if (!res.ok) throw new Error("Failed to fetch manufactured products");
    const data = await res.json();
    return data.manu_products;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addManuProduct = async (productData) => {
  try {
    const res = await fetch(`http://localhost:5000/manu_products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add product");
    }

    const newProduct = await res.json();
    return newProduct;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchManuProductById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/manu_products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    const data = await res.json();
    console.log("Fetched product:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateManuProduct = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/manu_products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update product');
    }

    const updatedProduct = await res.json();
    return updatedProduct;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete product
export const deleteManuProduct = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/manu_products/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete product");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};