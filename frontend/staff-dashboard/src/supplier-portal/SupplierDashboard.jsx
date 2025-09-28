import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import DashboardProc from "./components/Dashboard_proc/Dashboard_proc";
import SupplierDetails from "./components/Supplier_details/Supplier_details";
import Orders from "./components/Orders/Orders";
import RestockAlerts from "./components/Restock_alerts/Restock_alerts";
import BudgetApproval from "./components/Budget_approval/Budget_approval";
import BudgetApprovalForm from "./components/Budget_approval_form/Budget_approval_form";
import OrderForm from "./components/OrderForm/OrderForm";
import UpdateDeleteSuppliers from "./components/Update_delete_suppliers/Update_delete_suppliers";
import AddSuppliers from "./components/Add_suppliers/Add_suppliers";
import NotificationsProc from "./components/Notifications_proc/Notifications_proc"; 
import SampleOrder from "./components/Sample_order/Sample_order"; 
import DashboardSup from "./components/Dashboard_sup/Dashboard_sup";
import OrderDetailsSup from "./components/Order_details_sup/Order_details_sup";
import SampleOrderList from "./components/Sample_order_list/Sample_order_list";
import SampleOrderDetails from "./components/Sample_order_details/Sample_order_details";
import RateSupplier from "./components/Rate_supplier/Rate_supplier";

function SupplierDashboard() {
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
    </Routes>
  );
}

export default SupplierDashboard;