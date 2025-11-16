import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  expiryWarningDays: number;
  setExpiryWarningDays: (days: number) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'pregao_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expiryWarningDays, setExpiryWarningDaysState] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.expiryWarningDays !== undefined) {
          setExpiryWarningDaysState(parsedSettings.expiryWarningDays);
        }
      }
    } catch (error) {
        console.error("Failed to load settings from localStorage", error);
    }
    setLoading(false);
  }, []);

  const setExpiryWarningDays = (days: number) => {
    setExpiryWarningDaysState(days);
    try {
      const settings = { expiryWarningDays: days };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  if (loading) {
      return null;
  }

  return (
    <SettingsContext.Provider value={{ expiryWarningDays, setExpiryWarningDays }}>
      {children}
    </SettingsContext.Provider>
  );
};