import { motion } from "motion/react";
import { Gavel, Users, Scale, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      title: "User Conduct",
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      content: "All interactions on SkillSwap must be professional and respectful. Users are expected to honor their swap commitments and provide high-quality teaching to their partners."
    },
    {
      title: "Skill Exchange",
      icon: <Scale className="w-5 h-5 text-purple-400" />,
      content: "SkillSwap is a direct-exchange platform. No monetary payments should be requested for skill swaps. The platform is built on the principle of mutual knowledge sharing."
    },
    {
      title: "Content Rights",
      icon: <Gavel className="w-5 h-5 text-pink-400" />,
      content: "You retain ownership of the content you share, but you grant SkillSwap a license to use that content to operate and improve the platform services."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4 relative">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Prestige Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="mb-12 flex items-center space-x-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600 transition-all">
            <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Gateway</span>
        </motion.button>
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8"
          >
            Community Standards
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic mb-8">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Service</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium italic border-l-2 border-purple-500/30 pl-6 max-w-2xl mx-auto text-left">
            By joining the SkillSwap network, you agree to uphold our values of integrity, expertise sharing, and professional growth.
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
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
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

        <div className="mt-20 p-10 rounded-[3rem] bg-pink-600/10 border border-pink-500/20 flex items-center space-x-6">
          <AlertCircle className="w-8 h-8 text-pink-400 flex-shrink-0" />
          <p className="text-slate-300 font-medium text-sm text-left">
            Failure to adhere to these terms may result in account review or suspension. We reserve the right to modify these terms as our community evolves.
          </p>
        </div>
      </div>
    </div>
  );
}
