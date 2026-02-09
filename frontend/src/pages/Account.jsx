import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMe, updateProfile } from '../api/auth';
import { getUserBookings } from '../api/bookings';
import UserDashboard from '../components/dashboard/UserDashboard';
import ProviderDashboard from './ProviderDashboard';

const Account = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: contextUser } = useOutletContext() || {}; // Context from UserLayout

    // User state
    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "+91 98765 43210",
        location: "New York, USA",
        addressTag: "Home",
        memberSince: "December 2024",
        role: ""
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Data independent of layout context if needed, or sync with it.
                // We fetch fresh to be sure.
                const userData = await getMe();
                setUser(prev => ({
                    ...prev,
                    name: userData.user.username,
                    email: userData.user.email,
                    location: userData.user.address?.city || "Unknown Location",
                    phone: userData.user.contactNumber || "",
                    addressTag: "Home",
                    role: userData.user.role
                }));

                if (userData.user.role !== 'service_provider') {
                    const bookingsData = await getUserBookings();
                    if (bookingsData.success) {
                        setBookings(bookingsData.bookings || []);
                    }
                }

            } catch (err) {
                console.error("Failed to fetch profile or bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState(user);
    const addressTags = ["Home", "Work", "Other"];

    useEffect(() => {
        setTempData(user);
    }, [user]);

    const handleEdit = () => {
        setTempData({ ...user });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempData(user);
    };

    const handleSave = async () => {
        try {
            const payload = {
                username: tempData.name,
                email: tempData.email,
                city: tempData.location,
                phone: tempData.phone,
            };

            const response = await updateProfile(payload);
            setUser({ ...tempData });
            setIsEditing(false);
            console.log("Profile updated", response);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile: " + (err.response?.data?.error || err.message));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user.role === 'service_provider') {
        return <ProviderDashboard user={user} />;
    }

    // Mobile Menu View for Account Page
    // Since Account.jsx is the 'Overview' for user, we render buttons here on mobile

    // We can conditionally render UserDashboard or just pass a prop "isMobile" if we want UserDashboard to handle it.
    // However, UserDashboard might be a complex component. Let's check imports.
    // It imports UserDashboard from components. 
    // To strictly follow the "clean page" requirement, maybe I should wrap UserDashboard?
    // Actually, simpler: Wrapper div in Account.jsx that shows Menu on mobile, and hides UserDashboard??
    // User says "only display the menu content... so no aside".
    // If I hide the sidebar, the "UserDashboard" component is the ONLY thing visible.
    // So "UserDashboard" component itself should probably show the menu on mobile?
    // Or I can add it here.

    return (
        <div>
            {/* Introduction / Welcome Card - Mobile & Desktop aligned */}
            <div className="md:hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative transition-all mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-soft-black mb-2">{t('account.hi')} {user.name}!</h1>
                        <p className="text-gray-500 text-sm">{t('account.welcomeBack')}</p>
                    </div>
                    {/* Mobile Logout Button */}
                    <button
                        onClick={() => {
                            sessionStorage.clear();
                            localStorage.removeItem('user');
                            window.location.href = '/';
                        }}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        title={t('account.logout')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Grid */}
            <div className="md:hidden grid grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4">
                {[
                    { path: '/user/bookings', label: t('account.myBookings'), icon: '📅' },
                    { path: '/user/addresses', label: t('account.addresses'), icon: '📍' },
                    { path: '/user/plans', label: t('account.myPlans'), icon: '📄' },
                    { path: '/user/settings', label: t('account.settings'), icon: '⚙️' },
                ].map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <span className="text-2xl mb-2">{item.icon}</span>
                        <span className="font-bold text-soft-black text-sm">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Desktop / Tablet View (or Mobile Content below menu if desired) */}
            <div className="hidden md:block">
                <UserDashboard
                    user={user}
                    bookings={bookings}
                    isEditing={isEditing}
                    tempData={tempData}
                    handleEdit={handleEdit}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    handleChange={handleChange}
                    addressTags={addressTags}
                />
            </div>
            {/* On Mobile, we might want to hide the standard dashboard if we ONLY want the menu. 
                 The user said "display the menu content... as a page". 
                 So I hid UserDashboard on mobile (`hidden md:block`).
                 But wait, `UserDashboard` contains the "Overview" stats?
                 If the user meant "Menu Page" replces Sidebar, then navigating to "Overview" should show stats?
                 There is no "Overview" link in the user sidebar. Just "My Bookings", "Addresses" etc.
                 So `Account.jsx` IS effectively just a landing page or "Settings" wrapper? 
                 Actually `UserLayout` has no "Overview" link. It just goes to `/user/bookings` etc.
                 Wait, `/account` renders `Account.jsx`. There is NO link to `/account` in the sidebar I saw in UserLayout.
                 UserLayout navItems: Bookings, Addresses, Plans, Settings.
                 So how does one get to `/account`?
                 Ah, the Navbar user profile link goes to `/account`.
                 So `/account` is effectively the "Overview" or "Profile" page.
                 So rendering the Menu options there on mobile makes perfect sense as a "Hub".
             */}
        </div>
    );
};

export default Account;
