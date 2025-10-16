// inspectionForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const InspectionForm = ({ selectedAssignment }) => {
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

  const API_BASE = "/api/inspectorForms";

  // Fetch inspector forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found - showing empty state');
        setForms([]);
        setLoading(false);
        return;
      }
      
      const res = await axios.get(`${API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API Response:', res.data); // Debug log
      // Add safety check to ensure forms is always an array
      const formsData = res.data.forms || res.data || [];
      // Ensure formsData is an array
      if (Array.isArray(formsData)) {
        setForms(formsData);
      } else {
        console.warn('API returned non-array data:', formsData);
        setForms([]);
      }
    } catch (err) {
      console.error('Error fetching forms:', err);
      if (err.response?.status === 401) {
        console.log('Authentication failed - user needs to login');
        setError('Authentication required. Please login to view your forms.');
      } else {
        setError(`Failed to load forms: ${err.message}`);
      }
      // Set forms to empty array if API call fails
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch existing forms if we're not collecting data for a specific assignment
    if (!selectedAssignment) {
      fetchForms();
    } else {
      // For assignment-based form creation, skip fetching existing forms
      setForms([]);
      setLoading(false);
    }
  }, [selectedAssignment]);

  // Pre-fill form data when assignment is selected
  useEffect(() => {
    if (selectedAssignment && selectedAssignment.inspectionRequest) {
      const request = selectedAssignment.inspectionRequest;
      setFormData({
        InspectionRequest_ID: selectedAssignment.InspectionRequest_ID || "",
        floor_number: "",
        roomID: "",
        room_name: "", 
        room_dimension: "",
        inspector_notes: `Assignment for ${request.clientName}. Location: ${request.propertyAddress}. Phone: ${request.clientPhone}`,
      });
    }
  }, [selectedAssignment]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save form (create or update)
  const handleSave = async () => {
    // Basic validation
    if (!formData.InspectionRequest_ID || !formData.floor_number || !formData.roomID || !formData.room_name) {
      alert('Please fill in all required fields (Inspection Request ID, Floor Number, Room ID, and Room Name)');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to save forms.');
        return;
      }
      
      if (editingFormId) {
        await axios.patch(`${API_BASE}/${editingFormId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditingFormId(null);
        alert('Form updated successfully!');
      } else {
        const response = await axios.post(API_BASE, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Form saved successfully!');
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
      if (err.response?.status === 401) {
        alert("Authentication failed - Please login again");
      } else {
        alert("Failed to save form: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Submit form
  const handleSubmitForm = async (form) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to submit forms.');
        return;
      }
      
      await axios.post(`${API_BASE}/submit/${form._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Form submitted successfully!");
      fetchForms();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Authentication failed - Please login again");
      } else {
        alert("Failed to submit form: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Generate report
  const handleGenerateReport = async (form) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to generate reports.');
        return;
      }
      
      await axios.post(`${API_BASE}/generate-report/${form._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Report generated successfully!");
      fetchForms();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Authentication failed - Please login again");
      } else {
        alert("Failed to generate report: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Edit form
  const handleEdit = (form) => {
    setEditingFormId(form._id);
    setFormData({
      InspectionRequest_ID: typeof form.InspectionRequest_ID === 'object' 
        ? form.InspectionRequest_ID?._id || ''
        : form.InspectionRequest_ID || '',
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
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to delete forms.');
        return;
      }
      
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Form deleted successfully!');
      fetchForms();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Authentication failed - Please login again");
      } else {
        alert("Failed to delete form: " + (err.response?.data?.message || err.message));
      }
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
      {/* Assignment Context Banner */}
      {selectedAssignment && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Assignment Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Client:</span> {selectedAssignment.inspectionRequest?.clientName}</p>
            <p><span className="font-medium">Location:</span> {selectedAssignment.inspectionRequest?.propertyAddress}</p>
            <p><span className="font-medium">Phone:</span> {selectedAssignment.inspectionRequest?.clientPhone || selectedAssignment.inspectionRequest?.phone}</p>
            <p><span className="font-medium">Date:</span> {selectedAssignment.inspectionRequest?.preferredDate 
              ? new Date(selectedAssignment.inspectionRequest.preferredDate).toLocaleDateString()
              : 'Not specified'}</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingFormId ? "Edit Inspection Form" : selectedAssignment ? "Collect Inspection Data" : "New Inspection Form"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hide InspectionRequest_ID field when collecting data from assignment */}
          {!selectedAssignment && (
            <input
              type="text"
              name="InspectionRequest_ID"
              placeholder="Inspection Request ID"
              value={formData.InspectionRequest_ID}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          )}
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
         <select
            name="room_name"
            value={formData.room_name}
            onChange={handleChange}
            className="border p-2 rounded"
            style={{
              display: 'block',
              width: '100%',
              height: '40px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
            required
            onFocus={() => console.log('Dropdown focused')}
            onClick={() => console.log('Dropdown clicked')}
          >
            <option value="">Select a Room</option>
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Office">Office</option>
          </select>
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
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Your Inspection Forms</h3>
        {forms.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Inspection Forms Yet</h4>
            <p className="text-gray-500 mb-4">Create your first inspection form using the form above.</p>
            <p className="text-sm text-gray-400">Fill in the details and click "Save Form" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.filter(form => form && typeof form === 'object' && form._id).map((form) => {
              const locked = form.report_generated;
              return (
                <div key={form._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">{form.room_name || 'Unnamed Room'}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Request ID:</span> {
                      typeof form.InspectionRequest_ID === 'object' 
                        ? form.InspectionRequest_ID?._id || 'N/A'
                        : form.InspectionRequest_ID || 'N/A'
                    }</p>
                    <p><span className="font-medium">Floor:</span> {form.floor_number}</p>
                    <p><span className="font-medium">Room ID:</span> {form.roomID}</p>
                    <p><span className="font-medium">Dimension:</span> {form.room_dimension || 'Not specified'}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        form.completion_status === 'submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {form.completion_status || 'Draft'}
                      </span>
                    </p>
                    {form.inspector_notes && (
                      <p><span className="font-medium">Notes:</span> {form.inspector_notes}</p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!locked && form.completion_status !== "submitted" && (
                      <>
                        <button
                          onClick={() => handleEdit(form)}
                          className="bg-yellow-500 px-3 py-1 rounded text-white hover:bg-yellow-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(form._id)}
                          className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleSubmitForm(form)}
                          className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600 transition-colors"
                        >
                          Submit
                        </button>
                      </>
                    )}
                    {form.completion_status === "submitted" && !locked && (
                      <button
                        onClick={() => handleGenerateReport(form)}
                        className="bg-blue-500 px-3 py-1 rounded text-white hover:bg-blue-600 transition-colors"
                      >
                        Generate Report
                      </button>
                    )}
                    {locked && (
                      <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded">✅ Report Generated</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionForm;

