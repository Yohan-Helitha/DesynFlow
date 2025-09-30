import Navbar from "../component/navbar";
import React from 'react'
import { fetchRawMaterial, deleteRawMaterial } from "../services/FrawMaterialsService.js";
import { useState, useEffect } from "react";
import { Edit2, Trash2,Filter,Search,Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const RawMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [showFilter, setShowFilter] = useState(false);

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

    // Filtering logic
    const filteredMaterials = materials.filter((material) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return material.materialId?.toLowerCase().includes(query);
    }
    if (filterBy === "name") {
      return material.materialName?.toLowerCase().includes(query);
    }
    if (filterBy === "category") {
      return material.category?.toLowerCase().includes(query);
    }
    if (filterBy === "type") {
      return material.type?.toLowerCase().includes(query);
    }
    if(filterBy === "inventoryName") {
      return material.inventoryName?.toLowerCase().includes(query);
    }
    if (filterBy === "critical") {
    return material.currentLevel < material.reorderLevel;
    }

    // Default: search all
    if (filterBy === "all") {
    return (
      material.materialId?.toLowerCase().includes(query) ||
      material.materialName?.toLowerCase().includes(query) ||
      material.category?.toLowerCase().includes(query) ||
      material.type?.toLowerCase().includes(query) ||
      material.inventoryName?.toLowerCase().includes(query)
    );
  }
  return false
  });

  //pdf function
    const handleDownloadPDF = () => {
      console.log("Downloading PDF...");
  
      const columns = [
      "ID", "Name", "Category", "Type", "Unit", "Restock Level", 
      "Reorder Level", "Current Level",
      "Inventory Name", "Created By", "Month", "Year", "Created At"
      ];
  
      const rows = filteredMaterials.map(material => [
        material.materialId,
        material.materialName,
        material.category,
        material.type,
        material.unit,
        material.restockLevel,
        material.reorderLevel,
        material.currentLevel,
        material.inventoryName,
        material.createdBy,
        material.month,
        material.year,
        new Date(material.createdAt).toLocaleString()
      ]);
  
      generatePDF(columns, rows, "Raw Materials Report");
  
    };

    const chartData = materials.reduce((acc, material) => {
      const key = `${material.month}-${material.year}`;
      if (!acc[key]) {
        acc[key] = { monthYear: `${material.month}/${material.year}`, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    const chartArray = Object.values(chartData);
    
  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Raw Materials</h1>
          <button className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10" onClick={() => navigate('/warehouse-manager/raw-materials/add')}>
            + Add Material
            </button>
        </div>

        {/* 📊 Bar Chart Section */}
        <div className="w-full h-80 mb-10">
          <ResponsiveContainer>
            <BarChart data={chartArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#674636" barSize={30}/> 
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 🔎 Search + Filter */}
        <div className="mb-6 flex justify-end items-center gap-2">
            <Search className="w-5 h-5 text-gray-700" />
            <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Filter Icon + Dropdown Wrapper */}
            <div className="relative">
            <button
                onClick={() => setShowFilter(!showFilter)}
                className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            >
                <Filter className="w-5 h-5 text-gray-700" />
            </button>

            {/* Dropdown */}
            {showFilter && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
                <ul className="text-sm">
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "all" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("all"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    All
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "id" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("id"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Material ID
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "name" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("name"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Material Name
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "category" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("category"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Category
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "type" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("type"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Type
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Inventory Name
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "critical" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("critical"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Below Reorder Level
                    </li>
                </ul>
                </div>
            )}
            </div>

          <button
            onClick={handleDownloadPDF}
            className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            title="Download PDF"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        

        <div className="overflow-x-auto text-xs">
            <table className="min-w-max border-collapse border border-gray-300">
            <thead>
                <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Material ID</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-64 w-48 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Category</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Type</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Restock Level</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Reorder Level</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Current Level</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Created By</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Month</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Year</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Created At</th>
                </tr>
            </thead>
            <tbody className="align-middle text-center">
                {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                    <tr 
                    key={material._id}
                    className={material.currentLevel < material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"}
                    >
                    <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel < material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-0  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>
                        <div className="flex items-center justify-center gap-8">
                            <div className="group relative cursor-pointer" onClick={() => navigate(`/warehouse-manager/raw-materials/update/${material._id}`)}>
                            <Edit2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
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
                            <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
                            </div>

                        </div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel < material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-32  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{material.materialId}</td>
                    <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel < material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-64  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{material.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{material.category}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{material.type}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.restockLevel}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.reorderLevel}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.currentLevel}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{material.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.month}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{material.year}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{new Date(material.createdAt).toLocaleString()}</td>
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