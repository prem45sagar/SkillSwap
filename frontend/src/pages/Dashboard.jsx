import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  History,
  Star,
  ArrowRightLeft,
  X,
  MessageSquare,
  Trash2,
  ThumbsUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useState, useEffect } from "react";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import ShareSkillModal from "@/src/components/common/ShareSkillModal";
import { swapService } from "@/src/services/swapService";
import { skillService } from "@/src/services/skillService";
import { reviewService } from "@/src/services/reviewService";
import { userService } from "@/src/services/userService";
import ReviewModal from "@/src/components/common/ReviewModal";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [rejectRequestId, setRejectRequestId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isReposting, setIsReposting] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState(null);
  const [completeSkillData, setCompleteSkillData] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Helper to check if user was active within last 3 days
  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return new Date() - new Date(lastActive) < threeDays;
  };

  // Consistent dummy ratings
  const getDummyRating = (id) => {
    const ratings = ["4.9", "5.0", "4.8", "4.7"];
    const index = id.charCodeAt(id.length - 1) % ratings.length;
    return ratings[index];
  };

  const getTimeRemaining = (skill) => {
    if (!skill.startDate) return null;
    const start = new Date(skill.startDate);
    const durationCount = skill.duration || 7;
    const isMinutes = skill.durationUnit === "minutes";
    
    let end;
    if (isMinutes) {
      end = new Date(start.getTime() + durationCount * 60 * 1000);
    } else {
      end = new Date(start.getTime() + durationCount * 24 * 60 * 60 * 1000);
    }
    
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return null;
    
    if (isMinutes) {
      const mins = Math.floor(diff / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      return mins > 0 ? `${mins}m ${secs}s left` : `${secs}s left`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const isSkillCompletable = (skill) => {
    // True if time is up
    if (!getTimeRemaining(skill)) return true;
    
    // True if partner has already reviewed
    const associatedReq = requests.find(r => 
      (r.status === "Accepted" || r.status === "Completed") && 
      (r.skillGiven === skill?.name)
    );
    return !!associatedReq?.partnerReviewed;
  };

  
  useEffect(() => {
    const syncData = async () => {
      await fetchDashboardData();
      await fetchMySkills();
      try {
        await userService.syncProfileStats();
        await refreshUser();
      } catch (err) {
        console.error("Failed to sync stats:", err);
      }
    };
    syncData();
  }, []);

  const fetchMySkills = async () => {
    try {
      const data = await skillService.getSkills();
      // Filter to only show current user's skills and sort by new first
      const filtered = data
        .filter(s => s.owner?._id === user?._id)
        .sort((a, b) => {
          // Put ongoing or occupied skills first
          const isBusyA = a.status === 'ongoing' || a.status === 'occupied';
          const isBusyB = b.status === 'ongoing' || b.status === 'occupied';
          if (isBusyA && !isBusyB) return -1;
          if (!isBusyA && isBusyB) return 1;
          // Then sort by date
          return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
        });
      setMySkills(filtered);
    } catch (err) {
      console.error("Failed to fetch my skills:", err);
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setIsReposting(false);
    setIsModalOpen(true);
  };

  const handleRepostSkill = (skill) => {
    setEditingSkill(skill);
    setIsReposting(true);
    setIsModalOpen(true);
  };

  const handleCompleteSkill = async (skillId) => {
    try {
      // Find the associated swap request to know who to review
      // The skill being completed is OWNED by the current user.
      const skill = mySkills.find(s => s._id === skillId);
      const associatedReq = requests.find(r => 
        (r.status === "Accepted" || r.status === "Completed") && 
        (r.skillGiven === skill?.name) &&
        !r.hasProvidedReview
      );

      if (associatedReq) {
        setCompleteSkillData({
          skill: skill,
          reviewee: { _id: associatedReq.userId, name: associatedReq.user },
          requestId: associatedReq.id
        });
        setIsReviewModalOpen(true);
      } else {
        // Fallback or alert if no active request found that needs a review
        alert("No active swap request found for this skill that requires a review.");
      }
    } catch (err) {
      console.error("Failed to prepare completion review:", err);
    }
  };

  const handleDeleteSkill = async () => {
    if (deleteSkillId) {
      try {
        await skillService.deleteSkill(deleteSkillId);
        fetchMySkills(); // Refresh list
        setDeleteSkillId(null);
      } catch (err) {
        console.error("Failed to delete skill:", err);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await swapService.getSwapRequests();
      
      // Map backend requests to frontend format relative to current user
      const mapped = data.map(req => {
        const senderId = (req.sender?._id || req.sender)?.toString();
        const currentUserId = (user?._id || user?.id)?.toString();
        
        const isSender = senderId === currentUserId;
        const otherUser = isSender ? req.receiver : req.sender;
        
        // Dynamic mapping based on user role
        const mySkillObj = isSender ? req.senderSkill : req.receiverSkill;
        const partnerSkillObj = isSender ? req.receiverSkill : req.senderSkill;

        const wantsToLearn = typeof partnerSkillObj === 'string' ? partnerSkillObj : (partnerSkillObj?.name || "Skill");
        const skillsIHave = typeof mySkillObj === 'string' ? mySkillObj : (mySkillObj?.name || "Skill");
        
        return {
          id: req._id,
          user: (otherUser?.name || "Peer"),
          userId: (otherUser?._id || otherUser)?.toString(),
          wantsToLearn,
          skillsIHave,
          skill: wantsToLearn,
          skillGiven: skillsIHave,
          skillReceived: wantsToLearn,
          status: req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1)) : "Pending",
          senderReviewed: req.senderReviewed,
          receiverReviewed: req.receiverReviewed,
          partnerReviewed: isSender ? req.receiverReviewed : req.senderReviewed,
          date: new Date(req.createdAt).toLocaleDateString(),
          rawDate: new Date(req.createdAt),
          isIncoming: !isSender,
          rating: req.partnerRating || 5, // Use real rating if available, fallback to 5 for UI consistency in history
          hasProvidedReview: req.hasProvidedReview,
          isRealRating: !!req.partnerRating
        };
      });
      
      // Sort by date newest first
      const sorted = mapped.sort((a, b) => b.rawDate - a.rawDate);
      
      setRequests(sorted);
      // Completed swaps history: show only if at least one review is present or status is completed
      setCompletedRequests(sorted.filter(r => (r.status === "Accepted" || r.status === "Completed") && (r.senderReviewed || r.receiverReviewed)));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasPendingReview = requests.some(req => 
    req.status === 'Accepted' && !req.hasProvidedReview
  );

  const stats = [
    { 
      label: "Active Swaps", 
      value: requests.filter(r => r.status === "Accepted" && !(r.senderReviewed && r.receiverReviewed)).length.toString(), 
      icon: Clock, 
      color: "text-blue-400" 
    },
    {
      label: "Swaps Completed",
      value: user?.completedSwaps || "0",
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Community Rating",
      value: (user?.numReviews > 0) ? user.rating.toFixed(1) : "New",
      icon: TrendingUp,
      color: "text-amber-400",
    },
    {
      label: "Connections",
      value: requests.length.toString(),
      icon: Users,
      color: "text-purple-400",
    },
  ];

  const handleAcceptRequest = async (requestId) => {
    try {
      await swapService.updateSwapStatus(requestId, "accepted");
      await fetchDashboardData(); // Refresh list
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleRejectRequest = async () => {
    if (rejectRequestId !== null) {
      try {
        const reqToCancel = requests.find(r => r.id === rejectRequestId);
        const statusToSend = reqToCancel?.isIncoming ? "rejected" : "cancelled";
        
        await swapService.updateSwapStatus(rejectRequestId, statusToSend);
        await fetchDashboardData(); // Refresh list
        setRejectRequestId(null);
      } catch (err) {
        console.error("Failed to cancel/reject request:", err);
      }
    }
  };



  const completedSwaps = completedRequests;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-900 dark:text-slate-400">
            Here's what's happening with your skill swaps today.
          </p>
        </div>
        <Link
          to={hasPendingReview ? "#" : "/search"}
          onClick={(e) => {
            if (hasPendingReview) {
              e.preventDefault();
              alert("You must complete your pending reviews before finding a new skill.");
            }
          }}
          className={cn(
            "inline-flex items-center px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg",
            hasPendingReview 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
          )}
        >
          <Plus className="w-5 h-5 mr-2" />
          Find New Skill
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-slate-900 dark:text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Your Posted Skills Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white px-1">
                Your Shared Skills
              </h2>
              <Link
                to="/my-skills"
                className="text-sm text-indigo-600 dark:text-indigo-300 transition-colors flex items-center"
              >
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySkills.length > 0 ? (
                mySkills.slice(0, 2).map((skill) => (
                  <motion.div
                    key={skill._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all relative overflow-hidden group"
                  >
                    {/* Header: Avatar + Name + Rating + Status */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl border border-indigo-500/20">
                            {user?.name ? user.name[0] : "?"}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-900 dark:text-white font-bold block">
                            {user?.name || "You"}
                          </span>
                          <div className="flex items-center text-amber-400 text-[10px] font-black uppercase tracking-widest">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            {getDummyRating(skill._id)}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        skill.status === 'open' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        skill.status === 'ongoing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        skill.status === 'occupied' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      )}>
                        {skill.status}
                      </span>
                    </div>

                    {/* Skill Title + Description */}
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{skill.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-2 font-medium">{skill.description}</p>

                    {/* Language Section */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Language</div>
                        <div className="flex flex-wrap gap-2">
                          {skill.languages?.map((lang, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-bold border border-indigo-500/10 uppercase tracking-wider">
                              {lang}
                            </span>
                          ))}
                          {!skill.languages?.length && (
                            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                              {skill.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Wants to Learn */}
                      {skill.desiredSkill && (
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Wants to Learn</div>
                          <div className="px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold italic">
                            "{skill.desiredSkill}"
                          </div>
                        </div>
                      )}

                      {skill.criteria && (
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Target Criteria</div>
                          <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest">
                            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/10">
                              {skill.criteria}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Duration + Active Status */}
                     <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <div className="flex items-center">
                         <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                         {skill.duration || 7} {skill.durationUnit === 'minutes' ? 'Minutes' : 'Days'}
                       </div>
                       <div className="flex items-center space-x-1.5 text-indigo-500">
                         <ThumbsUp className="w-3.5 h-3.5 fill-indigo-500/10" />
                         <span>{(skill.endorsements || []).length} Endorsements</span>
                       </div>
                     </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                      {skill.status === 'completed' ? (
                        <button 
                          onClick={() => handleRepostSkill(skill)}
                          disabled={mySkills.some(s => s.status === 'ongoing' || s.status === 'occupied') || hasPendingReview}
                          className={cn(
                            "text-xs font-bold transition-all px-4 py-2 rounded-xl",
                            (mySkills.some(s => s.status === 'ongoing' || s.status === 'occupied') || hasPendingReview)
                              ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                              : "text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                          )}
                          title={hasPendingReview ? "You must complete your pending reviews before reposting" : (mySkills.some(s => s.status === 'ongoing' || s.status === 'occupied') ? "You cannot repost while a course is ongoing" : "Repost this skill")}
                        >
                          Repost
                        </button>
                      ) : (
                        <>
                          {(skill.status === 'ongoing' || skill.status === 'occupied') && (
                            <button 
                              onClick={() => handleCompleteSkill(skill._id)}
                              disabled={!isSkillCompletable(skill)}
                              className={cn(
                                "text-xs font-bold transition-all px-4 py-2 rounded-xl",
                                !isSkillCompletable(skill)
                                  ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-white/10"
                                  : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              )}
                              title={!isSkillCompletable(skill) 
                                ? `Ends in ${getTimeRemaining(skill)}` 
                                : (getTimeRemaining(skill) ? "Partner has reviewed! You can now complete early." : "Mark this skill swap as completed")}
                            >
                              {(!isSkillCompletable(skill)) ? getTimeRemaining(skill) : "Mark Completed"}
                            </button>
                          )}
                          {skill.status === 'open' && (
                            <button 
                              onClick={() => handleEditSkill(skill)}
                              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                      {!(skill.status === 'ongoing' || skill.status === 'occupied') && (
                        <button 
                          onClick={() => setDeleteSkillId(skill._id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-white/5 rounded-2xl border border-dashed border-slate-700">
                  <p className="text-slate-500">You haven't shared any skills yet.</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recent Swap Requests
              </h2>
              <Link
                to="/swaps"
                className="text-sm text-indigo-600 dark:text-indigo-300 transition-colors flex items-center"
              >
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {requests.length > 0 ? (
                requests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/5 hover:border-indigo-500/20 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-start sm:items-center space-x-4">
                        <Link to={`/profile/${req.userId}`} className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all">
                          {req.user[0]}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link to={`/profile/${req.userId}`} className="text-slate-900 dark:text-white font-bold hover:text-indigo-600 transition-colors truncate">{req.user}</Link>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                              req.isIncoming ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            )}>
                              {req.isIncoming ? "Received" : "Sent"}
                            </span>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                               <span className="opacity-50 font-bold">Wants:</span> <span className="text-indigo-500 font-bold">{req.wantsToLearn}</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                               <span className="opacity-50 font-bold">Gives:</span> <span className="text-emerald-500 font-bold">{req.skillsIHave}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5">
                        <div className="text-left sm:text-right">
                          <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest block w-fit sm:ml-auto",
                            req.status === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : req.status === "Pending"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-red-500/10 text-red-500"
                          )}>
                            {req.status}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 font-bold">
                            {req.date}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {req.isIncoming && req.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="p-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                                title="Accept Request"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectRequestId(req.id)}
                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                title="Reject Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {!req.isIncoming && req.status === "Pending" && (
                            <button
                              onClick={() => setRejectRequestId(req.id)}
                              className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                              title="Cancel Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          
                          {req.status === "Accepted" && (
                            <Link
                              to="/chat"
                              className="p-3 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-slate-700">
                  <ArrowRightLeft className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No swap requests yet.</p>
                  <Link to="/search" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">Explore skills to start swapping</Link>
                </div>
              )}
            </div>
          </div>

          {/* Completed Swaps History */}
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Completed Swaps History
                </h2>
              </div>
              <Link
                to="/history"
                className="text-sm text-indigo-600 dark:text-indigo-300 transition-colors flex items-center"
              >
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {completedSwaps.length > 0 ? (
                completedSwaps.slice(0, 3).map((swap) => (
                <div
                  key={swap.id}
                  className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/5 hover:border-indigo-500/20 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <Link to={`/profile/${swap.userId}`} className="flex items-center space-x-4 group/item">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all text-xl">
                        {swap.user[0]}
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold group-hover/item:text-indigo-400 transition-colors">
                          {swap.user}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          {swap.date}
                        </div>
                      </div>
                    </Link>

                    <div className="flex-1 py-4 lg:py-0 border-y lg:border-0 border-slate-100 dark:border-white/5">
                      <div className="flex flex-col items-start lg:items-center">
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-emerald-500 dark:text-emerald-400 font-black tracking-tight">
                            {swap.skillGiven}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                          <span className="text-indigo-500 dark:text-indigo-400 font-black tracking-tight">
                            {swap.skillReceived}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-black">
                          {swap.senderReviewed && swap.receiverReviewed 
                            ? "Successfully Completed" 
                            : "Swap In Progress"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-6">
                      <div className="flex flex-col items-start lg:items-end">
                        <div className="flex items-center space-x-1">
                          {swap.isRealRating ? (
                            [...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3.5 h-3.5",
                                  i < swap.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 dark:text-slate-700",
                                )}
                              />
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pending</span>
                          )}
                        </div>
                        {!swap.hasProvidedReview && (
                          <span className="text-[8px] text-indigo-400 font-black uppercase mt-1 tracking-tighter">Review needed</span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate("/chat")}
                        className="p-3 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-slate-700">
                  <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No completed swaps yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Skills */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Recommended for You
            </h2>
            <div className="space-y-4">
              {["Advanced React", "UI/UX Principles", "Node.js Backend"].map(
                (skill, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-300 font-medium">
                        {skill}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                ),
              )}
            </div>
            <button className="w-full mt-6 py-3 text-sm text-slate-900 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
              Refresh recommendations
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={rejectRequestId !== null}
        onClose={() => setRejectRequestId(null)}
        onConfirm={handleRejectRequest}
        title="Reject Request"
        message="Are you sure you want to reject this swap request? This action cannot be undone."
        confirmText="Reject"
        type="danger"
      />

      <ConfirmationModal
        isOpen={deleteSkillId !== null}
        onClose={() => setDeleteSkillId(null)}
        onConfirm={handleDeleteSkill}
        title="Delete Skill"
        message="Are you sure you want to delete this shared skill? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />



      <ShareSkillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSkill(null);
          setIsReposting(false);
        }}
        onSkillAdded={() => {
          fetchMySkills();
          fetchDashboardData();
        }}
        editData={editingSkill}
        isRepost={isReposting}
      />

      {completeSkillData && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setCompleteSkillData(null);
          }}
          skill={completeSkillData.skill}
          reviewee={completeSkillData.reviewee}
          requestId={completeSkillData.requestId}
          onSuccess={() => {
            fetchDashboardData();
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
