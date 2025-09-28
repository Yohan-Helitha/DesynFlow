import React, { useState, useEffect } from 'react';

export default function CreateMaterialRequestForm({ 
  isOpen, 
  onClose, 
  onRequestCreated, 
  project,
  leaderId,
  editRequest = null 
}) {
  const [form, setForm] = useState({
    items: [{ itemName: '', qty: 1 }],
    neededBy: '',
    warehouseNote: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!editRequest;

  useEffect(() => {
    if (editRequest) {
      setForm({
        items: editRequest.items || [{ itemName: '', qty: 1 }],
        neededBy: editRequest.neededBy ? new Date(editRequest.neededBy).toISOString().split('T')[0] : '',
        warehouseNote: editRequest.warehouseNote || ''
      });
    }
  }, [editRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.neededBy) {
      setError('Needed by date is required');
      return;
    }

    if (form.items.length === 0) {
      setError('At least one item is required');
      return;
    }

    for (const item of form.items) {
      if (!item.itemName.trim() || !item.qty || item.qty <= 0) {
        setError('All items must have a name and positive quantity');
        return;
      }
    }

    if (!project || !project._id) {
      setError('Invalid project data');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        projectId: project._id,
        requestedBy: leaderId,
        items: form.items.map(item => ({
          itemName: item.itemName.trim(),
          qty: parseInt(item.qty)
        })),
        neededBy: form.neededBy,
        warehouseNote: form.warehouseNote.trim()
      };

      const url = isEdit 
        ? `http://localhost:4000/api/material-requests/${editRequest._id}`
        : 'http://localhost:4000/api/material-requests';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save material request');
      }

      const savedRequest = await response.json();
      onRequestCreated(savedRequest);
      onClose();
      
      // Reset form
      setForm({
        items: [{ itemName: '', qty: 1 }],
        neededBy: '',
        warehouseNote: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ 
      ...form, 
      items: [...form.items, { itemName: '', qty: 1 }] 
    });
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      const newItems = form.items.filter((_, i) => i !== index);
      setForm({ ...form, items: newItems });
    }
  };

  const handleClose = () => {
    setForm({
      items: [{ itemName: '', qty: 1 }],
      neededBy: '',
      warehouseNote: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-brown-primary mb-4">
          {isEdit ? 'Edit Material Request' : 'Create New Material Request'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Info (read-only) */}
          <div>
            <label className="block text-sm font-medium text-brown-secondary mb-1">
              Project
            </label>
            <input
              type="text"
              value={project?.projectName || 'Loading...'}
              disabled
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
            />
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-brown-secondary mb-2">
              Material Items
            </label>
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={form.items.length === 1}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Item
            </button>
          </div>

          {/* Needed By Date */}
          <div>
            <label className="block text-sm font-medium text-brown-secondary mb-1">
              Needed By Date *
            </label>
            <input
              type="date"
              value={form.neededBy}
              onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brown-primary focus:border-transparent"
              required
            />
          </div>

          {/* Warehouse Note */}
          <div>
            <label className="block text-sm font-medium text-brown-secondary mb-1">
              Additional Notes
            </label>
            <textarea
              value={form.warehouseNote}
              onChange={(e) => setForm({ ...form, warehouseNote: e.target.value })}
              placeholder="Any additional notes or specifications..."
              rows="3"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brown-primary focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-brown-primary text-white rounded hover:bg-brown-secondary disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Request' : 'Create Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}