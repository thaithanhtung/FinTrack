import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { usePageTracking } from "./hooks";
import {
  Home,
  Charts,
  Alerts,
  Converter,
  Settings,
  Statistics,
  History,
  Login,
  Register,
  DailyReport,
} from "./pages";
import { useThemeStore, useLanguageStore } from "./stores";
import i18n from "./i18n/config";

function App() {
  const { theme } = useThemeStore();
  const { language } = useLanguageStore();

  // Track page views automatically
  usePageTracking();

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
    <AuthProvider>
      <Routes>
        {/* Public auth routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/history" element={<History />} />
                <Route path="/converter" element={<Converter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/daily-report" element={<DailyReport />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
