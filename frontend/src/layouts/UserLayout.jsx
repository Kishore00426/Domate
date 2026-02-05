import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Calendar,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    CreditCard,
    FileText
} from 'lucide-react';
import { getMe } from '../api/auth';
import { fetchServices } from '../store/servicesSlice';
import Navbar from '../components/Navbar'; // Import Navbar

const UserLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auth & Data States
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        dispatch(fetchServices());

        const fetchUser = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const userData = await getMe();
                const mappedUser = {
                    name: userData.user.username,
                    location: userData.user.address?.city || "Unknown Location",
                    ...userData.user
                };

                setUser(mappedUser);
                sessionStorage.setItem('user', JSON.stringify(mappedUser));
            } catch (err) {
                console.error("Failed to fetch user", err);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                navigate('/login');
            }
        };

        fetchUser();
    }, [dispatch, navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [

        { path: '/user/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/user/addresses', label: 'Addresses', icon: MapPin },
        { path: '/user/plans', label: 'My Plans', icon: FileText },
        { path: '/user/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-beige flex flex-col">
            {/* Navbar - Fixed at the top */}
            <Navbar variant="dashboard" user={user} loading={!user} />

            {/* Main Layout Container - Pushed down by Navbar height (approx 68px) */}
            <div className="flex flex-1 pt-[68px]">

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed md:sticky top-[68px] left-0 z-40 h-[calc(100vh-68px)] w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}
                >
                    {/* User Snippet */}
                    <div className="p-4 md:p-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-soft-black font-bold">
                                {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-soft-black truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                end={item.path === '/account'}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium
                                    ${isActive
                                        ? 'bg-soft-black text-white shadow-lg shadow-black/10'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-soft-black'}
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-50 space-y-2">
                        {/* Removed 'Back to Home' since Navbar handles navigation */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-0 min-w-0">
                    {/* Mobile Header Trigger (Only visible on mobile when sidebar is closed) */}
                    <div className="md:hidden p-4 pb-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-2 text-soft-black font-bold p-2 bg-white rounded-xl shadow-sm border border-gray-100 w-fit"
                        >
                            <Menu className="w-5 h-5" />
                            <span>Menu</span>
                        </button>
                    </div>

                    {/* Page Content */}
                    <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                        <Outlet context={{ user }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
