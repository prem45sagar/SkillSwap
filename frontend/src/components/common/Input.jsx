import React from "react";
import { cn } from "@/src/lib/utils";

export const Input = React.forwardRef(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-2xl py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all",
              icon ? "pl-12 pr-4" : "px-4",
              error ? "border-red-500/50 focus:ring-red-500/30" : "",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
      </div>
    );
  },
);
