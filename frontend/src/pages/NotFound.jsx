import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-9xl font-black text-slate-900 dark:text-white/10 mb-8"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-slate-900 dark:text-slate-400 mb-10 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved to
          another dimension.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-500/20"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-400 dark:border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
