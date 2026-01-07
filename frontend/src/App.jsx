import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Account from './pages/Account';
import Services from './pages/Services';
import AdminLayout from './layouts/AdminLayout';
import ServiceDetail from './pages/ServiceDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProviderVerification from './pages/Admin/ProviderVerification';
import ProviderDashboard from './pages/ProviderDashboard'; // Added
import AdminLogin from './pages/Admin/AdminLogin';
import AdminRegister from './pages/Admin/AdminRegister';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ServiceManagement from './pages/Admin/ServiceManagement';
import UserManagement from './pages/Admin/UserManagement';
import AdminSettings from './pages/Admin/AdminSettings';
import PrivilegeManagement from './pages/Admin/PrivilegeManagement';
import MyBookings from './pages/MyBookings';
import Settings from './pages/Settings';
import SavedAddresses from './pages/SavedAddresses';
import MyPlans from './pages/MyPlans';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/services" element={<Services />} />
          <Route path="/account" element={<Account />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          {/* User Routes */}
          <Route path="/user/bookings" element={<MyBookings />} />
          <Route path="/user/addresses" element={<SavedAddresses />} />
          <Route path="/user/plans" element={<MyPlans />} />
          <Route path="/user/settings" element={<Settings />} />

          {/* Provider Dashboard */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />


          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="verification" element={<ProviderVerification />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="privileges" element={<PrivilegeManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* Add other admin routes here */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
