import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Administrative Authorization failed");
      }

      // Save admin info to local storage
      localStorage.setItem("adminData", JSON.stringify(data));
      
      // Navigate to admin dashboard (to be created)
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#020617] overflow-hidden relative">
      {/* Strategic Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 md:p-12 rounded-[3.5rem] bg-slate-950/60 border border-white/10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
          
          <div className="text-center mb-10">
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative group"
            >
               <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl opacity-50" />
               <img src="/assets/logo.png" alt="SkillSwap" className="w-14 h-14 invert brightness-200 relative z-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none">
                Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-400">Portal</span>
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-3 h-3 text-red-500" />
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em]">Administrative Authority Only</p>
                <Sparkles className="w-3 h-3 text-red-500" />
              </div>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center space-x-3 text-red-400 text-[10px] font-black uppercase tracking-[0.1em] leading-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">
                Admin Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-red-400 transition-all duration-300" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-16 pr-6 py-5 bg-white/[0.03] border border-white/5 rounded-3xl text-white placeholder:text-slate-800 focus:border-red-500/50 focus:bg-white/[0.05] outline-none transition-all duration-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">
                Secret Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-red-400 transition-all duration-300" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-6 py-5 bg-white/[0.03] border border-white/5 rounded-3xl text-white placeholder:text-slate-800 focus:border-red-500/50 focus:bg-white/[0.05] outline-none transition-all duration-500 font-medium"
                />
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(220,38,38,0.2)] disabled:opacity-50 flex items-center justify-center group"
            >
              <ShieldCheck className="mr-3 w-5 h-5" />
              {isSubmitting ? "Verifying..." : "Initialize Command"}
              {!isSubmitting && <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <p className="mt-10 text-center text-slate-700 text-[9px] font-bold uppercase tracking-[0.3em]">
            SkillSwap Central Governance · 2026
          </p>
        </div>

        <div className="mt-8 text-center">
            <button onClick={() => navigate("/")} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-colors">
              Return to Platform
            </button>
        </div>
      </motion.div>
    </div>
  );
}
