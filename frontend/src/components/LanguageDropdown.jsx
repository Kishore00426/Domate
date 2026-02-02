import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageDropdown = () => {
    const { i18n } = useTranslation();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef(null);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'hi', label: 'हिन्दी (Hindi)' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target) && isLangOpen) {
                setIsLangOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLangOpen]);

    return (
        <div className="relative" ref={langRef}>
            <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{currentLang.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${i18n.language === lang.code ? 'text-black font-semibold bg-gray-50' : 'text-gray-600'}`}
                        >
                            <span>{lang.label}</span>
                            {i18n.language === lang.code && <Check className="w-4 h-4 text-black" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageDropdown;
