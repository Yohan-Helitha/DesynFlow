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

    const data = await res.json(); // parse response
    console.log("Fetched products:", data); // <--- add this

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw data;
      }

      return data; // success response
    } catch (err) {
      console.error("Add product error:", err);
      throw err; // propagate to React form
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

    const result = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw result;
      }

      return result; // success response
    } catch (err) {
      console.error("Update product error:", err);
      throw err; // propagate to React form
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