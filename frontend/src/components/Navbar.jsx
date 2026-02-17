import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, MapPin, Home, Menu, X, Search, LogOut, LayoutGrid, Bell, ChevronDown, Check, Globe, Briefcase, Calendar, Upload, LayoutDashboard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openSearchModal, closeSearchModal } from '../store/uiSlice';
import SearchModal from './SearchModal';
import LanguageDropdown from './LanguageDropdown';

const Navbar = ({ variant = 'landing', user, loading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const isDashboard = variant === 'dashboard';

    const handleLogout = () => {
        sessionStorage.clear(); // Remove all cache data
        localStorage.removeItem('user'); // Ensure local storage is also cleared
        window.location.href = '/';
    };
    const isHomeActive = location.pathname === '/home';
    const isServicesActive = location.pathname.startsWith('/services');
    const isNotificationsActive = location.pathname === '/notifications';

    const isAccountPage = location.pathname === '/account' || location.pathname.startsWith('/user/') || location.pathname.startsWith('/provider/dashboard');

    const searchRef = useRef(null);
    const isSearchOpen = useSelector((state) => state.ui.isSearchModalOpen);

    const isServiceProvider = user?.role === 'service_provider' || user?.role?.name === 'service_provider';
    const isGuest = !user || user?.name === 'Guest' || user?.name?.toLowerCase() === 'guest';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target) && isSearchOpen) {
                dispatch(closeSearchModal());
            }
            if (searchRef.current && !searchRef.current.contains(event.target) && isSearchOpen) {
                dispatch(closeSearchModal());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, dispatch]);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'hi', label: 'हिन्दी (Hindi)' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };


    return (
        <nav className="fixed top-0 left-0 w-full z-50">
            <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between ">

                <div className="flex items-center gap-8">

                    <Link to={isDashboard ? "/home" : "/"} className="flex items-center gap-2">
                        <img src="/logo.png" alt="DoMate" className="h-8 w-auto" />
                        <span className="text-2xl font-bold tracking-tight text-soft-black">DoMate</span>
                    </Link>

                </div>


                {/* Center Section - Removed Search Bar from here, moved to Right Nav */}
                {/* Orders and Plans buttons removed for Account page as per request */}


                {!isDashboard && (
                    <div className="hidden md:flex items-center gap-6 lg:gap-8 bg-gray-50/50 px-6 py-2 rounded-full border border-gray-100/50">
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
                            className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {t('navbar.services')}
                        </button>
                        <Link to="/register?role=service_provider" className="text-sm font-medium text-gray-600 hover:text-soft-black transition-colors whitespace-nowrap">{t('navbar.becomeProfessional')}</Link>
                    </div>
                )}


                <div className="flex items-center gap-4">


                    {isDashboard ? (
                        <div className="hidden md:flex items-center gap-2 ">
                            {/* Expanding Search Bar */}
                            {(isHomeActive || isServicesActive) && (
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

                            <LanguageDropdown />

                            {!isServiceProvider && (
                                <>
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
                                </>
                            )}

                            <Link
                                to="/notifications"
                                className={`p-2 rounded-full transition-all ${isNotificationsActive ? 'bg-black text-white' : 'text-gray-600 hover:text-soft-black hover:bg-gray-100'}`}
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
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
                                !isGuest ? null : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2 py-2 px-4 ml-2 bg-soft-black text-white hover:bg-black rounded-full transition-colors font-medium text-sm"
                                    >
                                        <span>Login</span>
                                    </Link>
                                )
                            ) : (
                                isGuest ? (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2 py-2 px-4 ml-2 bg-soft-black text-white hover:bg-black rounded-full transition-colors font-medium text-sm"
                                    >
                                        <span>Login</span>
                                    </Link>
                                ) : (
                                    <Link to={(isServiceProvider) ? "/provider/dashboard" : "/account"} className="flex items-center gap-3 pl-2 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
                                        <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                                        </div>
                                        <div className="hidden lg:block text-sm">
                                            <div className="font-semibold text-soft-black leading-none mb-1">{user?.name}</div>
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <MapPin className="w-3 h-3" />
                                                {user?.location || 'Unknown'}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    ) : (
                        /* Landing Right Section */
                        <div className="hidden md:flex items-center gap-4">
                            <LanguageDropdown />
                            <Link to="/login" className="bg-soft-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-transform active:scale-95 duration-200 cursor-pointer block">
                                {t('navbar.getStarted')}
                            </Link>
                        </div>
                    )}

                    {/* Mobile Actions: Search & Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        {mobileSearchOpen ? (
                            <div className="absolute inset-0 bg-white z-50 px-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm rounded-b-3xl">
                                <Search className="w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className="flex-1 bg-transparent border-none outline-none text-base text-soft-black placeholder:text-gray-400 h-full py-4"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        dispatch(openSearchModal());
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => {
                                    setMobileSearchOpen(false);
                                    dispatch(closeSearchModal());
                                }} className="p-5 text-gray-600 hover:text-black">
                                    <X className="w-5 h-8" />
                                </button>

                                {/* Mobile Search Results Modal */}
                                {(searchTerm && isSearchOpen) && (
                                    <div className="absolute top-full left-0 w-full px-2">
                                        <SearchModal searchTerm={searchTerm} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="p-2 text-soft-black"
                                onClick={() => setMobileSearchOpen(true)}
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        )}

                        <button
                            className="text-soft-black p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl p-4 flex flex-col gap-1 md:hidden animate-in fade-in slide-in-from-top-2">
                    {isDashboard ? (
                        <>
                            {!isServiceProvider && (
                                <>
                                    <Link to="/home" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-black font-medium">
                                        <Home className="w-5 h-5" /> Home
                                    </Link>
                                    <Link to="/services" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-black font-medium">
                                        <LayoutGrid className="w-5 h-5" /> Services
                                    </Link>
                                </>
                            )}
                            <Link to="/notifications" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-black font-medium">
                                <Bell className="w-5 h-5" /> Notifications
                            </Link>

                            <div className="p-2 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang.code ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                                        >
                                            {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className="border-t pt-1 mt-1">
                                {!isGuest ? (
                                    <>
                                        <Link
                                            to={isServiceProvider ? "/provider/dashboard" : "/account"}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center font-semibold text-white">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-black">{user?.name}</div>
                                                <div className="text-xs text-black font-medium">{user?.location}</div>
                                            </div>
                                        </Link>

                                        {/* Provider Navigation Items in Mobile Menu */}
                                        {isServiceProvider && (
                                            <div className="space-y-1 mt-2 mb-2 pl-2 border-l-2 border-gray-100 ml-4">
                                                <Link to="/provider/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <LayoutDashboard className="w-4 h-4" /> Overview
                                                </Link>
                                                <Link to="/provider/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <User className="w-4 h-4" /> Profile
                                                </Link>
                                                <Link to="/provider/services" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Briefcase className="w-4 h-4" /> My Services
                                                </Link>
                                                <Link to="/provider/bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Calendar className="w-4 h-4" /> Bookings
                                                </Link>
                                                <Link to="/provider/documents" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 text-gray-600 hover:text-black text-sm font-medium">
                                                    <Upload className="w-4 h-4" /> Documents
                                                </Link>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="flex items-center justify-center p-3 bg-black text-white rounded-xl font-medium w-full">
                                        Login
                                    </Link>
                                )}
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
                                {t('navbar.services')}
                            </button>
                            <Link to="/register?role=service_provider" className="text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg">{t('navbar.becomeProfessional')}</Link>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang.code ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                                        >
                                            {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Link to="/login" className="bg-soft-black text-white px-5 py-3 rounded-xl text-sm font-medium w-full block text-center">
                                {t('navbar.getStarted')}
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
