import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomeLayout = ({ children }) => {
    // Mock user data for the navbar
    const user = {
        name: "John Doe",
        location: "New York, USA"
    };

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
