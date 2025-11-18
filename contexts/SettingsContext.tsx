
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  expiryWarningDays: number;
  lowStockThreshold: number;
  updateSettings: (settings: Partial<{ expiryWarningDays: number, lowStockThreshold: number }>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'pregao_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expiryWarningDays, setExpiryWarningDays] = useState<number>(30);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.expiryWarningDays !== undefined) {
          setExpiryWarningDays(parsedSettings.expiryWarningDays);
        }
        if (parsedSettings.lowStockThreshold !== undefined) {
          setLowStockThreshold(parsedSettings.lowStockThreshold);
        }
      }
    } catch (error) {
        console.error("Failed to load settings from localStorage", error);
    }
    setLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<{ expiryWarningDays: number, lowStockThreshold: number }>) => {
    let newExpiry = expiryWarningDays;
    let newLow = lowStockThreshold;

    if (newSettings.expiryWarningDays !== undefined) {
        newExpiry = newSettings.expiryWarningDays;
        setExpiryWarningDays(newExpiry);
    }
    if (newSettings.lowStockThreshold !== undefined) {
        newLow = newSettings.lowStockThreshold;
        setLowStockThreshold(newLow);
    }

    try {
      const settings = { expiryWarningDays: newExpiry, lowStockThreshold: newLow };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  if (loading) {
      return null;
  }

  return (
    <SettingsContext.Provider value={{ expiryWarningDays, lowStockThreshold, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
