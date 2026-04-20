import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, X, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { reviewService } from '@/src/services/reviewService';

export default function ReviewModal({ isOpen, onClose, skill, reviewee, requestId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await reviewService.submitReview({
        revieweeId: reviewee._id,
        skillId: skill._id,
        rating,
        comment,
        requestId
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-600/20 rotate-3">
              <Star className="w-10 h-10 fill-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Well Done!
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              You've completed the swap for <span className="text-indigo-400 font-bold">{skill.name}</span>. How was your experience with <span className="text-white font-bold">{reviewee.name}</span>?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            {/* Rating Stars */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-all active:scale-90"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors",
                        (hoverRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                          : "text-slate-600 fill-transparent"
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {rating === 0 ? "Select a rating" : `${rating} - ${['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}`}
              </span>
            </div>

            {/* Review Box */}
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the teaching style and experience..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all min-h-[120px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95",
                loading
                  ? "bg-white/5 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-600/30"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Feedback</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
