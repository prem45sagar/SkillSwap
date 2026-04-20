import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { reviewService } from "@/src/services/reviewService";
import { userService } from "@/src/services/userService";
import { ChevronLeft, Star, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function AllReviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, profileData] = await Promise.all([
        reviewService.getUserReviews(id),
        userService.getUserProfile(id)
      ]);
      setReviews(reviewsData);
      setProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-outfit">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <Link 
        to={`/profile/${id}`} 
        className="inline-flex items-center text-slate-500 hover:text-indigo-400 mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to {profile.name}'s Profile
      </Link>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          All Reviews for {profile.name}
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {(profile.rating || 0).toFixed(1)}
            </span>
          </div>
          <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Based on {reviews.length} Swap Reviews
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((rev, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 shadow-xl relative group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-xl border border-indigo-500/20 shadow-inner">
                  {rev.reviewer?.avatar ? (
                    <img src={rev.reviewer.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (rev.reviewer?.name?.[0] || "?")}
                </div>
                <div>
                  <h5 className="font-bold text-lg text-slate-900 dark:text-white leading-none mb-1">
                    {rev.reviewer?.name}
                  </h5>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {rev.reviewer?.title || "Community Explorer"}
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-white dark:bg-white/10 px-4 py-2 rounded-2xl border border-slate-400 dark:border-white/10 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1.5" />
                <span className="text-sm font-black text-slate-900 dark:text-white">{(rev.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/10">
                SWAPPED: {rev.skill?.name || "Skill"}
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 italic leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>
            
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 mr-2" />
              {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </motion.div>
        ))}

        {reviews.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-400 dark:border-slate-800">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h3>
            <p className="text-slate-500">Reviews appear here after successful skill swaps.</p>
          </div>
        )}
      </div>
    </div>
  );
}
