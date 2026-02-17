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
import ProviderDashboard from './pages/ProviderDashboard';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminRegister from './pages/Admin/AdminRegister';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ServiceManagement from './pages/Admin/ServiceManagement';
import UserManagement from './pages/Admin/UserManagement';
import AdminSettings from './pages/Admin/AdminSettings';
import PrivilegeManagement from './pages/Admin/PrivilegeManagement';
import BookingManagement from './pages/Admin/BookingManagement';
import AdminReports from './pages/Admin/AdminReports';
import MyBookings from './pages/MyBookings';
import Settings from './pages/Settings';
import SavedAddresses from './pages/SavedAddresses';
import MyPlans from './pages/MyPlans';
import Notifications from './pages/Notifications';
import UserLayout from './layouts/UserLayout';
import ProviderLayout from './layouts/ProviderLayout';
import ProviderProfile from './pages/Provider/ProviderProfile';
import ProviderServices from './pages/Provider/ProviderServices';
import ProviderBookings from './pages/Provider/ProviderBookings';
import ProviderDocuments from './pages/Provider/ProviderDocuments';


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
          <Route path="/services/:id" element={<ServiceDetail />} />

          {/* User Dashboard Routes - Wrapped in UserLayout */}
          <Route element={<UserLayout />}>
            <Route path="/account" element={<Account />} />
            <Route path="/user/bookings" element={<MyBookings />} />
            <Route path="/user/addresses" element={<SavedAddresses />} />
            <Route path="/user/plans" element={<MyPlans />} />
            <Route path="/user/settings" element={<Settings />} />
          </Route>

          <Route path="/notifications" element={<Notifications />} />

          {/* Provider Dashboard */}
          <Route element={<ProviderLayout />}>
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/services" element={<ProviderServices />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/documents" element={<ProviderDocuments />} />
          </Route>


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
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* Add other admin routes here */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
