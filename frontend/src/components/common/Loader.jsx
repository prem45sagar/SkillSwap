import { motion } from "motion/react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className="w-12 h-12 bg-indigo-600 shadow-lg shadow-indigo-500/40"
      />
    </div>
  );
}
