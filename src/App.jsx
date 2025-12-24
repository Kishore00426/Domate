import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Services from './pages/Services';

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
