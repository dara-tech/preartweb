import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, i18n]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'km' : 'en';
    setCurrentLanguage(newLang);
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        toggleLanguage,
        changeLanguage,
        isKhmer: currentLanguage === 'km',
        isEnglish: currentLanguage === 'en'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

