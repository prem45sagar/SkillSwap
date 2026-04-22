import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Send, Loader2, CheckCircle2, Globe, Calendar, Zap, BookOpen } from "lucide-react";
import { skillService } from "@/src/services/skillService";
import { cn } from "@/src/lib/utils";

const CATEGORIES = ["Development", "Design", "Marketing", "Business", "Lifestyle", "Music", "Language"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Hindi", "Arabic", "Portuguese", "Russian", "Japanese", "Turkish", "Italian"];

export default function ShareSkillModal({ isOpen, onClose, onSkillAdded, editData = null, isRepost = false }) {
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: "",
    category: "Development",
    description: "",
    languages: [],
    duration: 7,
    durationUnit: "days",
    startDate: today,
    endDate: "",
    desiredSkill: "",
    criteria: ""
  });

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        name: editData.name || "",
        category: editData.category || "Development",
        description: editData.description || "",
        languages: editData.languages || [],
        duration: editData.duration || 7,
        durationUnit: editData.durationUnit || "days",
        startDate: isRepost ? today : (editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : today),
        endDate: editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : "",
        desiredSkill: editData.desiredSkill || "",
        criteria: editData.criteria || ""
      });
    }
  }, [editData, isRepost, today, isOpen]);

  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      if (formData.durationUnit === "minutes") {
        // For minutes, the end date is essentially the same day in the calendar view
        setFormData(prev => ({ ...prev, endDate: formData.startDate }));
      } else {
        end.setDate(start.getDate() + parseInt(formData.duration));
        setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
      }
    }
  }, [formData.startDate, formData.duration, formData.durationUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submissionData = {
      ...formData,
      status: isRepost ? "open" : (editData?.status || "open")
    };

    try {
      if (isRepost) {
        await skillService.repostSkill(editData._id, submissionData);
      } else if (editData) {
        await skillService.updateSkill(editData._id, submissionData);
      } else {
        await skillService.addSkill(submissionData);
      }
      setStep("success");
      if (onSkillAdded) onSkillAdded();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save skill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setFormData({
        name: "",
        category: "Development",
        description: "",
        languages: [],
        duration: 7,
        startDate: today,
        endDate: "",
        desiredSkill: "",
        criteria: ""
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10 overflow-y-auto overflow-x-hidden">
              {step === "form" ? (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                        {isRepost ? "Repost Completed Skill" : editData ? "Edit Your Skill" : "Share Your Expertise"}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {isRepost ? "Refresh Your Listing" : editData ? "Update Details" : "What do you want to teach?"}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                          Skill Name
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Master React Hooks"
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                        <Globe className="w-3 h-3 mr-2 text-indigo-500" />
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2 p-4 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                              formData.languages.includes(lang)
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                : "bg-white/5 border-slate-300 dark:border-white/10 text-slate-500 hover:border-indigo-500/30 dark:hover:border-white/30"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                        Description
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe what you can teach..."
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                          <Zap className="w-3 h-3 mr-2 text-amber-500" />
                          Duration ({formData.durationUnit === 'days' ? 'Days' : 'Mins'})
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                          />
                          <select
                            value={formData.durationUnit}
                            onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                            className="w-32 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-xs uppercase cursor-pointer"
                          >
                            <option value="days">Days</option>
                            <option value="minutes">Mins</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                          <BookOpen className="w-3 h-3 mr-2 text-indigo-500" />
                          Skill I Want to Learn
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.desiredSkill}
                          onChange={(e) => setFormData({...formData, desiredSkill: e.target.value})}
                          placeholder="e.g. Swift Design"
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                         <Sparkles className="w-3 h-3 mr-2 text-indigo-500" />
                         Target Audience / Criteria
                       </label>
                       <input
                         type="text"
                         value={formData.criteria}
                         onChange={(e) => setFormData({...formData, criteria: e.target.value})}
                         placeholder="e.g. 10th, 12th, UG, PG, BTech students"
                         className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                       />
                     </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-2 text-indigo-400" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          required
                          min={today}
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-2 text-slate-500" />
                          End Date (Auto)
                        </label>
                        <input
                          type="date"
                          disabled
                          value={formData.endDate}
                          className="w-full bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-500 dark:text-slate-500 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>{isRepost ? "Confirm & Repost" : editData ? "Save Changes" : "Share Skill Now"}</span>
                          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {isRepost ? "Successfully Reposted!" : editData ? "Changes Saved!" : "Skill Listed!"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                      {isRepost 
                        ? "Your skill has been updated and relisted as open for new swaps."
                        : editData 
                        ? "Your changes have been applied successfully."
                        : "Your expertise is now live in the network. Other users can now find you and send swap requests."}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-slate-900 dark:bg-white/5 border border-slate-700 dark:border-white/10 rounded-xl text-white font-bold hover:bg-black dark:hover:bg-white/10 transition-all shadow-lg shadow-black/20"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
