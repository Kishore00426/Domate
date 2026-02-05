import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    User,
    Upload
} from 'lucide-react';
import { getMe } from '../api/auth';
import { getMyProviderProfile } from '../api/providers';
import Navbar from '../components/Navbar';

const ProviderLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auth & Data States
    const [user, setUser] = useState(null);
    const [providerDetails, setProviderDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // 1. Get User Data
                const userData = await getMe();
                if (userData.user.role !== 'service_provider') {
                    navigate('/home');
                    return;
                }
                setUser(userData.user);

                // 2. Get Provider Specific Data
                const profileResponse = await getMyProviderProfile();
                if (profileResponse.success) {
                    setProviderDetails(profileResponse.provider);
                }

            } catch (err) {
                console.error("Failed to fetch provider data", err);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/provider/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/provider/profile', label: 'Profile', icon: User },
        { path: '/provider/services', label: 'My Services', icon: Briefcase },
        { path: '/provider/bookings', label: 'Bookings', icon: Calendar },
        { path: '/provider/documents', label: 'Documents', icon: Upload },
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-beige">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-beige flex flex-col">
            {/* Navbar - Reuse existing Navbar */}
            <Navbar variant="dashboard" user={user} loading={loading} />

            {/* Main Layout Container */}
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
                            <div className="w-10 h-10 bg-soft-black text-white rounded-full flex items-center justify-center shadow-sm font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-soft-black truncate">{user?.username || 'Provider'}</p>
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
                                end={true}
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
                    <div className="p-4 border-t border-gray-50">
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
                    {/* Mobile Header Trigger */}
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
                        {/* Pass context to child routes so they don't need to re-fetch */}
                        <Outlet context={{ user, providerDetails, setProviderDetails }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProviderLayout;
