import React from "react";
import { Route, Routes } from "react-router-dom";
import './App.css';

// Components
import Dashboard_proc from "./Components/Dashboard_proc/Dashboard_proc";
import Supplier_details from "./Components/Supplier_details/Supplier_details";
import Orders from "./Components/Orders/Orders";
import Budget_approval from "./Components/Budget_approval/Budget_approval";
import Budget_approval_form from "./Components/Budget_approval_form/Budget_approval_form";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard_proc />} />
      <Route path="/Supplier_details" element={<Supplier_details />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/Budget_approval" element={<Budget_approval />} />
      <Route path="/Budget_approval_form" element={<Budget_approval_form />} />
    </Routes>
  );
}

export default App;
