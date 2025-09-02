import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar.jsx';
import { addInvLocation } from "../services/FinvLocationService";

const AddInvLocationForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    inventoryId: '',
    inventoryName: '',
    inventoryAddress: '',
    country: '',
    capacity: '',
    inventoryContact: '',
    warehouseManagerName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const payload = {
      ...formData,
      createdBy: loggedInUserId || "WM001",
      createdAt: now.toISOString()
    };

    try {
      await addInvLocation(payload);
      alert('Inventory added successfully!');
      navigate('/inv-location');
    } catch (err) {
      console.error(err);
      alert('Failed to add inventory');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-2xl rounded shadow">
          <h1 className="text-2xl font-bold mb-6">Add Inventory</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">

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

            {/* Inventory Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inventoryName"
                value={formData.inventoryName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Inventory Address */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inventoryAddress"
                value={formData.inventoryAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Capacity (m³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Inventory Contact */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inventoryContact"
                value={formData.inventoryContact}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Warehouse Manager Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Warehouse Manager <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="warehouseManagerName"
                value={formData.warehouseManagerName}
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
                Add Inventory
              </button>
              <button
                type="button"
                onClick={() => navigate('/inv-location')}
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

export default AddInvLocationForm;
