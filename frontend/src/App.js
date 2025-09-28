import React from "react";
import { Route, Routes } from "react-router-dom";
import './App.css';

// Components
import DashboardProc from "./Components/Dashboard_proc/Dashboard_proc";
import SupplierDetails from "./Components/Supplier_details/Supplier_details";
import Orders from "./Components/Orders/Orders";
import RestockAlerts from "./Components/Restock_alerts/Restock_alerts";
import BudgetApproval from "./Components/Budget_approval/Budget_approval";
import BudgetApprovalForm from "./Components/Budget_approval_form/Budget_approval_form";
import OrderForm from "./Components/OrderForm/OrderForm";
import UpdateDeleteSuppliers from "./Components/Update_delete_suppliers/Update_delete_suppliers";
import AddSuppliers from "./Components/Add_suppliers/Add_suppliers";
import NotificationsProc from "./Components/Notifications_proc/Notifications_proc"; 
import SampleOrder from "./Components/Sample_order/Sample_order"; 
import DashboardSup from "./Components/Dashboard_sup/Dashboard_sup";
import OrderDetailsSup from "./Components/Order_details_sup/Order_details_sup";
import SampleOrderList from "./Components/Sample_order_list/Sample_order_list";
import SampleOrderDetails from "./Components/Sample_order_details/Sample_order_details";
import RateSupplier from "./Components/Rate_supplier/Rate_supplier";
import LoginSup from "./Components/Login_sup/Login_sup";



function App() {
  return (
    <Routes>
  <Route path="/" element={<DashboardProc />} />
  <Route path="/Supplier_details" element={<SupplierDetails />} />
  <Route path="/Orders" element={<Orders />} />
  <Route path="/Restock_alerts" element={<RestockAlerts />} />
  <Route path="/Budget_approval" element={<BudgetApproval />} />
  <Route path="/Budget_approval_form" element={<BudgetApprovalForm />} />
  <Route path="/OrderForm" element={<OrderForm />} />
  <Route path="/Update_delete_suppliers" element={<UpdateDeleteSuppliers />} />
  <Route path="/Add_suppliers" element={<AddSuppliers />} />
  <Route path="/Notifications_proc" element={<NotificationsProc />} />
  <Route path="/Sample_order" element={<SampleOrder />} />
  <Route path="/Dashboard_sup" element={<DashboardSup />} />
  <Route path="/Order_details_sup" element={<OrderDetailsSup />} />
  <Route path="/Sample_order_list" element={<SampleOrderList />} />
  <Route path="/Sample_order_details/:id" element={<SampleOrderDetails />} />
  <Route path="/Rate_supplier" element={<RateSupplier />} />
  <Route path="/SupplierLogin" element={<LoginSup />} />
    </Routes>
  );
}

export default App;
