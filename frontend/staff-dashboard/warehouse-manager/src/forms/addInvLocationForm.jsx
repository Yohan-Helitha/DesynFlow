import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar.jsx';
import { addInvLocation, fetchInvLocation } from "../services/FinvLocationService.js";

const countryPhoneRules = {
  "Sri Lanka": { code: "+94", digits: 9 },
  "USA": { code: "+1", digits: 10 },
  "India": { code: "+91", digits: 10 },
  "UK": { code: "+44", digits: 10 },
  "Germany": { code: "+49", digits: 10 },
  "Canada": { code: "+1", digits: 10 }
};

const AddInvLocationForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inventoryName: '',
    inventoryAddress: '',
    country: '',
    capacity: '',
    inventoryContact: '',
    warehouseManagerName: ''
  });
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loadLocations = async () => {
      const data = await fetchInvLocation();
      setLocations(data);
    };
    loadLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers for capacity and contact (excluding country code)
    if (name === 'capacity') {
      if (!/^\d*$/.test(value)) return;
    }
    if (name === 'inventoryContact') {
      if (!/^\d*$/.test(value.replace(/^\+?\d*/, ''))) return;
    }

    let updatedData = { ...formData, [name]: value };

    // Auto-fill country code for contact when country changes
    if (name === 'country') {
      const rule = countryPhoneRules[value];
      if (rule) {
        // Remove old country code if present
        const contactNumber = formData.inventoryContact.replace(/^\+\d+/, '');
        updatedData.inventoryContact = rule.code + contactNumber;
      }
    }

    setFormData(updatedData);
  };

  const validateForm = () => {
    const errs = {};
    const { inventoryName, inventoryAddress, country, capacity, inventoryContact, warehouseManagerName } = formData;

    // Required
    if (!inventoryName.trim()) errs.inventoryName = "Inventory name is required";
    if (!inventoryAddress.trim()) errs.inventoryAddress = "Inventory address is required";
    if (!country.trim()) errs.country = "Country is required";
    if (!capacity) errs.capacity = "Capacity is required";
    if (!inventoryContact.trim()) errs.inventoryContact = "Contact is required";
    if (!warehouseManagerName.trim()) errs.warehouseManagerName = "Warehouse manager is required";

    // Capacity numeric
    if (capacity && isNaN(Number(capacity))) errs.capacity = "Capacity must be a number";

    // Contact validation
    // Contact validation
if (country && inventoryContact) {
  const rule = countryPhoneRules[country];
  if (rule) {
    const contactNumber = inventoryContact.replace(/\D/g, ''); // keep only numbers
    const expectedLength = rule.code.replace("+", "").length + rule.digits; // code length + local digits

    if (contactNumber.length !== expectedLength) {
      errs.inventoryContact = `Contact number must be ${expectedLength} digits including country code for ${country}`;
    }

    // Ensure it starts with correct code
    if (!contactNumber.startsWith(rule.code.replace("+", ""))) {
      errs.inventoryContact = `Contact must start with ${rule.code}`;
    }
  }
}


    // Check duplicates locally
    locations.forEach(loc => {
      if (loc.inventoryName === inventoryName) errs.inventoryName = "Inventory name already exists";
      if (loc.inventoryAddress === inventoryAddress) errs.inventoryAddress = "Inventory address already exists";
      if (loc.inventoryContact === inventoryContact) errs.inventoryContact = "Contact already exists";
    });

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const now = new Date();
    const payload = { ...formData, createdBy: loggedInUserId || "WM001", createdAt: now.toISOString() };

    try {
      await addInvLocation(payload);
      alert('Inventory added successfully!');
      navigate('/inv-location');
    } catch (err) {
      console.error(err);
      alert('Failed to add inventory');
    }
  };

  const inputClass = (field) => `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
    errors[field] ? "border-red-500" : "border-gray-300"
  }`;

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-xl  shadow bg-[#FFF8E8]">
          <h1 className="text-2xl font-bold mb-6">Add Inventory</h1>

          {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">

            {/* Inventory Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="inventoryName" value={formData.inventoryName} onChange={handleChange} className={inputClass('inventoryName')} />
              {errors.inventoryName && <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>}
            </div>

            {/* Inventory Address */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input type="text" name="inventoryAddress" value={formData.inventoryAddress} onChange={handleChange} className={inputClass('inventoryAddress')} />
              {errors.inventoryAddress && <p className="text-red-500 text-sm mt-1">{errors.inventoryAddress}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select name="country" value={formData.country} onChange={handleChange} className={inputClass('country')}>
                <option value="">-- Select Country --</option>
                {Object.keys(countryPhoneRules).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* Capacity */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Capacity (m³) <span className="text-red-500">*</span>
              </label>
              <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} className={inputClass('capacity')} />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            {/* Inventory Contact */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Contact <span className="text-red-500">*</span>
              </label>
              <input type="text" name="inventoryContact" value={formData.inventoryContact} onChange={handleChange} className={inputClass('inventoryContact')} />
              {errors.inventoryContact && <p className="text-red-500 text-sm mt-1">{errors.inventoryContact}</p>}
            </div>

            {/* Warehouse Manager Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Warehouse Manager <span className="text-red-500">*</span>
              </label>
              <input type="text" name="warehouseManagerName" value={formData.warehouseManagerName} onChange={handleChange} className={inputClass('warehouseManagerName')} />
              {errors.warehouseManagerName && <p className="text-red-500 text-sm mt-1">{errors.warehouseManagerName}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md">Add Inventory</button>
              <button type="button" onClick={() => navigate('/inv-location')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md">Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvLocationForm;
