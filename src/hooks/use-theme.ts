import { useState, useEffect } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "salam_tech_theme";

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
  } else {
    html.classList.add("light");
    html.classList.remove("dark");
  }
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  applyTheme(saved === "light" ? "light" : "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}
