import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { App } from "./App";
import { InspectionSection } from "./components/InspectionSection/InspectionSection";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="inspection-management" element={<InspectionSection />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}