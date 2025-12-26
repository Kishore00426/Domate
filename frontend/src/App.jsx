import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Services from './pages/Services';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProviderVerification from './pages/Admin/ProviderVerification';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminRegister from './pages/Admin/AdminRegister';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ServiceManagement from './pages/Admin/ServiceManagement';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/services" element={<Services />} />
          <Route path="/account" element={<Account />} />


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
            {/* Add other admin routes here */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
