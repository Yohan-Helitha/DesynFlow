import Navbar from "../component/navbar";
import React from 'react'
import { fetchRawMaterial, deleteRawMaterial } from "../services/FrawMaterialsService.js";
import { useState, useEffect } from "react";
import { Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RawMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const navigate = useNavigate();

    // Function to fetch materials from backend
    const getMaterials = async () => {
        try {
        const data = await fetchRawMaterial();
        setMaterials(data);
        } catch (err) {
        console.error("Failed to fetch materials:", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        getMaterials();
    }, []);

    // Delete handler
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this material?");
        if (!confirmDelete) return;

        try {
        await deleteRawMaterial(id); // call API
        await getMaterials(); // refresh table
        alert("Material deleted successfully!");
        } catch (err) {
        console.error("Failed to delete material:", err);
        alert("Failed to delete material.");
        }
    };
    
  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Raw Materials</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10" onClick={() => navigate('/add-material')}>
            + Add Material
            </button>
        </div>
        

        <div className="overflow-x-auto">
            <table className="min-w-max border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-64 w-48 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Material Name</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Unit</th>
                <th className="border border-gray-300 px-4 py-2">Restock Level</th>
                <th className="border border-gray-300 px-4 py-2">Reorder Level</th>
                <th className="border border-gray-300 px-4 py-2">Current Level</th>
                <th className="border border-gray-300 px-4 py-2">Inventory ID</th>
                <th className="border border-gray-300 px-4 py-2">Created By</th>
                <th className="border border-gray-300 px-4 py-2">Month</th>
                <th className="border border-gray-300 px-4 py-2">Year</th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
                </tr>
            </thead>
            <tbody className="align-middle text-center">
                {materials.length > 0 ? (
                materials.map((material) => (
                    <tr key={material._id}>
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                        <div className="flex items-center justify-center gap-8">
                            <div className="group relative cursor-pointer" onClick={() => navigate(`/update-material/${material._id}`)}>
                            <Edit2 className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Update
                            </span>
                            </div>

                            <div className="group relative cursor-pointer" onClick={async () => {
                                const confirmDelete = window.confirm("Are you sure you want to delete this material?");
                                if (confirmDelete) {
                                try {
                                    await deleteRawMaterial(material._id); // call API
                                    // Refresh the table after deletion
                                    setMaterials(materials.filter(p => p._id !== material._id));
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to delete the material."); // alert on error
                                }
                                }
                            }}>
                            <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Delete
                            </span>
                            </div>

                        </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{material.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-64 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{material.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.category}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.type}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.restockLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.reorderLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.currentLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.inventoryId}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.month}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.year}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(material.createdAt).toLocaleString()}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="14" className="text-center p-4">No materials found.</td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
      
    </div>
  );
}

export default RawMaterials;