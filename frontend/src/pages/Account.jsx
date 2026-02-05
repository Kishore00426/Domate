import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getMe, updateProfile } from '../api/auth';
import { getUserBookings } from '../api/bookings';
import UserDashboard from '../components/dashboard/UserDashboard';
import ProviderDashboard from './ProviderDashboard';

const Account = () => {
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

    return (
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
    );
};

export default Account;
