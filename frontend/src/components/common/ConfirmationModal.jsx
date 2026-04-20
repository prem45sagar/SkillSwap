import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Decorative background */}
            <div
              className={`absolute -top-24 -right-24 w-48 h-48 blur-3xl rounded-full opacity-10 ${
                type === "danger"
                  ? "bg-red-500"
                  : type === "warning"
                    ? "bg-amber-500"
                    : "bg-indigo-500"
              }`}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-3 rounded-2xl ${
                    type === "danger"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : type === "warning"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">{message}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                    type === "danger"
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                      : type === "warning"
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-bold"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
