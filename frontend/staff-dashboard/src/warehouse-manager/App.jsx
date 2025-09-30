import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/home.jsx';
import ManuProducts from './pages/manuProducts.jsx';
import AddProductForm from './forms/addManuProductsForm.jsx';
import UpdateProductForm from './forms/updateManuProductsForm.jsx';
import RawMaterials from './pages/rawMaterials.jsx';
import AddMaterialsForm from './forms/addRawMaterialsForm.jsx';
import UpdateMaterialsForm from './forms/updateRawMaterialsForm.jsx';
import InvLocation from './pages/invLocations.jsx';
import AddLocationForm from './forms/addInvLocationForm.jsx';
import UpdateLocationForm from './forms/updateInvLocationForm.jsx';
import StockMovement from './pages/stockMovement.jsx';
import AddMovementForm from './forms/addStockMovementForm.jsx';
import UpdateMovementForm from './forms/updateStockMovementForm.jsx';
import TransferRequest from './pages/transferRequest.jsx';
import AddTransferRequestForm from './forms/addTransferRequestForm.jsx';
import UpdateTransferRequestForm from './forms/updateTransferRequestForm.jsx';
import DisposalMaterials from './pages/disposalMaterials.jsx';
import AddDisposalMaterialsForm from './forms/addDisposalMaterialsForm.jsx';
import UpdateDisposalMaterialsForm from './forms/updateDisposalMaterialsForm.jsx';
import AuditLogs from './pages/auditLog.jsx';
import ThresholdAlerts from './pages/thresholdAlerts.jsx';
import SReorderRequest from './pages/sReorderRequest.jsx';
import AddSReorderRequestForm from './forms/addSReorderRequestForm.jsx';
import UpdateSReorderRequestForm from './forms/updateSReorderRequestForm.jsx';
import Notifications from './pages/notifications.jsx';
import { NotificationsProvider } from './context/notificationContext.jsx';

function App() {
  return (
    <div className="min-h-screen app-container">
      <Router>
        <NotificationsProvider>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/manu-products" element={<ManuProducts />} />
            <Route path="/add-product" element={<AddProductForm />} />
            <Route path="/update-product/:id" element={<UpdateProductForm />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/add-material" element={<AddMaterialsForm />} />
            <Route path="/update-material/:id" element={<UpdateMaterialsForm />} />
            <Route path="/inv-location" element={<InvLocation />} />
            <Route path="/add-location" element={<AddLocationForm />} />
            <Route path="/update-location/:id" element={<UpdateLocationForm />} />
            <Route path="/stock-movement" element={<StockMovement />} />
            <Route path="/add-movement" element={<AddMovementForm />} />
            <Route path="/update-movement/:id" element={<UpdateMovementForm />} />
            <Route path="/transfer-request" element={<TransferRequest />} />
            <Route path="/add-transfer-request" element={<AddTransferRequestForm />} />
            <Route path="/update-transfer-request/:id" element={<UpdateTransferRequestForm />} />
            <Route path="/disposal-materials" element={<DisposalMaterials />} />
            <Route path="/add-disposal-material" element={<AddDisposalMaterialsForm />} />
            <Route path="/update-disposal-material/:id" element={<UpdateDisposalMaterialsForm />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/threshold-alert" element={<ThresholdAlerts />} />
            <Route path="/s-reorder-requests" element={<SReorderRequest />} />
            <Route path="/add-s-reorder-requests" element={<AddSReorderRequestForm />} />
            <Route path="/update-s-reorder-requests/:id" element={<UpdateSReorderRequestForm />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </NotificationsProvider>  
      </Router>
    </div>
  );
}

export default App;
