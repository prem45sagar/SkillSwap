import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { X, Send, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { swapService } from "@/src/services/swapService";
import { useAuth } from "@/src/context/AuthContext";
import { skillService } from "@/src/services/skillService";

export default function SwapRequestModal({
  isOpen,
  onClose,
  expertId,
  expertName,
  expertSkill,
  receiverSkillId,
}) {
  const { user } = useAuth();
  const [step, setStep] = useState("form");
  const [error, setError] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [formData, setFormData] = useState({
    desiredSkill: "",
    offeredSkillId: "",
    message: "",
  });

  // Sync formData with props when they change
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        desiredSkill: expertSkill || "",
      }));
    }
  }, [isOpen, expertSkill]);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch current user's skills to offer in exchange
      skillService.getSkills().then(allSkills => {
        const mySkills = allSkills.filter(s => s.owner?._id === user._id || s.owner === user._id);
        setUserSkills(mySkills);
        if (mySkills.length > 0) {
          setFormData(prev => ({ ...prev, offeredSkillId: mySkills[0]._id }));
        }
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.offeredSkillId) {
      setError("Please select a skill to offer in exchange.");
      return;
    }

    setStep("loading");
    setError(null);
    try {
      await swapService.createSwapRequest({
        receiverId: expertId,
        receiverSkillId: receiverSkillId,
        senderSkillId: formData.offeredSkillId,
        message: formData.message
      });
      setStep("success");
    } catch (err) {
      console.error("Failed to send swap request:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep("form");
      setFormData({ desiredSkill: expertSkill, offeredSkillId: "", message: "" });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-indigo-500/20 blur-3xl rounded-full" />

            <div className="relative p-8 sm:p-10">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-black dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {step === "form" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Skill Swap Request
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight">
                      Connect with{" "}
                      <span className="text-indigo-400">{expertName}</span>
                    </h2>
                    <p className="text-black dark:text-slate-400 mt-2 text-sm">
                      Propose a fair exchange of knowledge and grow together.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Desired Skill
                        </label>
                        <input
                          type="text"
                          value={formData.desiredSkill}
                          readOnly
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 px-5 text-indigo-600 dark:text-indigo-400 font-bold cursor-not-allowed focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          What you offer in exchange
                        </label>
                        {userSkills.length > 0 ? (
                          <div className="relative group">
                            <select
                              required
                              value={formData.offeredSkillId}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  offeredSkillId: e.target.value,
                                })
                              }
                              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                              {userSkills.map((s) => (
                                <option key={s._id} value={s._id} className="dark:bg-slate-900">
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
                            You haven't listed any skills yet. 
                            <Link to="/search?share=true" className="block mt-1 font-bold underline text-indigo-500">Add a skill to your profile first</Link>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Personal Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Introduce yourself and explain why you'd like to swap skills..."
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 px-5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 group"
                    >
                      <span>Send Swap Request</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === "loading" && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Sending Request...
                    </h3>
                    <p className="text-black dark:text-slate-400 text-sm">
                      Encrypting your proposal and notifying {expertName}.
                    </p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-black dark:text-white">
                      Request Sent!
                    </h3>
                    <p className="text-black dark:text-slate-400 max-w-xs mx-auto">
                      Your proposal has been delivered to{" "}
                      <span className="text-black dark:text-white font-medium">
                        {expertName}
                      </span>
                      . You'll be notified once they respond.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-xl text-black dark:text-white font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  >
                    Close Window
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
