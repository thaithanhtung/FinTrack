import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Charts from "./pages/Charts";
import Alerts from "./pages/Alerts";
import Converter from "./pages/Converter";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import History from "./pages/History";
import { useThemeStore, useLanguageStore } from "./stores";
import i18n from "./i18n/config";

function App() {
  const { theme } = useThemeStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    // Apply theme on mount
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // Sync language with i18n
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/history" element={<History />} />
        <Route path="/converter" element={<Converter />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
