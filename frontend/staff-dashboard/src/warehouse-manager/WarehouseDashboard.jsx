import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import QualityAssurance from './pages/qualityAssurance.jsx';
import AddQualityAssuranceForm from './forms/addQualityAssuranceForm.jsx';
import UpdateQualityAssuranceForm from './forms/updateQualityAssuranceForm.jsx';
import SupplierManagement from './pages/supplierManagement.jsx';
import AddSupplierForm from './forms/addSupplierForm.jsx';
import UpdateSupplierForm from './forms/updateSupplierForm.jsx';
import ProcurementManagement from './pages/procurementManagement.jsx';
import AddProcurementForm from './forms/addProcurementForm.jsx';
import UpdateProcurementForm from './forms/updateProcurementForm.jsx';
import './App.css';

const WarehouseDashboard = () => {
  return (
    <div className="warehouse-manager">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manufactured-products" element={<ManuProducts />} />
        <Route path="/manufactured-products/add" element={<AddProductForm />} />
        <Route path="/manufactured-products/update/:id" element={<UpdateProductForm />} />
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/raw-materials/add" element={<AddMaterialsForm />} />
        <Route path="/raw-materials/update/:id" element={<UpdateMaterialsForm />} />
        <Route path="/inventory-locations" element={<InvLocation />} />
        <Route path="/inventory-locations/add" element={<AddLocationForm />} />
        <Route path="/inventory-locations/update/:id" element={<UpdateLocationForm />} />
        <Route path="/stock-movement" element={<StockMovement />} />
        <Route path="/stock-movement/add" element={<AddMovementForm />} />
        <Route path="/stock-movement/update/:id" element={<UpdateMovementForm />} />
        <Route path="/transfer-request" element={<TransferRequest />} />
        <Route path="/transfer-request/add" element={<AddTransferRequestForm />} />
        <Route path="/transfer-request/update/:id" element={<UpdateTransferRequestForm />} />
        <Route path="/disposal-materials" element={<DisposalMaterials />} />
        <Route path="/disposal-materials/add" element={<AddDisposalMaterialsForm />} />
        <Route path="/disposal-materials/update/:id" element={<UpdateDisposalMaterialsForm />} />
        <Route path="/quality-assurance" element={<QualityAssurance />} />
        <Route path="/quality-assurance/add" element={<AddQualityAssuranceForm />} />
        <Route path="/quality-assurance/update/:id" element={<UpdateQualityAssuranceForm />} />
        <Route path="/supplier-management" element={<SupplierManagement />} />
        <Route path="/supplier-management/add" element={<AddSupplierForm />} />
        <Route path="/supplier-management/update/:id" element={<UpdateSupplierForm />} />
        <Route path="/procurement-management" element={<ProcurementManagement />} />
        <Route path="/procurement-management/add" element={<AddProcurementForm />} />
        <Route path="/procurement-management/update/:id" element={<UpdateProcurementForm />} />
      </Routes>
    </div>
  );
};

export default WarehouseDashboard;