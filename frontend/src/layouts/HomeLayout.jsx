import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoToTop from '../components/GoToTop';
import { getMe } from '../api/auth';

const HomeLayout = ({ children }) => {
    // Optimistic UI: Initialize state from localStorage if available
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Loading is true only if we have a token but no user data yet (rare case)
    const [loading, setLoading] = useState(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        return !!token && !savedUser;
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // If no token, don't fetch
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const userData = await getMe();

                // Map backend data to UI requirements
                const mappedUser = {
                    name: userData.user.username,
                    location: userData.user.address?.city || "Unknown Location",
                    ...userData.user
                };

                setUser(mappedUser);
                // Update cache with fresh data
                localStorage.setItem('user', JSON.stringify(mappedUser));

            } catch (err) {
                console.error("Failed to fetch user for layout", err);
                // If fetch fails but we had cached data, user still sees it.
                // If token expired, maybe clear it? For now, keep it simple.
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-beige">
            <Navbar
                variant="dashboard"
                user={user}
                loading={loading}
            />
            <main className="min-h-[calc(100vh-80px)]">
                {children}
            </main>
            <Footer />
            <GoToTop />
        </div>
    );
};

export default HomeLayout;
