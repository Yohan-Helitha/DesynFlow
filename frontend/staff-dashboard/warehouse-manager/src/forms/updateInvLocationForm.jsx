import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar';
import { fetchInvLocationById, updateInvLocation } from '../services/FinvLocationService.js';

const UpdateInvLocationForm = () => {
  const { id } = useParams(); // get inventory ID from URL
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

  // Labels mapping
  const labels = {
    inventoryId: "Inventory ID",
    inventoryName: "Inventory Name",
    inventoryAddress: "Address",
    country: "Country",
    capacity: "Capacity (m³)",
    inventoryContact: "Contact",
    warehouseManagerName: "Warehouse Manager"
  };

  useEffect(() => {
    const getInventory = async () => {
      try {
        const data = await fetchInvLocationById(id);
        if (!data) {
          alert('Inventory not found');
          return;
        }
        setFormData({
          inventoryId: data.inventoryId || '',
          inventoryName: data.inventoryName || '',
          inventoryAddress: data.inventoryAddress || '',
          country: data.country || '',
          capacity: data.capacity || '',
          inventoryContact: data.inventoryContact || '',
          warehouseManagerName: data.warehouseManagerName || ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to fetch inventory details');
      }
    };
    getInventory();
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
        capacity: Number(formData.capacity) // convert to number
      };

      await updateInvLocation(id, payload);
      alert('Inventory updated successfully!');
      navigate('/inv-location'); // redirect to inventory list page
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update inventory');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-2xl rounded shadow">
          <h1 className="text-2xl font-bold mb-6">Update Inventory</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block mb-1 font-medium">{labels[key]}</label>
                <input
                  type={key === 'capacity' ? 'number' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  min={key === 'capacity' ? 0 : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            ))}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Update Inventory
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

export default UpdateInvLocationForm;
