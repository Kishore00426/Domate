import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getMe, updateProfile } from '../api/auth';
import UserDashboard from '../components/dashboard/UserDashboard';

const Account = () => {
    const navigate = useNavigate();
    // User state
    const [user, setUser] = useState({
        name: "", // Will be populated from DB
        email: "",
        phone: "+91 98765 43210", // Placeholder (not in DB)
        location: "New York, USA", // Placeholder (not in DB)
        addressTag: "Home", // Placeholder
        memberSince: "December 2024", // Placeholder
        role: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getMe();
                setUser(prev => ({
                    ...prev,
                    name: userData.user.username,
                    email: userData.user.email,
                    location: userData.user.address?.city || "Unknown Location",
                    role: userData.user.role // Very important for conditional rendering
                }));

                // Redirect provider to their dashboard
                if (userData.user.role === 'service_provider') {
                    navigate('/provider/dashboard');
                }
            } catch (err) {
                console.error("Failed to fetch user profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    // Edit mode states (Shared logic - mostly for UserDashboard currently)
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState(user);
    const addressTags = ["Home", "Work", "Other"];

    // Update tempData when user loads
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
            <HomeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <UserDashboard
                user={user}
                isEditing={isEditing}
                tempData={tempData}
                handleEdit={handleEdit}
                handleCancel={handleCancel}
                handleSave={handleSave}
                handleChange={handleChange}
                addressTags={addressTags}
            />
        </HomeLayout>
    );
};

export default Account;
