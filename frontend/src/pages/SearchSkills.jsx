import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, Star, MapPin, Clock, ArrowRight, Plus, X, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import SwapRequestModal from "@/src/components/common/SwapRequestModal";
import ShareSkillModal from "@/src/components/common/ShareSkillModal";
import { skillService } from "@/src/services/skillService";
import { swapService } from "@/src/services/swapService";
import { useAuth } from "@/src/context/AuthContext";

const DUMMY_SKILLS = [
  {
    _id: "dummy1",
    name: "Advanced React Patterns",
    description: "Master Compound Components, Render Props, and Higher-Order Components for scalable apps.",
    category: "Development",
    owner: { _id: "u1", name: "Sarah Chen", avatar: "S" },
    location: "San Francisco, CA",
    availability: "Weekends",
    level: "Advanced",
    isDummy: true
  },
  {
    _id: "dummy2",
    name: "Visual Storytelling & Photography",
    description: "Learn how to capture emotions and narratives through landscape and portrait photography.",
    category: "Creative",
    owner: { _id: "u2", name: "Marcus Thorne", avatar: "M" },
    location: "London, UK",
    availability: "Flexible",
    level: "Intermediate",
    isDummy: true
  },
  {
    _id: "dummy3",
    name: "UI/UX Micro-animations",
    description: "Using Framer Motion and Lottie to create delightful user experiences and interactions.",
    category: "Design",
    owner: { _id: "u3", name: "Elena Rodriguez", avatar: "E" },
    location: "Madrid, Spain",
    availability: "Mornings",
    level: "Beginner",
    isDummy: true
  },
  {
    _id: "dummy4",
    name: "Full-Stack Node.js Architecture",
    description: "Building resilient and distributed systems with Express, MongoDB, and Redis.",
    category: "Development",
    owner: { _id: "u4", name: "Alex Rivera", avatar: "A" },
    location: "Berlin, DE",
    availability: "Evenings",
    level: "Expert",
    isDummy: true
  }
];

// Helper to provide consistent dummy ratings
const getDummyRating = (id) => {
  const ratings = ["4.9", "5.0", "4.8", "4.7"];
  const index = id.charCodeAt(id.length - 1) % ratings.length;
  return ratings[index];
};

export default function SearchSkills() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    minRating: 0,
    statuses: ["open"],
    skills: []
  });
  const [tempFilters, setTempFilters] = useState({
    minRating: 0,
    statuses: ["open"],
    skills: []
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [isCurrentUserBusy, setIsCurrentUserBusy] = useState(false);
  const [hasPendingReview, setHasPendingReview] = useState(false);

  const allSkills = Array.from(
    new Set(skills.map((s) => s.name).filter(Boolean)),
  ).sort();
  
  useEffect(() => {
    if (searchParams.get("share") === "true" && isAuthenticated) {
      setIsShareModalOpen(true);
      // Remove the param so it doesn't open again on browser refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("share");
      setSearchParams(newParams);
    }
  }, [searchParams, isAuthenticated, setSearchParams]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        
        if (!isAuthenticated) {
          // Show only dummy data before login
          setSkills(DUMMY_SKILLS);
          const dynamicCategories = ["All", ...new Set(DUMMY_SKILLS.map(s => s.category).filter(Boolean))];
          setCategories(dynamicCategories);
        } else {
          // Show only real user data after login, excluding current user's own skills
          const data = await skillService.getSkills();
          
          // Identify owners who have an ongoing swap (any skill marked 'ongoing')
          const busyOwners = new Set(
            data.filter(s => s.status === 'ongoing').map(s => (typeof s.owner === 'object' ? s.owner?._id : s.owner))
          );

          const othersSkills = data
            .filter(s => {
              const ownerId = typeof s.owner === 'object' ? s.owner?._id : s.owner;
              return ownerId !== user?._id;
            })
            .map(s => ({
              ...s,
              isOwnerBusy: busyOwners.has(typeof s.owner === 'object' ? s.owner?._id : s.owner)
            }))
            .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
          
          setSkills(othersSkills);
          
          // Check if current user is busy
          setIsCurrentUserBusy(busyOwners.has(user?._id));

          // Check for pending mutual reviews
          const swaps = await swapService.getSwapRequests();
          const pending = swaps.some(req => 
            req.status === 'accepted' && 
            ((req.sender?._id === user?._id && !req.senderReviewed) || (req.receiver?._id === user?._id && !req.receiverReviewed))
          );
          setHasPendingReview(pending);

          const dynamicCategories = ["All", ...new Set(othersSkills.map(s => s.category).filter(Boolean))];
          setCategories(dynamicCategories);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch skills");
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [isAuthenticated, user?._id]);

  const filteredSkills = skills.filter((s) => {
    const skillName = s.name || "";
    const description = s.description || "";
    const ownerName = s.owner?.name || "";
    const category = s.category || "";
    const status = s.status || "open";

    const matchesSearch =
      skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || category === activeCategory;

    const matchesStatus = appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(status);
    const matchesSkills = appliedFilters.skills.length === 0 || appliedFilters.skills.includes(skillName);
    const matchesRating = parseFloat(getDummyRating(s._id || s.id)) >= appliedFilters.minRating;

    return matchesSearch && matchesCategory && matchesStatus && matchesSkills && matchesRating;
  });

  const handleRequestSwap = (skillItem) => {
    if (skillItem.status && skillItem.status !== 'open') return;
    if (skillItem.isOwnerBusy) return;
    if (isCurrentUserBusy) return;
    setSelectedExpert(skillItem);
    setIsModalOpen(true);
  };

  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return new Date() - new Date(lastActive) < threeDays;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SwapRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expertId={selectedExpert?.owner?._id}
        expertName={selectedExpert?.owner?.name || "Expert"}
        expertSkill={selectedExpert?.name || ""}
        receiverSkillId={selectedExpert?._id}
      />

      <div className="mb-10 lg:mb-12">
        <h1 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Skills</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium max-w-2xl">
          Discover experts and start your next skill exchange journey.
        </p>
      </div>

      {/* Sticky Search Bar - Only this part stays on top */}
      <div className="sticky top-20 z-40 -mx-4 px-4 py-4 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-400 dark:border-white/5 lg:relative lg:top-0 lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:p-0 lg:mx-0 mb-8">
        <div className="relative max-w-4xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search for any skill or expert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-white/10 border border-slate-400 dark:border-white/10 rounded-[2rem] py-4 lg:py-5 pl-14 pr-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xl shadow-indigo-500/5"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & Categories (Scrolls away) */}
      <div className="flex flex-col gap-8 mb-10 lg:mb-16">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-8 py-4 rounded-2xl border transition-all flex items-center space-x-3 group shadow-lg hover:scale-[1.02] active:scale-95",
              showFilters
                ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30 font-black"
                : "bg-white dark:bg-white/5 border-slate-400 dark:border-white/10 text-slate-900 dark:text-slate-300 hover:border-indigo-500/40 font-bold"
            )}
          >
            <Filter className={cn("w-5 h-5", showFilters ? "text-white" : "text-indigo-500")} />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            disabled={isCurrentUserBusy || hasPendingReview}
            className={cn(
              "px-8 py-4 rounded-2xl transition-all flex items-center space-x-3 shadow-lg hover:scale-[1.02] active:scale-95",
              (isCurrentUserBusy || hasPendingReview)
                ? "bg-slate-400 dark:bg-white/10 text-slate-500 cursor-not-allowed grayscale" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-indigo-600/30"
            )}
          >
            <Plus className="w-5 h-5" />
            <span>Share Your Skill</span>
          </button>
        </div>

        {/* Categories Scroll */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 ml-1">
            Popular Categories
          </h4>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs lg:text-sm font-black whitespace-nowrap transition-all border uppercase tracking-widest",
                  activeCategory === cat
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-xl shadow-indigo-500/20"
                    : "bg-white dark:bg-white/5 border-slate-400 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-500/30 hover:text-indigo-500",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? "auto" : 0,
          opacity: showFilters ? 1 : 0,
          marginBottom: showFilters ? 48 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rating Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-400 uppercase tracking-widest flex items-center">
                  <Star className="w-3.5 h-3.5 mr-2 text-amber-400" />
                  Min Rating
                </h4>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {tempFilters.minRating}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={tempFilters.minRating}
                onChange={(e) => setTempFilters({ ...tempFilters, minRating: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-400 font-bold uppercase tracking-widest">
                <span>Any</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-400 uppercase tracking-widest flex items-center">
                <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {['open', 'ongoing', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setTempFilters((prev) => ({
                        ...prev,
                        statuses: [status],
                      }));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                      tempFilters.statuses.includes(status)
                        ? "bg-indigo-500 border-indigo-400 text-white"
                        : "bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 text-slate-900 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300",
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-400 uppercase tracking-widest flex items-center">
                <Filter className="w-3.5 h-3.5 mr-2 text-purple-400" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setTempFilters((prev) => {
                        if (prev.skills.includes(skill)) {
                          return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
                        }
                        if (prev.skills.length < 3) {
                          return { ...prev, skills: [...prev.skills, skill] };
                        }
                        return prev;
                      });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                      tempFilters.skills.includes(skill)
                        ? "bg-indigo-500 border-indigo-400 text-white"
                        : "bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 text-slate-900 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300",
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply / Reset Filters */}
          <div className="mt-8 pt-6 border-t border-slate-400 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-900 dark:text-slate-400">
              Showing{" "}
              <span className="text-slate-900 dark:text-white font-bold">
                {filteredSkills.length}
              </span>{" "}
              results
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  const defaultFilters = { minRating: 0, statuses: ["open"], skills: [] };
                  setTempFilters(defaultFilters);
                  setAppliedFilters(defaultFilters);
                  setSearchQuery("");
                  setActiveCategory("All");
                  setShowFilters(false);
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all uppercase tracking-widest"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setAppliedFilters(tempFilters);
                  setShowFilters(false);
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "p-6 rounded-3xl border dark:backdrop-blur-sm transition-all relative overflow-hidden group",
                item.isOwnerBusy || isCurrentUserBusy || (item.status && item.status !== 'open')
                  ? "bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/5 cursor-not-allowed opacity-75"
                  : "bg-slate-100 dark:bg-white/5 border-slate-400 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
              )}
              onClick={() => handleRequestSwap(item)}
              title={
                item.isOwnerBusy 
                  ? "This expert is currently busy with another swap" 
                  : isCurrentUserBusy 
                    ? "Complete your ongoing swap to request new ones" 
                    : item.status !== 'open'
                      ? "This skill is not currently available"
                      : "Click to request a swap"
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/profile/${item.owner?._id}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="relative group/avatar shrink-0"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl border border-indigo-500/20 group-hover/avatar:border-indigo-500 transition-all">
                      {item.owner?.name ? item.owner.name[0] : "?"}
                    </div>
                    {/* Status indicator */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900",
                      isUserOnline(item.owner?.lastActive) ? "bg-emerald-500" : "bg-slate-500"
                    )} title={isUserOnline(item.owner?.lastActive) ? "Online" : "Offline"}></div>
                  </Link>
                  <div className="min-w-0">
                    <Link 
                      to={`/profile/${item.owner?._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold transition-colors block truncate"
                    >
                      {item.owner?.name || "Expert"}
                    </Link>
                    <div className="flex items-center text-amber-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {getDummyRating(item._id)}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit",
                  item.isOwnerBusy ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  item.status === 'open' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  item.status === 'ongoing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  item.status === 'occupied' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-slate-500/10 text-slate-500 border-slate-500/20"
                )}>
                  {item.isOwnerBusy ? "Busy" : (item.status || "Open")}
                </div>
              </div>

              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {item.name}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 font-medium">
                {item.description}
              </p>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language</div>
                   <div className="flex flex-wrap gap-2">
                    {item.languages?.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-bold border border-indigo-500/10 uppercase tracking-wider">
                        {lang}
                      </span>
                    ))}
                    {!item.languages?.length && (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                   </div>
                </div>

                 {item.desiredSkill && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wants to Learn</div>
                    <div className="px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold italic">
                      "{item.desiredSkill}"
                    </div>
                  </div>
                )}

                {item.criteria && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Criteria</div>
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest">
                       <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/10">
                        {item.criteria}
                       </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-400 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    {item.duration || 7} {item.durationUnit === 'minutes' ? 'Minutes' : 'Days'}
                  </div>
                  <div className="text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className={cn(
                  "font-black transition-colors",
                  isUserOnline(item.owner?.lastActive) ? "text-emerald-500" : "text-slate-500"
                )}>
                  {isUserOnline(item.owner?.lastActive) ? "• Active Now" : "• Offline"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-3xl backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-slate-900" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-slate-700 dark:text-slate-400 mb-8">
            Try adjusting your filters or search query to find what you're
            looking for.
          </p>
          <button
            onClick={() => {
              setMinRating(0);
              setMaxHours(20);
              setSelectedTags([]);
              setSearchQuery("");
            }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}
      <ShareSkillModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSkillAdded={() => {
          // Re-fetch skills, excluding current user's own skills
          skillService.getSkills().then(data => {
            const othersSkills = data
              .filter(s => s.owner?._id !== user?._id)
              .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setSkills(othersSkills);
          });
        }}
      />
    </div>
  );
}
