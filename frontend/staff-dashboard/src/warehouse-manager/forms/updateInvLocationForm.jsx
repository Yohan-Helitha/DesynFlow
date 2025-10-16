import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar.jsx';
import { fetchInvLocationById, updateInvLocation, fetchInvLocation } from '../services/FinvLocationService.js';

const countryPhoneRules = {
  "Sri Lanka": { code: "+94", digits: 9 },
  "USA": { code: "+1", digits: 10 },
  "India": { code: "+91", digits: 10 },
  "UK": { code: "+44", digits: 10 },
  "Germany": { code: "+49", digits: 10 },
  "Canada": { code: "+1", digits: 10 }
};

const UpdateInvLocationForm = () => {
  const { id } = useParams();
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
      setLocations(data.filter(loc => loc.inventoryId !== id));
    };

    const loadInventory = async () => {
      try {
        const data = await fetchInvLocationById(id);
        if (!data) {
          alert('Inventory not found');
          return;
        }
        setFormData({
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

    loadLocations();
    loadInventory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedData = { ...formData, [name]: value };

    // Only allow numbers for capacity
    if (name === 'capacity') {
      if (!/^\d*$/.test(value)) return;
    }

    // Handle contact input: allow only digits after country code
    if (name === 'inventoryContact') {
      const rule = countryPhoneRules[formData.country];
      if (rule) {
        // Keep country code, replace local digits only
        const localDigits = value.replace(/\D/g, '').slice(rule.code.replace('+','').length);
        updatedData.inventoryContact = rule.code + localDigits;
      } else {
        updatedData.inventoryContact = value.replace(/\D/g,''); // fallback
      }
    }

    // Auto-fill country code when country changes
    if (name === 'country') {
      const rule = countryPhoneRules[value];
      if (rule) {
        const digitsOnly = formData.inventoryContact.replace(/\D/g, '');
        const oldCodeLength = formData.country ? countryPhoneRules[formData.country].code.replace('+','').length : 0;
        const localNumber = digitsOnly.slice(oldCodeLength);
        updatedData.inventoryContact = rule.code + localNumber;
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
    if (country && inventoryContact) {
      const rule = countryPhoneRules[country];
      if (rule) {
        const digitsOnly = inventoryContact.replace(/\D/g, '');
        const countryCodeDigits = rule.code.replace('+','');
        const expectedLength = countryCodeDigits.length + rule.digits;

        if (!digitsOnly.startsWith(countryCodeDigits)) {
          errs.inventoryContact = `Contact must start with ${rule.code}`;
        } else if (digitsOnly.length !== expectedLength) {
          errs.inventoryContact = `Contact number must be ${expectedLength} digits including country code`;
        }
      }
    }

    locations.forEach(loc => {
    if (loc.inventoryId === id) return; // skip self

    // Instance 1: same name, address, country, capacity, same manager → check contact
    if (
      loc.inventoryName === inventoryName &&
      loc.inventoryAddress === inventoryAddress &&
      loc.country === country &&
      loc.capacity === capacity &&
      loc.warehouseManagerName === warehouseManagerName &&
      loc.inventoryContact !== inventoryContact
    ) {
      if (locations.some(i => i.inventoryContact === inventoryContact)) {
        errs.inventoryContact = "Contact must be unique";
      }
    }

    // Instance 4: different name, same address, country, capacity, contact, manager → check name
    if (
      loc.inventoryAddress === inventoryAddress &&
      loc.country === country &&
      loc.capacity === capacity &&
      loc.inventoryContact === inventoryContact &&
      loc.warehouseManagerName === warehouseManagerName &&
      loc.inventoryName !== inventoryName
    ) {
      if (locations.some(i => i.inventoryName === inventoryName)) {
        errs.inventoryName = "Inventory name must be unique";
      }
    }

    // Instance 5: same name, different address, same country, same capacity, different contact, same manager → check address
    if (
      loc.inventoryName === inventoryName &&
      loc.country === country &&
      loc.capacity === capacity &&
      loc.warehouseManagerName === warehouseManagerName &&
      loc.inventoryAddress !== inventoryAddress
    ) {
      if (locations.some(i => i.inventoryAddress === inventoryAddress)) {
        errs.inventoryAddress = "Inventory address must be unique";
      }
    }
  });

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = { ...formData, capacity: Number(formData.capacity) };

    try {
      await updateInvLocation(id, payload);
      alert('Inventory updated successfully!');
      navigate('/warehouse-manager/inventory-locations');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update inventory');
    }
  };

  const inputClass = (field) => `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
    errors[field] ? "border-red-500" : "border-gray-300"
  }`;

  return (
    <div>
      <Navbar />
      <div className="m-6">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Update Inventory</h1>

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
              <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md">Update Inventory</button>
              <button type="button" onClick={() => navigate('/warehouse-manager/inventory-locations')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md">Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateInvLocationForm;
