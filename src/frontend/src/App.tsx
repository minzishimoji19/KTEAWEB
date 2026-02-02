import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/Login';
import EmptyState from './components/EmptyState';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import TransactionList from './pages/TransactionList';
import PendingQueue from './pages/PendingQueue';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import Dashboard from './pages/Dashboard';
import VoucherList from './pages/VoucherList';
import AutomationDashboard from './pages/AutomationDashboard';
import VoucherValidation from './pages/VoucherValidation';
import VoucherHunter from './pages/internal/VoucherHunter';

import { Toaster } from 'react-hot-toast';

// Main App Component with Routing
function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="transactions" element={<TransactionList />} />
          <Route path="transactions/pending" element={<PendingQueue />} />
          <Route path="loyalty" element={<LoyaltyDashboard />} />
          <Route path="vouchers" element={<VoucherList />} />
          <Route path="automation" element={<AutomationDashboard />} />
          <Route path="validation" element={<VoucherValidation />} />
          <Route path="internal/vouchers" element={<VoucherHunter />} />
          <Route path="settings" element={<EmptyState title="Settings" description="User roles and System config." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
