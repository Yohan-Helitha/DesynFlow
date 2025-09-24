import React from 'react';import React from 'react';import React from 'react';



const PropertyDetailsForm = ({ formData, setFormData, errors }) => {

  

  const handleInputChange = (field, value) => {const PropertyDetailsForm = ({ formData, setFormData, errors }) => {const PropertyDetailsForm = ({ formData, setFormData, errors }) => {

    setFormData(prev => ({

      ...prev,    

      [field]: value

    }));  const handleInputChange = (field, value) => {  const handleInputChange = (field, value) => {

  };

    setFormData(prev => ({    setFormData(prev => ({

  const propertyTypes = [

    { value: 'residential', label: 'Residential' },      ...prev,      ...prev,

    { value: 'commercial', label: 'Commercial' },

    { value: 'apartment', label: 'Apartment' }      [field]: value      [field]: value

  ];

    }));    }));

  return (

    <div className="property-details-form">  };  };

      <h2>Property Details</h2>

      

      {/* Client Information */}

      <div className="form-section">  const propertyTypes = [  const propertyTypes = [

        <h3>Client Information</h3>

            { value: 'residential', label: 'Residential' },    { value: 'residential', label: 'Residential' },

        <div className="form-group">

          <label>Client Name *</label>    { value: 'commercial', label: 'Commercial' },    { value: 'commercial', label: 'Commercial' },

          <input

            type="text"    { value: 'apartment', label: 'Apartment' }    { value: 'apartment', label: 'Apartment' }

            value={formData.client_name}

            onChange={(e) => handleInputChange('client_name', e.target.value)}  ];  ];

            placeholder="Enter your full name"

          />

          {errors.client_name && <span className="error">{errors.client_name}</span>}

        </div>  return (  return (



        <div className="form-row">    <div className="property-details-form">    <div className="property-details-form">

          <div className="form-group">

            <label>Email Address *</label>      <h2>Property Details</h2>      <h2>Property Details</h2>

            <input

              type="email"            

              value={formData.email}

              onChange={(e) => handleInputChange('email', e.target.value)}      {/* Client Information */}      {/* Client Information */}

              placeholder="your.email@example.com"

            />      <div className="form-section">      <div className="form-section">

            {errors.email && <span className="error">{errors.email}</span>}

          </div>        <h3>Client Information</h3>        <h3>Client Information</h3>



          <div className="form-group">                

            <label>Phone Number *</label>

            <input        <div className="form-group">        <div className="form-group">

              type="tel"

              value={formData.phone_number}          <label>Client Name *</label>          <label>Client Name *</label>

              onChange={(e) => handleInputChange('phone_number', e.target.value)}

              placeholder="+1 (555) 123-4567"          <input          <input

            />

            {errors.phone_number && <span className="error">{errors.phone_number}</span>}            type="text"            type="text"

          </div>

        </div>            value={formData.client_name}            value={formData.client_name}

      </div>

            onChange={(e) => handleInputChange('client_name', e.target.value)}            onChange={(e) => handleInputChange('client_name', e.target.value)}

      {/* Property Information */}

      <div className="form-section">            placeholder="Enter your full name"            placeholder="Enter your full name"

        <h3>Property Information</h3>

                  />          />

        <div className="form-group">

          <label>Property Address *</label>          {errors.client_name && <span className="error">{errors.client_name}</span>}          {errors.client_name && <span className="error">{errors.client_name}</span>}

          <input

            type="text"        </div>        </div>

            value={formData.propertyLocation_address}

            onChange={(e) => handleInputChange('propertyLocation_address', e.target.value)}

            placeholder="123 Main Street, Suite 100"

          />        <div className="form-row">        <div className="form-row">

          {errors.propertyLocation_address && <span className="error">{errors.propertyLocation_address}</span>}

        </div>          <div className="form-group">          <div className="form-group">



        <div className="form-row">            <label>Email Address *</label>            <label>Email Address *</label>

          <div className="form-group">

            <label>City *</label>            <input            <input

            <input

              type="text"              type="email"              type="email"

              value={formData.propertyLocation_city}

              onChange={(e) => handleInputChange('propertyLocation_city', e.target.value)}              value={formData.email}              value={formData.email}

              placeholder="Enter city"

            />              onChange={(e) => handleInputChange('email', e.target.value)}              onChange={(e) => handleInputChange('email', e.target.value)}

            {errors.propertyLocation_city && <span className="error">{errors.propertyLocation_city}</span>}

          </div>              placeholder="your.email@example.com"              placeholder="your.email@example.com"



          <div className="form-group">            />            />

            <label>Property Type *</label>

            <select            {errors.email && <span className="error">{errors.email}</span>}            {errors.email && <span className="error">{errors.email}</span>}

              value={formData.propertyType}

              onChange={(e) => handleInputChange('propertyType', e.target.value)}          </div>          </div>

            >

              <option value="">Select property type</option>

              {propertyTypes.map(type => (

                <option key={type.value} value={type.value}>{type.label}</option>          <div className="form-group">          <div className="form-group">

              ))}

            </select>            <label>Phone Number *</label>            <label>Phone Number *</label>

            {errors.propertyType && <span className="error">{errors.propertyType}</span>}

          </div>            <input            <input

        </div>

              type="tel"              type="tel"

        <div className="form-row">

          <div className="form-group">              value={formData.phone_number}              value={formData.phone_number}

            <label>Number of Floors *</label>

            <input              onChange={(e) => handleInputChange('phone_number', e.target.value)}              onChange={(e) => handleInputChange('phone_number', e.target.value)}

              type="number"

              min="1"              placeholder="+1 (555) 123-4567"              placeholder="+1 (555) 123-4567"

              max="50"

              value={formData.number_of_floor}            />            />

              onChange={(e) => handleInputChange('number_of_floor', parseInt(e.target.value))}

            />            {errors.phone_number && <span className="error">{errors.phone_number}</span>}            {errors.phone_number && <span className="error">{errors.phone_number}</span>}

            {errors.number_of_floor && <span className="error">{errors.number_of_floor}</span>}

          </div>          </div>          </div>



          <div className="form-group">        </div>        </div>

            <label>Total Number of Rooms *</label>

            <input      </div>      </div>

              type="number"

              min="1"

              max="100"

              value={formData.number_of_room}      {/* Property Information */}      {/* Property Information */}

              onChange={(e) => handleInputChange('number_of_room', parseInt(e.target.value))}

            />      <div className="form-section">      <div className="form-section">

            {errors.number_of_room && <span className="error">{errors.number_of_room}</span>}

          </div>        <h3>Property Information</h3>        <h3>Property Information</h3>

        </div>

      </div>                



      {/* Inspection Preferences */}        <div className="form-group">        <div className="form-group">

      <div className="form-section">

        <h3>Inspection Preferences</h3>          <label>Property Address *</label>          <label>Property Address *</label>

        

        <div className="form-group">          <input          <input

          <label>Preferred Inspection Date *</label>

          <input            type="text"            type="text"

            type="date"

            value={formData.inspection_date}            value={formData.propertyLocation_address}            value={formData.propertyLocation_address}

            onChange={(e) => handleInputChange('inspection_date', e.target.value)}

            min={new Date().toISOString().split('T')[0]}            onChange={(e) => handleInputChange('propertyLocation_address', e.target.value)}            onChange={(e) => handleInputChange('propertyLocation_address', e.target.value)}

          />

          {errors.inspection_date && <span className="error">{errors.inspection_date}</span>}            placeholder="123 Main Street, Suite 100"            placeholder="123 Main Street, Suite 100"

        </div>

          />          />

        <div className="form-group">

          <label>Special Instructions</label>          {errors.propertyLocation_address && <span className="error">{errors.propertyLocation_address}</span>}          {errors.propertyLocation_address && <span className="error">{errors.propertyLocation_address}</span>}

          <textarea

            value={formData.special_instructions}        </div>        </div>

            onChange={(e) => handleInputChange('special_instructions', e.target.value)}

            placeholder="Any special requirements or instructions for the inspection..."

            rows="3"

          />        <div className="form-row">        <div className="form-row">

        </div>

      </div>          <div className="form-group">          <div className="form-group">

    </div>

  );            <label>City *</label>            <label>City *</label>

};

            <input            <input

export default PropertyDetailsForm;
              type="text"              type="text"

              value={formData.propertyLocation_city}              value={formData.propertyLocation_city}

              onChange={(e) => handleInputChange('propertyLocation_city', e.target.value)}              onChange={(e) => handleInputChange('propertyLocation_city', e.target.value)}

              placeholder="Enter city"              placeholder="Enter city"

            />            />

            {errors.propertyLocation_city && <span className="error">{errors.propertyLocation_city}</span>}            {errors.propertyLocation_city && <span className="error">{errors.propertyLocation_city}</span>}

          </div>          </div>



          <div className="form-group">          <div className="form-group">

            <label>Property Type *</label>            <label>Property Type *</label>

            <select            <select

              value={formData.propertyType}              value={formData.propertyType}

              onChange={(e) => handleInputChange('propertyType', e.target.value)}              onChange={(e) => handleInputChange('propertyType', e.target.value)}

            >            >

              <option value="">Select property type</option>              <option value="">Select property type</option>

              {propertyTypes.map(type => (              {propertyTypes.map(type => (

                <option key={type.value} value={type.value}>{type.label}</option>                <option key={type.value} value={type.value}>{type.label}</option>

              ))}              ))}

            </select>            </select>

            {errors.propertyType && <span className="error">{errors.propertyType}</span>}            {errors.propertyType && <span className="error">{errors.propertyType}</span>}

          </div>          </div>

        </div>        </div>



        <div className="form-row">        <div className="form-row">

          <div className="form-group">          <div className="form-group">

            <label>Number of Floors *</label>            <label>Number of Floors *</label>

            <input            <input

              type="number"              type="number"

              min="1"              min="1"

              max="50"              max="50"

              value={formData.number_of_floor}              value={formData.number_of_floor}

              onChange={(e) => handleInputChange('number_of_floor', parseInt(e.target.value))}              onChange={(e) => handleInputChange('number_of_floor', parseInt(e.target.value))}

            />            />

            {errors.number_of_floor && <span className="error">{errors.number_of_floor}</span>}            {errors.number_of_floor && <span className="error">{errors.number_of_floor}</span>}

          </div>          </div>



          <div className="form-group">          <div className="form-group">

            <label>Total Number of Rooms *</label>            <label>Total Number of Rooms *</label>

            <input            <input

              type="number"              type="number"

              min="1"              min="1"

              max="100"              max="100"

              value={formData.number_of_room}              value={formData.number_of_room}

              onChange={(e) => handleInputChange('number_of_room', parseInt(e.target.value))}              onChange={(e) => handleInputChange('number_of_room', parseInt(e.target.value))}

            />            />

            {errors.number_of_room && <span className="error">{errors.number_of_room}</span>}            {errors.number_of_room && <span className="error">{errors.number_of_room}</span>}

          </div>          </div>

        </div>        </div>

      </div>      </div>



      {/* Inspection Preferences */}      {/* Inspection Preferences */}

      <div className="form-section">      <div className="form-section">

        <h3>Inspection Preferences</h3>        <h3>Inspection Preferences</h3>

                

        <div className="form-group">        <div className="form-group">

          <label>Preferred Inspection Date *</label>          <label>Preferred Inspection Date *</label>

          <input          <input

            type="date"            type="date"

            value={formData.inspection_date}            value={formData.inspection_date}

            onChange={(e) => handleInputChange('inspection_date', e.target.value)}            onChange={(e) => handleInputChange('inspection_date', e.target.value)}

            min={new Date().toISOString().split('T')[0]}            min={new Date().toISOString().split('T')[0]}

          />          />

          {errors.inspection_date && <span className="error">{errors.inspection_date}</span>}          {errors.inspection_date && <span className="error">{errors.inspection_date}</span>}

        </div>        </div>



        <div className="form-group">        <div className="form-group">

          <label>Special Instructions</label>          <label>Special Instructions</label>

          <textarea          <textarea

            value={formData.special_instructions}            value={formData.special_instructions}

            onChange={(e) => handleInputChange('special_instructions', e.target.value)}            onChange={(e) => handleInputChange('special_instructions', e.target.value)}

            placeholder="Any special requirements or instructions for the inspection..."            placeholder="Any special requirements or instructions for the inspection..."

            rows="3"            rows="3"

          />          />

        </div>        </div>

      </div>      </div>



      <style jsx>{`        <div className="form-row">

        .property-details-form {          <div className="form-group">

          max-width: 800px;            <label>Email Address *</label>

          margin: 0 auto;            <input

          padding: 20px;              type="email"

        }              value={formData.email}

              onChange={(e) => handleInputChange('email', e.target.value)}

        .form-section {              placeholder="your@email.com"

          margin-bottom: 30px;            />

          background: #f9f9f9;            {errors.email && <span className="error">{errors.email}</span>}

          padding: 20px;          </div>

          border-radius: 8px;

        }          <div className="form-group">

            <label>Phone Number *</label>

        .form-section h3 {            <input

          margin-top: 0;              type="tel"

          margin-bottom: 20px;              value={formData.phone}

          color: #333;              onChange={(e) => handleInputChange('phone', e.target.value)}

          border-bottom: 2px solid #007bff;              placeholder="+1 (555) 123-4567"

          padding-bottom: 8px;            />

        }            {errors.phone && <span className="error">{errors.phone}</span>}

          </div>

        .form-row {        </div>

          display: flex;      </div>

          gap: 20px;

          margin-bottom: 20px;      {/* Property Information */}

        }      <div className="form-section">

        <h3>Property Information</h3>

        .form-row .form-group {        

          flex: 1;        <div className="form-group">

        }          <label>Property Address *</label>

          <input

        .form-group {            type="text"

          margin-bottom: 20px;            value={formData.propertyLocation.address}

        }            onChange={(e) => handleInputChange('propertyLocation.address', e.target.value)}

            placeholder="123 Main Street, City, State, ZIP"

        .form-group label {          />

          display: block;          {errors.address && <span className="error">{errors.address}</span>}

          margin-bottom: 5px;        </div>

          font-weight: 600;

          color: #333;        <div className="form-row">

        }          <div className="form-group">

            <label>City *</label>

        .form-group input,            <input

        .form-group select,              type="text"

        .form-group textarea {              value={formData.propertyLocation.city}

          width: 100%;              onChange={(e) => handleInputChange('propertyLocation.city', e.target.value)}

          padding: 10px;              placeholder="City"

          border: 1px solid #ddd;            />

          border-radius: 4px;          </div>

          font-size: 16px;

          transition: border-color 0.3s ease;          <div className="form-group">

        }            <label>State</label>

            <input

        .form-group input:focus,              type="text"

        .form-group select:focus,              value={formData.propertyLocation.state}

        .form-group textarea:focus {              onChange={(e) => handleInputChange('propertyLocation.state', e.target.value)}

          outline: none;              placeholder="State"

          border-color: #007bff;            />

        }          </div>



        .form-group textarea {          <div className="form-group">

          resize: vertical;            <label>ZIP Code</label>

          min-height: 80px;            <input

        }              type="text"

              value={formData.propertyLocation.zipCode}

        .error {              onChange={(e) => handleInputChange('propertyLocation.zipCode', e.target.value)}

          color: #dc3545;              placeholder="12345"

          font-size: 14px;            />

          margin-top: 5px;          </div>

          display: block;        </div>

        }

        <div className="form-row">

        @media (max-width: 768px) {          <div className="form-group">

          .form-row {            <label>Property Type *</label>

            flex-direction: column;            <select

            gap: 0;              value={formData.propertyType}

          }              onChange={(e) => handleInputChange('propertyType', e.target.value)}

        }            >

      `}</style>              <option value="">Select Property Type</option>

    </div>              {propertyTypes.map(type => (

  );                <option key={type.value} value={type.value}>{type.label}</option>

};              ))}

            </select>

export default PropertyDetailsForm;            {errors.propertyType && <span className="error">{errors.propertyType}</span>}
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