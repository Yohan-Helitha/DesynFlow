import Navbar from "../component/navbar";
import React from 'react'
import { fetchManuProducts, deleteManuProduct } from "../services/FmanuProductsService.js";
import { useState, useEffect } from "react";
import { Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManuProducts = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // Function to fetch products from backend
    const getProducts = async () => {
        try {
        const data = await fetchManuProducts();
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
        

        <div className="overflow-x-auto text-xs">
            <table className="min-w-max border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-64 w-48 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Material Name</th>
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

            <tbody className="align-middle text-center text-xs bg-white">
                {products.length > 0 ? (
                products.map((product) => (
                    <tr 
                    key={product._id}
                    className={product.currentLevel < product.reorderLevel ? "bg-red-100" : "bg-white"}
                    >
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-red-100" : "bg-white"} sticky left-0  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>
                        <div className="flex items-center justify-center gap-8">
                            <div className="group relative cursor-pointer" onClick={() => navigate(`/update-product/${product._id}`)}>
                            <Edit2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Update
                            </span>
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
                            <Trash2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Delete
                            </span>
                            </div>

                        </div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-red-100" : "bg-white"} sticky left-32 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{product.materialId}</td>
                    <td className={`border border-gray-300 px-4 py-2 ${product.currentLevel < product.reorderLevel ? "bg-red-100" : "bg-white"} sticky left-64  z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50`}>{product.materialName}</td>
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