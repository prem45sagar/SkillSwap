import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import ThreeBackground from "./components/common/ThreeBackground";
import { useState, useEffect } from "react";
import { AlertTriangle, Hammer, ShieldAlert, X } from "lucide-react";

const MaintenancePage = ({ notice }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full space-y-8 bg-white/5 border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
      <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
        <Hammer className="w-12 h-12 text-amber-500" />
      </div>
      <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Under Maintenance</h1>
      <p className="text-slate-400 font-medium leading-relaxed mb-10">We are currently optimizing the platform for a better exchange experience. Please check back shortly.</p>
      {notice && (
        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center"><ShieldAlert className="w-3 h-3 mr-2" /> Admin Directive</p>
          <p className="text-xs text-white font-bold italic">"{notice}"</p>
        </div>
      )}
      <div className="pt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Scheduled Recovery: T-Minus Soon</div>
    </div>
  </div>
);

function AppContent({ settings, showNotice, setShowNotice, isDismissed, setIsDismissed }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  // Determine which notice to show. Priority: Welcome Notice (one-time) > Admin System Notice
  const activeNotice = showNotice 
    ? "WELCOME TO THE SKILLSWAP PRESTIGE NETWORK. TRANSFORM YOUR SKILLS INTO OPPORTUNITIES! 🚀" 
    : settings.systemNotice;

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowNotice(false);
    sessionStorage.setItem("bannerDismissed", "true");
  };

  const shouldShowBanner = activeNotice && !isDismissed && !isAdminPath;

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 transition-colors duration-300">
      {shouldShowBanner && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-indigo-600 text-white py-2 px-4 shadow-2xl flex items-center justify-between">
           <div className="flex-1 flex items-center justify-center space-x-3">
             <AlertTriangle className="w-4 h-4 animate-bounce" />
             <span className="text-[10px] font-black uppercase tracking-widest italic">{activeNotice}</span>
           </div>
           <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-4">
             <X className="w-4 h-4" />
           </button>
        </div>
      )}
      <ThreeBackground />
      {!isAdminPath && <Navbar />}
      <main className={shouldShowBanner ? "pt-10" : ""}>
        <AppRoutes />
      </main>
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState({ platformName: "SkillSwap", maintenanceMode: false, systemNotice: "" });
  const [loading, setLoading] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const [isDismissed, setIsDismissed] = useState(sessionStorage.getItem("bannerDismissed") === "true");

  useEffect(() => {
    // Check for one-time welcome notice after login
    if (localStorage.getItem("showWelcomeNotice") === "true") {
      setShowNotice(true);
      setIsDismissed(false);
      sessionStorage.removeItem("bannerDismissed");
      localStorage.removeItem("showWelcomeNotice");
    }

    fetch("/api/settings/public")
      .then(res => res.json())
      .then(data => { 
        setSettings(data); 
        window.settings = data;
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (settings.maintenanceMode && !window.location.pathname.startsWith("/admin")) return <MaintenancePage notice={settings.systemNotice} />;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent 
            settings={settings} 
            showNotice={showNotice} 
            setShowNotice={setShowNotice} 
            isDismissed={isDismissed}
            setIsDismissed={setIsDismissed}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
