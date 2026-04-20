import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Ban,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";

import { swapService } from "@/src/services/swapService";
import { useAuth } from "@/src/context/AuthContext";

export default function SwapRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [cancelAcceptedId, setCancelAcceptedId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await swapService.getSwapRequests();
      const mapped = data.map(r => {
        const receiverId = (r.receiver?._id || r.receiver)?.toString();
        const currentUserId = (user?._id || user?.id)?.toString();
        const isIncoming = receiverId === currentUserId;
        
        // My skill is either senderSkill or receiverSkill
        const mySkillObj = !isIncoming ? r.senderSkill : r.receiverSkill;
        const partnerSkillObj = !isIncoming ? r.receiverSkill : r.senderSkill;

        const wantsToLearn = typeof partnerSkillObj === 'string' ? partnerSkillObj : (partnerSkillObj?.name || "Skill");
        const skillsIHave = typeof mySkillObj === 'string' ? mySkillObj : (mySkillObj?.name || "Skill");

        const otherUserId = isIncoming ? r.sender?._id : r.receiver?._id;
        
        return {
          ...r,
          id: r._id,
          user: isIncoming ? (r.sender?.name || "Peer") : (r.receiver?.name || "Peer"),
          userId: (otherUserId?._id || otherUserId)?.toString(),
          wantsToLearn,
          skillsIHave,
          type: isIncoming ? "Incoming" : "Outgoing",
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          date: new Date(r.createdAt).toLocaleDateString(),
          rawDate: new Date(r.createdAt),
          avatar: isIncoming ? (r.sender?.name ? r.sender.name[0] : "?") : (r.receiver?.name ? r.receiver.name[0] : "?")
        };
      });
      const sorted = mapped.sort((a, b) => b.rawDate - a.rawDate);
      setRequests(sorted);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "All" || req.status === filter;
    const matchesSearch =
      req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.wantsToLearn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.skillsIHave.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAcceptRequest = async (requestId) => {
    try {
      await swapService.updateSwapStatus(requestId, "accepted");
      await fetchRequests();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        const reqToCancel = requests.find(r => r.id === deleteId);
        const statusToSend = reqToCancel?.type === "Incoming" ? "rejected" : "cancelled";
        
        await swapService.updateSwapStatus(deleteId, statusToSend);
        await fetchRequests();
        setDeleteId(null);
      } catch (err) {
        console.error("Failed to cancel/reject request:", err);
      }
    }
  };

  const handleCancelAccepted = async () => {
    if (cancelAcceptedId) {
      try {
        await swapService.updateSwapStatus(cancelAcceptedId, "cancelled");
        await fetchRequests();
        setCancelAcceptedId(null);
      } catch (err) {
        console.error("Failed to cancel accepted request:", err);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors self-start mt-1.5"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
                <ArrowRightLeft className="w-10 h-10 mr-4 text-indigo-600 dark:text-indigo-400" />
                Swap Requests
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Manage your ongoing and pending skill exchange requests.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative group text-slate-900">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by user or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-sm hover:border-indigo-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 min-w-0">
                    <Link 
                      to={`/profile/${req.userId}`}
                      className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shrink-0"
                    >
                      {req.avatar}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link 
                          to={`/profile/${req.userId}`}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors truncate"
                        >
                          {req.user}
                        </Link>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0",
                            req.type === "Incoming"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                          )}
                        >
                          {req.type}
                        </span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                        {req.date}
                      </div>
                    </div>
                  </div>

                  {/* Skills Exchange - inline compact (Desktop only) */}
                  <div className="hidden lg:flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                    <div className="text-center min-w-[80px]">
                      <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black mb-1">Learn</div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{req.wantsToLearn}</div>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    <div className="text-center min-w-[80px]">
                      <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black mb-1">Offer</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{req.skillsIHave}</div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shrink-0",
                        req.status === "Accepted"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : req.status === "Pending"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20",
                      )}
                    >
                      {req.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Accept & Reject for incoming pending */}
                      {req.type === "Incoming" && req.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="p-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                            title="Accept"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(req.id)}
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Cancel for outgoing pending */}
                      {req.type === "Outgoing" && req.status === "Pending" && (
                        <button
                          onClick={() => setDeleteId(req.id)}
                          className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancel Swap for accepted */}
                      {req.status === "Accepted" && (
                        <button
                          onClick={() => setCancelAcceptedId(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold border border-red-500/20"
                          title="Cancel Swap"
                        >
                          <Ban className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills row for mobile */}
                <div className="flex md:hidden items-center gap-3 mt-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-center flex-1">
                    <div className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Learn</div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">{req.wantsToLearn}</div>
                  </div>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                  <div className="text-center flex-1">
                    <div className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Offer</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{req.skillsIHave}</div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-24 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-[3rem] shadow-xl">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ArrowRightLeft className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                No requests found
              </h3>
              <p className="text-slate-600 dark:text-slate-500 mt-2">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject/Cancel Pending Request Modal */}
      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={requests.find(r => r.id === deleteId)?.type === "Incoming" ? "Reject Request" : "Cancel Request"}
        message={
          requests.find(r => r.id === deleteId)?.type === "Incoming"
            ? "Are you sure you want to reject this swap request? This action cannot be undone."
            : "Are you sure you want to cancel this swap request? This will remove it from your list."
        }
        confirmText={requests.find(r => r.id === deleteId)?.type === "Incoming" ? "Reject" : "Cancel Request"}
        type="danger"
      />

      {/* Cancel Accepted Swap Modal */}
      <ConfirmationModal
        isOpen={cancelAcceptedId !== null}
        onClose={() => setCancelAcceptedId(null)}
        onConfirm={handleCancelAccepted}
        title="Cancel Accepted Swap"
        message="Are you sure you want to cancel this accepted swap? The other user will be notified and the swap will be terminated."
        confirmText="Cancel Swap"
        type="danger"
      />
    </div>
  );
}
