import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { userService } from "@/src/services/userService";
import { skillService } from "@/src/services/skillService";
import {
  User,
  Mail,
  Globe,
  Github,
  Linkedin,
  Award,
  BookOpen,
  Star,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Users,
  ChevronLeft,
  UserPlus,
  UserCheck,
  Zap,
  Briefcase,
  Clock,
  ThumbsUp,
  Trophy,
  Lock,
  GraduationCap,
  Milestone
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Avatar3DViewer from "@/src/components/profile/Avatar3DViewer";
import SwapRequestModal from "@/src/components/common/SwapRequestModal";
import { reviewService } from "@/src/services/reviewService";
import { BADGES } from "@/src/constants/badges";

import leetcodeIcon from "@/src/assets/platforms/leetcode.svg";
import codeforcesIcon from "@/src/assets/platforms/codeforces.svg";
import codechefIcon from "@/src/assets/platforms/codechef.png";
import gfgIcon from "@/src/assets/platforms/geeksforgeeks.svg";
import hackerrankIcon from "@/src/assets/platforms/hackerrank.svg";
import interviewbitIcon from "@/src/assets/platforms/interviewbit.png";
import codingninjasIcon from "@/src/assets/platforms/codingninjas.svg";
import atcoderIcon from "@/src/assets/platforms/atcoder.svg";
import githubIcon from "@/src/assets/platforms/github.svg";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [isOwnerBusy, setIsOwnerBusy] = useState(false);
  const [isCurrentUserBusy, setIsCurrentUserBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchUserSkills();
    fetchReviews();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserProfile(id);
      setProfile(data);
      setIsFollowing(data.isFollowing);
      setCounts({
        followers: data.followers?.length || 0,
        following: data.following?.length || 0
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async () => {
    try {
      const allSkills = await skillService.getSkills();
      
      // Identify all busy owners
      const busyOwners = new Set(
        allSkills.filter(s => s.status === 'ongoing').map(s => s.owner?._id || s.owner)
      );

      setIsOwnerBusy(busyOwners.has(id));
      setIsCurrentUserBusy(busyOwners.has(currentUser?._id));

      const userSkills = allSkills
        .filter(s => (s.owner?._id === id || s.owner === id))
        .map(s => ({ ...s, endorsements: s.endorsements || [] }));
      setSkills(userSkills);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getUserReviews(id);
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await userService.followUser(id);
      setIsFollowing(res.isFollowing);
      setCounts(prev => ({
        ...prev,
        followers: res.isFollowing ? prev.followers + 1 : prev.followers - 1
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleEndorse = async (skillId) => {
    try {
      const res = await skillService.endorseSkill(skillId);
      // Update the skills local state
      setSkills(prevSkills => 
        prevSkills.map(s => 
          s._id === skillId ? { ...s, endorsements: res.endorsements } : s
        )
      );
    } catch (err) {
      console.error("Endorsement error:", err);
    }
  };
  
  const handleRequestSwap = (skill) => {
    if (isOwnerBusy || isCurrentUserBusy || skill.status !== 'open') return;
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) return <div>User not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-outfit">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <Link to="/search" className="inline-flex items-center text-slate-500 hover:text-indigo-400 mb-8 transition-colors group">
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl backdrop-blur-md sticky top-28 flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 mb-8 relative">
              <div className="w-full h-full rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-indigo-500/40 relative overflow-hidden border-2 border-slate-400 dark:border-white/10">
                {profile.avatarMode === '3d' && profile.avatar3d ? (
                  <Avatar3DViewer
                    model={profile.avatar3d.model}
                    color={profile.avatar3d.color}
                    rotation={profile.avatar3d.rotation}
                  />
                ) : profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name[0]
                )}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
              {profile.name}
            </h2>
            <p className="text-indigo-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              {profile.title || "SkillSwap Member"}
            </p>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {profile.bio || "This user prefers keeping their journey a mystery."}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 pt-6 border-t border-slate-400 dark:border-white/5 w-full">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{counts.followers}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center">
                   <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                   {(profile?.rating || 0).toFixed(1)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{profile?.completedSwaps || 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Swaps Finished</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{counts.following}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Following</div>
              </div>
            </div>

            {/* Follow & Message Buttons */}
            {currentUser?._id !== profile._id && (
              <div className="grid grid-cols-2 gap-3 w-full mb-8">
                <button
                  onClick={handleFollow}
                  className={cn(
                    "py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2",
                    isFollowing
                      ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <button className="py-3.5 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </button>
              </div>
            )}

            {/* Social Links */}
             <div className="flex justify-center space-x-3 mb-4 flex-wrap gap-y-3">
              {[
                { key: "github", icon: githubIcon, url: profile.platforms?.github?.username ? `https://github.com/${profile.platforms.github.username}` : profile.links?.github, isLogo: true, invert: true },
                { key: "linkedin", icon: Linkedin, url: profile.links?.linkedin },
                { key: "leetcode", icon: leetcodeIcon, url: profile.platforms?.leetcode?.username ? `https://leetcode.com/u/${profile.platforms.leetcode.username}` : profile.links?.leetcode, isLogo: true },
                { key: "codechef", icon: codechefIcon, url: profile.platforms?.codechef?.username ? `https://www.codechef.com/users/${profile.platforms.codechef.username}` : profile.links?.codechef, isLogo: true },
                { key: "codeforces", icon: codeforcesIcon, url: profile.platforms?.codeforces?.username ? `https://codeforces.com/profile/${profile.platforms.codeforces.username}` : profile.links?.codeforces, isLogo: true },
                { key: "hackerrank", icon: hackerrankIcon, url: profile.platforms?.hackerrank?.username ? `https://www.hackerrank.com/profile/${profile.platforms.hackerrank.username}` : profile.links?.hackerrank, isLogo: true },
                { key: "codestudio", icon: codingninjasIcon, url: profile.platforms?.codestudio?.username ? `https://www.naukri.com/code360/profile/${profile.platforms.codestudio.username}` : profile.links?.codestudio, isLogo: true },
                { key: "geeksforgeeks", icon: gfgIcon, url: profile.platforms?.geeksforgeeks?.username ? `https://www.geeksforgeeks.org/user/${profile.platforms.geeksforgeeks.username}` : profile.links?.geeksforgeeks, isLogo: true },
                { key: "atcoder", icon: atcoderIcon, url: profile.platforms?.atcoder?.username ? `https://atcoder.jp/users/${profile.platforms.atcoder.username}` : profile.links?.atcoder, isLogo: true },
                { key: "interviewbit", icon: interviewbitIcon, url: profile.platforms?.interviewbit?.username ? `https://www.interviewbit.com/profile/${profile.platforms.interviewbit.username}` : profile.links?.interviewbit, isLogo: true },
                { key: "portfolio", icon: Briefcase, url: profile.links?.portfolio },
                { key: "website", icon: Globe, url: profile.links?.website },
              ].filter(l => l.url).map(link => (
                 <a
                    key={link.key}
                    href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                    target="_blank"
                    className="p-3 bg-slate-900/5 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-white border border-transparent hover:border-indigo-500/20 transition-all h-11 w-11 flex items-center justify-center"
                  >
                    {link.isLogo ? (
                      <img src={link.icon} alt={link.key} className={cn("w-5 h-5 object-contain transition-transform group-hover:scale-110", link.invert && "dark:invert")} />
                    ) : (
                      <link.icon className="w-5 h-5" />
                    )}
                  </a>
              ))}
            </div>

          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-indigo-500" />
                Skills to Teach
              </h3>
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                {(skills || []).length} ACTIVE LISTINGS
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(skills || []).map((skill, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold border border-indigo-500/20">
                        {skill.name[0]}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest">
                        {skill.category}
                      </div>
                   </div>
                   <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{skill.name}</h4>
                   <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{skill.description}</p>
                   
                   {skill.criteria && (
                     <div className="mb-4">
                       <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/10">
                        Criteria: {skill.criteria}
                       </span>
                     </div>
                   )}

                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                       {skill.duration} {skill.durationUnit === 'minutes' ? 'Minutes' : 'Days'}
                     </div>
                     {currentUser?._id !== id && (
                       <button 
                         onClick={() => handleEndorse(skill._id)}
                         className={cn(
                           "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95",
                           (skill.endorsements || []).some(eid => String(eid) === String(currentUser?._id))
                             ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                             : "bg-white dark:bg-white/5 border-slate-400 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50"
                         )}
                         title={(skill.endorsements || []).some(eid => String(eid) === String(currentUser?._id)) ? "Remove Endorsement" : "Endorse Skill"}
                       >
                         <ThumbsUp className={cn("w-3.5 h-3.5", (skill.endorsements || []).some(eid => String(eid) === String(currentUser?._id)) && "fill-current")} />
                         <span className="text-[10px] font-black">{(skill.endorsements || []).length}</span>
                       </button>
                     )}
                     {currentUser?._id === id && (
                       <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 dark:bg-white/5 border-slate-400 dark:border-white/10 text-slate-600 dark:text-slate-400">
                         <Award className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black">{(skill.endorsements || []).length} ENDORSEMENTS</span>
                       </div>
                     )}
                   </div>
                   <button 
                      onClick={() => handleRequestSwap(skill)}
                      disabled={isOwnerBusy || isCurrentUserBusy || skill.status !== 'open'}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        isOwnerBusy || isCurrentUserBusy || skill.status !== 'open'
                          ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                      )}
                      title={
                        isOwnerBusy ? "This user is busy with another swap" :
                        isCurrentUserBusy ? "Complete your swap first" :
                        skill.status !== 'open' ? "Skill not available" : "Request Swap"
                      }
                    >
                       {isOwnerBusy ? "Busy" : "Swap for this"}
                    </button>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-400 dark:border-slate-800">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active skills listed yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Professional Background Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Experience */}
            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-indigo-500" />
                Work Experience
              </h3>
              <div className="space-y-8">
                {(profile?.experience || []).length > 0 ? (
                  profile.experience.map((exp, idx) => (
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
                     <p className="text-slate-500 text-sm italic">No experience listed.</p>
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
                 {(profile?.education || []).length > 0 ? (
                  profile.education.map((edu, idx) => (
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
                     <p className="text-slate-500 text-sm italic">No education records shared.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Achievements section */}
          {(profile?.achievements || []).length > 0 && (
             <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
                  <Milestone className="w-6 h-6 mr-3 text-indigo-500" />
                  Key Milestones & Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.achievements.map((ach, idx) => (
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
          
          <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl relative z-10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center justify-between">
              <span className="flex items-center">
                <Star className="w-6 h-6 mr-3 text-indigo-500" />
                Swap Reviews & Feedback
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {(reviews || []).length} REVIEWS
                </span>
                {(reviews || []).length > 2 && (
                  <Link 
                    to={`/profile/${id}/reviews`}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-400 underline underline-offset-4 decoration-indigo-500/30"
                  >
                    View All
                  </Link>
                )}
              </div>
            </h3>

            <div className="space-y-6">
              {(reviews || []).slice(0, 2).map((rev, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-400 dark:border-white/10 relative group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-lg border border-indigo-500/20">
                        {rev.reviewer?.avatar ? (
                          <img src={rev.reviewer.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (rev.reviewer?.name?.[0] || "?")}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {rev.reviewer?.name}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {rev.reviewer?.title || "Explorer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-white dark:bg-white/10 px-3 py-1.5 rounded-xl border border-slate-400 dark:border-white/10 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">{(rev.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest mb-2 border border-indigo-500/10">
                      LEANED: {rev.skill?.name || "Skill"}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ))}

              {(!reviews || reviews.length === 0) && (
                <div className="py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-400 dark:border-slate-800">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No swap reviews yet.</p>
                  <p className="text-xs text-slate-400 mt-2 italic px-8">Reviews appear here after a successful skill swap with this user.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl relative backdrop-blur-sm z-10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center justify-between font-outfit">
              <span className="flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-indigo-500" />
                Community Achievements
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                {currentUser?._id === id 
                  ? `${BADGES.filter(b => b.criteria(profile, (profile?.skills || []).length)).length}/${BADGES.length} UNLOCKED`
                  : `${BADGES.filter(b => b.criteria(profile, (profile?.skills || []).length)).length} EARNED`
                }
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {BADGES.map((badge) => {
                const isUnlocked = badge.criteria(profile, (profile?.skills || []).length);
                const isOwner = currentUser?._id === id;
                
                if (!isOwner && !isUnlocked) return null;

                const Icon = badge.icon;
                const progress = badge.progress(profile, (profile?.skills || []).length);
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
                        ? `${badge.bg} border-transparent shadow-lg shadow-indigo-500/5 hover:-translate-y-1`
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
                      
                      {!isUnlocked && isOwner && (
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

            {currentUser?._id !== id && BADGES.filter(b => b.id === 'skill_explorer' ? b.criteria(profile, (skills || []).length) : b.criteria(profile)).length === 0 && (
              <div className="py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-400 dark:border-white/10">
                <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No community achievements earned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <SwapRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expertId={id}
        expertName={profile?.name}
        expertSkill={selectedSkill?.name}
        receiverSkillId={selectedSkill?._id}
      />
    </div>
  );
}
