import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useState, useEffect } from "react";
import { Star, Clock, Trash2, ChevronLeft, Search } from "lucide-react";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import ShareSkillModal from "@/src/components/common/ShareSkillModal";
import { skillService } from "@/src/services/skillService";

export default function MySkills() {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isReposting, setIsReposting] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState(null);

  useEffect(() => {
    fetchMySkills();
  }, []);

  const fetchMySkills = async () => {
    try {
      setLoading(true);
      const data = await skillService.getSkills();
      const filtered = data
        .filter(s => s.owner?._id === user?._id)
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      setMySkills(filtered);
    } catch (err) {
      console.error("Failed to fetch my skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return new Date() - new Date(lastActive) < threeDays;
  };

  const getDummyRating = (id) => {
    const ratings = ["4.9", "5.0", "4.8", "4.7"];
    const index = id.charCodeAt(id.length - 1) % ratings.length;
    return ratings[index];
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
      await skillService.updateSkill(skillId, { status: "completed" });
      fetchMySkills();
    } catch (err) {
      console.error("Failed to mark skill as completed:", err);
    }
  };

  const handleDeleteSkill = async () => {
    if (deleteSkillId) {
      try {
        await skillService.deleteSkill(deleteSkillId);
        fetchMySkills();
        setDeleteSkillId(null);
      } catch (err) {
        console.error("Failed to delete skill:", err);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          to="/dashboard"
          className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Your Shared Skills
          </h1>
          <p className="text-slate-900 dark:text-slate-400">
            Manage all the skills you've posted on SkillSwap.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySkills.length > 0 ? (
            mySkills.map((skill) => (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 dark:backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all relative overflow-hidden group"
              >
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

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{skill.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-2 font-medium">{skill.description}</p>

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

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    {skill.duration || 7} Days
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                  {skill.status === 'completed' ? (
                    <button 
                      onClick={() => handleRepostSkill(skill)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20"
                    >
                      Repost
                    </button>
                  ) : (
                    <>
                      {(skill.status === 'ongoing' || skill.status === 'occupied') && (
                        <button 
                          disabled
                          className="text-xs font-bold text-emerald-400 opacity-50 cursor-not-allowed transition-colors px-4 py-2 rounded-xl bg-emerald-500/10"
                          title="Skill swap is currently in progress"
                        >
                          Completed
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-3xl backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No skills shared yet
              </h3>
              <p className="text-slate-700 dark:text-slate-400 mb-8">
                You haven't shared any skills on the platform.
              </p>
            </motion.div>
          )}
        </div>
      )}

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
        }}
        editData={editingSkill}
        isRepost={isReposting}
      />
    </div>
  );
}
