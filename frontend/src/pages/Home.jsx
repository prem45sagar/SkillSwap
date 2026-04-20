import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Sparkles,
  Users,
  MessageSquare,
  Repeat,
  Star,
  TrendingUp,
  Search,
  Box,
  Code,
  Palette,
  Megaphone,
  Briefcase,
  Heart,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/src/lib/utils";
import SkillModelViewer from "@/src/components/common/SkillModelViewer";
import OnboardingTutorial from "@/src/components/common/OnboardingTutorial";
import { useTheme } from "@/src/context/ThemeContext";

import { useState, useEffect } from "react";
import { skillService } from "@/src/services/skillService";
import { swapService } from "@/src/services/swapService";
import { useAuth } from "@/src/context/AuthContext";

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [featuredExperts, setFeaturedExperts] = useState([
    { name: "Sarah Jensen", skill: "UI Architecture", swaps: 124, stars: 5.0, color: "#6366f1" },
    { name: "David Chen", skill: "Scalable Node.js", swaps: 98, stars: 4.9, color: "#a855f7" },
    { name: "Marcus Thorne", skill: "Cyber Security", swaps: 85, stars: 4.8, color: "#ec4899" },
    { name: "Julia Kim", skill: "Strategic Marketing", swaps: 72, stars: 5.0, color: "#10b981" }
  ]);
  const [recentSwaps, setRecentSwaps] = useState([
    { user1: "Sarah Jensen", user2: "David Chen", skill1: "UI Architecture", skill2: "Scalable Node.js", time: "2m ago" },
    { user1: "Marcus Thorne", user2: "Julia Kim", skill1: "Cyber Security", skill2: "Strategic Marketing", time: "15m ago" },
    { user1: "Elena Rossi", user2: "Liam Smith", skill1: "Data Science", skill2: "Product Leadership", time: "1h ago" },
    { user1: "Aarav Sharma", user2: "Sophie Brown", skill1: "Python Dev", skill2: "UX Research", time: "3h ago" }
  ]);
  const containerRef = useRef(null);

  const [dbStats, setDbStats] = useState([
    { label: "Active Users", value: "2.4k+", icon: Users },
    { label: "Skills Shared", value: "850+", icon: Zap },
    { label: "Successful Swaps", value: "1.2k+", icon: Repeat },
    { label: "Countries", value: "48", icon: Globe },
  ]);

  const [popularCategories, setPopularCategories] = useState([
    { name: "Development", icon: Code, count: "240+", color: "from-blue-500 to-cyan-500" },
    { name: "Design", icon: Palette, count: "180+", color: "from-purple-500 to-pink-500" },
    { name: "Marketing", icon: Megaphone, count: "120+", color: "from-orange-400 to-red-500" },
    { name: "Business", icon: Briefcase, count: "95+", color: "from-indigo-500 to-blue-600" },
    { name: "Lifestyle", icon: Heart, count: "150+", color: "from-rose-400 to-pink-500" },
  ]);

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How does SkillSwap work?",
      answer: "SkillSwap connects you with experts globally. You list skills you can teach and skills you want to learn. Our AI matches you with partners for a direct knowledge exchange."
    },
    {
      question: "Is it free to swap skills?",
      answer: "Yes! SkillSwap is built on the principle of direct exchange. You trade your expertise for someone else's, making learning high-quality and free of charge."
    },
    {
      question: "How do I find the right learning partner?",
      answer: "You can use our 'Explore' section to search by categories or specific skills. Our community ratings and 'Top Experts' list help you identify trustworthy mentors."
    },
    {
      question: "Can I teach multiple skills at once?",
      answer: "Absolutely. You can list as many skills as you are proficient in. Your profile card will highlight your top expertise to attract the best matches."
    }
  ];

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const skills = await skillService.getSkills();
      const swaps = await swapService.getSwapRequests();

      const counts = {};
      skills.forEach(s => {
        if (s.category) counts[s.category] = (counts[s.category] || 0) + 1;
      });

      setPopularCategories(prev => prev.map(c => ({
        ...c,
        count: counts[c.name] ? `${counts[c.name]}+` : "0"
      })));

      const experts = skills.slice(0, 5).map(s => ({
        id: s._id,
        name: s.owner?.name || "Expert",
        stars: 5.0,
        swaps: Math.floor(Math.random() * 100) + 10,
        color: ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"][Math.floor(Math.random() * 5)],
        skill: s.name
      }));
      setFeaturedExperts(experts);

      const mappedSwaps = swaps.slice(0, 4).map(s => ({
        user1: s.sender?.name || "User",
        user2: s.receiver?.name || "Peer",
        skill1: s.senderSkill?.name || (typeof s.senderSkill === 'string' ? s.senderSkill : "Skill A"),
        skill2: s.receiverSkill?.name || (typeof s.receiverSkill === 'string' ? s.receiverSkill : "Skill B"),
        time: "Recently"
      }));
      setRecentSwaps(mappedSwaps);

      // Update DB Stats
      const uniqueUsers = new Set(skills.map(s => s.owner?._id).filter(Boolean));
      if (user?._id) uniqueUsers.add(user._id);

      setDbStats([
        { label: "Active Users", value: `${uniqueUsers.size}`, icon: Users },
        { label: "Skills Shared", value: `${skills.length}`, icon: Zap },
        { label: "Successful Swaps", value: `${swaps.filter(s => s.status === 'completed').length}`, icon: Repeat },
        { label: "Countries", value: "1", icon: Globe },
      ]);
    } catch (err) {
      console.error("Failed to fetch home data:", err);
    }
  };
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0, 0.3], [50, -50]);
  const worksY = useTransform(scrollYProgress, [0.1, 0.4], [100, -100]);
  const viewerY = useTransform(scrollYProgress, [0.2, 0.5], [150, -150]);

  const dataY = useTransform(scrollYProgress, [0.3, 0.6], [150, -150]);
  const feedY = useTransform(scrollYProgress, [0.5, 0.8], [100, -100]);

  const bgCircle1Y = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const bgCircle2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const bgCircle3Y = useTransform(scrollYProgress, [0, 1], [0, -800]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen pt-16 overflow-x-hidden"
    >
      <OnboardingTutorial />

      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: bgCircle1Y }}
        className="absolute top-[10%] -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        style={{ y: bgCircle2Y }}
        className="absolute top-[40%] -right-20 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        style={{ y: bgCircle3Y }}
        className="absolute top-[70%] left-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >

            <h1 className="text-5xl md:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Swap Skills, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Unlock Potential
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-900 dark:text-slate-400 mb-10 leading-relaxed">
              SkillSwap is a immersive platform where knowledge is the currency.
              Connect with global experts, trade your expertise, and master new
              crafts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center shadow-2xl shadow-indigo-500/40"
              >
                Start Swapping Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/search"
                className="px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-400 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Explore the Network
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Popular Categories */}
      <motion.section className="relative z-10 py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 italic">
            Trending Hubs
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Explore the most sought-after expertise areas.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {popularCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -10 }}
              className={cn(
                "p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-sm relative overflow-hidden group cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br opacity-20 blur-3xl group-hover:opacity-40 transition-opacity rounded-full",
                  cat.color,
                )}
              />
              <cat.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-6 relative z-10" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest relative z-10">
                {cat.count} Active Skills
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        style={{ y: statsY }}
        className="relative z-10 py-20 bg-slate-100 dark:bg-white/5 dark:backdrop-blur-sm border-y border-slate-400 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {dbStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-900 dark:text-slate-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        style={{ y: worksY }}
        className="relative z-10 py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-slate-900 dark:text-slate-400 max-w-xl mx-auto">
            Three simple steps to start your learning journey with SkillSwap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Create Your Profile",
              desc: "List the skills you have and the ones you want to learn. Our AI matches you with the right partners.",
              icon: Search,
            },
            {
              step: "02",
              title: "Connect & Chat",
              desc: "Send swap requests and use our premium messaging system to discuss goals and schedules.",
              icon: MessageSquare,
            },
            {
              step: "03",
              title: "Swap & Grow",
              desc: "Meet virtually or in-person to exchange knowledge. Rate your experience and build your reputation.",
              icon: Repeat,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-[3rem] bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-md group hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-500/40 group-hover:rotate-12 transition-transform">
                {item.step}
              </div>
              <item.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-8 mt-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {item.title}
              </h3>
              <p className="text-slate-900 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Skill Journey Path Section */}
      <section className="relative z-10 py-24 md:py-40 overflow-hidden bg-[#020617]">
        {/* Advanced Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 md:mb-32">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block"
            >
              The Mastery Path
            </motion.span>
            <h2 className="text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 uppercase tracking-tighter italic leading-none">
              Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Knowledge</span> Flow
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm md:text-lg leading-relaxed opacity-80 px-4">
              Explore a seamless network of global expertise. Connect with masters and transcend boundaries.
            </p>
          </div>

          {/* Desktop Journey (Curved) */}
          <div className="hidden md:flex relative h-[600px] items-center justify-center">
            <svg className="absolute w-full h-full max-w-[1400px] pointer-events-none overflow-visible" viewBox="0 0 1200 600" fill="none">
              <defs>
                <path
                  id="silkPath"
                  d="M50 500 C 200 500, 100 100, 300 100 C 500 100, 400 500, 600 500 C 800 500, 700 100, 900 100 C 1100 100, 1000 500, 1150 400"
                />
                <linearGradient id="silkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <filter id="neonBlur">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <use href="#silkPath" stroke="rgba(255,255,255,0.03)" strokeWidth="6" strokeLinecap="round" />
              <use href="#silkPath" stroke="url(#silkGradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 20" />
              <motion.path
                d="M50 500 C 200 500, 100 100, 300 100 C 500 100, 400 500, 600 500 C 800 500, 700 100, 900 100 C 1100 100, 1000 500, 1150 400"
                stroke="#818cf8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="50 150"
                animate={{ strokeDashoffset: [0, -400] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                filter="url(#neonBlur)"
              />
            </svg>

            <div className="absolute w-full h-full max-w-7xl">
              {[
                { name: "React JS", x: "4.1%", y: "83.3%", color: "text-blue-400" },
                { name: "Node JS", x: "16.6%", y: "50.0%", color: "text-green-400" },
                { name: "TypeScript", x: "25.0%", y: "16.6%", color: "text-blue-500" },
                { name: "Next JS", x: "37.5%", y: "50.0%", color: "text-slate-200" },
                { name: "Tailwind UI", x: "50.0%", y: "83.3%", color: "text-cyan-400" },
                { name: "Express", x: "62.5%", y: "50.0%", color: "text-slate-400" },
                { name: "MongoDB", x: "75.0%", y: "16.6%", color: "text-emerald-400" },
                { name: "Amazon AWS", x: "87.5%", y: "45.0%", color: "text-orange-400" },
                { name: "Docker", x: "95.8%", y: "66.6%", color: "text-blue-400" },
              ].map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{ left: skill.x, top: skill.y }}
                  className="absolute pointer-events-auto z-20"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center space-x-3 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={cn("w-2 h-2 rounded-full", skill.color.replace('text', 'bg'))} />
                    <span className={cn("text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap", skill.color)}>
                      {skill.name}
                    </span>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Journey (Vertical Timeline) */}
          <div className="md:hidden relative flex flex-col items-center space-y-12 py-10">
            {/* Background Moving Line for mobile */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
            <motion.div
              animate={{ y: [0, 1000] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 top-0 w-px h-20 bg-gradient-to-b from-transparent via-indigo-500 to-transparent -translate-x-1/2"
            />

            {[
              { name: "React JS", color: "text-blue-400" },
              { name: "Node JS", color: "text-green-400" },
              { name: "TypeScript", color: "text-blue-500" },
              { name: "Next JS", color: "text-slate-200" },
              { name: "Tailwind UI", color: "text-cyan-400" },
              { name: "Express", color: "text-slate-400" },
              { name: "MongoDB", color: "text-emerald-400" },
              { name: "Amazon AWS", color: "text-orange-400" },
              { name: "Docker", color: "text-blue-400" },
            ].map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10 w-full flex items-center justify-center"
              >
                <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl flex items-center space-x-3 w-[200px] justify-center">
                  <div className={cn("w-1.5 h-1.5 rounded-full", skill.color.replace('text', 'bg'))} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", skill.color)}>
                    {skill.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Swap Impact Highlights (Liquid Silicon Final) */}
      <section className="relative z-10 pt-32 pb-64 overflow-hidden bg-[#020617] border-b border-white/5">
        {/* Dynamic Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 relative">
             {/* Huge Ghost Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-white/[0.01] uppercase pointer-events-none select-none tracking-widest">
              Nexus
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic">
                Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Exchanges</span>
              </h2>
              <div className="mt-8 flex items-center justify-center space-x-4">
                <div className="h-px w-12 bg-white/10" />
                <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.6em] italic">
                  Knowledge Liquidity
                </p>
                <div className="h-px w-12 bg-white/10" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 relative">
            {[
              {
                p1: "Alex Rivers", s1: "UI Architecture",
                p2: "Satoshi N.", s2: "Node.js Core",
                color: "#6366f1"
              },
              {
                p1: "Elena Rossi", s1: "Product Design",
                p2: "Marcus Thorne", s2: "Cybersecurity",
                color: "#a855f7"
              },
              {
                p1: "Julia Kim", s1: "Brand Strategy",
                p2: "Liam Smith", s2: "Data Analytics",
                color: "#ec4899"
              }
            ].map((swap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-14 rounded-[5rem] bg-[#0f172a]/40 border border-white/5 backdrop-blur-3xl group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                  {/* Participant 1 */}
                  <div className="flex-1 flex items-center space-x-10 p-4 md:p-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl font-black text-white relative z-10">
                        {swap.p1[0]}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">{swap.p1}</h4>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 italic flex items-center">
                        <TrendingUp className="w-3 h-3 mr-2" />
                        Mastered {swap.s1}
                      </div>
                    </div>
                  </div>

                  {/* The Silk Connection */}
                  <div className="flex-[0.6] flex flex-col items-center justify-center relative py-12 md:py-0 w-full md:w-auto">
                    <svg className="w-full h-12" viewBox="0 0 200 40">
                      <motion.path
                        d="M0 20 Q 100 0, 200 20"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <motion.path
                        d="M0 20 Q 100 0, 200 20"
                        stroke={swap.color}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="15 185"
                        animate={{ strokeDashoffset: [200, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        filter="drop-shadow(0 0 8px rgba(99,102,241,0.5))"
                      />
                    </svg>
                    <div className="w-14 h-14 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-white relative z-10 -mt-6 shadow-2xl group-hover:scale-110 transition-all duration-500">
                       <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-0 group-hover:opacity-100" />
                       <Repeat className="w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </div>

                  {/* Participant 2 */}
                  <div className="flex-1 flex items-center space-x-10 md:flex-row-reverse md:space-x-reverse p-4 md:p-0">
                     <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl font-black text-white relative z-10">
                        {swap.p2[0]}
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">{swap.p2}</h4>
                      <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-2 italic flex items-center md:flex-row-reverse md:space-x-reverse">
                        <Sparkles className="w-3 h-3 md:ml-2 mr-2 md:mr-0" />
                        Mastered {swap.s2}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
             <Link
              to="/search"
              className="group relative px-10 py-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden inline-flex items-center space-x-4 backdrop-blur-md hover:border-indigo-500/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/10 to-indigo-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-[0.5em] italic">Explore The Network</span>
              <ArrowRight className="relative z-10 w-4 h-4 text-indigo-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <motion.section
        style={{ y: dataY }}
        className="relative z-10 py-32 bg-indigo-600/5 border-y border-slate-400 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
                Top Rated Experts
              </h2>
              <p className="text-slate-900 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                Our community is built on trust. These are some of our most
                active members who have consistently provided high-quality skill
                exchanges.
              </p>
              <div className="space-y-6">
                {featuredExperts.length > 0 ? (
                  featuredExperts.slice(0, 3).map((expert, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/5"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {expert.name[0]}
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white font-bold">
                            {expert.name}
                          </div>
                          <div className="text-xs text-slate-900 dark:text-slate-500">
                            Expert in {expert.skill} • {expert.swaps} swaps
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500 dark:text-amber-400 font-bold">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {expert.stars}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No experts found yet.</p>
                )}
              </div>
            </div>
            <div className="h-[400px] p-8 rounded-[3rem] bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Swap Activity by Expert
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featuredExperts}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#ffffff10" : "#00000010"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                      borderColor: theme === "dark" ? "#ffffff20" : "#00000010",
                      borderRadius: "16px",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                    itemStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
                  />

                  <Bar dataKey="swaps" radius={[8, 8, 0, 0]}>
                    {featuredExperts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Live Feed & Messaging Preview */}
      <motion.section
        style={{ y: feedY }}
        className="relative z-10 py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Live Feed */}
          <div className="p-10 rounded-[3rem] bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-md">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
              <Repeat className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
              Live Swap Feed
            </h3>
            <div className="space-y-6">
              {recentSwaps.length > 0 ? (
                recentSwaps.map((swap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                          {swap.user1[0]}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                          {swap.user2[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {swap.user1} ↔ {swap.user2}
                        </div>
                        <div className="text-xs text-slate-900 dark:text-slate-400">
                          {swap.skill1} for {swap.skill2}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-900 dark:text-slate-400 font-medium uppercase tracking-widest">
                      {swap.time}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 italic">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Messaging Preview */}
          <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h3 className="text-2xl font-bold mb-8 flex items-center relative z-10">
              <MessageSquare className="w-6 h-6 mr-3" />
              Premium Messaging
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className="text-sm">
                  Hey! I saw you're an expert in React. Would you be interested
                  in swapping for some UI Design tips?
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                <p className="text-sm">
                  Absolutely! I've been looking to improve my design skills.
                  When are you free to chat?
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className="text-sm">
                  How about tomorrow at 6 PM? We can use the built-in video
                  call!
                </p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
              <p className="text-indigo-100 text-sm italic">
                "The built-in chat makes it so easy to coordinate. I learned
                more in one hour than in a whole month of tutorials!"
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-white/20" />
                <span className="text-xs font-bold">
                  - David, Frontend Developer
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
            Frequently Asked <span className="text-indigo-600">Questions</span>
          </h2>
          <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="group rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:border-indigo-500/30"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 sm:p-8 text-left transition-all"
              >
                <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {faq.question}
                </span>
                <div className={cn(
                  "p-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all",
                  openFaq === i ? "rotate-180 bg-indigo-600 border-indigo-600 text-white" : "text-slate-500"
                )}>
                  {openFaq === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>

              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-8 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>


      </section>

      {/* Recruitment CTA Section */}
      <section className="relative z-10 py-32 bg-slate-100 dark:bg-[#020617] overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-600/[0.02] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">unlock</span><br />
              your <span className="italic">Professional Potential?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 font-medium">
              Start your SkillSwap journey now and master new crafts.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-orange-500/30 active:scale-95 group"
            >
              Sign Up for Free
              <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Previous Final CTA - Optional to remove or keep, but user asked for "below वाला भी" from image */}
      {/* I will keep the previous one but modify it to be less redundant or remove it if it clashes */}

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-400 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/" className="flex items-center group">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden relative shadow-2xl group">
              <img 
                src="/assets/logo.png" 
                alt="SkillSwap Prestige Logo" 
                className="h-10 w-auto invert brightness-200 group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </Link>
          <div className="flex space-x-8 text-sm text-slate-900 dark:text-slate-500">
            <Link
              to="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-600">
            © 2026 SkillSwap. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
