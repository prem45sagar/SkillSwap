import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import {
  Mail,
  Linkedin,
  Award,
  BookOpen,
  Star,
  RotateCw,
  Globe,
  Briefcase,
  UserRound,
  Trophy,
  Lock,
  MessageSquare,
  Zap,
  GraduationCap,
  Milestone
} from "lucide-react";
import { BADGES } from "@/src/constants/badges";

import Avatar3DViewer from "@/src/components/profile/Avatar3DViewer";
import { cn } from "@/src/lib/utils";

import leetcodeIcon from "@/src/assets/platforms/leetcode.svg";
import codeforcesIcon from "@/src/assets/platforms/codeforces.svg";
import codechefIcon from "@/src/assets/platforms/codechef.png";
import gfgIcon from "@/src/assets/platforms/geeksforgeeks.svg";
import hackerrankIcon from "@/src/assets/platforms/hackerrank.svg";
import interviewbitIcon from "@/src/assets/platforms/interviewbit.png";
import codingninjasIcon from "@/src/assets/platforms/codingninjas.svg";
import atcoderIcon from "@/src/assets/platforms/atcoder.svg";
import githubIcon from "@/src/assets/platforms/github.svg";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [is3DMode, setIs3DMode] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    refreshUser();
  }, []);

  const toggleAvatarMode = () => {
    setIs3DMode(!is3DMode);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 backdrop-blur-sm text-center relative overflow-hidden group shadow-xl"
          >
            {/* Background Decorative Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />

            <div className="relative inline-block mb-6 w-full text-center">
              <div 
                className="relative mx-auto w-48 h-48 cursor-pointer group/avatar-container"
                onClick={toggleAvatarMode}
              >
                {/* Floating Toggle Hint */}
                <div className="absolute -top-2 -right-2 z-20 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-full text-[10px] font-bold text-indigo-500 shadow-lg opacity-0 group-hover/avatar-container:opacity-100 transition-opacity whitespace-nowrap">
                  Click for {is3DMode ? "Photo" : "3D View"}
                </div>

                <AnimatePresence mode="wait">
                  {!is3DMode ? (
                    <motion.div
                      key="2d"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", damping: 20, stiffness: 100 }}
                      className="w-full h-full rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-indigo-500/40 overflow-hidden group relative border-2 border-slate-400 dark:border-white/10 transition-all duration-500"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user?.name?.[0] || 'U'
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="3d"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", damping: 20, stiffness: 100 }}
                      className="w-full h-full rounded-3xl bg-white dark:bg-slate-900/50 border-2 border-indigo-500/30 overflow-hidden shadow-2xl shadow-indigo-500/20 pointer-events-none"
                    >
                      <Avatar3DViewer
                        model={user?.avatar3d?.model || "cube"}
                        color={user?.avatar3d?.color || "#6366f1"}
                        rotation={user?.avatar3d?.rotation || 0}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
              {user?.name}
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-3">
               <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                {user?.title || "SkillSwap Member"}
              </p>
            </div>
            <p className="text-slate-500 dark:text-slate-500 text-xs mb-4 leading-relaxed px-2 line-clamp-2 italic">
              "{user?.bio || "Passionate skill swapper and community member."}"
            </p>

            {/* Followers/Following Stats */}
            <div className="flex justify-center space-x-8 mb-6 pt-4 border-t border-slate-400 dark:border-white/5 w-full">
              <div className="text-center group cursor-pointer transition-all">
                <div className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {user?.followers?.length || 0}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">Followers</div>
              </div>
              <div className="text-center group cursor-pointer transition-all">
                <div className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {user?.following?.length || 0}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">Following</div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 mb-8 flex-wrap gap-y-3">
              {[
                { key: "github", icon: githubIcon, url: user?.platforms?.github?.username ? `https://github.com/${user.platforms.github.username}` : user?.links?.github, isLogo: true, invert: true },
                { key: "linkedin", icon: Linkedin, url: user?.links?.linkedin },
                { key: "leetcode", icon: leetcodeIcon, url: user?.platforms?.leetcode?.username ? `https://leetcode.com/u/${user.platforms.leetcode.username}` : user?.links?.leetcode, isLogo: true },
                { key: "codechef", icon: codechefIcon, url: user?.platforms?.codechef?.username ? `https://www.codechef.com/users/${user.platforms.codechef.username}` : user?.links?.codechef, isLogo: true },
                { key: "codeforces", icon: codeforcesIcon, url: user?.platforms?.codeforces?.username ? `https://codeforces.com/profile/${user.platforms.codeforces.username}` : user?.links?.codeforces, isLogo: true },
                { key: "hackerrank", icon: hackerrankIcon, url: user?.platforms?.hackerrank?.username ? `https://www.hackerrank.com/profile/${user.platforms.hackerrank.username}` : user?.links?.hackerrank, isLogo: true },
                { key: "codestudio", icon: codingninjasIcon, url: user?.platforms?.codestudio?.username ? `https://www.naukri.com/code360/profile/${user.platforms.codestudio.username}` : user?.links?.codestudio, isLogo: true },
                { key: "geeksforgeeks", icon: gfgIcon, url: user?.platforms?.geeksforgeeks?.username ? `https://www.geeksforgeeks.org/user/${user.platforms.geeksforgeeks.username}` : user?.links?.geeksforgeeks, isLogo: true },
                { key: "atcoder", icon: atcoderIcon, url: user?.platforms?.atcoder?.username ? `https://atcoder.jp/users/${user.platforms.atcoder.username}` : user?.links?.atcoder, isLogo: true },
                { key: "interviewbit", icon: interviewbitIcon, url: user?.platforms?.interviewbit?.username ? `https://www.interviewbit.com/profile/${user.platforms.interviewbit.username}` : user?.links?.interviewbit, isLogo: true },
                { key: "portfolio", icon: Briefcase, url: user?.links?.portfolio },
                { key: "website", icon: Globe, url: user?.links?.website },
              ]
                .filter((link) => link.url)
                .map((link) => {
                  const url = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                  return (
                    <a
                      key={link.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-900/50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-indigo-600 border border-white/5 transition-all shadow-xl hover:shadow-indigo-500/20 group h-12 w-12 flex items-center justify-center"
                      title={link.key.charAt(0).toUpperCase() + link.key.slice(1)}
                    >
                      {link.isLogo ? (
                        <img src={link.icon} alt={link.key} className={cn("w-5 h-5 object-contain transition-transform group-hover:scale-110", link.invert && "dark:invert")} />
                      ) : (
                        <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                    </a>
                  );
                })}
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <Mail className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-400" />
                {user?.email}
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <Award className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-400" />
                Top Rated Skillswapper
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { label: "Swaps Completed", value: user?.completedSwaps || 0, icon: RotateCw, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Skills Shared", value: user?.skills?.length || 0, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                  { label: "Community Rating", value: user?.numReviews > 0 ? user.rating.toFixed(1) : "0.0", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl group hover:border-indigo-500/50 transition-all">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700" />
              <div className="relative">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <UserRound className="w-6 h-6 mr-3 text-indigo-500" />
                  About Me
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium">
                  {user?.bio || "No biography provided yet. This is where user's personal story and goals are showcased."}
                </p>
              </div>
            </div>

            {/* Professional Background Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Experience */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-indigo-500" />
                  Work Experience
                </h3>
                <div className="space-y-8">
                  {(user?.experience || []).length > 0 ? (
                    user.experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-8 border-l-2 border-slate-100 dark:border-white/5 last:border-0 pb-2">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-2">{exp.title}</h4>
                        <p className="text-indigo-500 text-sm font-bold mb-3">{exp.company}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          {exp.fromMonth} {exp.fromYear} — {exp.current ? "Present" : `${exp.toMonth} ${exp.toYear}`}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                          "{exp.description}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-400 dark:border-white/10">
                       <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-slate-500 text-sm italic">No experience added yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-indigo-500" />
                  Education
                </h3>
                <div className="space-y-8">
                   {(user?.education || []).length > 0 ? (
                    user.education.map((edu, idx) => (
                      <div key={idx} className="relative pl-8 border-l-2 border-slate-100 dark:border-white/5 last:border-0 pb-2">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-2">{edu.degree}</h4>
                        <p className="text-emerald-500 text-sm font-bold mb-3">{edu.school}</p>
                        <div className="flex items-center space-x-4 mb-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {edu.fromMonth} {edu.fromYear} — {edu.toMonth} {edu.toYear}
                          </p>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black">
                            {edu.gradeType}: {edu.grade}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-400 dark:border-white/10">
                       <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-slate-500 text-sm italic">No education records found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Achievements section */}
            {(user?.achievements || []).length > 0 && (
               <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                    <Milestone className="w-6 h-6 mr-3 text-indigo-500" />
                    Key Milestones & Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.achievements.map((ach, idx) => (
                      <div key={idx} className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-400 dark:border-white/10 group hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl">
                             <Trophy className="w-5 h-5 text-indigo-500" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                             {ach.issueMonth} {ach.issueYear}
                           </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ach.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 italic">"{ach.description}"</p>
                        {ach.url && (
                          <a 
                            href={ach.url.startsWith('http') ? ach.url : `https://${ach.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center"
                          >
                            View Document <ExternalLink className="w-3 h-3 ml-1.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {/* Skills Showcase */}
            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Award className="w-6 h-6 mr-3 text-emerald-500" />
                  Expertise & Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {(user?.skills || []).map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-indigo-500/5 text-slate-700 dark:text-indigo-300 font-bold border border-slate-400 dark:indigo-500/20 shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all cursor-default"
                  >
                    {skill}
                  </motion.div>
                ))}
                {(user?.skills || []).length === 0 && (
                  <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-400 dark:border-white/10">
                    <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 font-medium italic mx-12">No skills highlighted yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Community Achievements (Owner Detailed View) */}
            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 flex items-center justify-between">
                <span className="flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-indigo-500" />
                  My Achievements
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                  {BADGES.filter(b => b.criteria(user, (user?.skills || []).length)).length}/{BADGES.length} UNLOCKED
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {BADGES.map((badge) => {
                  const isUnlocked = badge.criteria(user, (user?.skills || []).length);
                  const Icon = badge.icon;
                  const progress = badge.progress(user, (user?.skills || []).length);
                  const isActive = activeBadge === badge.id;

                  return (
                    <div 
                      key={badge.id}
                      onClick={() => setActiveBadge(isActive ? null : badge.id)}
                      onMouseEnter={() => setActiveBadge(badge.id)}
                      onMouseLeave={() => setActiveBadge(null)}
                      className={cn(
                        "group relative p-4 rounded-3xl border transition-all duration-500 cursor-pointer overflow-visible",
                        isUnlocked 
                          ? `${badge.bg} border-transparent shadow-lg hover:-translate-y-1`
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 grayscale"
                      )}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                          isUnlocked ? `${badge.color} bg-white dark:bg-white/10 shadow-sm` : "text-slate-400 bg-slate-200/50 dark:bg-white/5"
                        )}>
                          {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5 text-slate-500" />}
                        </div>
                        
                        <h4 className={cn(
                          "text-[10px] font-black uppercase tracking-wider mb-1 px-1 line-clamp-1",
                          isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-500"
                        )}>
                          {badge.name}
                        </h4>
                        
                        {!isUnlocked && (
                          <div className="w-full mt-3 space-y-1.5 opacity-60">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-500">
                              <span>Progress</span>
                              <span>{Math.round(Math.min(progress, 99)) || 0}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-1000" 
                                style={{ width: `${Math.min(progress, 100) || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tooltip implementation with AnimatePresence for better mobile feel */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-5 rounded-[2rem] bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl z-[100]"
                            >
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">{badge.name}</p>
                              <p className="text-[11px] font-medium text-slate-300 leading-relaxed mb-4">{badge.description}</p>
                              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-black tracking-widest uppercase">
                                 <span className="text-slate-500">Target</span>
                                 <span className="text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{badge.target}</span>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
