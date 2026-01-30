# i18n Implementation for Landing Page

## Overview
Added Tamil language support to the Landing page. Users can now toggle between English (EN) and Tamil (TA) using the button in the Navbar.

## Changes Made

### 1. Dependencies
Installed the following packages:
- `i18next`: The core internationalization library.
- `react-i18next`: React bindings for i18next.

### 2. Configuration
- Created `frontend/src/i18n.js` to configure i18next and define translations.
- Imported `i18n.js` in `frontend/src/main.jsx` to initialize it at the application startup.

### 3. Components Updated
The following components were updated to use the `useTranslation` hook and translation keys instead of hardcoded strings:  
- **Navbar**: Added a language switcher button (TA/EN) that only appears on the landing page.
- **Hero**: Translated title, subtitle, and CTA button.
- **HowItWorks**: Translated section title, step titles, and descriptions.
- **WhyChooseUs**: Translated section title, features, and rating text.
- **Footer**: Translated company, social links headers, and copyright text.

## How to Test
1. Run the development server.
2. Visit the landing page.
3. Click the "TA" button in the top right corner of the Navbar.
4. Observe that the text on the landing page changes to Tamil.
5. Click "EN" to switch back to English.
