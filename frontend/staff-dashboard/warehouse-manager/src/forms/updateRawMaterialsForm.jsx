import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar';
import { fetchRawMaterialById, updateRawMaterial } from '../services/FrawMaterialsService.js';

const UpdateRawMaterialForm = () => {
  const { id } = useParams(); // get the material id from URL
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
    inventoryId: "Inventory ID"
  };

  useEffect(() => {
    const getMaterial = async () => {
      try {
        const data = await fetchRawMaterialById(id);
        console.log("Fetched material for update:", data);
        if (!data) {
          alert('Material not found');
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
          inventoryId: data.inventoryId || ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to fetch material details');
      }
    };
    getMaterial();
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
      };

      await updateRawMaterial(id, payload);
      alert('Material updated successfully!');
      navigate('/raw-materials'); // redirect to material list page
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update material');
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
                Update Material
              </button>
              <button
                type="button"
                onClick={() => navigate('/raw-materials')}
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

export default UpdateRawMaterialForm;
