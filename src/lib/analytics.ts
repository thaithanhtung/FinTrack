import ReactGA from "react-ga4";

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // Anonymize IP for GDPR compliance
      },
    });
    console.log("✅ Google Analytics initialized");
  } else {
    console.warn("⚠️ GA_MEASUREMENT_ID not found. Analytics disabled.");
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({
      hitType: "pageview",
      page: path,
      title: title || document.title,
    });
  }
};

/**
 * Track custom event
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

/**
 * Track user actions
 */
export const analytics = {
  // Page views
  pageView: (path: string, title?: string) => trackPageView(path, title),

  // User authentication
  login: (method: string = "email") => {
    trackEvent("User", "Login", method);
  },

  register: (method: string = "email") => {
    trackEvent("User", "Register", method);
  },

  logout: () => {
    trackEvent("User", "Logout");
  },

  // Alert actions
  createAlert: (goldType: string, condition: string) => {
    trackEvent("Alert", "Create", `${goldType}_${condition}`);
  },

  deleteAlert: (goldType: string) => {
    trackEvent("Alert", "Delete", goldType);
  },

  toggleAlert: (isActive: boolean) => {
    trackEvent("Alert", "Toggle", isActive ? "Activate" : "Deactivate");
  },

  // Telegram integration
  linkTelegram: () => {
    trackEvent("Integration", "Link Telegram");
  },

  unlinkTelegram: () => {
    trackEvent("Integration", "Unlink Telegram");
  },

  // Settings
  changeTheme: (theme: string) => {
    trackEvent("Settings", "Change Theme", theme);
  },

  changeLanguage: (language: string) => {
    trackEvent("Settings", "Change Language", language);
  },

  // Data interactions
  refreshData: () => {
    trackEvent("Data", "Refresh");
  },

  exportData: (format: string) => {
    trackEvent("Data", "Export", format);
  },

  // Price comparisons
  viewComparison: (goldType: string) => {
    trackEvent("Comparison", "View", goldType);
  },

  calculateSpread: () => {
    trackEvent("Comparison", "Calculate Spread");
  },

  // Charts & Statistics
  viewChart: (chartType: string) => {
    trackEvent("Chart", "View", chartType);
  },

  changeTimeRange: (range: string) => {
    trackEvent("Chart", "Change Time Range", range);
  },

  // Converter
  convertCurrency: (from: string, to: string) => {
    trackEvent("Converter", "Convert", `${from}_to_${to}`);
  },

  // Errors
  error: (errorType: string, errorMessage?: string) => {
    trackEvent("Error", errorType, errorMessage);
  },
};
