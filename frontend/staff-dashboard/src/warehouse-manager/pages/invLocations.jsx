import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { fetchInvLocation, deleteInvLocation } from "../services/FinvLocationService.js"; 
import { Edit2, Trash2, Filter, Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const InvLocation = () => {
  const [inventories, setInventories] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Geocode address to lat/lng
  const getCoordinates = async (address) => {
    if (!address) return { lat: 0, lng: 0 };
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        return { lat: 0, lng: 0 };
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      return { lat: 0, lng: 0 };
    }
  };

  // Fetch inventories and add coordinates
  const getInventories = async () => {
    setLoading(true);
    try {
      const data = await fetchInvLocation();

      // Map addresses to lat/lng
      const dataWithCoords = await Promise.all(
        data.map(async (inv) => {
          const coords = await getCoordinates(inv.inventoryAddress);
          return { ...inv, lat: coords.lat, lng: coords.lng };
        })
      );

      setInventories(dataWithCoords);
    } catch (err) {
      console.error("Failed to fetch inventories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInventories();
  }, []);

  // Delete inventory
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this inventory?");
    if (!confirmDelete) return;

    try {
      await deleteInvLocation(id);
      setInventories(inventories.filter((inv) => inv._id !== id));
      alert("Inventory deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete inventory.");
    }
  };

  // Filtering logic
  const filteredInventories = inventories.filter((inventory) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") return inventory.inventoryId?.toLowerCase().includes(query);
    if (filterBy === "name") return inventory.inventoryName?.toLowerCase().includes(query);
    if (filterBy === "address") return inventory.inventoryAddress?.toLowerCase().includes(query);
    if (filterBy === "country") return inventory.country?.toLowerCase().includes(query);

    // Default: search all
    return (
      inventory.inventoryId?.toLowerCase().includes(query) ||
      inventory.inventoryName?.toLowerCase().includes(query) ||
      inventory.inventoryAddress?.toLowerCase().includes(query) ||
      inventory.country?.toLowerCase().includes(query)
    );
  });

  // PDF download
  const handleDownloadPDF = () => {
    const columns = [
      "ID",
      "Name",
      "Address",
      "Country",
      "Capacity",
      "Contact",
      "Warehouse Manager Name",
      "Created At",
    ];

    const rows = filteredInventories.map((inventory) => [
      inventory.inventoryId,
      inventory.inventoryName,
      inventory.inventoryAddress,
      inventory.country,
      inventory.capacity,
      inventory.inventoryContact,
      inventory.warehouseManagerName,
      new Date(inventory.createdAt).toLocaleString(),
    ]);

    generatePDF(columns, rows, "Warehouse Locations Report");
  };

  // Determine map center
  const mapCenter =
    inventories.length > 0 ? [inventories[0].lat, inventories[0].lng] : [0, 0];

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Inventory Locations</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/inventory-locations/add")}
          >
            + Add Location
          </button>
        </div>

        {/* Map */}
        <div className="h-96 w-3/4 mb-6 mx-auto">
          <MapContainer
            center={mapCenter}
            zoom={5}
            minZoom={2}         // restrict zoom-out level
            maxZoom={18}
            style={{ height: "100%", width: "100%" }}
            maxBounds={[
              [-90, -180],
              [90, 180]
            ]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false} // prevents tile repetition
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.esri.com">Esri</a>'
              noWrap={true}
              bounds={[
                [-90, -180],
                [90, 180]
              ]}
            />

            {!loading &&
              filteredInventories
                .filter((inv) => inv.lat && inv.lng)
                .map((inv) => (
                  <Marker key={inv._id} position={[inv.lat, inv.lng]} icon={redIcon}>
                    <Popup>
                      <strong>{inv.inventoryName}</strong>
                      <br />
                      {inv.inventoryAddress}
                      <br />
                      {inv.country}
                      <br />
                      Capacity: {inv.capacity} m³
                    </Popup>
                  </Marker>
                ))}
          </MapContainer>
        </div>


        {/* Search + Filter */}
        <div className="mb-6 flex justify-center items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-5xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
                <ul className="text-sm">
                  {["all", "id", "name", "address", "country"].map((f) => (
                    <li
                      key={f}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        filterBy === f ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setFilterBy(f);
                        setSearchQuery("");
                        setShowFilter(false);
                      }}
                    >
                      {f === "all"
                        ? "All"
                        : f === "id"
                        ? "Inventory ID"
                        : f === "name"
                        ? "Inventory Name"
                        : f === "address"
                        ? "Address"
                        : "Country"}
                    </li>
                  ))}
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

        {/* Table */}
        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40" style={{ background: "#674636" }}>Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40" style={{ background: "#674636" }}>Inventory ID</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-64 w-32 bg-gray-200 z-40" style={{ background: "#674636" }}>Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-64">Address</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Country</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Capacity (m³)</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Contact</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Warehouse Manager</th>
                <th className="border border-gray-300 px-4 py-2 w-40">Created At</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle text-xs bg-[#FFF8E8]">
              {loading ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center font-semibold">
                      Loading inventories...
                    </td>
                  </tr>
                ) : filteredInventories.length > 0 ? (
                  filteredInventories.map((inv) => (
                    <tr key={inv._id} className="bg-[#FFF8E8]">
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 z-40" style={{ background: "#FFF8E8" }}>
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/warehouse-manager/inventory-locations/update/${inv._id}`)}
                        >
                          <Edit2 className="w-5 h-5 text-[#674636] hover:text-[#A67C52]" />
                        </div>
                        <div className="cursor-pointer" onClick={() => handleDelete(inv._id)}>
                          <Trash2 className="w-5 h-5 text-[#674636] hover:text-[#A67C52]" />
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40" style={{ background: "#FFF8E8" }}>{inv.inventoryId}</td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-64 bg-white z-40" style={{ background: "#FFF8E8" }}>{inv.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-64">{inv.inventoryAddress}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{inv.country}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{inv.capacity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{inv.inventoryContact}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{inv.warehouseManagerName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-40">{new Date(inv.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-4">
                    No inventories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvLocation;
