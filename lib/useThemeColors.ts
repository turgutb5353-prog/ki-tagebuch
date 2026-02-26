import { useEffect, useState } from "react";

export const useThemeColors = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");

    const handleStorageChange = () => {
      const theme = localStorage.getItem("theme");
      setDarkMode(theme === "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    mounted,
    darkMode,
    bg: darkMode ? "#2c2817" : "#faf8f3",
    text: darkMode ? "#faf8f3" : "#2c2817",
    accent: "#8b7355",
    accentLight: "#a4886f",
    border: darkMode ? "rgba(250, 248, 243, 0.1)" : "rgba(44, 40, 23, 0.1)",
    cardBg: darkMode ? "rgba(250, 248, 243, 0.05)" : "rgba(44, 40, 23, 0.03)",
  };
};
