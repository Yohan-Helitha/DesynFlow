import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar.jsx';
import { fetchStockMovementById, updateStockMovement } from '../services/FstockMovementService.js';

const UpdateStockMovementForm = ({ loggedInUserId }) => {
  const { id } = useParams(); // get stock movement id from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: '',
    fromLocation: '',
    toLocation: '',
    unit: '',
    quantity: '',
    reason: '',
    employeeId: '',
    vehicleInfo: '',
    dispatchedDate: ''
  });

  const labels = {
    materialId: "Material ID",
    fromLocation: "From Location",
    toLocation: "To Location",
    unit: "Unit",
    quantity: "Quantity",
    reason: "Reason",
    employeeId: "Employee ID",
    vehicleInfo: "Vehicle Info",
    dispatchedDate: "Dispatched Date"
  };

  // Fetch current stock movement details
  useEffect(() => {
    const getMovement = async () => {
      try {
        const data = await fetchStockMovementById(id);
        console.log("Fetched movement:", data);
        if (!data) {
          alert('Stock movement not found');
          return;
        }
        setFormData({
          materialId: data.materialId || '',
          fromLocation: data.fromLocation || '',
          toLocation: data.toLocation || '',
          unit: data.unit || '',
          quantity: data.quantity || '',
          reason: data.reason || '',
          employeeId: data.employeeId || '',
          vehicleInfo: data.vehicleInfo || '',
          dispatchedDate: data.dispatchedDate ? data.dispatchedDate.split('T')[0] : ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to fetch stock movement details');
      }
    };
    getMovement();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        approvedBy: loggedInUserId || "PM001" // keep PM approval
      };

      await updateStockMovement(id, payload);
      alert('Stock movement updated successfully!');
      navigate('/stock-movement');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update stock movement');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-2xl rounded shadow">
          <h1 className="text-2xl font-bold mb-6">Update Stock Movement</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block mb-2 font-medium">{labels[key]}</label>
                {key === 'unit' ? (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : key === 'quantity' ? (
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : key === 'dispatchedDate' ? (
                  <input
                    type="date"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={['stockId','materialId','unit','quantity'].includes(key)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Update Stock Movement
              </button>
              <button
                type="button"
                onClick={() => navigate('/stock-movement')}
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

export default UpdateStockMovementForm;
