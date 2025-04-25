import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("dark") === "true"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark", darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  return { darkMode, toggleDark };
}
