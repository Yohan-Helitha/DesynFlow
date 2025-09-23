import React from 'react';

const PropertyDetailsForm = ({ formData, setFormData, errors }) => {
  
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'office', label: 'Office' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="property-details-form">
      <h2>Property Details</h2>
      
      {/* Client Information */}
      <div className="form-section">
        <h3>Client Information</h3>
        
        <div className="form-group">
          <label>Client Name *</label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            placeholder="Enter your full name"
          />
          {errors.clientName && <span className="error">{errors.clientName}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="form-section">
        <h3>Property Information</h3>
        
        <div className="form-group">
          <label>Property Address *</label>
          <input
            type="text"
            value={formData.propertyLocation.address}
            onChange={(e) => handleInputChange('propertyLocation.address', e.target.value)}
            placeholder="123 Main Street, City, State, ZIP"
          />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={formData.propertyLocation.city}
              onChange={(e) => handleInputChange('propertyLocation.city', e.target.value)}
              placeholder="City"
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={formData.propertyLocation.state}
              onChange={(e) => handleInputChange('propertyLocation.state', e.target.value)}
              placeholder="State"
            />
          </div>

          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              value={formData.propertyLocation.zipCode}
              onChange={(e) => handleInputChange('propertyLocation.zipCode', e.target.value)}
              placeholder="12345"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Property Type *</label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.propertyType && <span className="error">{errors.propertyType}</span>}
          </div>

          <div className="form-group">
            <label>Number of Floors *</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.numberOfFloors}
              onChange={(e) => handleInputChange('numberOfFloors', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* Inspection Preferences */}
      <div className="form-section">
        <h3>Inspection Preferences</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Preferred Inspection Date *</label>
            <input
              type="date"
              value={formData.preferredInspectionDate}
              onChange={(e) => handleInputChange('preferredInspectionDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.preferredInspectionDate && <span className="error">{errors.preferredInspectionDate}</span>}
          </div>

          <div className="form-group">
            <label>Alternative Date 1</label>
            <input
              type="date"
              value={formData.alternativeDate1}
              onChange={(e) => handleInputChange('alternativeDate1', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Special Instructions</label>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            placeholder="Any special requirements or instructions for the inspection..."
            rows="3"
          />
        </div>
      </div>

      <style jsx>{`
        .property-details-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-section {
          margin-bottom: 30px;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }

        .form-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 8px;
        }

        .form-row {
          display: flex;
          gap: 15px;
        }

        .form-group {
          flex: 1;
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .error {
          color: #dc3545;
          font-size: 12px;
          display: block;
          margin-top: 5px;
        }

        textarea {
          resize: vertical;
        }
      `}</style>
    </div>
  );
};

export default PropertyDetailsForm;