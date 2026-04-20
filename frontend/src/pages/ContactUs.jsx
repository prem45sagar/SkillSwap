import { motion } from "motion/react";
import { Mail, MessageSquare, Globe, Send, ArrowRight } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Prestige Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="mb-12 flex items-center space-x-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
            <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Gateway</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8 w-fit"
            >
              Get In Touch
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic mb-8">
              Connect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">With Us</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium italic border-l-2 border-indigo-500/30 pl-6 mb-12 max-w-md">
              Need assistance or want to propose a partnership? Our elite support team is ready to assist you.
            </p>

            <div className="space-y-6">
              {[
                { icon: <Mail className="w-5 h-5" />, label: "Email", value: "hello@skillswap.com" },
                { icon: <MessageSquare className="w-5 h-5" />, label: "Community", value: "discord.gg/skillswap" },
                { icon: <Globe className="w-5 h-5" />, label: "Global", value: "Remote First Office" }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all w-fit pr-10">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>
                    <div className="text-white font-bold">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 md:p-14 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl"
          >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  rows="5"
                  placeholder="How can we help your mastery journey?"
                  className="w-full px-6 py-4 rounded-3xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center group"
              >
                Send Message
                <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
