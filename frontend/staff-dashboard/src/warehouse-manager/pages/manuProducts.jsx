import Navbar from "../component/navbar";
import React from 'react'
import { fetchManuProducts, deleteManuProduct } from "../services/FmanuProductsService.js";
import { useState, useEffect } from "react";
import { Edit2, Trash2,Filter,Search,Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const ManuProducts = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [showFilter, setShowFilter] = useState(false);


    // Function to fetch products from backend
    const getProducts = async () => {
        try {
        const data = await fetchManuProducts();
        console.log("Fetched products:", data);
        setProducts(data);
        } catch (err) {
        console.error("Failed to fetch products:", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        getProducts();
    }, []);

    // Delete handler
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;

        try {
        await deleteManuProduct(id); // call API
        await getProducts(); // refresh table
        alert("Product deleted successfully!");
        } catch (err) {
        console.error("Failed to delete product:", err);
        alert("Failed to delete product.");
        }
    };

    // Filtering logic
    const filteredProducts = products.filter((product) => {
      const query = searchQuery.toLowerCase();

      if (filterBy === "id") {
        return product.materialId?.toLowerCase().includes(query);
      }
      if (filterBy === "name") {
        return product.materialName?.toLowerCase().includes(query);
      }
      if (filterBy === "category") {
        return product.category?.toLowerCase().includes(query);
      }
      if (filterBy === "type") {
        return product.type?.toLowerCase().includes(query);
      }
      if(filterBy === "inventoryName") {
        return product.inventoryName?.toLowerCase().includes(query);
      }
      if(filterBy === "warrantyPeriod") {
        return product.warrantyPeriod?.toLowerCase().includes(query);
      }
      if (filterBy === "critical") {
      return product.currentLevel < product.reorderLevel;
      }

      // Default: search all
      if (filterBy === "all") {
      return (
        product.materialId?.toLowerCase().includes(query) ||
        product.materialName?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.type?.toLowerCase().includes(query) ||
        product.inventoryName?.toLowerCase().includes(query) ||
        product.warrantyPeriod?.toLowerCase().includes(query)
        );
      }
      return false;
    });
    
    //pdf function
  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");

    const columns = [
    "ID", "Name", "Category", "Type", "Unit", "Restock Level", 
    "Reorder Level", "Current Level", "Warranty Period", 
    "Inventory Name", "Created By", "Month", "Year", "Created At"
    ];

    const rows = filteredProducts.map(product => [
      product.materialId,
      product.materialName,
      product.category,
      product.type,
      product.unit,
      product.restockLevel,
      product.reorderLevel,
      product.currentLevel,
      product.warrantyPeriod,
      product.inventoryName,
      product.createdBy,
      product.month,
      product.year,
      new Date(product.createdAt).toLocaleString()
    ]);

    generatePDF(columns, rows, "Manufactured Products Report");

  };

  const chartData = products.reduce((acc, product) => {
    const key = `${product.month}-${product.year}`;
    if (!acc[key]) {
      acc[key] = { monthYear: `${product.month}/${product.year}`, count: 0 };
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
          <h1 className="text-2xl font-bold mt-6 mb-10">Manufactured Products</h1>
          <button className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10" onClick={() => navigate('/add-product')}>
            + Add New Product
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
              <Bar dataKey="count" fill="#674636" barSize={30} /> 
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔎 Search + Filter */}
        <div className="mb-10 flex justify-end items-center gap-2">
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
              title="Filter By"
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialId" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("materialId"); setSearchQuery(""); setShowFilter(false); }}
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "warrantyPeriod" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("warrantyPeriod"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Warranty Period
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
                <th className="border border-gray-300 px-4 py-2 w-16">Warranty Period</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Created By</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Month</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Year</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Created At</th>
                </tr>
            </thead>

            <tbody className="align-middle text-center text-xs">
                {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <tr 
                    key={product._id}
                    className={product.currentLevel < product.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"}
                    >
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-0  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>
                        <div className="flex items-center justify-center gap-8">
                            <div className="group relative cursor-pointer" onClick={() => navigate(`/update-product/${product._id}`)}>
                            <Edit2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
                            </div>

                            <div className="group relative cursor-pointer" onClick={async () => {
                                const confirmDelete = window.confirm("Are you sure you want to delete this product?");
                                if (confirmDelete) {
                                try {
                                    await deleteManuProduct(product._id); // call API
                                    // Refresh the table after deletion
                                    setProducts(products.filter(p => p._id !== product._id));
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to delete the product."); // alert on error
                                }
                                }
                            }}>
                            <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                            
                            </div>

                        </div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-32 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{product.materialId}</td>
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-[#AAB396]" : "bg-[#FFF8E8]"} sticky left-64  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{product.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.category}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.type}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.restockLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.reorderLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.currentLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.warrantyPeriod}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.month}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.year}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(product.createdAt).toLocaleString()}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="14" className="text-center p-4">No products found.</td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
      
    </div>
  );
}

export default ManuProducts;