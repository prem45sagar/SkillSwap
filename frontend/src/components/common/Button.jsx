import React from "react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20",
      secondary:
        "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-400 dark:border-white/10",
      outline:
        "bg-transparent border border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10",
      ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
      danger:
        "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </motion.button>
    );
  },
);
