import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  MessageSquare,
  Repeat,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const STEPS = [
  {
    title: "Define Your Expertise",
    description:
      "Start by listing the skills you've mastered and those you're eager to learn. Our AI uses this to find your perfect match.",
    icon: Search,
    color: "bg-indigo-500",
  },
  {
    title: "Connect with Experts",
    description:
      "Browse the network, send swap requests, and use our premium messaging to coordinate your learning sessions.",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    title: "Master New Skills",
    description:
      "Meet your partner, exchange knowledge, and grow together. Rate your experience to build your community reputation.",
    icon: Repeat,
    color: "bg-pink-500",
  },
];

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("skillswap_onboarding_seen");
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("skillswap_onboarding_seen", "true");
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 w-full max-w-sm"
        >
          <div className="relative p-8 rounded-[2.5rem] bg-white/90 dark:bg-slate-900/90 border border-slate-400 dark:border-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
            {/* Background Glow */}
            <div
              className={cn(
                "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 transition-colors duration-500",
                STEPS[currentStep].color,
              )}
            />

            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 p-2 text-black dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-6">
                <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  Quick Guide
                </span>
                <span className="text-[10px] text-black dark:text-slate-500 font-bold">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>

              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors duration-500",
                    STEPS[currentStep].color,
                  )}
                >
                  {(() => {
                    const Icon = STEPS[currentStep].icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">
                  {STEPS[currentStep].title}
                </h3>
                <p className="text-sm text-black dark:text-slate-400 leading-relaxed">
                  {STEPS[currentStep].description}
                </p>
              </motion.div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex space-x-1">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentStep
                          ? "w-6 bg-indigo-500"
                          : "w-2 bg-black/10 dark:bg-white/10",
                      )}
                    />
                  ))}
                </div>

                <div className="flex space-x-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-black dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-slate-400 dark:border-white/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-500/20"
                  >
                    {currentStep === STEPS.length - 1 ? (
                      <>
                        Got it!
                        <CheckCircle2 className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
