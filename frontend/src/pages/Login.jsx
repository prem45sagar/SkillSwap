import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam === "blocked") {
      setError("User blocked by Admin.");
    } else if (errorParam === "auth_error") {
      setError("Authentication failed. Please try again.");
    }
  }, [location]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("skillswap_user");
        localStorage.removeItem("skillswap_token");
        localStorage.setItem("adminData", JSON.stringify(data));
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Admin authentication failed");
      }
    } catch (err) {
      setError("Server connection failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (isAdminMode) return handleAdminLogin(e);
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      localStorage.setItem("showWelcomeNotice", "true");
      navigate("/dashboard");
    } catch (err) {
      const message = err.message || (err.response?.data?.message) || "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto shadow-inner overflow-hidden">
              <img 
                src="/assets/logo.png" 
                alt="SkillSwap" 
                className="w-12 h-12 dark:invert dark:brightness-200" 
              />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic">
            {window.settings?.platformName?.slice(0, 5) || "SKILL"}<span className="text-indigo-600">{window.settings?.platformName?.slice(5) || "SWAP"}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{isAdminMode ? "Administrative Secure Gateway" : "Continue your learning journey"}</p>
        </div>

        <div className="flex bg-slate-200 dark:bg-white/5 p-1.5 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isAdminMode ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserIcon className="w-4 h-4" /> <span>Member</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAdminMode ? 'bg-white dark:bg-red-500 text-red-500 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="w-4 h-4" /> <span>Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm text-center font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 ${isAdminMode ? 'bg-red-500' : 'bg-indigo-600'} text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center group shadow-lg ${isAdminMode ? 'shadow-red-500/25' : 'shadow-indigo-500/25'} disabled:opacity-50`}
          >
            {isSubmitting ? "Signing In..." : (isAdminMode ? 'Authorize Command' : 'Sign In')}
            {!isSubmitting && (
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <span className="relative px-4 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                Or continue with
              </span>
            </div>

            <button
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/google`}
              className="w-full py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-xl shadow-slate-100 dark:shadow-none group"
            >
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" />
              </svg>
              Google
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
