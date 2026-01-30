import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            navbar: {
                services: "Services",
                becomeProfessional: "Become a Professional",
                login: "Login",
                getStarted: "Get Started",
                home: "Home",
                notifications: "Notifications",
                searchPlaceholder: "Search...",
                logout: "Logout"
            },
            hero: {
                title: "Quality home services, <br /> <span class='text-gray-400'>on demand.</span>",
                subtitle: "Experience the professional difference. Expert cleaning, salon, and repair services at your doorstep.",
                getStarted: "Get Started"
            },
            howItWorks: {
                title: "How it Works",
                step1Title: "Choose a Service",
                step1Desc: "Select from our wide range of premium home services.",
                step2Title: "Book an Appointment",
                step2Desc: "Pick a convenient date and time slot.",
                step3Title: "Relax",
                step3Desc: "Our professional arrives and gets the job done."
            },
            whyChooseUs: {
                title: "Why DoMate is the <br /> safest choice",
                verifiedTitle: "Verified Professionals",
                verifiedDesc: "Background checked and trained experts.",
                pricingTitle: "Transparent Pricing",
                pricingDesc: "Upfront quotes. No hidden fees.",
                guaranteeTitle: "Satisfaction Guarantee",
                guaranteeDesc: "If you are not happy, we will make it right.",
                rating: "Average Rating <br /> from 1M+ users"
            },
            footer: {
                desc: "Making home services reliable, affordable and accessible for everyone.",
                company: "Company",
                aboutUs: "About Us",
                terms: "Terms & Conditions",
                privacy: "Privacy Policy",
                social: "Social",
                rights: "All rights reserved."
            }
        }
    },
    ta: {
        translation: {
            navbar: {
                services: "சேவைகள்",
                becomeProfessional: "நிபுணராக மாறுங்கள்",
                login: "உள்நுழைய",
                getStarted: "தொடங்குங்கள்",
                home: "முகப்பு",
                notifications: "அறிவிப்புகள்",
                searchPlaceholder: "தேடு...",
                logout: "வெளியேறு"
            },
            hero: {
                title: "தரமான வீட்டுச் சேவைகள், <br /> <span class='text-gray-400'>தேவைக்கேற்ப.</span>",
                subtitle: "தொழில்முறை வித்தியாசத்தை அனுபவியுங்கள். நிபுணர் சுத்தம், சலூன் மற்றும் பழுதுபார்ப்பு சேவைகள் உங்கள் வீட்டு வாசலில்.",
                getStarted: "தொடங்குங்கள்"
            },
            howItWorks: {
                title: "இது எப்படி வேலை செய்கிறது",
                step1Title: "சேவையைத் தேர்வுசெய்க",
                step1Desc: "எங்கள் பரந்த அளவிலான பிரீமியம் வீட்டுச் சேவைகளிலிருந்து தேர்ந்தெடுக்கவும்.",
                step2Title: "முன்பதிவு செய்யுங்கள்",
                step2Desc: "வசதியான தேதி மற்றும் நேரத்தைத் தேர்வுசெய்க.",
                step3Title: "நிம்மதியாக இருங்கள்",
                step3Desc: "எங்கள் நிபுணர் வந்து வேலையைச் முடிப்பார்."
            },
            whyChooseUs: {
                title: "DoMate ஏன் <br /> பாதுகாப்பான தேர்வு",
                verifiedTitle: "சரிபார்க்கப்பட்ட நிபுணர்கள்",
                verifiedDesc: "பின்னணி சரிபார்க்கப்பட்ட மற்றும் பயிற்சி பெற்ற நிபுணர்கள்.",
                pricingTitle: "வெளிப்படையான விலை",
                pricingDesc: "முன்பே விலை விவரம். மறைமுகக் கட்டணங்கள் இல்லை.",
                guaranteeTitle: "திருப்தி உத்தரவாதம்",
                guaranteeDesc: "நீங்கள் மகிழ்ச்சியாக இல்லையென்றால், நாங்கள் அதைச் சரிசெய்வோம்.",
                rating: "1M+ பயனர்களிடமிருந்து <br /> சராசரி மதிப்பீடு"
            },
            footer: {
                desc: "வீட்டுச் சேவைகளை நம்பகமானதாகவும், மலிவு விலையிலும், அனைவருக்கும் கிடைக்கக்கூடியதாகவும் மாற்றுதல்.",
                company: "நிறுவனம்",
                aboutUs: "எங்களைப் பற்றி",
                terms: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
                privacy: "தனியுரிமைக் கொள்கை",
                social: "சமூகம்",
                rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
