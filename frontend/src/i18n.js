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
            },
            login: {
                welcome: "Welcome Back",
                subtitle: "Login to your DoMate account.",
                emailLabel: "Email Address",
                emailPlaceholder: "name@example.com",
                passwordLabel: "Password",
                passwordPlaceholder: "••••••••",
                loginButton: "Login",
                noAccount: "Don't have an account?",
                signUp: "Sign up",
                errors: {
                    emailRequired: "Email is required",
                    emailInvalid: "Email is invalid",
                    passwordRequired: "Password is required",
                    passwordLength: "Password must be at least 6 characters",
                    loginFailed: "Login failed. Please try again.",
                    networkError: "Unable to connect to the server. Please check your internet connection or try again later."
                }
            },
            home: {
                carousel: {
                    slide1: {
                        title: "Expert Home Services",
                        subtitle: "From cleaning to repairs, we have you covered."
                    },
                    slide2: {
                        title: "Festive Season begins",
                        subtitle: "We are here to make your festive season a healthy & memorable one."
                    },
                    slide3: {
                        title: "Skilled Electricians",
                        subtitle: "Safe and reliable electrical repairs."
                    },
                    bookNow: "Book Now"
                },
                categories: {
                    title: "What are you looking for?",
                    items: {
                        salonSpa: "Salon & Spa",
                        cleaning: "Cleaning",
                        handyman: "Handyman Services",
                        acAppliance: "AC & Appliance Repair",
                        mosquito: "Mosquito & Safety nets",
                        painting: "Painting & Waterproofing",
                        disinfection: "Disinfection Services",
                        packersMovers: "Packers & Movers"
                    },
                    modal: {
                        noServices: "No services available for this category yet.",
                        close: "Close"
                    }
                },
                cleaning: {
                    title: "Sparkle & Shine: Premium Cleaning for Your Home",
                    subtitle: "Experience the joy of a spotless home with our top-rated cleaning professionals.",
                    startsAt: "Starts at",
                    bookNow: "Book Now"
                },
                experts: {
                    title: "Meet Our Experts",
                    subtitle: "Highly rated professionals ready to help you.",
                    experience: "Yrs Exp",
                    expertise: "Expertise"
                }
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
            },
            login: {
                welcome: "மீண்டும் வருக",
                subtitle: "உங்கள் DoMate கணக்கில் உள்நுழையவும்.",
                emailLabel: "மின்னஞ்சல் முகவரி",
                emailPlaceholder: "name@example.com",
                passwordLabel: "கடவுச்சொல்",
                passwordPlaceholder: "••••••••",
                loginButton: "உள்நுழைய",
                noAccount: "கணக்கு இல்லையா?",
                signUp: "பதிவு செய்க",
                errors: {
                    emailRequired: "மின்னஞ்சல் தேவை",
                    emailInvalid: "மின்னஞ்சல் தவறானது",
                    passwordRequired: "கடவுச்சொல் தேவை",
                    passwordLength: "கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்",
                    loginFailed: "உள்நுழைவு தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
                    networkError: "சேவையகத்துடன் இணைக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்."
                }
            },
            home: {
                carousel: {
                    slide1: {
                        title: "நிபுணத்துவ வீட்டுச் சேவைகள்",
                        subtitle: "சுத்தம் செய்வது முதல் பழுது பார்ப்பது வரை, அனைத்தும் எங்களிடம்."
                    },
                    slide2: {
                        title: "பண்டிகை காலம் தொடங்குகிறது",
                        subtitle: "உங்கள் பண்டிகை காலத்தை ஆரோக்கியமாகவும் மறக்கமுடியாததாகவும் மாற்ற நாங்கள் இருக்கிறோம்."
                    },
                    slide3: {
                        title: "திறமையான எலக்ட்ரீஷியன்கள்",
                        subtitle: "பாதுகாப்பான மற்றும் நம்பகமான மின்சார பழுதுபார்ப்பு."
                    },
                    bookNow: "முன்பதிவு செய்யவும்"
                },
                categories: {
                    title: "நீங்கள் எதைத் தேடுகிறீர்கள்?",
                    items: {
                        salonSpa: "சலூன் & ஸ்பா",
                        cleaning: "சுத்தம்",
                        handyman: "கைவினைஞர் சேவைகள்",
                        acAppliance: "ஏசி & உபகரணங்கள் பழுது",
                        mosquito: "கொசு & பாதுகாப்பு வலைகள்",
                        painting: "ஓவியம் & வாட்டர்ப்ரூஃபிங்",
                        disinfection: "கிருமிநாசினி சேவைகள்",
                        packersMovers: "பேக்கர்ஸ் & மூவர்ஸ்"
                    },
                    modal: {
                        noServices: "இந்த வகைக்கு சேவைகள் எதுவும் இல்லை.",
                        close: "மூடு"
                    }
                },
                cleaning: {
                    title: "ஸ்பார்கிள் & ஷைன்: உங்கள் வீட்டிற்கான பிரீமியம் சுத்தம்",
                    subtitle: "எங்கள் சிறந்த தரமதிப்பீடு பெற்ற சுத்தம் செய்யும் நிபுணர்களுடன் உங்கள் வீடு பளிச்சிடுவதை அனுபவியுங்கள்.",
                    startsAt: "ஆரம்ப விலை",
                    bookNow: "முன்பதிவு செய்யவும்"
                },
                experts: {
                    title: "எங்கள் நிபுணர்களை சந்திக்கவும்",
                    subtitle: "உங்களுக்கு உதவ தயாராக இருக்கும் உயர் தரமதிப்பீடு பெற்ற நிபுணர்கள்.",
                    experience: "வருட அனுபவம்",
                    expertise: "நிபுணத்துவம்"
                }
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
