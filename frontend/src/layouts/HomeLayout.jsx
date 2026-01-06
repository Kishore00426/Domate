import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoToTop from '../components/GoToTop';
import { getMe } from '../api/auth';
import { fetchServices } from '../store/servicesSlice';

const HomeLayout = ({ children }) => {
    const dispatch = useDispatch();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });


    const [loading, setLoading] = useState(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        return !!token && !savedUser;
    });

    useEffect(() => {
        // Fetch services from database
        dispatch(fetchServices());

        const fetchUser = async () => {
            try {

                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const userData = await getMe();


                const mappedUser = {
                    name: userData.user.username,
                    location: userData.user.address?.city || "Unknown Location",
                    ...userData.user
                };

                setUser(mappedUser);

                localStorage.setItem('user', JSON.stringify(mappedUser));

            } catch (err) {
                console.error("Failed to fetch user for layout", err);
                // If fetch fails (likely 401 or network), clear invalid session
                localStorage.removeItem('token');
                // Don't clear user entirely if you want to fall back to guest, 
                // but usually for auth failure we want to start fresh or keep guest if that was the intent.
                // However, if we had a token, we were trying to be key "User".
                if (localStorage.getItem('token')) {
                    // Only clear if we actually had a token that failed
                    localStorage.removeItem('user');
                    setUser(null);
                }
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
