import React, { createContext, useState, ReactNode } from "react";


export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true);

  const theme = {
    darkMode,
    colors: {
      background: darkMode ? "#1A1818" : "#fff",
      text: darkMode ? "#fff" : "#000",
      card: darkMode ? "#242333" : "#f2f2f2",
      toggleActive: "#4CAF50",
      toggleInactive: "#ccc",
      green: darkMode ? "#4CAF50" : "#008000",
      grey: darkMode ? "#8a8a8a" : "#555",
    },
    toggleTheme: () => setDarkMode(!darkMode),
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export default function ThemeContextPage() {
  return null;
}
