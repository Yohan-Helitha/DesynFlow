// inspectionForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const InspectionForm = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    InspectionRequest_ID: "",
    floor_number: "",
    roomID: "",
    room_name: "",
    room_dimension: "",
    inspector_notes: "",
  });
  const [editingFormId, setEditingFormId] = useState(null);

  const API_BASE = "http://localhost:4000/api/inspectorForms";

  // Fetch inspector forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API Response:', res.data); // Debug log
      // Add safety check to ensure forms is always an array
      setForms(res.data.forms || res.data || []);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError(`Failed to load forms: ${err.message}`);
      // Set forms to empty array if API call fails
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save form (create or update)
  const handleSave = async () => {
    try {
      if (editingFormId) {
        await axios.patch(`${API_BASE}/${editingFormId}`, formData);
        setEditingFormId(null);
      } else {
        await axios.post(API_BASE, formData);
      }
      setFormData({
        InspectionRequest_ID: "",
        floor_number: "",
        roomID: "",
        room_name: "",
        room_dimension: "",
        inspector_notes: "",
      });
      fetchForms();
    } catch (err) {
      console.error(err);
      alert("Failed to save form");
    }
  };

  // Submit form
  const handleSubmitForm = async (form) => {
    try {
      await axios.post(`${API_BASE}/submit/${form._id}`);
      alert("Form submitted successfully!");
      fetchForms();
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    }
  };

  // Generate report
  const handleGenerateReport = async (form) => {
    try {
      await axios.post(`${API_BASE}/generate-report/${form._id}`);
      alert("Report generated successfully!");
      fetchForms();
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    }
  };

  // Edit form
  const handleEdit = (form) => {
    setEditingFormId(form._id);
    setFormData({
      InspectionRequest_ID: form.InspectionRequest_ID,
      floor_number: form.floor_number,
      roomID: form.roomID,
      room_name: form.room_name,
      room_dimension: form.room_dimension,
      inspector_notes: form.inspector_notes,
    });
  };

  // Cancel editing (reset formData)
  const handleCancel = () => {
    setEditingFormId(null);
    setFormData({
      InspectionRequest_ID: "",
      floor_number: "",
      roomID: "",
      room_name: "",
      room_dimension: "",
      inspector_notes: "",
    });
  };

  // Delete form
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchForms();
    } catch (err) {
      console.error(err);
      alert("Failed to delete form");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading inspection forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Forms</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchForms}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Loading Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingFormId ? "Edit Inspection Form" : "New Inspection Form"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="InspectionRequest_ID"
            placeholder="Inspection Request ID"
            value={formData.InspectionRequest_ID}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="floor_number"
            placeholder="Floor Number"
            value={formData.floor_number}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="roomID"
            placeholder="Room ID"
            value={formData.roomID}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="room_name"
            placeholder="Room Name"
            value={formData.room_name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="room_dimension"
            placeholder="Room Dimension"
            value={formData.room_dimension}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <textarea
            name="inspector_notes"
            placeholder="Inspector Notes"
            value={formData.inspector_notes}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingFormId ? "Update Form" : "Save Form"}
          </button>
          {editingFormId && (
            <button
              onClick={handleCancel}
              className="bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Forms Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(forms || []).map((form) => {
          const locked = form.report_generated;
          return (
            <div key={form._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">{form.room_name}</h3>
              <p>Floor: {form.floor_number}</p>
              <p>Room ID: {form.roomID}</p>
              <p>Dimension: {form.room_dimension}</p>
              <p>Status: {form.completion_status}</p>
              <p>Notes: {form.inspector_notes}</p>
              <div className="mt-4 flex space-x-2">
                {!locked && form.completion_status !== "submitted" && (
                  <>
                    <button
                      onClick={() => handleEdit(form)}
                      className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(form._id)}
                      className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleSubmitForm(form)}
                      className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600"
                    >
                      Submit
                    </button>
                  </>
                )}
                {form.completion_status === "submitted" && !locked && (
                  <button
                    onClick={() => handleGenerateReport(form)}
                    className="bg-blue-500 px-3 py-1 rounded text-white hover:bg-blue-600"
                  >
                    Generate Report
                  </button>
                )}
                {locked && (
                  <span className="text-green-600 font-semibold">Report Generated</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InspectionForm;
