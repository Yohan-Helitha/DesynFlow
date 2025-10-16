import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar";
import {
  fetchRawMaterialById,
  updateRawMaterial,
} from "../services/FrawMaterialsService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";

const UpdateRawMaterialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialName: "",
    category: "",
    type: "",
    unit: "",
    restockLevel: "",
    reorderLevel: "",
    currentLevel: "",
    inventoryName: "",
  });

  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});

  // Categories & Types
  const categories = [
    "Wood & Wood Products",
    "Metals",
    "Fabrics & Upholstery Materials",
    "Flooring Materials",
    "Glass & Mirrors",
    "Electrical & Lighting Components",
  ];

  const getTypesForCategory = (category) => {
    const categoryTypes = {
      "Wood & Wood Products": [
        "Solid wood (Teak, Mahogany, Oak, Pine)",
        "Engineered wood (Plywood, MDF, Particleboard)",
        "Veneers and laminates",
        "Timber for structural purposes",
      ],
      Metals: [
        "Stainless steel (for furniture frames, handles)",
        "Aluminum (windows, lightweight frames)",
        "Brass, copper, and bronze (decorative fixtures)",
        "Iron/steel (structural and decorative)",
      ],
      "Fabrics & Upholstery Materials": [
        "Cotton, Linen, Silk, Velvet, Leather",
        "Synthetic fabrics (polyester, microfiber)",
        "Foam, batting, and cushioning materials",
      ],
      "Flooring Materials": [
        "Ceramic/porcelain tiles",
        "Marble, granite, and natural stones",
        "Wooden flooring / Laminates / Vinyl sheets",
        "Carpets, rugs, and mats",
      ],
      "Glass & Mirrors": [
        "Tempered glass, frosted glass",
        "Mirrors for décor and furniture",
        "Glass panels for partitions",
      ],
      "Electrical & Lighting Components": [
        "LED strips, bulbs, and fittings",
        "Switches, sockets, and wiring materials",
        "Decorative lighting (pendants, chandeliers)",
      ],
    };

    return categoryTypes[category] || [];
  };

  // Load material and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        const material = await fetchRawMaterialById(id);
        if (!material) {
          alert("Material not found");
          return;
        }
        setFormData({
          materialName: material.materialName || "",
          category: material.category || "",
          type: material.type || "",
          unit: material.unit || "",
          restockLevel: material.restockLevel || "",
          reorderLevel: material.reorderLevel || "",
          currentLevel: material.currentLevel || "",
          inventoryName: material.inventoryName || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch material details");
      }
    };

    const loadLocations = async () => {
      try {
        const data = await fetchInvLocation();
        setLocations(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
    loadLocations();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData({ ...formData, category: value, type: "" });
    }  else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      restockLevel: Number(formData.restockLevel),
      reorderLevel: Number(formData.reorderLevel),
      currentLevel: Number(formData.currentLevel),
    };

    try {
      await updateRawMaterial(id, payload);
      alert("Material updated successfully!");
      navigate("/warehouse-manager/raw-materials");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update material" });
      }
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Update Raw Material</h1>

          {errors.general && (
            <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
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
                className={inputClass("materialName")}
              />
              {errors.materialName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.materialName}
                </p>
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
                className={inputClass("category")}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={!formData.category}
                className={inputClass("type")}
              >
                <option value="">
                  {formData.category
                    ? "-- Select Type --"
                    : "-- Select Category First --"}
                </option>
                {getTypesForCategory(formData.category).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
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
                className={inputClass("unit")}
              >
                <option value="">-- Select Unit --</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="m">m</option>
              </select>
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
              )}
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
                className={inputClass("restockLevel")}
              />
              {errors.restockLevel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restockLevel}
                </p>
              )}
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
                className={inputClass("reorderLevel")}
              />
              {errors.reorderLevel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reorderLevel}
                </p>
              )}
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
                className={inputClass("currentLevel")}
              />
              {errors.currentLevel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentLevel}
                </p>
              )}
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
                className={inputClass("inventoryName")}
              >
                <option value="">-- Select Inventory Location --</option>
                {locations.map((loc) => (
                  <option key={loc.inventoryId} value={loc.inventoryName}>
                    {loc.inventoryName}
                  </option>
                ))}
              </select>
              {errors.inventoryName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.inventoryName}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Update Material
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

export default UpdateRawMaterialForm;
