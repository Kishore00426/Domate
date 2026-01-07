import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Home, Menu, X, FileText, Calendar, Tag, Search, LogOut, LayoutGrid } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openSearchModal, closeSearchModal } from '../store/uiSlice';
import SearchModal from './SearchModal';
// import SearchBar from './SearchBar'; // No longer needed directly here if we replace it

const Navbar = ({ variant = 'landing', user, loading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isDashboard = variant === 'dashboard';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/home');
    };
    const isHomeActive = location.pathname === '/home';
    const isServicesActive = location.pathname.startsWith('/services');
    const isCartActive = location.pathname === '/cart';
    const isAccountPage = location.pathname === '/account';

    const searchRef = useRef(null);
    const isSearchOpen = useSelector((state) => state.ui.isSearchModalOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target) && isSearchOpen) {
                dispatch(closeSearchModal());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, dispatch]);

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-white/20 px-6 py-3 flex items-center justify-between transition-all duration-300 hover:shadow-md">

                <div className="flex items-center gap-8">

                    <Link to={isDashboard ? "/home" : "/"} className="flex items-center gap-2">
                        <img src="/logo.png" alt="DoMate" className="h-8 w-auto" />
                        <span className="text-2xl font-bold tracking-tight text-soft-black">DoMate</span>
                    </Link>




                </div>


                {/* Center Section - Removed Search Bar from here, moved to Right Nav */}
                {/* Orders and Plans buttons removed for Account page as per request */}


                {!isDashboard && (
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
                        <button
                            onClick={() => {
                                // Set guest user in localStorage
                                const guestUser = {
                                    name: 'Guest',
                                    location: 'Unknown'
                                };
                                localStorage.setItem('user', JSON.stringify(guestUser));
                                // Navigate to home page
                                navigate('/home');
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors cursor-pointer"
                        >
                            Services
                        </button>
                        <Link to="/register?role=service_provider" className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors">Become a Professional</Link>
                    </div>
                )}


                <div className="flex items-center gap-4">


                    {isDashboard ? (
                        <div className="hidden md:flex items-center gap-2 ">
                            {/* Expanding Search Bar */}
                            {(isHomeActive || isCartActive || isServicesActive) && (
                                <div className="relative group mr-2" ref={searchRef}>
                                    <div
                                        className={`flex items-center rounded-full bg-transparent hover:bg-white border-none transition-all duration-300 ease-in-out cursor-pointer ${isSearchOpen || searchTerm ? 'w-[250px] px-4 py-2 bg-white ring-1 ring-gray-200' : 'w-10 h-10 justify-center hover:w-[250px] hover:justify-start hover:px-4'}`}
                                        onClick={() => dispatch(openSearchModal())}
                                    >
                                        <Search className={`w-5 h-5 text-gray-600 transition-all duration-300 ${isSearchOpen || searchTerm ? 'mr-3' : ''}`} />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className={`bg-transparent border-none outline-none text-sm font-medium text-soft-black placeholder:text-gray-500 caret-black transition-all duration-300 ${isSearchOpen || searchTerm ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}
                                            value={searchTerm}
                                            autoComplete="off"
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                dispatch(openSearchModal());
                                            }}
                                            onFocus={() => dispatch(openSearchModal())}
                                        />
                                    </div>
                                    {/* Show modal only if it's "open" (meaning active interaction) */}
                                    {(isSearchOpen) && (
                                        <div className="absolute top-12 left-0 w-[350px] z-50">
                                            <SearchModal searchTerm={searchTerm} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <Link
                                to="/home"
                                className={`p-2 rounded-full transition-all ${isHomeActive ? 'bg-black text-white' : 'text-gray-600 hover:text-soft-black hover:bg-gray-100'}`}
                                title="Home"
                            >
                                <Home className="w-5 h-5" />
                            </Link>

                            <Link
                                to="/services"
                                className={`p-2 rounded-full transition-all ${isServicesActive ? 'bg-black text-white' : 'text-gray-600 hover:text-soft-black hover:bg-gray-100'}`}
                                title="Services"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </Link>


                            {loading ? (
                                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 p-1">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="hidden lg:block space-y-1">
                                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ) : isAccountPage ? (
                                user?.name && user.name.toLowerCase() !== 'guest' ? (
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 py-2 px-4 ml-2 bg-black text-white hover:bg-black/80 rounded-full transition-colors font-medium text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2 py-2 px-4 ml-2 bg-soft-black text-white hover:bg-black rounded-full transition-colors font-medium text-sm"
                                    >
                                        <span>Login</span>
                                    </Link>
                                )
                            ) : (
                                <Link to="/account" className="flex items-center gap-3 pl-2 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
                                    <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                                        {user?.name && user.name.toLowerCase() !== 'guest' ? (
                                            user.name.charAt(0).toUpperCase()
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="hidden lg:block text-sm">
                                        <div className="font-semibold text-soft-black leading-none mb-1">{user?.name || 'Guest'}</div>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <MapPin className="w-3 h-3" />
                                            {user?.location || 'Unknown'}
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Landing Right Section */
                        <div className="hidden md:block">
                            <Link to="/register" className="bg-soft-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-transform active:scale-95 duration-200 cursor-pointer block">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-soft-black p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-2">
                    {isDashboard ? (
                        <>
                            <Link to="/home" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-black font-medium">
                                <Home className="w-5 h-5" /> Home
                            </Link>
                            <Link to="/services" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-black font-medium">
                                <LayoutGrid className="w-5 h-5" /> Services
                            </Link>
                            <div className="p-2">
                                <input type="text" placeholder="Search..." className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 shadow-md text-black placeholder:text-gray-500" />
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex items-center gap-3 p-2">
                                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center font-semibold text-white">
                                        {user?.name && user.name.toLowerCase() !== 'guest' ? (
                                            user.name.charAt(0).toUpperCase()
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-black">{user?.name}</div>
                                        <div className="text-xs text-black font-medium">{user?.location}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    // Set guest user in localStorage
                                    const guestUser = {
                                        name: 'Guest',
                                        location: 'Unknown'
                                    };
                                    localStorage.setItem('user', JSON.stringify(guestUser));
                                    // Navigate to home page
                                    navigate('/home');
                                    // Close mobile menu
                                    setIsOpen(false);
                                }}
                                className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg text-left w-full cursor-pointer"
                            >
                                Services
                            </button>
                            <Link to="/register?role=service_provider" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg">Become a Professional</Link>
                            <Link to="/register" className="bg-soft-black text-white px-5 py-3 rounded-xl text-sm font-medium w-full block text-center">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
