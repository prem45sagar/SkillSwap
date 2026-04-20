import { motion } from "motion/react";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export default function LegalPrivacy() {
  const sections = [
    {
      title: "Data We Collect",
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      content: "We collect information you provide directly to us when you create an account, such as your name, email address, and professional skills. We also collect data on your skill swaps and community interactions to improve our matching algorithms."
    },
    {
      title: "How We Use Data",
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      content: "Your data is used to facilitate skill exchanges, personalize your dashboard, and ensure a secure environment for all users. We never sell your personal information to third parties."
    },
    {
      title: "Security Measures",
      icon: <Lock className="w-5 h-5 text-pink-400" />,
      content: "We implement industry-standard encryption and security protocols to protect your data. This includes secure socket layer (SSL) technology and regular security audits of our platform infrastructure."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Prestige Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="mb-12 flex items-center space-x-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Gateway</span>
        </motion.button>

        <div className="text-center mb-20 text-left">
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8"
          >
            Trust & Transparency
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic mb-8">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium italic border-l-2 border-indigo-500/30 pl-6 max-w-2xl text-left">
            At SkillSwap, we believe your data is your own. Our policy is designed to protect your professional identity while enabling seamless global collaboration.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{section.title}</h2>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 text-center">
          <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">
            Last updated: April 20, 2026. For any privacy-related queries, please contact our legal team at <span className="text-indigo-400 font-bold">legal@skillswap.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
