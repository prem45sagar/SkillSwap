import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const data = await register(name, email, password);
      setSuccess(
        data.message ||
        "Registration successful! Please check your email to verify your account.",
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden group/logo">
              <img 
                src="/assets/logo.png" 
                alt="SkillSwap" 
                className="w-12 h-12 invert brightness-200 group-hover/logo:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic">
            {window.settings?.platformName?.slice(0, 5) || "SKILL"}<span className="text-indigo-600">{window.settings?.platformName?.slice(5) || "SWAP"}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Join the future of skill exchange</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center group shadow-lg shadow-indigo-500/25"
          >
            Create Account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-400 dark:border-white/10"></div>
            </div>
            <span className="relative px-4 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Or sign up with
            </span>
          </div>

          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/google`}
            className="w-full py-4 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"
              />
            </svg>
            Google
          </button>
        </div>

        <p className="mt-8 text-center text-slate-900 dark:text-slate-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
