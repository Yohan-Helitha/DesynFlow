import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar';
import { fetchManuProductById, updateManuProduct } from '../services/FmanuProductsService.js';

const UpdateManuProductForm = () => {
  const { id } = useParams(); // get the product id from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: '',
    materialName: '',
    category: '',
    type: '',
    unit: '',
    restockLevel: '',
    reorderLevel: '',
    currentLevel: '',
    warrantyPeriod: '',
    inventoryId: ''
  });

  // Proper labels mapping
  const labels = {
    materialId: "Material ID",
    materialName: "Material Name",
    category: "Category",
    type: "Type",
    unit: "Unit of Measurement",
    restockLevel: "Restock Level",
    reorderLevel: "Reorder Level",
    currentLevel: "Current Stock Level",
    warrantyPeriod: "Warranty Period",
    inventoryId: "Inventory ID"
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        const data = await fetchManuProductById(id);
        console.log("Fetched product for update:", data);
        if (!data) {
          alert('Product not found');
          return;
        }
        setFormData({
          materialId: data.materialId || '',
          materialName: data.materialName || '',
          category: data.category || '',
          type: data.type || '',
          unit: data.unit || '',
          restockLevel: data.restockLevel || '',
          reorderLevel: data.reorderLevel || '',
          currentLevel: data.currentLevel || '',
          warrantyPeriod: data.warrantyPeriod || '',
          inventoryId: data.inventoryId || ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to fetch product details');
      }
    };
    getProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        restockLevel: Number(formData.restockLevel),
        reorderLevel: Number(formData.reorderLevel),
        currentLevel: Number(formData.currentLevel),
        warrantyPeriod: formData.warrantyPeriod
      };

      await updateManuProduct(id, payload);
      alert('Product updated successfully!');
      navigate('/'); // redirect to product list page
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update product');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-2xl rounded shadow align-middle justify-center">
          <h1 className="text-2xl font-bold mb-6">Update Raw Material</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block mb-1 font-medium">{labels[key]}</label>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            ))}

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
              >
                Update Product
              </button>
              <button
                type="button"
                onClick={() => navigate('/manu-products')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded shadow"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateManuProductForm;
