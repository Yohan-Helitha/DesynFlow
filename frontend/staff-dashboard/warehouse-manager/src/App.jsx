import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import ManuProducts from './pages/manuProducts.jsx';
import AddProductForm from './forms/addManuProductsForm.jsx';
import UpdateProductForm from './forms/updateManuProductsForm.jsx';
import RawMaterials from './pages/rawMaterials.jsx';
import AddMaterialsForm from './forms/addRawMaterialsForm.jsx';
import UpdateMaterialsForm from './forms/updateRawMaterialsForm.jsx';
import InvLocation from './pages//invLocations.jsx';
import AddLocationForm from './forms//addInvLocationForm.jsx';
import UpdateLocationForm from './forms/updateInvLocationForm.jsx';
import StockMovement from './pages/stockMovement.jsx';
import AddMovementForm from './forms/addStockMovementForm.jsx';
import UpdateMovementForm from './forms/updateStockMovementForm.jsx';
import TransferRequest from './pages/transferRequest.jsx';
import AddTransferRequestForm from './forms/addTransferRequestForm.jsx';
import UpdateTransferRequestForm from './forms/updateTransferRequestForm.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ManuProducts />} />
        <Route path="/home" element={<Home />} />
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
      </Routes>
    </Router>
  );
}

export default App;
