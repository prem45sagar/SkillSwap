import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { 
  Download, 
  Share2, 
  ChevronLeft, 
  Star, 
  RotateCw, 
  BookOpen, 
  Copy, 
  Check,
  QrCode,
  Sparkles,
  Zap,
  Award,
  ShieldCheck,
  Clock,
  History,
  Heart,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import Avatar3DViewer from "@/src/components/profile/Avatar3DViewer";
import { userService } from "@/src/services/userService";

export default function ProfileCard() {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [force2D, setForce2D] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    try {
        setIsSyncing(true);
        await userService.syncProfileStats();
        if (refreshUser) {
           await refreshUser();
        }
    } catch (err) {
        console.error("Profile sync error:", err);
    } finally {
        setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isDownloading) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/profile/${user?._id || user?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = async () => {
    const captureTool = window.htmlToImage;
    if (!captureTool || isDownloading) return;
    
    try {
      setIsDownloading(true);
      setRotate({ x: 0, y: 0 }); 
      if (user?.avatarMode === '3d') setForce2D(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const filter = (node) => node?.id !== 'card-controls' && node?.id !== 'sync-trigger';

      const dataUrl = await captureTool.toPng(cardRef.current, {
        quality: 1.0,
        backgroundColor: null,
        filter: filter,
        pixelRatio: 2.5,
        cacheBust: true,
        style: { borderRadius: '48px' }
      });
      
      const link = document.createElement("a");
      link.download = `${user?.name?.replace(/\s+/g, '_') || 'Member'}_Passport.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setIsDownloading(false);
      setForce2D(false);
    }
  };

  const profileLink = `${window.location.origin}/profile/${user?._id || user?.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileLink)}&bgcolor=ffffff&color=4f46e5&margin=5`;

  const rawSkills = (user?.topSkills && user.topSkills.length > 0) ? user.topSkills : (user?.skills || []);
  const displaySkills = rawSkills.slice(0, 3).map(s => {
    if (typeof s === 'string') return { name: s, count: 0 };
    return { name: s.name || "Skill", count: s.count || 0 };
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex flex-col items-center font-outfit overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      
      <div className="max-w-6xl w-full flex flex-col items-center">
        {/* Navigation Header */}
        <div className="w-full flex items-center justify-between mb-16 px-4">
          <Link to="/profile" className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-all font-black text-[12px] uppercase tracking-[0.2em] group shrink-0">
            <span className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
              <ChevronLeft className="w-4 h-4 text-indigo-400" />
            </span>
            <span className="hidden sm:inline">Portal Hub</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-[0.5em] italic leading-tight text-center">
               PROFILE<span className="text-indigo-500">ID</span>
            </h1>
            <div className="h-0.5 w-16 bg-indigo-500 mt-2 rounded-full opacity-60" />
          </div>

          <button id="sync-trigger" onClick={syncData} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 transition-all shadow-xl shrink-0">
            <RefreshCw className={cn("w-4.5 h-4.5", isSyncing && "animate-spin")} />
          </button>
        </div>

        {/* Holistic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center w-full px-2 sm:px-4">
          
          {/* Card Section (Left) - Adjusted Width & Aspect Ratio */}
          <div className="lg:col-span-5 flex justify-center perspective-2000">
            <motion.div
              ref={cardRef}
              id="id-card"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ rotateX: rotate.x, rotateY: rotate.y }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full max-w-[360px] rounded-[3.5rem] p-0.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] bg-white/5 border border-white/10"
            >
              <div className="w-full h-full rounded-[3.4rem] bg-[#020617] p-8 flex flex-col relative backdrop-blur-3xl overflow-hidden min-h-[460px]">
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                   <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at center, #6366f1 0.5px, transparent 0.5px)', backgroundSize: '18px 18px' }} />
                </div>

                {/* Card Header Branding */}
                <div className="flex justify-between items-start mb-8 z-10 w-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden">
                      <img src="/assets/logo.png" alt="" className="w-8 h-8 object-contain invert brightness-200" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-lg font-black text-white italic tracking-tighter leading-none">SKILL<span className="text-indigo-600">SWAP</span></span>
                       <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-600 mt-0.5">Verification Passport</span>
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl shadow-lg ring-2 ring-indigo-500/5 shrink-0">
                     <img src={qrCodeUrl} alt="QR" className="w-12 h-12 object-contain" crossOrigin="anonymous" />
                  </div>
                </div>

                {/* Avatar Section - More Balanced Size */}
                <div className="relative mb-6 flex justify-center z-10">
                   <motion.div 
                     animate={{ y: isDownloading ? 0 : [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="w-32 h-32 rounded-[2.5rem] p-1 shadow-2xl relative bg-gradient-to-tr from-indigo-600 via-white/30 to-purple-500"
                   >
                     <div className="w-full h-full rounded-[2.4rem] overflow-hidden border border-white/30 bg-slate-900 flex items-center justify-center">
                        {user?.avatarMode === '3d' && user?.avatar3d && !force2D ? (
                          <Avatar3DViewer model={user.avatar3d.model} color={user.avatar3d.color} rotation={user.avatar3d.rotation} />
                        ) : user?.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <span className="text-6xl font-black text-indigo-400">{user?.name?.[0]}</span>
                        )}
                     </div>
                     <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-xl border-2 border-[#020617] shadow-xl">
                        <ShieldCheck className="w-4 h-4 text-white" />
                     </div>
                   </motion.div>
                </div>

                <div className="text-center mb-6 z-10">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate px-2">{user?.name}</h2>
                  <div className="inline-block px-5 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.45em]">{user?.title || "PARTNER VERIFIED"}</p>
                  </div>
                </div>

                {/* Stats Grid - Cleaner Impact */}
                <div className="grid grid-cols-2 gap-4 mb-6 z-10 w-full">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3">
                     <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                     <div className="flex flex-col">
                       <span className="text-base font-black text-white tracking-tight">{(user?.rating || 0).toFixed(1)}</span>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">RATING</span>
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3">
                     <History className="w-5 h-5 text-emerald-400" />
                     <div className="flex flex-col">
                       <span className="text-base font-black text-white tracking-tight">{user?.completedSwaps || 0}</span>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">SWAPS</span>
                     </div>
                  </div>
                </div>

                {/* Total Stats Bar */}
                <div className="p-4 bg-indigo-600/10 rounded-2xl flex items-center justify-between border border-indigo-500/20 mb-8 z-10">
                   <div className="flex items-center space-x-3 text-indigo-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em]">TEACHING TIME</span>
                   </div>
                   <div className="text-lg font-black text-white tracking-tight">{user?.totalHours || 0}+ Hours</div>
                </div>

                {/* Expertise Badges */}
                <div className="z-10 bg-white/[0.03] p-5 rounded-[2.8rem] border border-white/5 mt-auto">
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {displaySkills.length > 0 ? (displaySkills.map((skill, i) => (
                      <div key={i} className="flex items-center space-x-2.5 px-4 py-2 bg-[#020617] rounded-xl border border-white/10 group/skill">
                        <span className="text-indigo-400 text-[10px] font-black uppercase italic tracking-wider">{skill.name}</span>
                        {skill.count > 0 && (
                          <div className="flex items-center space-x-2 pl-2.5 border-l border-white/10">
                            <Heart className="w-3 h-3 text-pink-500 fill-current" />
                            <span className="text-[11px] font-black text-white">{skill.count}</span>
                          </div>
                        )}
                      </div>
                    ))) : (
                      <span className="text-[10px] font-bold text-slate-800 uppercase italic tracking-widest">Generating profile...</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Hub (Right) - Enhanced Benefit Boxes */}
          <div className="lg:col-span-7 flex flex-col space-y-8 w-full" id="card-controls">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="p-10 sm:p-14 rounded-[4rem] bg-zinc-900/50 border border-white/10 shadow-3xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="mb-10">
                   <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tighter uppercase leading-none italic">
                     PROFILE <span className="text-indigo-500">CARD</span>
                   </h3>
                   <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
                 </div>
                 
                 <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-12 font-medium opacity-90">
                   Your authenticated skill identity. Represent your expertise with a high-resolution, community-verified passport.
                 </p>

                 <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <button 
                      onClick={downloadCard}
                      disabled={isDownloading}
                      className={cn(
                        "flex-[1.8] flex items-center justify-center p-6 sm:p-8 rounded-[2rem] bg-indigo-600 text-white font-black hover:bg-indigo-500 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-[14px] sm:text-[15px] tracking-[0.2em]",
                        isDownloading && "cursor-wait"
                      )}
                    >
                      {isDownloading ? <RotateCw className="w-6 h-6 animate-spin" /> : <><Download className="w-6 h-6 mr-4" /> SAVE IDENTITY </>}
                    </button>
                    <button onClick={copyLink} className={cn("flex-1 flex items-center justify-center p-6 sm:p-8 rounded-[2rem] font-black transition-all border border-white/10 active:scale-95 text-[14px] sm:text-[15px] tracking-[0.2em] backdrop-blur-md hover:bg-white/5", copied ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 text-white hover:text-white/20")}>
                      {copied ? <Check className="w-6 h-6 mr-4" /> : <><Copy className="w-5 h-5 mr-4" /> COPY URL </>}
                    </button>
                 </div>
              </div>

              {/* Enlarged Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {[
                   { icon: Share2, label: "COMMUNITY READY", desc: "Perfectly optimized for your social bios and professional profiles.", color: "text-blue-500" },
                   { icon: Award, label: "VERIFIED IDENTITY", desc: "Your skills are backed by real-time data and community endorsements.", color: "text-purple-500" }
                 ].map((item, i) => (
                   <div key={i} className="p-10 lg:p-12 rounded-[3.5rem] bg-zinc-900/30 border border-white/5 flex flex-col items-center text-center shadow-xl hover:border-indigo-500/20 transition-all group">
                     <div className={cn("p-5 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5", item.color)}>
                        <item.icon className="w-8 h-8" />
                     </div>
                     <h4 className="font-black text-white mb-4 uppercase text-[12px] tracking-[0.3em]">{item.label}</h4>
                     <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed font-bold opacity-80 px-4">{item.desc}</p>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
