import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';
import { addManuProduct } from "../services/FmanuProductsService";

const AddManuProductForm = ({ loggedInUserId }) => {
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

  // Define categories and their related types
  const categories = ['Furniture', 'Lighting', 'Window Treatments', 'Kitchen & Bathroom', 'Decorative Accessories'];
  
  const getTypesForCategory = (category) => {
    const categoryTypes = {
      'Furniture': [
        'Sofas & Armchairs',
        'Tables (Dining, Coffee, Side)',
        'Chairs & Stools',
        'Beds & Mattresses',
        'Cabinets & Storage Units',
        'Shelving & Bookcases'
      ],
      'Lighting': [
        'Ceiling Lights (Chandeliers, Pendant Lights)',
        'Wall Lights & Sconces',
        'Table & Floor Lamps',
        'LED Strips & Spotlights'
      ],
      'Window Treatments': [
        'Curtains & Drapes',
        'Blinds & Shades',
        'Curtain Rods & Accessories'
      ],
      'Kitchen & Bathroom': [
        'Countertops (Granite, Quartz, Marble)',
        'Cabinets & Pantry Units',
        'Sinks & Faucets',
        'Bathroom Fixtures (Showers, Tubs, Toilets)'
      ],
      'Decorative Accessories': [
        'Mirrors',
        'Wall Art & Frames',
        'Vases & Planters',
        'Decorative Lighting'
      ]
    };
    return categoryTypes[category] || [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        type: '' // Reset type when category changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const payload = {
      ...formData,
      createdBy: loggedInUserId || "WM001",  // fallback if not passed
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      createdAt: now.toISOString()
    };

    try {
      await addManuProduct(payload);
      alert('Product added successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-2xl rounded shadow align-middle justify-center">
          <h1 className="text-2xl font-bold mb-6">Add Manufactured Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            
            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Material Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={!formData.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:bg-gray-100"
              >
                <option value="">
                  {formData.category ? '-- Select Type --' : '-- Select Category First --'}
                </option>
                {getTypesForCategory(formData.category).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Unit of Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Restock Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Restock Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="restockLevel"
                value={formData.restockLevel}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Current Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Current Stock Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Warranty Period */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Warranty Period<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Inventory ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inventoryId"
                value={formData.inventoryId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={() => navigate('/manu-products')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md"
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

export default AddManuProductForm;