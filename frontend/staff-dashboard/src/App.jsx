import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import StaffLogin from './staff-login/staffLogin'
import CSRDashboard from './CSR-portal/pages/CSRDashboard'
import InspectorDashboard from './inspector-portal/pages/InspectorDashboard'
import RequestTable from './CSR-portal/component/requestTable'
import ProjectManagerDashboard from './project/ProjectManagerDashboard.jsx';
import TeamLeaderMainDashboard from './project/TeamLeaderMainDashboard.jsx';
import TeamMemberDashboard from './project/TeamMemberDashboard.jsx';
import WarehouseDashboard from './warehouse-manager/WarehouseDashboard.jsx';
import SupplierDashboard from './supplier-portal/SupplierDashboard.jsx';
import FinanceDashboard from './finance-portal/FinanceDashboard.jsx';

// Supplier Portal Components
import DashboardProc from './supplier-portal/components/Dashboard_proc/Dashboard_proc';
import SupplierDetails from './supplier-portal/components/Supplier_details/Supplier_details';
import Orders from './supplier-portal/components/Orders/Orders';
import RestockAlerts from './supplier-portal/components/Restock_alerts/Restock_alerts';
import BudgetApproval from './supplier-portal/components/Budget_approval/Budget_approval';
import BudgetApprovalForm from './supplier-portal/components/Budget_approval_form/Budget_approval_form';
import OrderForm from './supplier-portal/components/OrderForm/OrderForm';
import UpdateDeleteSuppliers from './supplier-portal/components/Update_delete_suppliers/Update_delete_suppliers';
import AddSuppliers from './supplier-portal/components/Add_suppliers/Add_suppliers';
import NotificationsProc from './supplier-portal/components/Notifications_proc/Notifications_proc';
import SampleOrder from './supplier-portal/components/Sample_order/Sample_order';
import DashboardSup from './supplier-portal/components/Dashboard_sup/Dashboard_sup';
import OrderDetailsSup from './supplier-portal/components/Order_details_sup/Order_details_sup';
import SampleOrderList from './supplier-portal/components/Sample_order_list/Sample_order_list';
import SampleOrderListSup from './supplier-portal/components/SampleOrderList/sample_order_list_sup';
import SampleOrderDetails from './supplier-portal/components/Sample_order_details/Sample_order_details';
import RateSupplier from './supplier-portal/components/Rate_supplier/Rate_supplier';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  // Remove all blocking browser alert boxes globally and replace with toasts
  useEffect(() => {
    const oldAlert = window.alert;
    const oldConfirm = window.confirm;
    const oldPrompt = window.prompt;

    window.alert = (message) => {
      try { toast.info(String(message ?? '')); } catch (e) { /* noop */ }
    };
    window.confirm = (message) => {
      try { toast.info(`${message ? String(message) + ' — ' : ''}Action auto-confirmed`); } catch (e) { /* noop */ }
      // Always proceed without showing a blocking dialog
      return true;
    };
    window.prompt = (message, defaultValue = '') => {
      try { toast.info(`${message ? String(message) + ' — ' : ''}Prompt skipped`); } catch (e) { /* noop */ }
      // Return default to avoid blocking input dialogs
      return defaultValue ?? '';
    };

    return () => {
      window.alert = oldAlert;
      window.confirm = oldConfirm;
      window.prompt = oldPrompt;
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen">        
        <main>
          <Routes>
            {/* Staff Login as default route */}
            <Route path="/" element={<StaffLogin />} />
            <Route path="/login" element={<StaffLogin />} />
            
            {/* Role-based Dashboard Routes */}
            <Route path="/csr-dashboard" element={<CSRDashboard />} />
            <Route path="/inspector-dashboard" element={<InspectorDashboard />} />
            
            {/* Legacy Routes */}
            <Route path="/csr" element={<CSRDashboard />} />
            <Route path="/csr/requests" element={<RequestTable />} />
            
            {/* Project Manager route */}
            <Route path="/project-manager" element={<ProjectManagerDashboard />} />
            <Route path="/team-leader" element={<TeamLeaderMainDashboard />} />
            <Route path="/team-member" element={<TeamMemberDashboard />} />
            
            {/* Warehouse Manager routes */}
            <Route path="/warehouse-manager/*" element={<WarehouseDashboard />} />
            
            {/* Procurement Officer route (maps to supplier portal) */}
            <Route path="/procurement-officer/*" element={<SupplierDashboard />}>
              <Route index element={<DashboardProc />} />
              <Route path="dashboard" element={<DashboardProc />} />
              <Route path="supplier_details" element={<SupplierDetails />} />
              <Route path="orders" element={<Orders />} />
              <Route path="restock_alerts" element={<RestockAlerts />} />
              <Route path="budget_approval" element={<BudgetApproval />} />
              <Route path="budget_approval_form" element={<BudgetApprovalForm />} />
              <Route path="order_form" element={<OrderForm />} />
              <Route path="update_delete_suppliers" element={<UpdateDeleteSuppliers />} />
              <Route path="add_suppliers" element={<AddSuppliers />} />
              <Route path="notifications_proc" element={<NotificationsProc />} />
              <Route path="sample_order" element={<SampleOrder />} />
              <Route path="dashboard_sup" element={<DashboardSup />} />
              <Route path="order_details_sup" element={<OrderDetailsSup />} />
              <Route path="sample_order_list" element={<SampleOrderList />} />
              <Route path="sample_order_list_sup" element={<SampleOrderListSup />} />
              <Route path="sample_order_details/:id" element={<SampleOrderDetails />} />
              <Route path="rate_supplier" element={<RateSupplier />} />
            </Route>

            {/* Finance Manager route */}
            <Route path="/finance-manager/*" element={<FinanceDashboard />} />
          </Routes>
        </main>
        
        {/* Sonner Toast Container */}
        <Toaster 
          position="top-right"
          richColors 
          closeButton 
          expand={false}
          duration={4000}
        />
        <ScrollToTop />
      </div>
    </Router>
  )
}


export default App
