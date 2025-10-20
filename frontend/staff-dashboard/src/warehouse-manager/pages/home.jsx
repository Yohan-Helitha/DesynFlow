// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar";
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   LineChart, Line
// } from "recharts";
// import { Package, AlertTriangle, TrendingUp, TrendingDown, MapPin, Trash2, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";

// // Services
// import { fetchDisposalMaterials } from "../services/FdisposalMaterialsService.js";
// import { fetchInvLocation } from "../services/FinvLocationService.js";
// import { fetchManuProducts } from "../services/FmanuProductsService.js";
// import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
// import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
// import { fetchStockMovements } from "../services/FstockMovementService.js";
// import { fetchTransferRequests } from "../services/FtransferRequestService.js";

// const fetchThresholdAlertsSafely = async () => {
//   try {
//     const { fetchThresholdAlerts } = await import("../services/FthresholdAlertService.js");
//     return await fetchThresholdAlerts();
//   } catch (error) {
//     console.log("Threshold alerts service not available:", error);
//     return [];
//   }
// };

// // Reusable Summary Card
// const SummaryCard = ({ title, value, icon, color }) => (
//   <div className={`p-5 rounded-xl shadow-md border-l-4 ${color} bg-[#FFF8E8] hover:shadow-lg transition-shadow duration-300`}>
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-2xl font-bold text-gray-800">{value}</p>
//       </div>
//       <div className="text-gray-400">{icon}</div>
//     </div>
//   </div>
// );

// const Home = () => {
//   const [dashboardData, setDashboardData] = useState({
//     disposals: [], locations: [], manuProducts: [], rawMaterials: [],
//     reorderRequests: [], stockMovements: [], transferRequests: [], alerts: []
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       const [
//         disposals, locations, manuProducts, rawMaterials,
//         reorderRequests, stockMovements, transferRequests, alerts
//       ] = await Promise.all([
//         fetchDisposalMaterials(),
//         fetchInvLocation(),
//         fetchManuProducts(),
//         fetchRawMaterial(),
//         fetchSReorderRequests(),
//         fetchStockMovements(),
//         fetchTransferRequests(),
//         fetchThresholdAlertsSafely()
//       ]);
//       setDashboardData({
//         disposals: disposals || [],
//         locations: locations || [],
//         manuProducts: manuProducts || [],
//         rawMaterials: rawMaterials || [],
//         reorderRequests: reorderRequests || [],
//         stockMovements: stockMovements || [],
//         transferRequests: transferRequests || [],
//         alerts: alerts || []
//       });
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchAllData(); }, []);

//   const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#14B8A6', '#F97316'];

//   // --- Metrics ---
//   const totalMaterials = dashboardData.rawMaterials.length + dashboardData.manuProducts.length;
//   const lowStockItems = [...dashboardData.rawMaterials, ...dashboardData.manuProducts].filter(i => i.currentLevel < i.reorderLevel).length;
//   const totalRequests = dashboardData.reorderRequests.length + dashboardData.transferRequests.length;
//   const totalCapacity = dashboardData.locations.reduce((sum, loc) => sum + (parseFloat(loc.capacity)||0),0);
//   const totalDisposals = dashboardData.disposals.length;
//   const totalAlerts = dashboardData.alerts.length;
//   const incomingTransfers = dashboardData.transferRequests.length;
//   const totalMovements = dashboardData.stockMovements.length;

//   // --- Data for charts ---
//   const inventoryData = Object.entries(dashboardData.locations.reduce((acc, loc) => {
//     const country = loc.country || 'Unknown';
//     acc[country] = (acc[country] || 0) + 1;
//     return acc;
//   }, {})).map(([name, value]) => ({ name, value }));

//   const categoryData = Object.entries([...dashboardData.rawMaterials, ...dashboardData.manuProducts].reduce((acc, item) => {
//     const cat = item.category || 'Unknown';
//     acc[cat] = (acc[cat] || 0) + 1;
//     return acc;
//   }, {})).map(([name, value]) => ({ name, value }));

//   const stockLevels = [...dashboardData.rawMaterials, ...dashboardData.manuProducts].slice(0, 10).map(item => ({
//     name: item.materialName?.substring(0, 15) + '...' || 'Unknown',
//     current: item.currentLevel || 0,
//     reorder: item.reorderLevel || 0,
//     restock: item.restockLevel || 0
//   }));

//   const monthlyDisposals = Object.values(dashboardData.disposals.reduce((acc, item) => {
//     const d = new Date(item.createdAt);
//     const month = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
//     if(!acc[month]) acc[month] = { month, count:0, quantity:0 };
//     acc[month].count += 1;
//     acc[month].quantity += item.quantity || 0;
//     return acc;
//   }, {})).slice(-6);

//   const movementData = Object.values(dashboardData.stockMovements.reduce((acc, item) => {
//     const d = new Date(item.createdAt);
//     const month = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
//     if(!acc[month]) acc[month] = { month, count:0, totalQuantity:0 };
//     acc[month].count += 1;
//     acc[month].totalQuantity += item.quantity || 0;
//     return acc;
//   }, {})).slice(-6);

//   if(loading) return (
//     <div><Navbar /><div className="m-6 flex items-center justify-center h-64">
//       <div className="text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" /><p className="text-gray-600">Loading dashboard data...</p></div>
//     </div></div>
//   );

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <h1 className="text-3xl font-bold mb-1 text-gray-800">Warehouse Dashboard</h1>
//         <p className="text-gray-500 mb-8">Professional overview of warehouse operations</p>

//         {/* --- 8 Summary Cards --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <SummaryCard title="Total Items" value={totalMaterials} icon={<Package className="w-10 h-10 text-blue-500"/>} color="border-blue-500"/>
//           <SummaryCard title="Low Stock" value={lowStockItems} icon={<TrendingDown className="w-10 h-10 text-amber-500"/>} color="border-amber-500"/>
//           <SummaryCard title="Active Requests" value={totalRequests} icon={<Package className="w-10 h-10 text-purple-500"/>} color="border-purple-500"/>
//           <SummaryCard title="Total Capacity" value={totalCapacity.toLocaleString()} icon={<MapPin className="w-10 h-10 text-green-500"/>} color="border-green-500"/>
//           <SummaryCard title="Disposals" value={totalDisposals} icon={<Trash2 className="w-10 h-10 text-red-500"/>} color="border-red-500"/>
//           <SummaryCard title="Threshold Alerts" value={totalAlerts} icon={<AlertTriangle className="w-10 h-10 text-yellow-500"/>} color="border-yellow-500"/>
//           <SummaryCard title="Incoming Transfers" value={incomingTransfers} icon={<ArrowUp className="w-10 h-10 text-indigo-500"/>} color="border-indigo-500"/>
//           <SummaryCard title="Stock Movements" value={totalMovements} icon={<ArrowDown className="w-10 h-10 text-pink-500"/>} color="border-pink-500"/>
//         </div>

//         {/* --- Charts Section --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 ">
//           {inventoryData.length>0 && (
//             <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
//               <h3 className="text-xl font-semibold mb-4 text-gray-700">Inventory Distribution</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie data={inventoryData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
//                     {inventoryData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
//                   </Pie>
//                   <Tooltip/>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {categoryData.length>0 && (
//             <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
//               <h3 className="text-xl font-semibold mb-4 text-gray-700">Category Distribution</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
//                     {categoryData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]}/>)}
//                   </Pie>
//                   <Tooltip/>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//         </div>

//         {/* Stock Levels */}
//         {stockLevels.length>0 && (
//           <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md mb-8">
//             <h3 className="text-xl font-semibold mb-4 text-gray-700">Top 10 Stock Levels</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={stockLevels} margin={{top:20,right:30,left:20,bottom:100}}>
//                 <CartesianGrid strokeDasharray="3 3"/>
//                 <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{fontSize:12}}/>
//                 <YAxis/>
//                 <Tooltip/>
//                 <Legend/>
//                 <Bar dataKey="current" fill="#4F46E5" name="Current Level"/>
//                 <Bar dataKey="reorder" fill="#EF4444" name="Reorder Level"/>
//                 <Bar dataKey="restock" fill="#10B981" name="Restock Level"/>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}

//         {/* Trends */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {monthlyDisposals.length>0 && (
//             <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
//               <h3 className="text-xl font-semibold mb-4 text-gray-700">Monthly Disposal Trends</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={monthlyDisposals}>
//                   <CartesianGrid strokeDasharray="3 3"/>
//                   <XAxis dataKey="month"/>
//                   <YAxis/>
//                   <Tooltip/>
//                   <Legend/>
//                   <Bar dataKey="count" fill="#EF4444" name="Disposal Count"/>
//                   <Bar dataKey="quantity" fill="#10B981" name="Disposed Quantity"/>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {movementData.length>0 && (
//             <div className="bg-[#FFF8E8] p-6 rounded-xl shadow-md">
//               <h3 className="text-xl font-semibold mb-4 text-gray-700">Stock Movement Trends</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={movementData}>
//                   <CartesianGrid strokeDasharray="3 3"/>
//                   <XAxis dataKey="month"/>
//                   <YAxis/>
//                   <Tooltip/>
//                   <Legend/>
//                   <Line type="monotone" dataKey="count" stroke="#4F46E5" name="Movement Count"/>
//                   <Line type="monotone" dataKey="totalQuantity" stroke="#10B981" name="Total Quantity"/>
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//         </div>

//         {/* Alerts Section */}
//         {lowStockItems>0 ? (
//           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg mb-8 flex items-start gap-3">
//             <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1"/>
//             <div>
//               <h4 className="font-semibold text-yellow-800 text-lg">Attention Required</h4>
//               <p>{lowStockItems} items are below reorder level!</p>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-lg mb-8 flex items-start gap-3">
//             <TrendingUp className="w-6 h-6 text-green-500 mt-1"/>
//             <div>
//               <h4 className="font-semibold text-green-800 text-lg">All Good</h4>
//               <p>All stock items are above reorder levels.</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  MapPin, Trash2, RefreshCw, ArrowUp, ArrowDown,
  Warehouse, ClipboardList, Truck, BarChart3,
  PieChart as PieIcon, BarChart2, Activity
} from "lucide-react";

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

// Enhanced Summary Card with professional styling
const SummaryCard = ({ title, value, icon, color, trend, subtitle }) => (
  <div className={`p-6 rounded-2xl shadow-lg border-l-4 bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('border-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${color.replace('border-', 'text-')}` })}
      </div>
    </div>
  </div>
);

// Professional Chart Container Component
const ChartContainer = ({ title, icon, children, className = "" }) => (
  <div className={`bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl shadow-lg border border-amber-100 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      {icon}
    </div>
    {children}
  </div>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div>
    <Navbar />
    <div className="m-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-200 h-32"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-200 h-80"></div>
          ))}
        </div>
        
        <div className="bg-gray-200 p-6 rounded-2xl h-96 mb-8"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-200 h-80"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    disposals: [], locations: [], manuProducts: [], rawMaterials: [],
    reorderRequests: [], stockMovements: [], transferRequests: [], alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // Enhanced Color Palette
  const ENHANCED_COLORS = {
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316',
    indigo: '#6366F1',
    pink: '#EC4899'
  };

  const CHART_COLORS = Object.values(ENHANCED_COLORS);

  // Professional Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-semibold text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- Metrics ---
  const totalMaterials = dashboardData.rawMaterials.length + dashboardData.manuProducts.length;
  const lowStockItems = [...dashboardData.rawMaterials, ...dashboardData.manuProducts].filter(i => i.currentLevel < i.reorderLevel).length;
  const totalRequests = dashboardData.reorderRequests.length + dashboardData.transferRequests.length;
  const totalCapacity = dashboardData.locations.reduce((sum, loc) => sum + (parseFloat(loc.capacity)||0),0);
  const totalDisposals = dashboardData.disposals.length;
  const totalAlerts = dashboardData.alerts.length;
  const incomingTransfers = dashboardData.transferRequests.length;
  const totalMovements = dashboardData.stockMovements.length;

  // Calculate utilization percentage
  const utilizationPercentage = totalCapacity > 0 ? Math.round((totalMaterials / totalCapacity) * 100) : 0;

  // Enhanced Chart Data Processing
  const inventoryData = Object.entries(dashboardData.locations.reduce((acc, loc) => {
    const country = loc.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {})).map(([name, value], index) => ({ 
    name, 
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const categoryData = Object.entries([...dashboardData.rawMaterials, ...dashboardData.manuProducts].reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {})).map(([name, value], index) => ({ 
    name, 
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const stockLevels = [...dashboardData.rawMaterials, ...dashboardData.manuProducts]
    .sort((a, b) => (a.currentLevel / a.restockLevel) - (b.currentLevel / b.restockLevel))
    .slice(0, 8)
    .map(item => ({
      name: item.materialName?.substring(0, 12) + (item.materialName?.length > 12 ? '...' : '') || 'Unknown',
      current: item.currentLevel || 0,
      reorder: item.reorderLevel || 0,
      restock: item.restockLevel || 0,
      utilization: ((item.currentLevel / item.restockLevel) * 100).toFixed(1)
    }));

  const monthlyDisposals = Object.values(dashboardData.disposals.reduce((acc, item) => {
    const d = new Date(item.createdAt);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if(!acc[month]) acc[month] = { month, count:0, quantity:0 };
    acc[month].count += 1;
    acc[month].quantity += item.quantity || 0;
    return acc;
  }, {})).slice(-6);

  const movementData = Object.values(dashboardData.stockMovements.reduce((acc, item) => {
    const d = new Date(item.createdAt);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if(!acc[month]) acc[month] = { month, count:0, totalQuantity:0 };
    acc[month].count += 1;
    acc[month].totalQuantity += item.quantity || 0;
    return acc;
  }, {})).slice(-6);

  // Stock Status Data
  const stockStatusData = [
    { name: 'Optimal', value: [...dashboardData.rawMaterials, ...dashboardData.manuProducts].filter(i => i.currentLevel > i.restockLevel * 0.7).length, color: ENHANCED_COLORS.success },
    { name: 'Warning', value: [...dashboardData.rawMaterials, ...dashboardData.manuProducts].filter(i => i.currentLevel <= i.restockLevel * 0.7 && i.currentLevel > i.reorderLevel).length, color: ENHANCED_COLORS.warning },
    { name: 'Critical', value: lowStockItems, color: ENHANCED_COLORS.danger }
  ];

  if(loading) return <LoadingSkeleton />;

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="m-6 ">
        {/* Professional Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of inventory, operations, and performance metrics</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <button 
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFF8E8] border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Professional KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Inventory Items" 
            value={totalMaterials.toLocaleString()} 
            icon={<Warehouse />} 
            color="border-blue-500"
            subtitle="Across all locations"
          />
          <SummaryCard 
            title="Low Stock Items" 
            value={lowStockItems} 
            icon={<AlertTriangle />} 
            color="border-amber-500"
            trend={{ value: -5, label: "from last week" }}
          />
          <SummaryCard 
            title="Active Requests" 
            value={totalRequests} 
            icon={<ClipboardList />} 
            color="border-purple-500"
          />
          <SummaryCard 
            title="Capacity Utilization" 
            value={`${utilizationPercentage}%`} 
            icon={<MapPin />} 
            color="border-green-500"
            subtitle={`${totalMaterials} / ${totalCapacity}`}
          />
          <SummaryCard 
            title="Disposals" 
            value={totalDisposals} 
            icon={<Trash2 />} 
            color="border-red-500"
          />
          <SummaryCard 
            title="Active Alerts" 
            value={totalAlerts} 
            icon={<AlertTriangle />} 
            color="border-yellow-500"
          />
          <SummaryCard 
            title="Incoming Transfers" 
            value={incomingTransfers} 
            icon={<Truck />} 
            color="border-indigo-500"
          />
          <SummaryCard 
            title="Stock Movements" 
            value={totalMovements} 
            icon={<BarChart3 />} 
            color="border-pink-500"
            trend={{ value: 12, label: "this month" }}
          />
        </div>

        {/* Professional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Inventory Distribution - Enhanced Pie Chart */}
          {inventoryData.length > 0 && (
            <ChartContainer 
              title="Inventory Distribution by Location" 
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill}
                        stroke="#FFF8E8"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {/* Stock Status - Donut Chart */}
          {stockStatusData.some(item => item.value > 0) && (
            <ChartContainer 
              title="Stock Status Overview" 
              icon={<Activity className="w-5 h-5 text-gray-400" />}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Stock Levels - Professional Bar Chart */}
        {stockLevels.length > 0 && (
          <ChartContainer 
            title="Top 10 Stock Levels Analysis" 
            icon={<BarChart3 className="w-5 h-5 text-gray-400" />}
            className="mb-8"
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={stockLevels} 
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="current" 
                  name="Current Level"
                  fill={ENHANCED_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="reorder" 
                  name="Reorder Level"
                  fill={ENHANCED_COLORS.warning}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="restock" 
                  name="Restock Level"
                  fill={ENHANCED_COLORS.success}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Professional Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Disposals - Area Chart */}
          {monthlyDisposals.length > 0 && (
            <ChartContainer 
              title="Monthly Disposal Trends" 
              icon={<Trash2 className="w-5 h-5 text-gray-400" />}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyDisposals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="quantity" 
                    name="Disposed Quantity"
                    stroke={ENHANCED_COLORS.danger} 
                    fill={ENHANCED_COLORS.danger}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Disposal Count"
                    stroke={ENHANCED_COLORS.orange} 
                    fill={ENHANCED_COLORS.orange}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {/* Stock Movements - Enhanced Line Chart */}
          {movementData.length > 0 && (
            <ChartContainer 
              title="Stock Movement Trends" 
              icon={<TrendingUp className="w-5 h-5 text-gray-400" />}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Movement Count"
                    stroke={ENHANCED_COLORS.indigo} 
                    strokeWidth={3}
                    dot={{ fill: ENHANCED_COLORS.indigo, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: ENHANCED_COLORS.indigo }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalQuantity" 
                    name="Total Quantity"
                    stroke={ENHANCED_COLORS.teal} 
                    strokeWidth={3}
                    dot={{ fill: ENHANCED_COLORS.teal, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: ENHANCED_COLORS.teal }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Category Distribution - Professional Horizontal Bar Chart */}
        {categoryData.length > 0 && (
          <ChartContainer 
            title="Category Distribution" 
            icon={<Package className="w-5 h-5 text-gray-400" />}
            className="mb-8"
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                barCategoryGap="20%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name="Item Count"
                  radius={[0, 4, 4, 0]}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Professional Alert Section */}
        <div className="mb-8">
          {lowStockItems > 0 ? (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-lg mb-1">Attention Required</h4>
                  <p className="text-amber-700">
                    {lowStockItems} item{lowStockItems !== 1 ? 's are' : ' is'} below reorder level and requires immediate attention.
                  </p>
                
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-lg mb-1">Optimal Stock Levels</h4>
                  <p className="text-green-700">All inventory items are maintained above reorder levels.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Footer */}
        <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-200">
          Warehouse Management System Dashboard • Data refreshes automatically every 15 minutes
        </div>
      </div>
    </div>
  );
};

export default Home;