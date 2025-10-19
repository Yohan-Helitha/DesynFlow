// import Navbar from "../component/navbar";
// import React from 'react'
// import { fetchRawMaterial, deleteRawMaterial } from "../services/FrawMaterialsService.js";
// import { useState, useEffect, useMemo } from "react";
// import { Edit2, Trash2,Filter,Search,Download } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { generatePDF } from "../utils/pdfGenerator.js";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


// const RawMaterials = () => {
//     const [materials, setMaterials] = useState([]);
//     const navigate = useNavigate();
//     const [searchQuery, setSearchQuery] = useState("");
//     const [filterBy, setFilterBy] = useState("all");
//     const [showFilter, setShowFilter] = useState(false);
//     const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

//     // Function to fetch materials from backend
//     const getMaterials = async () => {
//         try {
//         const data = await fetchRawMaterial();
//         setMaterials(data);
//         } catch (err) {
//         console.error("Failed to fetch materials:", err);
//         }
//     };

//     // Initial fetch
//     useEffect(() => {
//         getMaterials();
//     }, []);

//     // Delete handler
//     const handleDelete = async (id) => {
//         const confirmDelete = window.confirm("Are you sure you want to delete this material?");
//         if (!confirmDelete) return;

//         try {
//         await deleteRawMaterial(id); // call API
//         await getMaterials(); // refresh table
//         alert("Material deleted successfully!");
//         } catch (err) {
//         console.error("Failed to delete material:", err);
//         alert("Failed to delete material.");
//         }
//     };

//     // Filtering logic
//     const filteredMaterials = materials.filter((material) => {
//     const query = searchQuery.toLowerCase();

//     if (filterBy === "id") {
//       return material.materialId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "name") {
//       return material.materialName?.toLowerCase().includes(query);
//     }
//     if (filterBy === "category") {
//       return material.category?.toLowerCase().includes(query);
//     }
//     if (filterBy === "type") {
//       return material.type?.toLowerCase().includes(query);
//     }
//     if(filterBy === "inventoryName") {
//       return material.inventoryName?.toLowerCase().includes(query);
//     }
//     if (filterBy === "critical") {
//     return material.currentLevel < material.reorderLevel;
//     }

//     // Default: search all
//     if (filterBy === "all") {
//     return (
//       material.materialId?.toLowerCase().includes(query) ||
//       material.materialName?.toLowerCase().includes(query) ||
//       material.category?.toLowerCase().includes(query) ||
//       material.type?.toLowerCase().includes(query) ||
//       material.inventoryName?.toLowerCase().includes(query)
//     );
//   }
//   return false
//   });

//   //pdf function
//     const handleDownloadPDF = (timeFilter = 'all') => {
//       console.log("Downloading PDF for:", timeFilter);

//       let dataToDownload = filteredMaterials;
      
//       // Filter data based on time selection
//       if (timeFilter !== 'all') {
//         const now = new Date();
//         const currentYear = now.getFullYear();
//         const currentMonth = now.getMonth() + 1;
        
//         dataToDownload = filteredMaterials.filter(material => {
//           const materialDate = new Date(material.createdAt);
//           const materialYear = materialDate.getFullYear();
//           const materialMonth = materialDate.getMonth() + 1;
          
//           switch (timeFilter) {
//             case 'thisMonth':
//               return materialYear === currentYear && materialMonth === currentMonth;
//             case 'previousMonth':
//               const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
//               const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
//               return materialYear === prevYear && materialMonth === prevMonth;
//             case 'thisYear':
//               return materialYear === currentYear;
//             default:
//               if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
//                 return materialYear === currentYear && materialMonth === timeFilter;
//               }
//               return true;
//           }
//         });
//       }
  
//       const columns = [
//       "ID", "Name", "Category", "Type", "Unit", "Restock Level", 
//       "Reorder Level", "Current Level",
//       "Inventory Name", "Created By", "Month", "Year", "Created At"
//       ];
  
//       const rows = dataToDownload.map(material => [
//         material.materialId,
//         material.materialName,
//         material.category,
//         material.type,
//         material.unit,
//         material.restockLevel,
//         material.reorderLevel,
//         material.currentLevel,
//         material.inventoryName,
//         material.createdBy,
//         material.month,
//         material.year,
//         new Date(material.createdAt).toLocaleString()
//       ]);

//       const timeFilterName = timeFilter === 'all' ? 'All Records' : 
//                             timeFilter === 'thisMonth' ? 'This Month' :
//                             timeFilter === 'previousMonth' ? 'Previous Month' :
//                             timeFilter === 'thisYear' ? 'This Year' :
//                             typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
//                             'Filtered';
  
//       generatePDF(columns, rows, `Raw Materials Report - ${timeFilterName}`);
//       setShowDownloadDropdown(false);
//     };

//     const chartData = useMemo(() => {
//   return materials.reduce((acc, material) => {
//     const key = `${material.month}-${material.year}`;
//     if (!acc[key]) {
//       acc[key] = { monthYear: `${material.month}/${material.year}`, count: 0 };
//     }
//     acc[key].count += 1;
//     return acc;
//   }, {});
// }, [materials]);

// const chartArray = Object.values(chartData);

    
//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Raw Materials</h1>
//           <button className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10" onClick={() => navigate('/warehouse-manager/raw-materials/add')}>
//             + Add Material
//             </button>
//         </div>

//         {/* 📊 Bar Chart Section */}
//         <div className="w-full h-80 mb-10">
//           <ResponsiveContainer>
//             <BarChart data={chartArray}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="monthYear" />
//               <YAxis domain={[0, 'dataMax + 2']} />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="count" fill="#674636" barSize={30}/> 
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
        
//         {/* 🔎 Search + Filter */}
//         <div className="mb-6 flex justify-end items-center gap-2">
//             <Search className="w-5 h-5 text-gray-700" />
//             <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             />

//             {/* Filter Icon + Dropdown Wrapper */}
//             <div className="relative">
//             <button
//                 onClick={() => setShowFilter(!showFilter)}
//                 className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             >
//                 <Filter className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* Dropdown */}
//             {showFilter && (
//                 <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
//                 <ul className="text-sm">
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "all" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("all"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     All
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "id" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("id"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Material ID
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "name" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("name"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Material Name
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "category" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("category"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Category
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "type" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("type"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Type
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Inventory Name
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "critical" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("critical"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Below Reorder Level
//                     </li>
//                 </ul>
//                 </div>
//             )}
//             </div>

//           <div className="relative">
//             <button
//               onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
//               className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//               title="Download PDF"
//             >
//               <Download className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* Download Dropdown */}
//             {showDownloadDropdown && (
//               <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-48 z-50">
//                 <ul className="text-sm">
//                   <li
//                     className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                     onClick={() => handleDownloadPDF('thisMonth')}
//                   >
//                     This Month
//                   </li>
//                   <li
//                     className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                     onClick={() => handleDownloadPDF('previousMonth')}
//                   >
//                     Previous Month
//                   </li>
//                   <li
//                     className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                     onClick={() => handleDownloadPDF('thisYear')}
//                   >
//                     This Year
//                   </li>
//                   <li className="px-4 py-2 text-gray-500 font-medium border-b border-gray-200">
//                     Select Month:
//                   </li>
//                   {[
//                     'January', 'February', 'March', 'April', 'May', 'June',
//                     'July', 'August', 'September', 'October', 'November', 'December'
//                   ].map((month, index) => (
//                     <li
//                       key={month}
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleDownloadPDF(index + 1)}
//                     >
//                       {month}
//                     </li>
//                   ))}
//                   <li
//                     className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200 font-medium"
//                     onClick={() => handleDownloadPDF('all')}
//                   >
//                     All Records
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>

        

//         <div className="overflow-x-auto text-xs">
//             <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//                 <tr style={{ background: "#674636", color:"#FFFFFF" }}>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Material ID</th>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-64 w-48 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Material Name</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">Category</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">Type</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Restock Level</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Reorder Level</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Current Level</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Inventory Name</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Created By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Month</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Year</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">Created At</th>
//                 </tr>
//             </thead>
//             <tbody className="align-middle text-center">
//                 {filteredMaterials.length > 0 ? (
//                 filteredMaterials.map((material) => (
//                     <tr 
//                     key={material._id}
//                     className={material.currentLevel <= material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"}
//                     >
//                     <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel <= material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-0  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>
//                         <div className="flex items-center justify-center gap-8">
//                             <div className="group relative cursor-pointer" onClick={() => navigate(`/warehouse-manager/raw-materials/update/${material._id}`)}>
//                             <Edit2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
//                             </div>

//                             <div className="group relative cursor-pointer" onClick={async () => {
//                                 const confirmDelete = window.confirm("Are you sure you want to delete this material?");
//                                 if (confirmDelete) {
//                                 try {
//                                     await deleteRawMaterial(material._id); // call API
//                                     // Refresh the table after deletion
//                                     setMaterials(materials.filter(p => p._id !== material._id));
//                                 } catch (err) {
//                                     console.error(err);
//                                     alert("Failed to delete the material."); // alert on error
//                                 }
//                                 }
//                             }}>
//                             <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
//                             </div>

//                         </div>
//                     </td>
//                     <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel <= material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-32  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{material.materialId}</td>
//                     <td className={`border border-gray-300 px-4 py-2 ${material.currentLevel < material.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-64  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{material.materialName}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{material.category}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{material.type}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.unit}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.restockLevel}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.reorderLevel}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.currentLevel}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{material.inventoryName}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.createdBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.month}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{material.year}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{new Date(material.createdAt).toLocaleString()}</td>
//                     </tr>
//                 ))
//                 ) : (
//                 <tr>
//                     <td colSpan="14" className="text-center p-4">No materials found.</td>
//                 </tr>
//                 )}
//             </tbody>
//             </table>
//         </div>
//       </div>
      
//     </div>
//   );
// }

// export default RawMaterials;

import Navbar from "../component/navbar";
import React from 'react'
import { fetchRawMaterial, deleteRawMaterial } from "../services/FrawMaterialsService.js";
import { useState, useEffect, useMemo } from "react";
import { Edit2, Trash2, Filter, Search, Download, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const RawMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [showFilter, setShowFilter] = useState(false);
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
        await deleteRawMaterial(id);
        setMaterials(materials.filter(p => p._id !== id));
        if (showModal && selectedMaterial?._id === id) {
            setShowModal(false);
            setSelectedMaterial(null);
        }
        alert("Material deleted successfully!");
        } catch (err) {
        console.error("Failed to delete material:", err);
        alert("Failed to delete material.");
        }
    };

    // Modal handlers
    const openModal = (material) => {
        setSelectedMaterial(material);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMaterial(null);
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
    const handleDownloadPDF = (timeFilter = 'all') => {
      console.log("Downloading PDF for:", timeFilter);

      let dataToDownload = filteredMaterials;
      
      // Filter data based on time selection
      if (timeFilter !== 'all') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        dataToDownload = filteredMaterials.filter(material => {
          const materialDate = new Date(material.createdAt);
          const materialYear = materialDate.getFullYear();
          const materialMonth = materialDate.getMonth() + 1;
          
          switch (timeFilter) {
            case 'thisMonth':
              return materialYear === currentYear && materialMonth === currentMonth;
            case 'previousMonth':
              const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
              const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
              return materialYear === prevYear && materialMonth === prevMonth;
            case 'thisYear':
              return materialYear === currentYear;
            default:
              if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
                return materialYear === currentYear && materialMonth === timeFilter;
              }
              return true;
          }
        });
      }
  
      const columns = [
      "ID", "Name", "Category", "Type", "Unit", "Restock Level", 
      "Reorder Level", "Current Level",
      "Inventory Name", "Created By", "Month", "Year", "Created At"
      ];
  
      const rows = dataToDownload.map(material => [
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

      const timeFilterName = timeFilter === 'all' ? 'All Records' : 
                            timeFilter === 'thisMonth' ? 'This Month' :
                            timeFilter === 'previousMonth' ? 'Previous Month' :
                            timeFilter === 'thisYear' ? 'This Year' :
                            typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
                            'Filtered';
  
      generatePDF(columns, rows, `Raw Materials Report - ${timeFilterName}`);
      setShowDownloadDropdown(false);
    };

    const chartData = useMemo(() => {
  return materials.reduce((acc, material) => {
    const key = `${material.month}-${material.year}`;
    if (!acc[key]) {
      acc[key] = { monthYear: `${material.month}/${material.year}`, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});
}, [materials]);

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

        {/* Bar Chart Section - Enhanced Styling */}
        <div className="w-full mb-10 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-6 border border-amber-100">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#674636] mb-1">Materials Overview</h2>
            <p className="text-sm text-gray-600">Monthly raw materials tracking</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart 
                data={chartArray}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5A3C" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#674636" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="monthYear" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 2']}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{ value: 'Material Count', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#674636', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#8B5A3C' }}
                  cursor={{ fill: 'rgba(139, 90, 60, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={() => 'Raw Materials'}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                /> 
              </BarChart>
            </ResponsiveContainer>
          </div>
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

          <div className="relative">
            <button
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
              title="Download PDF"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>

            {/* Download Dropdown */}
            {showDownloadDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-48 z-50">
                <ul className="text-sm">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('thisMonth')}
                  >
                    This Month
                  </li>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('previousMonth')}
                  >
                    Previous Month
                  </li>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('thisYear')}
                  >
                    This Year
                  </li>
                  <li className="px-4 py-2 text-gray-500 font-medium border-b border-gray-200">
                    Select Month:
                  </li>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month, index) => (
                    <li
                      key={month}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleDownloadPDF(index + 1)}
                    >
                      {month}
                    </li>
                  ))}
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200 font-medium"
                    onClick={() => handleDownloadPDF('all')}
                  >
                    All Records
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Simplified Table */}
        <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse border border-gray-300">
            <thead>
                <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 w-24">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-40">Category</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Type</th>
                <th className="border border-gray-300 px-4 py-2 w-28">Restock Level</th>
                <th className="border border-gray-300 px-4 py-2 w-28">Current Level</th>
                <th className="border border-gray-300 px-4 py-2 w-28">Reorder Level</th>
                <th className="border border-gray-300 px-4 py-2 w-40">Inventory Name</th>
                </tr>
            </thead>
            <tbody className="align-middle text-center text-xs">
                {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                    <tr 
                    key={material._id}
                    className={
                        material.currentLevel <= material.reorderLevel
                          ? "bg-[#AAB396] hover:bg-[#AAB396]"
                          : "bg-[#FFF8E8]"
                      }
                    >
                    <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center justify-center gap-3">
                            <Eye 
                                className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                                onClick={() => openModal(material)}
                                title="View Details"
                            />
                            <Trash2 
                                className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                                onClick={() => handleDelete(material._id)}
                                title="Delete"
                            />
                        </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{material.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.category}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.type}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.restockLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.currentLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.reorderLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{material.inventoryName}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="9" className="text-center p-4">No materials found.</td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 hover:bg-gray-100 transition-all z-10"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Alert Banner */}
            {selectedMaterial.currentLevel <= selectedMaterial.reorderLevel && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-t-xl flex items-center gap-2 text-sm">
                <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  !
                </div>
                <div>
                  <p className="font-bold">Critical Stock Alert</p>
                  <p className="opacity-90 text-xs">Immediate restocking required</p>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4">
              {/* Title Section */}
              <div className="mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#674636]">{selectedMaterial.materialName}</h2>
                <p className="text-xs text-gray-500 mt-0.5">ID: {selectedMaterial.materialId}</p>
              </div>

              {/* Stock Levels - Horizontal Cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Restock Level */}
                <div className="relative rounded-lg border p-3 bg-blue-50 border-blue-300">
                  <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Restock</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedMaterial.restockLevel}</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">{selectedMaterial.unit}</p>
                </div>

                {/* Reorder Level */}
                <div className="relative rounded-lg border p-3 bg-yellow-50 border-yellow-300">
                  <p className="text-[10px] font-bold text-yellow-700 uppercase mb-1">Reorder</p>
                  <p className="text-2xl font-bold text-yellow-900">{selectedMaterial.reorderLevel}</p>
                  <p className="text-[10px] text-yellow-600 mt-0.5">{selectedMaterial.unit}</p>
                </div>

                {/* Current Level */}
                <div
                  className={`relative rounded-lg border p-3 ${
                    selectedMaterial.currentLevel <= selectedMaterial.reorderLevel
                      ? "bg-red-50 border-red-300"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase mb-1 ${
                      selectedMaterial.currentLevel <= selectedMaterial.reorderLevel
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Current
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      selectedMaterial.currentLevel <= selectedMaterial.reorderLevel
                        ? "text-red-900"
                        : "text-green-900"
                    }`}
                  >
                    {selectedMaterial.currentLevel}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      selectedMaterial.currentLevel <= selectedMaterial.reorderLevel
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedMaterial.unit}
                  </p>
                </div>
              </div>

              {/* Material Information Grid */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Category</p>
                  <p className="text-gray-900">{selectedMaterial.category}</p>
                </div>

                <div className="bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Type</p>
                  <p className="text-gray-900">{selectedMaterial.type}</p>
                </div>

                <div className="bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Unit</p>
                  <p className="text-gray-900">{selectedMaterial.unit}</p>
                </div>

                <div className="bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Created By</p>
                  <p className="text-gray-900">{selectedMaterial.createdBy}</p>
                </div>

                <div className="col-span-2 bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Inventory</p>
                  <p className="text-gray-900">{selectedMaterial.inventoryName}</p>
                </div>

                <div className="col-span-2 bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Period</p>
                  <p className="text-gray-900">{selectedMaterial.month}/{selectedMaterial.year}</p>
                </div>

                <div className="col-span-4 bg-gray-50 rounded p-2 border-l-2 border-[#674636]">
                  <p className="text-gray-600 font-semibold mb-0.5">Created At</p>
                  <p className="text-gray-900">{new Date(selectedMaterial.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
              <button
                className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded font-semibold"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#674636] to-[#8B5A3C] hover:from-[#8B5A3C] hover:to-[#674636] text-white rounded font-semibold flex items-center gap-1"
                onClick={() => {
                  closeModal();
                  navigate(`/warehouse-manager/raw-materials/update/${selectedMaterial._id}`);
                }}
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default RawMaterials;