import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';
import { addRawMaterial, fetchRawMaterial } from "../services/FrawMaterialsService";
import { fetchInvLocation } from "../services/FinvLocationService.js";

const AddRawMaterialsForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const initialFormData = {
    materialId: '',
    materialName: '',
    category: '',
    type: '',
    unit: '',
    restockLevel: '',
    reorderLevel: '',
    currentLevel: '',
    inventoryId: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [productType, setProductType] = useState('new');
  const [locations, setLocations] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [errors, setErrors] = useState({});

    // useEffect(() => {
    //     const loadLocations = async () => {
    //       const data = await fetchInvLocation();
    //       setLocations(data);
    //     };
    //     loadLocations();
    //   }, []);

  // Define categories and their related types
  const categories = ['Wood & Wood Products', 'Metals', 'Fabrics & Upholstery Materials', 'Flooring Materials', 'Glass & Mirrors', 'Electrical & Lighting Components'];
  
  const getTypesForCategory = (category) => {
    const categoryTypes = {
    'Wood & Wood Products': [
        'Solid wood (Teak, Mahogany, Oak, Pine)',
        'Engineered wood (Plywood, MDF, Particleboard)',
        'Veneers and laminates',
        'Timber for structural purposes'
    ],
    'Metals': [
        'Stainless steel (for furniture frames, handles)',
        'Aluminum (windows, lightweight frames)',
        'Brass, copper, and bronze (decorative fixtures)',
        'Iron/steel (structural and decorative)'
    ],
    'Fabrics & Upholstery Materials': [
        'Cotton, Linen, Silk, Velvet, Leather',
        'Synthetic fabrics (polyester, microfiber)',
        'Foam, batting, and cushioning materials'
    ],
    'Flooring Materials': [
        'Ceramic/porcelain tiles',
        'Marble, granite, and natural stones',
        'Wooden flooring / Laminates / Vinyl sheets',
        'Carpets, rugs, and mats'
    ],
    'Glass & Mirrors': [
        'Tempered glass, frosted glass',
        'Mirrors for décor and furniture',
        'Glass panels for partitions'
    ],
    'Electrical & Lighting Components': [
        'LED strips, bulbs, and fittings',
        'Switches, sockets, and wiring materials',
        'Decorative lighting (pendants, chandeliers)'
    ]
    };

    return categoryTypes[category] || [];
  };

  useEffect(() => {
      const loadData = async () => {
        const locData = await fetchInvLocation();
        setLocations(locData);
  
        const prodData = await fetchRawMaterial(); // fetch existing products
        setExistingProducts(prodData);
      };
      loadData();
    }, []);

    const handleProductTypeChange = (type) => {
    setProductType(type);
    
    setFormData({
    materialId: '',
    materialName: '',
    category: '',
    type: '',
    unit: '',
    restockLevel: '',
    reorderLevel: '',
    currentLevel: '',
    warrantyPeriod: '',
    inventoryName: ''
  });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        type: '' // Reset type when category changes
      });
    } else if (name === 'restockLevel') {
      setFormData({ ...formData, restockLevel: value, currentLevel: value });
    } else if (name === 'materialId' && productType === 'existing') {
      const selectedProduct = existingProducts.find(p => p.materialId === value);
      if (selectedProduct) {
        setFormData({
          ...initialFormData,
          materialId: selectedProduct.materialId,
          materialName: selectedProduct.materialName,
          category: selectedProduct.category,
          type: selectedProduct.type,
          unit: selectedProduct.unit,
          inventoryId: selectedProduct.inventoryId,
          restockLevel: '',
          currentLevel: '',
          reorderLevel: ''
        });
      }
    }
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // reset errors

    if (!formData.inventoryName || !formData.materialName) {
      setErrors({
        inventoryName: "Inventory location and product name are required"
      });
      return;
    }

    // Duplicate check: same inventoryName & materialName
    const duplicate = existingProducts.find(
      (p) =>
        p.inventoryName === formData.inventoryName &&
        p.materialName.trim().toLowerCase() === formData.materialName.trim().toLowerCase()
    );

    if (duplicate) {
      setErrors({
        inventoryName: "This product already exists in the selected inventory"
      });
      return;
    }

    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const payload = {
      ...formData,
      createdBy: loggedInUserId || "WM001",  // fallback if not passed
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      createdAt: now.toISOString(),
      materialId: productType === 'existing' ? formData.materialId : undefined
    };

    try {
      await addRawMaterial(payload);
      alert('Material added successfully!');
      navigate('/warehouse-manager/raw-materials');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to add material" });
      }
    }
  };

  const inputClass = (field) => `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
    errors[field] ? "border-red-500" : "border-gray-300"
  }`;

  return (
    <div>
      <Navbar />
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Add Raw Material</h1>

          {errors.general && (
            <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
          )}

          <div className="mb-6">
            <div className="font-medium mb-2">Product Type:</div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input type="radio" value="new" checked={productType==='new'} onChange={() => handleProductTypeChange('new')} className="h-4 w-4" />
                <span>New Material</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" value="existing" checked={productType==='existing'} onChange={() => handleProductTypeChange('existing')} className="h-4 w-4" />
                <span>Existing Material</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">

            {/* Material ID */}
            {productType === 'existing' ? (
              <div>
                <label className="block mb-2 font-medium text-gray-700">Material ID <span className="text-red-500">*</span></label>
                <select
                  name="materialId"
                  value={productType === 'new' ? '' : formData.materialId}
                  onChange={handleChange}
                  required
                  className={inputClass('materialId')}
                >
                  <option value="">-- Select Material ID --</option>
                  {[...new Map(existingProducts.map(p => [p.materialId, p])).values()].map(p => (
                    <option key={p.materialId} value={p.materialId}>
                      {p.materialId} - {p.materialName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block mb-2 font-medium text-gray-700">Material ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="materialId"
                  value={formData.materialId}
                  disabled
                  placeholder="Auto-generated for new product"
                  className={inputClass('materialId')}
                />
              </div>
            )}

            {/* Material Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                required
                className={inputClass('materialName')}
                disabled={productType === 'existing'}
              />
              {errors.materialName && (
                <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClass('category')}
                disabled={productType === 'existing'}
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              {productType === 'existing' ? (
                <input
                  type="text"
                  value={formData.type}
                  readOnly
                  className={inputClass('type')}
                />
              ) : (
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={!formData.category}
                className={inputClass('type')}
              >
                <option value="">{formData.category ? "-- Select Type --" : "-- Select Category First --"}</option>
                {getTypesForCategory(formData.category).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>)}
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Unit of Measurement <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className={inputClass('unit')}
                disabled={productType === 'existing'}
              >
                <option value="">-- Select Unit --</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="m">m</option>
              </select>
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>

            {/* Restock Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Restock Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="restockLevel"
                value={formData.restockLevel}
                onChange={handleChange}
                required
                min="0"
                className={inputClass('restockLevel')}
              />
              {errors.restockLevel && <p className="text-red-500 text-sm mt-1">{errors.restockLevel}</p>}
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                required
                min="0"
                className={inputClass('reorderLevel')}
              />
              {errors.reorderLevel && <p className="text-red-500 text-sm mt-1">{errors.reorderLevel}</p>}
            </div>

            {/* Current Level */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Current Stock Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                required
                min="0"
                className={inputClass('currentLevel')}
              />
              {errors.currentLevel && <p className="text-red-500 text-sm mt-1">{errors.currentLevel}</p>}
            </div>

            {/* Inventory Location */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory Location <span className="text-red-500">*</span>
              </label>
              <select
                name="inventoryName"
                value={formData.inventoryName}
                onChange={handleChange}
                required
                className={inputClass('inventoryName')}
              >
                <option value="">-- Select Inventory Location --</option>
                {locations.map(loc => (
                  <option key={loc.inventoryId} value={loc.inventoryName}>
                    {loc.inventoryName}
                  </option>
                ))}
              </select>
              {errors.inventoryName && <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Add Material
              </button>
              <button
                type="button"
                onClick={() => navigate("/warehouse-manager/raw-materials")}
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

export default AddRawMaterialsForm;