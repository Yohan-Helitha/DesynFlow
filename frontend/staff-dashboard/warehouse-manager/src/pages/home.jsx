import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { Package, AlertTriangle, TrendingUp, TrendingDown, MapPin, Trash2, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";

// Services
import { fetchDisposalMaterials } from "../services/FdisposalMaterialsService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
import { fetchStockMovements } from "../services/FstockMovementService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";

const fetchThresholdAlertsSafely = async () => {
  try {
    const { fetchThresholdAlerts } = await import("../services/FthresholdAlertService.js");
    return await fetchThresholdAlerts();
  } catch (error) {
    console.log("Threshold alerts service not available:", error);
    return [];
  }
};

// Reusable Summary Card
const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`p-5 rounded-xl shadow-md border-l-4 ${color} bg-[#FFF8E8] hover:shadow-lg transition-shadow duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  </div>
);

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    disposals: [], locations: [], manuProducts: [], rawMaterials: [],
    reorderRequests: [], stockMovements: [], transferRequests: [], alerts: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        disposals, locations, manuProducts, rawMaterials,
        reorderRequests, stockMovements, transferRequests, alerts
      ] = await Promise.all([
        fetchDisposalMaterials(),
        fetchInvLocation(),
        fetchManuProducts(),
        fetchRawMaterial(),
        fetchSReorderRequests(),
        fetchStockMovements(),
        fetchTransferRequests(),
        fetchThresholdAlertsSafely()
      ]);
      setDashboardData({
        disposals: disposals || [],
        locations: locations || [],
        manuProducts: manuProducts || [],
        rawMaterials: rawMaterials || [],
        reorderRequests: reorderRequests || [],
        stockMovements: stockMovements || [],
        transferRequests: transferRequests || [],
        alerts: alerts || []
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#14B8A6', '#F97316'];

  // --- Metrics ---
  const totalMaterials = dashboardData.rawMaterials.length + dashboardData.manuProducts.length;
  const lowStockItems = [...dashboardData.rawMaterials, ...dashboardData.manuProducts].filter(i => i.currentLevel < i.reorderLevel).length;
  const totalRequests = dashboardData.reorderRequests.length + dashboardData.transferRequests.length;
  const totalCapacity = dashboardData.locations.reduce((sum, loc) => sum + (parseFloat(loc.capacity)||0),0);
  const totalDisposals = dashboardData.disposals.length;
  const totalAlerts = dashboardData.alerts.length;
  const incomingTransfers = dashboardData.transferRequests.length;
  const totalMovements = dashboardData.stockMovements.length;

  // --- Data for charts ---
  const inventoryData = Object.entries(dashboardData.locations.reduce((acc, loc) => {
    const country = loc.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const categoryData = Object.entries([...dashboardData.rawMaterials, ...dashboardData.manuProducts].reduce((acc, item) => {
    const cat = item.category || 'Unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const stockLevels = [...dashboardData.rawMaterials, ...dashboardData.manuProducts].slice(0, 10).map(item => ({
    name: item.materialName?.substring(0, 15) + '...' || 'Unknown',
    current: item.currentLevel || 0,
    reorder: item.reorderLevel || 0,
    restock: item.restockLevel || 0
  }));

  const monthlyDisposals = Object.values(dashboardData.disposals.reduce((acc, item) => {
    const d = new Date(item.createdAt);
    const month = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    if(!acc[month]) acc[month] = { month, count:0, quantity:0 };
    acc[month].count += 1;
    acc[month].quantity += item.quantity || 0;
    return acc;
  }, {})).slice(-6);

  const movementData = Object.values(dashboardData.stockMovements.reduce((acc, item) => {
    const d = new Date(item.createdAt);
    const month = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    if(!acc[month]) acc[month] = { month, count:0, totalQuantity:0 };
    acc[month].count += 1;
    acc[month].totalQuantity += item.quantity || 0;
    return acc;
  }, {})).slice(-6);

  if(loading) return (
    <div><Navbar /><div className="m-6 flex items-center justify-center h-64">
      <div className="text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" /><p className="text-gray-600">Loading dashboard data...</p></div>
    </div></div>
  );

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <h1 className="text-3xl font-bold mb-1 text-gray-800">Warehouse Dashboard</h1>
        <p className="text-gray-500 mb-8">Professional overview of warehouse operations</p>

        {/* --- 8 Summary Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Items" value={totalMaterials} icon={<Package className="w-10 h-10 text-blue-500"/>} color="border-blue-500"/>
          <SummaryCard title="Low Stock" value={lowStockItems} icon={<TrendingDown className="w-10 h-10 text-amber-500"/>} color="border-amber-500"/>
          <SummaryCard title="Active Requests" value={totalRequests} icon={<Package className="w-10 h-10 text-purple-500"/>} color="border-purple-500"/>
          <SummaryCard title="Total Capacity" value={totalCapacity.toLocaleString()} icon={<MapPin className="w-10 h-10 text-green-500"/>} color="border-green-500"/>
          <SummaryCard title="Disposals" value={totalDisposals} icon={<Trash2 className="w-10 h-10 text-red-500"/>} color="border-red-500"/>
          <SummaryCard title="Threshold Alerts" value={totalAlerts} icon={<AlertTriangle className="w-10 h-10 text-yellow-500"/>} color="border-yellow-500"/>
          <SummaryCard title="Incoming Transfers" value={incomingTransfers} icon={<ArrowUp className="w-10 h-10 text-indigo-500"/>} color="border-indigo-500"/>
          <SummaryCard title="Stock Movements" value={totalMovements} icon={<ArrowDown className="w-10 h-10 text-pink-500"/>} color="border-pink-500"/>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 ">
          {inventoryData.length>0 && (
            <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Inventory Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={inventoryData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                    {inventoryData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {categoryData.length>0 && (
            <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                    {categoryData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stock Levels */}
        {stockLevels.length>0 && (
          <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Top 10 Stock Levels</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stockLevels} margin={{top:20,right:30,left:20,bottom:100}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{fontSize:12}}/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Bar dataKey="current" fill="#4F46E5" name="Current Level"/>
                <Bar dataKey="reorder" fill="#EF4444" name="Reorder Level"/>
                <Bar dataKey="restock" fill="#10B981" name="Restock Level"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {monthlyDisposals.length>0 && (
            <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Monthly Disposal Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyDisposals}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="count" fill="#EF4444" name="Disposal Count"/>
                  <Bar dataKey="quantity" fill="#10B981" name="Disposed Quantity"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {movementData.length>0 && (
            <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Stock Movement Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" name="Movement Count"/>
                  <Line type="monotone" dataKey="totalQuantity" stroke="#10B981" name="Total Quantity"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Alerts Section */}
        {lowStockItems>0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg mb-8 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1"/>
            <div>
              <h4 className="font-semibold text-yellow-800 text-lg">Attention Required</h4>
              <p>{lowStockItems} items are below reorder level!</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-lg mb-8 flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-green-500 mt-1"/>
            <div>
              <h4 className="font-semibold text-green-800 text-lg">All Good</h4>
              <p>All stock items are above reorder levels.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
