import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getMe } from '../api/auth';

const HomeLayout = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getMe();
                // Map backend data to UI requirements
                setUser({
                    name: userData.user.username,
                    location: userData.user.address?.city || "Unknown Location",
                    ...userData.user
                });
            } catch (err) {
                console.error("Failed to fetch user for layout", err);
                // Optionally check localStorage if API fails or user is offline? 
                // For now, let it be null (guest mode)
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-beige">
            <Navbar
                variant="dashboard"
                user={user}
            />
            <main className="min-h-[calc(100vh-80px)]">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default HomeLayout;
