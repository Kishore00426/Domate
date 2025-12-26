import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Settings, LogOut, Menu, X, LayoutGrid, FileText } from 'lucide-react';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [adminName, setAdminName] = useState('Admin'); // Default
    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/verification', label: 'Provider Verification', icon: CheckSquare },
        { path: '/admin/categories', label: 'Category Management', icon: LayoutGrid },
        { path: '/admin/services', label: 'Service Management', icon: FileText },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    React.useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            const user = localStorage.getItem('adminUser');

            if (!token || !user) {
                navigate('/admin/login');
                return;
            }

            try {
                const parsedUser = JSON.parse(user);
                // Optional: Check if user role is actually admin if stored in localstorage
                if (parsedUser.role && parsedUser.role.name && parsedUser.role.name !== 'admin') {
                    navigate('/admin/login'); // Or unauthorized page
                    return;
                }
                setAdminName(parsedUser.username || parsedUser.name || 'Admin');
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to parse admin user", e);
                navigate('/admin/login');
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-soft-black text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto bg-white rounded-full " />
                            <span className="text-xl font-bold tracking-tight">DoMate</span>
                        </div>
                        <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-white text-soft-black font-semibold shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-800">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-40">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-soft-black">Admin Panel</h2>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-beige flex items-center justify-center text-soft-black font-bold text-sm">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{adminName}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}
        </div>
    );
};

export default AdminLayout;
