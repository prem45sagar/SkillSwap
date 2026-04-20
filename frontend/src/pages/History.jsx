import { motion } from "motion/react";
import {
  History as HistoryIcon,
  Star,
  ArrowRightLeft,
  Calendar,
  Search,
  Filter,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";

import { swapService } from "@/src/services/swapService";
import { useAuth } from "@/src/context/AuthContext";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await swapService.getSwapRequests();
      // Filter for swaps that are completed or acted upon (not just pending)
      const historicalSwaps = data.filter(s => s.status !== "pending").map(s => {
        const senderId = (s.sender?._id || s.sender)?.toString();
        const currentUserId = (user?._id || user?.id)?.toString();
        const isSender = senderId === currentUserId;
        const otherUser = isSender ? s.receiver : s.sender;
        
        const skillGivenRaw = isSender ? s.senderSkill : s.receiverSkill;
        const skillReceivedRaw = isSender ? s.receiverSkill : s.senderSkill;
        
        return {
          id: s._id,
          user: (otherUser?.name || "Peer"),
          userId: (otherUser?._id || otherUser)?.toString(),
          skillGiven: typeof skillGivenRaw === 'string' ? skillGivenRaw : (skillGivenRaw?.name || "Skill"),
          skillReceived: typeof skillReceivedRaw === 'string' ? skillReceivedRaw : (skillReceivedRaw?.name || "Skill"),
          date: new Date(s.updatedAt).toLocaleDateString(),
          rawDate: new Date(s.updatedAt),
          rating: s.partnerRating || 0,
          comment: s.partnerComment || `Swap ${s.status === "accepted" ? (s.senderReviewed && s.receiverReviewed ? "completed successfully" : "verified by partner") : s.status}`,
          status: s.status,
          isRealRating: !!s.partnerRating,
          hasProvidedReview: s.hasProvidedReview,
          senderReviewed: s.senderReviewed,
          receiverReviewed: s.receiverReviewed
        };
      });
      const sorted = historicalSwaps.sort((a, b) => b.rawDate - a.rawDate);
      setHistory(sorted);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(
    (item) => {
      const matchesSearch = item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skillGiven.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skillReceived.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const displayedHistory = showAll ? filteredHistory : filteredHistory.slice(0, 5);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            to="/dashboard"
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <HistoryIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Swap History
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              A complete record of your skill exchanges and growth.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by user or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 pl-12 pr-8 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer font-bold min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{displayedHistory.length}</span> of{" "}
          <span className="text-slate-900 dark:text-white font-bold">{filteredHistory.length}</span> records
        </span>
      </div>

      {/* History List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : displayedHistory.length > 0 ? (
          <>
            {displayedHistory.map((swap, i) => (
              <motion.div
                key={swap.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="p-6 lg:p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:border-indigo-500/20 transition-all group shadow-sm"
              >
                {/* Top Row: User Info + Status */}
                <div className="flex items-center justify-between mb-5">
                  <Link to={`/profile/${swap.userId}`} className="flex items-center space-x-4 group/user">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl border border-indigo-500/20 group-hover/user:bg-indigo-500 group-hover/user:text-white transition-all shrink-0">
                      {swap.user[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover/user:text-indigo-500 transition-colors">
                        {swap.user}
                      </h3>
                      <div className="flex items-center text-slate-500 dark:text-slate-500 text-sm mt-0.5">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {swap.date}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border shrink-0",
                      swap.status === "accepted"
                        ? (swap.senderReviewed && swap.receiverReviewed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20")
                        : swap.status === "rejected"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}>
                      {swap.status === "accepted" ? (swap.senderReviewed && swap.receiverReviewed ? "Completed" : "In Progress") : swap.status}
                    </span>
                    {!swap.hasProvidedReview && swap.status === "accepted" && (
                      <span className="text-[10px] text-indigo-400 font-black animate-pulse uppercase tracking-tighter bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-500/10">Action Required: Review</span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Skill Exchange */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-5 px-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-5 relative">
                  <div className="text-center flex-1 w-full">
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1 font-bold">
                      You Taught
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg break-words">
                      {swap.skillGiven}
                    </div>
                  </div>

                  <div className="shrink-0 rotate-90 sm:rotate-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                      <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="text-center flex-1 w-full">
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1 font-bold">
                      You Learned
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-black text-base sm:text-lg break-words">
                      {swap.skillReceived}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Rating + Actions */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex items-center space-x-1">
                      {swap.isRealRating ? (
                        [...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < swap.rating
                                ? "text-amber-400 fill-amber-400 dark:text-amber-400 dark:fill-amber-400"
                                : "text-slate-300 dark:text-slate-700",
                            )}
                          />
                        ))
                      ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending review</span>
                      )}
                      {false && [...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < swap.rating
                              ? "text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400"
                              : "text-slate-300 dark:text-slate-700",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                      "{swap.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/chat")}
                      className="flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <Link
                      to={`/profile/${swap.userId}`}
                      className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-sm font-medium"
                      title="View Profile"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Show more / Show less toggle */}
            {filteredHistory.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/10"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({filteredHistory.length} records)
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-[2rem] backdrop-blur-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-900 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No history found
            </h3>
            <p className="text-slate-900 dark:text-slate-400">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
