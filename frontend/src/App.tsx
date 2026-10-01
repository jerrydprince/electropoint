import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/layout/AppShell';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PermissionRoute } from './components/layout/PermissionRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';

// User & Role Pages
const ReturnsList = lazy(() => import('./pages/returns/ReturnsList'));
const CreateReturn = lazy(() => import('./pages/returns/CreateReturn'));
const CreditList = lazy(() => import('./pages/credit/CreditList'));
const UserList = lazy(() => import('./pages/users/UserList'));
const UserForm = lazy(() => import('./pages/users/UserForm'));
const RoleList = lazy(() => import('./pages/roles/RoleList'));
const RoleForm = lazy(() => import('./pages/roles/RoleForm'));

// Company & Inventory Attributes
const CompanyLayout = lazy(() => import('./pages/company/CompanyLayout'));
const CompanyProfile = lazy(() => import('./pages/company/CompanyProfile'));
const BranchList = lazy(() => import('./pages/branches/BranchList'));
const BranchForm = lazy(() => import('./pages/branches/BranchForm'));
const WarehouseList = lazy(() => import('./pages/warehouses/WarehouseList'));
const WarehouseForm = lazy(() => import('./pages/warehouses/WarehouseForm'));
const Categories = lazy(() => import('./pages/attributes/Categories'));
const Brands = lazy(() => import('./pages/attributes/Brands'));
const Units = lazy(() => import('./pages/attributes/Units'));

// Products Catalog
const ProductList = lazy(() => import('./pages/products/ProductList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const ProductDetails = lazy(() => import('./pages/products/ProductDetails'));

// Inventory Engine
const InventoryManager = lazy(() => import('./pages/inventory/InventoryManager'));
const SupplierManager = lazy(() => import('./pages/suppliers/SupplierManager'));
const SuppliesManager = lazy(() => import('./pages/supplies/SuppliesManager'));

// Customers & CRM
const CustomerManager = lazy(() => import('./pages/customers/CustomerManager'));
const CustomerForm = lazy(() => import('./pages/customers/CustomerForm'));
const CustomerProfile = lazy(() => import('./pages/customers/CustomerProfile'));
const CorporateAccountManager = lazy(() => import('./pages/customers/CorporateAccountManager'));

// POS & Sales
const POSManager = lazy(() => import('./pages/sales/POSManager'));
const SalesHistory = lazy(() => import('./pages/sales/SalesHistory'));

// Warranties & After-Sales
const WarrantyLayout = lazy(() => import('./pages/warranties/WarrantyLayout'));
const WarrantiesList = lazy(() => import('./pages/warranties/WarrantiesList'));
const ClaimsList = lazy(() => import('./pages/warranties/ClaimsList'));
const CreateClaim = lazy(() => import('./pages/warranties/CreateClaim'));
const ClaimDetails = lazy(() => import('./pages/warranties/ClaimDetails'));

// Finance
const ExpensesList = lazy(() => import('./pages/finance/ExpensesList'));
const CreateExpense = lazy(() => import('./pages/finance/CreateExpense'));
const ExpenseCategories = lazy(() => import('./pages/finance/ExpenseCategories'));
const CashRegisterDashboard = lazy(() => import('./pages/finance/CashRegisterDashboard'));
const RegisterMovements = lazy(() => import('./pages/finance/RegisterMovements'));
const FinancialDashboard = lazy(() => import('./pages/finance/FinancialDashboard'));
const ChartOfAccounts = lazy(() => import('./pages/finance/ChartOfAccounts'));
const JournalEntries = lazy(() => import('./pages/finance/JournalEntries'));
const GeneralLedger = lazy(() => import('./pages/finance/GeneralLedger'));
const TaxManagement = lazy(() => import('./pages/finance/TaxManagement'));
const Budgets = lazy(() => import('./pages/finance/Budgets'));
const FiscalPeriods = lazy(() => import('./pages/finance/FiscalPeriods'));
const FinanceLayout = lazy(() => import('./pages/finance/FinanceLayout'));

const queryClient = new QueryClient();

// Dashboards & Reports
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const BranchDashboard = lazy(() => import('./pages/dashboards/BranchDashboard'));
const CashierDashboard = lazy(() => import('./pages/dashboards/CashierDashboard'));
const ReportHub = lazy(() => import('./pages/reports/ReportHub'));
const ReportOverview = lazy(() => import('./pages/reports/ReportOverview'));
const SalesReport = lazy(() => import('./pages/reports/SalesReport'));
const InventoryReport = lazy(() => import('./pages/reports/InventoryReport'));
const FinanceReport = lazy(() => import('./pages/reports/FinanceReport'));

// Notifications & Audit
const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationSettings = lazy(() => import('./pages/Settings/NotificationSettings'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
import { useAuth } from './contexts/AuthContext';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleName = user.roles?.[0]?.name || '';
  if (roleName === 'Super Administrator' || roleName === 'Administrator' || roleName === 'Manager') {
    return <Navigate to="/dashboards/admin" replace />;
  }
  if (roleName === 'Branch Manager') {
    return <Navigate to="/dashboards/branch" replace />;
  }
  return <Navigate to="/dashboards/cashier" replace />;
}
const Sales = () => <div className="p-6">Sales</div>;
const Customers = () => <div className="p-6">Customers</div>;

const ProcurementManager = lazy(() => import('./pages/procurement/ProcurementManager'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="print:hidden">
        <Toaster position="top-right" />
      </div>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardRedirect />} />
              <Route path="sales" element={<PermissionRoute permission="sales.create"><POSManager /></PermissionRoute>} />
              <Route path="sales-history" element={<PermissionRoute permission="sales.view"><SalesHistory /></PermissionRoute>} />
              <Route path="procurement/*" element={<PermissionRoute permission="procurement.view"><ProcurementManager /></PermissionRoute>} />
              <Route path="customers" element={<PermissionRoute permission="customers.view"><CustomerManager /></PermissionRoute>} />
              <Route path="customers/:id" element={<PermissionRoute permission="customers.view"><CustomerProfile /></PermissionRoute>} />
              <Route path="corporate-accounts" element={<PermissionRoute permission="customers.view"><CorporateAccountManager /></PermissionRoute>} />
              {/* Consolidated Finance Module */}
              <Route path="finance" element={<PermissionRoute permission="finance.view"><FinanceLayout /></PermissionRoute>}>
                <Route index element={<FinancialDashboard />} />
                <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
                <Route path="journals" element={<JournalEntries />} />
                <Route path="ledger" element={<GeneralLedger />} />
                <Route path="taxes" element={<TaxManagement />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="periods" element={<FiscalPeriods />} />
                
                <Route path="expenses" element={<ExpensesList />} />
                <Route path="expenses/create" element={<CreateExpense />} />
                <Route path="expense-categories" element={<ExpenseCategories />} />
                
                
                <Route path="reports" element={<FinanceReport />} />
              </Route>
              
              {/* Cash Register available to cashiers */}
              <Route path="cash-register" element={<PermissionRoute permission="sales.create"><CashRegisterDashboard /></PermissionRoute>} />
              <Route path="cash-register/movements" element={<PermissionRoute permission="sales.create"><RegisterMovements /></PermissionRoute>} />
              
              <Route path="inventory" element={<PermissionRoute permission="inventory.view"><InventoryManager /></PermissionRoute>} />
              <Route path="suppliers" element={<PermissionRoute permission="procurement.view"><SupplierManager /></PermissionRoute>} />
              <Route path="supplies" element={<PermissionRoute permission="inventory.transfer"><SuppliesManager /></PermissionRoute>} />
              
              {/* Products Catalog */}
              <Route path="products" element={<PermissionRoute permission="products.view"><ProductList /></PermissionRoute>} />
              <Route path="products/:id" element={<PermissionRoute permission="products.view"><ProductDetails /></PermissionRoute>} />
              
              {/* User Management */}
              <Route path="users" element={<PermissionRoute permission="users.view"><UserList /></PermissionRoute>} />
              <Route path="users/create" element={<PermissionRoute permission="users.create"><UserForm /></PermissionRoute>} />
              <Route path="users/:id/edit" element={<PermissionRoute permission="users.edit"><UserForm /></PermissionRoute>} />
              
              {/* Returns & Credit */}
              <Route path="returns" element={<PermissionRoute permission="sales.refund"><ReturnsList /></PermissionRoute>} />
              <Route path="returns/create" element={<PermissionRoute permission="sales.refund"><CreateReturn /></PermissionRoute>} />
              <Route path="credit" element={<PermissionRoute permission="sales.view"><CreditList /></PermissionRoute>} />

              {/* Warranties & After-Sales */}
              <Route path="warranties" element={<PermissionRoute permission="sales.view"><WarrantyLayout /></PermissionRoute>}>
                <Route index element={<WarrantiesList />} />
                <Route path="claims" element={<ClaimsList />} />
                <Route path="claims/create" element={<CreateClaim />} />
                <Route path="claims/:id" element={<ClaimDetails />} />
              </Route>

              {/* Finance (Moved to /finance) */}
              
              {/* Dashboards & Reports */}
              <Route path="dashboards/admin" element={<AdminDashboard />} />
              <Route path="dashboards/branch" element={<BranchDashboard />} />
              <Route path="dashboards/cashier" element={<CashierDashboard />} />

              <Route path="reports" element={<PermissionRoute permission="finance.export"><ReportHub /></PermissionRoute>}>
                <Route index element={<ReportOverview />} />
                <Route path="sales" element={<SalesReport />} />
                <Route path="inventory" element={<InventoryReport />} />
              </Route>

              {/* Notifications & Audit */}
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings/notifications" element={<NotificationSettings />} />
              <Route path="audit-logs" element={<PermissionRoute permission="settings.view"><AuditLogs /></PermissionRoute>} />

              {/* Role Management */}
              <Route path="roles" element={<PermissionRoute permission="roles.view"><RoleList /></PermissionRoute>} />
              <Route path="roles/create" element={<PermissionRoute permission="roles.create"><RoleForm /></PermissionRoute>} />
              <Route path="roles/:id/edit" element={<PermissionRoute permission="roles.edit"><RoleForm /></PermissionRoute>} />
              
              {/* Session 4: Company, Branches, Warehouses */}
              <Route path="company" element={<PermissionRoute permission="settings.view"><CompanyLayout /></PermissionRoute>}>
                <Route index element={<CompanyProfile />} />
                <Route path="branches" element={<BranchList />} />
                <Route path="branches/create" element={<BranchForm />} />
                <Route path="branches/:id/edit" element={<BranchForm />} />
                <Route path="warehouses" element={<WarehouseList />} />
                <Route path="warehouses/create" element={<WarehouseForm />} />
                <Route path="warehouses/:id/edit" element={<WarehouseForm />} />
              </Route>
              
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
