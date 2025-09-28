import React from "react";
import { Route, Routes } from "react-router-dom";
import './App.css';

// Components
import Dashboard_proc from "./Components/Dashboard_proc/Dashboard_proc";
import Supplier_details from "./Components/Supplier_details/Supplier_details";
import Orders from "./Components/Orders/Orders";
import Restock_alerts from "./Components/Restock_alerts/Restock_alerts";
import Budget_approval from "./Components/Budget_approval/Budget_approval";
import Budget_approval_form from "./Components/Budget_approval_form/Budget_approval_form";
import OrderForm from "./Components/OrderForm/OrderForm";
import Update_delete_suppliers from "./Components/Update_delete_suppliers/Update_delete_suppliers";
import Add_suppliers from "./Components/Add_suppliers/Add_suppliers";
import Notifications_proc from "./Components/Notifications_proc/Notifications_proc"; 
import Sample_order from "./Components/Sample_order/Sample_order"; 
import Dashboard_sup from "./Components/Dashboard_sup/Dashboard_sup";
import OrderDetailsSup from "./Components/Order_details_sup/Order_details_sup";
import Sample_order_list from "./Components/Sample_order_list/Sample_order_list";
import Sample_order_details from "./Components/Sample_order_details/Sample_order_details";
import Rate_supplier from "./Components/Rate_supplier/Rate_supplier";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard_proc />} />
      <Route path="/Supplier_details" element={<Supplier_details />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/Restock_alerts" element={<Restock_alerts />} />
      <Route path="/Budget_approval" element={<Budget_approval />} />
      <Route path="/Budget_approval_form" element={<Budget_approval_form />} />
      <Route path="/OrderForm" element={<OrderForm />} />
      <Route path="/Update_delete_suppliers" element={<Update_delete_suppliers />} />
      <Route path="/Add_suppliers" element={<Add_suppliers />} />
      <Route path="/Notifications_proc" element={<Notifications_proc />} />
      <Route path="/Sample_order" element={<Sample_order />} />
      <Route path="/Dashboard_sup" element={<Dashboard_sup />} />
      <Route path="/Order_details_sup" element={<OrderDetailsSup />} />
      <Route path="/Sample_order_list" element={<Sample_order_list />} />
      <Route path="/Sample_order_details/:id" element={<Sample_order_details />} />
      <Route path="/Rate_supplier" element={<Rate_supplier />} />
    </Routes>
  );
}

export default App;
