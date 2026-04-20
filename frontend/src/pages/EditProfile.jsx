import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import {
  User,
  LayoutGrid,
  Lock,
  Fingerprint,
  ArrowLeft,
  ChevronRight,
  Settings,
  Camera,
  X,
  Plus,
  Save,
  Star,
  Globe,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Check,
  UserRound,
  Award,
  Briefcase,
  Code2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Maximize2,
  Linkedin,
  Twitter,
  ExternalLink,
  PenLine,
  Box,
  RotateCw,
  Github,
  Trophy,
  Terminal,
  Layout,
  BarChart2,
  Hexagon,
  Search,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Avatar3DViewer from "@/src/components/profile/Avatar3DViewer";

import leetcodeIcon from "@/src/assets/platforms/leetcode.svg";
import codeforcesIcon from "@/src/assets/platforms/codeforces.svg";
import codechefIcon from "@/src/assets/platforms/codechef.png";
import gfgIcon from "@/src/assets/platforms/geeksforgeeks.svg";
import hackerrankIcon from "@/src/assets/platforms/hackerrank.svg";
import interviewbitIcon from "@/src/assets/platforms/interviewbit.png";
import codingninjasIcon from "@/src/assets/platforms/codingninjas.svg";
import atcoderIcon from "@/src/assets/platforms/atcoder.svg";


const sidebarItems = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "details", label: "Profile Details", icon: Settings },
  { id: "platform", label: "Platform", icon: LayoutGrid },
  { id: "skills", label: "Skills", icon: Star },
  { id: "accounts", label: "Accounts", icon: Fingerprint },
];

const detailTabs = [
  { id: "about", label: "About Me", icon: UserRound, description: "Add a brief introduction about yourself to showcase your personality and interests." },
  { id: "education", label: "Education", icon: GraduationCap, description: "Add your education details, including college name, degree, and grades." },
  { id: "achievements", label: "Achievements", icon: Award, description: "Showcase your achievements and certifications to enhance your profile." },
  { id: "experience", label: "Work Experience", icon: Briefcase, description: "Add your work experience, internships, and other relevant experiences." },
  { id: "socials", label: "Socials", icon: Code2, description: "You can update your social media details here." },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - 10 + i).toString());

const SOCIAL_PREFIXES = {
  linkedin: "https://www.linkedin.com/in/",
  twitter: "https://www.twitter.com/",
};

const PLATFORM_CONFIG = {
  leetcode: { label: "LeetCode", prefix: "https://leetcode.com/u/", logo: leetcodeIcon, icon: Code, color: "text-orange-500", placeholder: "johndoe" },
  codestudio: { label: "CodeStudio", prefix: "https://www.naukri.com/code360/profile/", logo: codingninjasIcon, icon: Terminal, color: "text-orange-600", placeholder: "johndoe" },
  geeksforgeeks: { label: "GeeksForGeeks", prefix: "https://www.geeksforgeeks.org/user/", logo: gfgIcon, icon: Code2, color: "text-green-600", placeholder: "johndoe" },
  interviewbit: { label: "InterviewBit", prefix: "https://www.interviewbit.com/profile/", logo: interviewbitIcon, icon: Layout, color: "text-cyan-500", placeholder: "johndoe" },
  codechef: { label: "CodeChef", prefix: "https://www.codechef.com/users/", logo: codechefIcon, icon: Trophy, color: "text-red-500", placeholder: "johndoe" },
  codeforces: { label: "CodeForces", prefix: "https://codeforces.com/profile/", logo: codeforcesIcon, icon: BarChart2, color: "text-blue-500", placeholder: "johndoe" },
  hackerrank: { label: "HackerRank", prefix: "https://www.hackerrank.com/profile/", logo: hackerrankIcon, icon: Hexagon, color: "text-green-500", placeholder: "johndoe" },
  atcoder: { label: "AtCoder", prefix: "https://atcoder.jp/users/", logo: atcoderIcon, icon: Trophy, color: "text-slate-900", placeholder: "johndoe" },
};


export default function EditProfile() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const [activeItem, setActiveItem] = useState("basic");
  const [activeDetailTab, setActiveDetailTab] = useState("about");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    bio: "",
    country: "India",
    skillswapId: "",
    education: [],
    experience: [],
    achievements: [],
    links: {
      linkedin: "",
      twitter: "",
      website: "",
      resume: "",
      portfolio: "",
    },
    platforms: {
      github: { username: "", verified: false },
      leetcode: { username: "", verified: false },
      codeforces: { username: "", verified: false },
      codechef: { username: "", verified: false },
      geeksforgeeks: { username: "", verified: false },
      hackerrank: { username: "", verified: false },
      interviewbit: { username: "", verified: false },
      codestudio: { username: "", verified: false },
      atcoder: { username: "", verified: false },
    },
    skills: [],
    title: "",
    avatarMode: "2d",
    avatar3d: {
      model: "cube",
      color: "#6366f1",
      rotation: 0
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState("");

  const [tempEntry, setTempEntry] = useState({});

  useEffect(() => {
    if (user) {
      const [first, ...last] = user.name ? user.name.split(" ") : ["", ""];
      
      const stripPrefix = (url, prefix) => {
        if (!url) return "";
        const cleanPrefix = prefix.replace("https://", "").replace("http://", "").replace("www.", "");
        const cleanUrl = url.replace("https://", "").replace("http://", "").replace("www.", "");
        return cleanUrl.replace(cleanPrefix, "");
      };

      const displayLinks = {
        linkedin: stripPrefix(user.links?.linkedin, SOCIAL_PREFIXES.linkedin),
        twitter: stripPrefix(user.links?.twitter, SOCIAL_PREFIXES.twitter),
        website: user.links?.website || "",
        resume: user.links?.resume || "",
        portfolio: user.links?.portfolio || "",
      };

      const displayPlatforms = {};
      Object.keys(formData.platforms).forEach(key => {
        displayPlatforms[key] = {
          username: user.platforms?.[key]?.username || "",
          verified: user.platforms?.[key]?.verified || false
        };
      });

      setFormData({
        firstName: first || "",
        lastName: last.join(" ") || "",
        email: user.email || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
        country: user.country || "India",
        skillswapId: user.skillswapId || user.name?.toLowerCase().replace(/\s+/g, '') || "",
        education: user.education || [],
        experience: user.experience || [],
        achievements: user.achievements || [],
        skills: user.skills || [],
        title: user.title || "",
        avatarMode: user.avatarMode || "2d",
        avatar3d: user.avatar3d || {
          model: "cube",
          color: "#6366f1",
          rotation: 0
        },
        links: displayLinks,
        platforms: displayPlatforms
      });
      setTempId(user.skillswapId || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("links.")) {
      const field = name.split(".")[1];
      let newValue = value;
      if (SOCIAL_PREFIXES[field]) {
        newValue = value.replace(SOCIAL_PREFIXES[field], "")
                        .replace(SOCIAL_PREFIXES[field].replace("https://", ""), "")
                        .replace("https://", "")
                        .replace("http://", "")
                        .replace("www.", "");
      }
      setFormData(prev => ({
        ...prev,
        links: { ...prev.links, [field]: newValue }
      }));
    } else if (name.startsWith("platforms.")) {
      const field = name.split(".")[1];
      let newValue = value;
      const config = PLATFORM_CONFIG[field];
      if (config) {
        newValue = value.replace(config.prefix, "")
                        .replace(config.prefix.replace("https://", ""), "")
                        .replace(config.prefix.replace("http://", ""), "")
                        .replace("https://", "").replace("http://", "").replace("www.", "");
      }
      setFormData(prev => ({
        ...prev,
        platforms: {
          ...prev.platforms,
          [field]: { ...prev.platforms[field], username: newValue }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", content: "Passwords do not match!" });
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({ 
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword 
      });
      setMessage({ type: "success", content: "Password updated successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", content: err.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveId = async () => {
    setLoading(true);
    try {
      await updateProfile({ skillswapId: tempId });
      setFormData(prev => ({ ...prev, skillswapId: tempId }));
      setIsEditingId(false);
      setMessage({ type: "success", content: "SkillSwap ID updated!" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", content: err.message || "Failed to update SkillSwap ID" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      setLoading(true);
      try {
        await deleteAccount();
        navigate("/");
      } catch (err) {
        setMessage({ type: "error", content: err.message || "Failed to delete account" });
        setLoading(false);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: "error", content: "Image size should be less than 10MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const finalLinks = {
        ...formData.links,
        linkedin: formData.links.linkedin ? `${SOCIAL_PREFIXES.linkedin}${formData.links.linkedin}` : "",
        twitter: formData.links.twitter ? `${SOCIAL_PREFIXES.twitter}${formData.links.twitter}` : "",
        portfolio: formData.links.portfolio,
      };

      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        avatar: formData.avatar,
        bio: formData.bio,
        country: formData.country,
        skillswapId: formData.skillswapId,
        education: formData.education,
        experience: formData.experience,
        achievements: formData.achievements,
        skills: formData.skills,
        title: formData.title,
        avatarMode: formData.avatarMode,
        avatar3d: formData.avatar3d,
        links: finalLinks,
        platforms: formData.platforms
      };

      await updateProfile(updatedData);
      setMessage({ type: "success", content: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", content: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = (tab) => {
    const defaultEntries = {
      education: { degree: "", school: "", gradeType: "CGPA", grade: "", fromMonth: "July", fromYear: "2023", toMonth: "May", toYear: "2027" },
      experience: { title: "", company: "", description: "", fromMonth: "April", fromYear: "2024", toMonth: "April", toYear: "2026", current: false },
      achievements: { title: "", description: "", url: "", issueMonth: "April", issueYear: "2026" }
    };
    setTempEntry(defaultEntries[tab]);
    setShowAddForm(true);
    setEditIndex(null);
  };

  const handleSaveEntry = (tab) => {
    const newList = [...formData[tab]];
    if (editIndex !== null) {
      newList[editIndex] = tempEntry;
    } else {
      newList.push(tempEntry);
    }
    setFormData(prev => ({ ...prev, [tab]: newList }));
    setShowAddForm(false);
    setEditIndex(null);
  };

  const handleEditEntry = (tab, index) => {
    setTempEntry(formData[tab][index]);
    setEditIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteEntry = (tab, index) => {
    const newList = formData[tab].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [tab]: newList }));
  };

  const renderBasicInfo = () => (
    <form onSubmit={handleSubmit} className="space-y-12">
      <section className="space-y-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Basic Details</h3>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8">
            <div className="relative group shrink-0">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 flex items-center justify-center">
                {formData.avatar ? <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><User className="w-10 h-10" /></div>}
              </div>
              <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 border-4 border-white dark:border-slate-900"><Camera className="w-4 h-4" /></button>
              <button type="button" onClick={removeImage} className="absolute -bottom-1 -left-1 w-9 h-9 bg-slate-200 dark:bg-slate-800 hover:bg-red-500 text-slate-500 hover:text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 border-4 border-white dark:border-slate-900"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 w-full space-y-5 sm:space-y-6">
              <div className="flex items-center space-x-2 text-sm sm:text-base">
                <span className="text-slate-500 font-medium">SkillSwap Id:</span>
                <span className="text-slate-900 dark:text-white font-bold">{formData.skillswapId}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5"><label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm sm:text-base h-12 sm:h-14" required /></div>
                <div className="space-y-1.5"><label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm sm:text-base h-12 sm:h-14" /></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Full Stack Developer, UI Designer" 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm sm:text-base h-12 sm:h-14" 
                />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label><input type="email" value={formData.email} readOnly className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 font-medium cursor-not-allowed" /></div>
        <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio (Max 200 Characters)</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} maxLength={200} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white min-h-[100px] resize-none" /></div>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Avatar Identification</h4>
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatarMode: "2d" }))}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold transition-all text-xs",
                  formData.avatarMode === "2d" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-slate-700"
                )}
              >
                2D Photo
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatarMode: "3d" }))}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold transition-all text-xs",
                  formData.avatarMode === "3d" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-slate-700"
                )}
              >
                3D Avatar
              </button>
            </div>
          </div>

          {formData.avatarMode === "3d" && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Box className="w-4 h-4 mr-2 text-indigo-500" />
                    Model Geometry
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["cube", "sphere", "pyramid", "torus"].map(model => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar3d: { ...prev.avatar3d, model } }))}
                        className={cn(
                          "py-3 px-4 rounded-2xl border-2 font-black capitalize transition-all text-sm",
                          formData.avatar3d.model === model 
                            ? "border-indigo-600 bg-indigo-600/5 text-indigo-600" 
                            : "border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Digital Finish</label>
                  <div className="flex flex-wrap gap-3">
                    {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#000000"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar3d: { ...prev.avatar3d, color } }))}
                        className={cn(
                          "w-10 h-10 rounded-2xl border-4 transition-all hover:scale-110",
                          formData.avatar3d.color === color ? "border-slate-900 dark:border-white shadow-xl" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative">
                      <input 
                        type="color" 
                        value={formData.avatar3d.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar3d: { ...prev.avatar3d, color: e.target.value } }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 border-2 border-white dark:border-slate-800" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Initial Rotation</span>
                    <span className="text-indigo-600">{formData.avatar3d.rotation}°</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <RotateCw className="w-4 h-4 text-slate-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={formData.avatar3d.rotation}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar3d: { ...prev.avatar3d, rotation: parseInt(e.target.value) } }))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
              
              <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-950/30" />
                <div className="w-full h-full transform scale-125 z-10">
                  <Avatar3DViewer 
                    model={formData.avatar3d.model} 
                    color={formData.avatar3d.color} 
                    rotation={formData.avatar3d.rotation} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-1.5 pt-6"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Country <span className="text-red-500">*</span></label><div className="relative"><select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg appearance-none cursor-pointer text-slate-900 dark:text-white transition-all focus:border-indigo-500">{["India", "USA", "UK", "Canada", "Australia"].map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400" /></div></div>
      </section>
      <div className="pt-8 flex items-center justify-end border-t border-slate-100 dark:border-white/5">
        <button type="submit" disabled={loading} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center space-x-3 font-black shadow-xl transition-all active:scale-95 disabled:opacity-50">{loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /><span>Save Changes</span></>}</button>
      </div>
    </form>
  );

  const renderProfileDetails = () => {
    const currentTab = detailTabs.find(t => t.id === activeDetailTab);
    return (
      <div className="space-y-8">
        <div className="border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex flex-wrap gap-2">
            {detailTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveDetailTab(tab.id); setShowAddForm(false); }}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all font-bold text-[11px] sm:text-sm whitespace-nowrap",
                  activeDetailTab === tab.id 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", activeDetailTab === tab.id ? "" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white break-words">{currentTab.label}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed break-words">{currentTab.description}</p>
          </div>
          {activeDetailTab !== "about" && activeDetailTab !== "socials" && !showAddForm && (
            <button
              onClick={() => handleAddEntry(activeDetailTab)}
              className="text-[#F97316] hover:text-[#EA580C] font-bold flex items-center space-x-2 transition-colors shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Add {currentTab.label}</span>
            </button>
          )}
          {activeDetailTab === "about" && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Update Changes</span>
            </button>
          )}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-hidden">
          {activeDetailTab === "about" && (
            <div className="space-y-6">
              <div className="flex space-x-4 border-b border-slate-100 dark:border-white/5 pb-2 overflow-x-auto scrollbar-hide">
                <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 px-2 whitespace-nowrap">Write</button>
                <button className="text-slate-500 font-bold hover:text-slate-700 px-2 whitespace-nowrap">Preview</button>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm w-full">
                <div className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 p-2 flex flex-wrap gap-1 items-center">
                  {[Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Code, ImageIcon, LinkIcon, Trash2, Undo2, Redo2].map((Icon, i) => (
                    <button key={i} type="button" className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors text-slate-600 dark:text-slate-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                  <div className="flex-1 min-w-[20px]" />
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-600"><Eye className="w-4 h-4" /></button>
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-600"><Maximize2 className="w-4 h-4" /></button>
                </div>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange} 
                  placeholder="Tell us about yourself..." 
                  className="w-full h-[300px] sm:h-[400px] p-4 sm:p-6 outline-none bg-transparent dark:text-white resize-none text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words" 
                />
              </div>
            </div>
          )}
          {(activeDetailTab === "education" || activeDetailTab === "experience" || activeDetailTab === "achievements") && (
            <div className="space-y-6">
              {showAddForm ? (
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 sm:p-8 border border-slate-100 dark:border-white/5 space-y-6">
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => setShowAddForm(false)} className="px-5 py-2 sm:px-6 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm sm:text-base transition-all active:scale-95">Cancel</button>
                    <button onClick={() => handleSaveEntry(activeDetailTab)} className="px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-base transition-all active:scale-95">Save</button>
                  </div>
                  {activeDetailTab === "education" && (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Degree *</label>
                        <div className="relative">
                          <select value={tempEntry.degree} onChange={e => setTempEntry({...tempEntry, degree: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-sm sm:text-base">
                            <option value="">Select your education level</option>
                            <option value="Bachelor of Technology">Bachelor of Technology</option>
                            <option value="Bachelor of Science">Bachelor of Science</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">School / College / University *</label>
                        <input type="text" placeholder="Search for your college" value={tempEntry.school} onChange={e => setTempEntry({...tempEntry, school: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Grade *</label>
                        <div className="flex flex-wrap gap-2">
                          {["GPA", "Percentage", "CGPA"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setTempEntry({...tempEntry, gradeType: type})}
                              className={cn("px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold transition-all text-xs sm:text-sm", tempEntry.gradeType === type ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "border-2 border-slate-100 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5")}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{tempEntry.gradeType}</label>
                        <div className="flex items-center space-x-4">
                          <input type="text" value={tempEntry.grade} onChange={e => setTempEntry({...tempEntry, grade: e.target.value})} className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                          <span className="text-slate-500 font-bold shrink-0 text-sm">Out of 10</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">From</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.fromMonth} onChange={e => setTempEntry({...tempEntry, fromMonth: e.target.value})}>{months.map(m => <option key={m}>{m}</option>)}</select>
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.fromYear} onChange={e => setTempEntry({...tempEntry, fromYear: e.target.value})}>{years.map(y => <option key={y}>{y}</option>)}</select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">To</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.toMonth} onChange={e => setTempEntry({...tempEntry, toMonth: e.target.value})}>{months.map(m => <option key={m}>{m}</option>)}</select>
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.toYear} onChange={e => setTempEntry({...tempEntry, toYear: e.target.value})}>{years.map(y => <option key={y}>{y}</option>)}</select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeDetailTab === "experience" && (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Description *</label>
                        <input type="text" value={tempEntry.title} onChange={e => setTempEntry({...tempEntry, title: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company *</label>
                        <input type="text" value={tempEntry.company} onChange={e => setTempEntry({...tempEntry, company: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea value={tempEntry.description} onChange={e => setTempEntry({...tempEntry, description: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl min-h-[150px] text-sm sm:text-base" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">From</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.fromMonth} onChange={e => setTempEntry({...tempEntry, fromMonth: e.target.value})}>{months.map(m => <option key={m}>{m}</option>)}</select>
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.fromYear} onChange={e => setTempEntry({...tempEntry, fromYear: e.target.value})}>{years.map(y => <option key={y}>{y}</option>)}</select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">To</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.toMonth} onChange={e => setTempEntry({...tempEntry, toMonth: e.target.value})}>{months.map(m => <option key={m}>{m}</option>)}</select>
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.toYear} onChange={e => setTempEntry({...tempEntry, toYear: e.target.value})}>{years.map(y => <option key={y}>{y}</option>)}</select>
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="checkbox" checked={tempEntry.current} onChange={e => setTempEntry({...tempEntry, current: e.target.checked})} className="w-5 h-5 rounded border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300 font-bold">I currently work here</span>
                      </label>
                    </div>
                  )}
                  {activeDetailTab === "achievements" && (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title *</label>
                        <input type="text" value={tempEntry.title} onChange={e => setTempEntry({...tempEntry, title: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea value={tempEntry.description} onChange={e => setTempEntry({...tempEntry, description: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl min-h-[150px] text-sm sm:text-base" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL *</label>
                        <input type="text" value={tempEntry.url} onChange={e => setTempEntry({...tempEntry, url: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl text-sm sm:text-base" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Issue Date</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.issueMonth} onChange={e => setTempEntry({...tempEntry, issueMonth: e.target.value})}>{months.map(m => <option key={m}>{m}</option>)}</select>
                            <select className="px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl appearance-none text-xs sm:text-sm" value={tempEntry.issueYear} onChange={e => setTempEntry({...tempEntry, issueYear: e.target.value})}>{years.map(y => <option key={y}>{y}</option>)}</select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData[activeDetailTab].length === 0 ? (
                    <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-10 sm:p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-white/10">
                      <currentTab.icon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mb-6" />
                      <h4 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-400">No {currentTab.label} added yet</h4>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-500 mt-2">Click the button above to add your first entry.</p>
                    </div>
                  ) : (
                    formData[activeDetailTab].map((entry, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between group hover:shadow-md transition-all gap-4">
                        <div className="flex space-x-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-lg sm:text-xl">{i + 1}</div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white break-words">{entry.title || entry.school || entry.degree}</h4>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium break-words px-0.5">{entry.company || entry.degree || (entry.description && entry.description.substring(0, 100) + "...")}</p>
                            <span className="text-[10px] sm:text-xs px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-md inline-block font-bold">
                              {entry.fromMonth} {entry.fromYear} - {entry.current ? "Present" : `${entry.toMonth} ${entry.toYear}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end sm:justify-start">
                          <button onClick={() => handleEditEntry(activeDetailTab, i)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                            <PenLine className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteEntry(activeDetailTab, i)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )} 
                  {formData[activeDetailTab].length > 0 && (
                    <div className="pt-6 flex justify-end">
                      <button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                        {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /><span>Save Changes</span></>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeDetailTab === "socials" && (
            <div className="space-y-8 max-w-2xl">
                {[
                  { name: "linkedin", label: "Linkedin", icon: Linkedin, placeholder: "johndoe", prefix: SOCIAL_PREFIXES.linkedin },
                  { name: "twitter", label: "Twitter", icon: Twitter, placeholder: "johndoe", prefix: SOCIAL_PREFIXES.twitter },
                  { name: "website", label: "Website", icon: Globe, placeholder: "https://www.portfolio.com" },
                  { name: "resume", label: "Resume", icon: BookOpen, placeholder: "https://drive.com/resume" }
                ].map(social => (
                  <div key={social.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 group">
                    <div className="flex items-center space-x-3 w-full sm:w-40 shrink-0">
                      <div className="w-9 h-9 flex items-center justify-center p-2 bg-slate-50 dark:bg-white/5 rounded-xl group-focus-within:bg-indigo-50 transition-colors">
                        <social.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-focus-within:text-indigo-600" />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{social.label}</span>
                    </div>
                    <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl transition-all focus-within:border-indigo-500 overflow-hidden px-4 h-12">
                      {social.prefix && (
                        <span className="text-slate-400 font-medium select-none whitespace-nowrap text-xs truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none mr-2">
                          {social.prefix}
                        </span>
                      )}
                      <input
                        type="text"
                        name={`links.${social.name}`}
                        value={formData.links[social.name]}
                        onChange={handleInputChange}
                        placeholder={social.placeholder}
                        className="flex-1 bg-transparent font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-300 text-sm"
                      />
                    </div>
                  </div>
                ))}
              <div className="pt-10 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 md:px-10 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex items-center space-x-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPlatform = () => (
    <div className="space-y-12">
      <section className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Accounts</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/5 group hover:shadow-md transition-all gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"
                />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">Google Account</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
            Connect
          </button>
        </div>
      </section>
      <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
      <section className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Professional</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 group">
          <div className="w-full md:w-48 flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Portfolio</span>
            <ChevronRight className="w-4 h-4 text-slate-400 hidden md:block" />
          </div>
          <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl transition-all focus-within:border-indigo-500 overflow-hidden px-4">
            <input
              type="text"
              name="links.portfolio"
              value={formData.links.portfolio}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
              className="flex-1 py-3 bg-transparent font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-300 text-sm sm:text-base"
            />
          </div>
        </div>
      </section>
      <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
      <section className="space-y-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Problem Solving</h3>
        <div className="space-y-6">
          {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 group">
              <div className="w-full md:w-48 flex items-center space-x-3 shrink-0">
                <div className="w-10 h-10 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  {config.logo ? (
                    <img src={config.logo} alt={config.label} className="w-full h-full object-contain" />
                  ) : (
                    <config.icon className={cn("w-6 h-6", config.color)} />
                  )}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{config.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 hidden md:block" />
              </div>
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl transition-all focus-within:border-indigo-500 overflow-hidden px-4">
                <span className="text-slate-400 font-medium select-none whitespace-nowrap text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none mr-1">
                  {config.prefix}
                </span>
                <input
                  type="text"
                  name={`platforms.${key}`}
                  value={formData.platforms[key].username}
                  onChange={handleInputChange}
                  placeholder={config.placeholder}
                  className="flex-1 py-3 bg-transparent font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-300 text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center space-x-3 shrink-0 justify-end sm:justify-start">
                {formData.platforms[key].verified ? (
                  <>
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <button onClick={() => setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, [key]: { username: "", verified: false } } }))} className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, [key]: { ...prev.platforms[key], verified: true } } }))} className="px-6 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 rounded-xl font-bold transition-all border border-slate-200 dark:border-white/10">{key === "geeksforgeeks" ? "Verify" : "Submit"}</button>
                    {formData.platforms[key].username && (
                      <button onClick={() => setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, [key]: { username: "", verified: false } } }))} className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="pt-10 flex justify-end border-t border-slate-100 dark:border-white/5">
        <button onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex items-center space-x-3 transition-all active:scale-95 disabled:opacity-50">
          {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /><span>Save Changes</span></>}
        </button>
      </div>
    </div>
  );


  const renderAccounts = () => {
    const isIdChanged = tempId !== user?.skillswapId;
    const isPasswordChanged = passwordForm.currentPassword !== "" || passwordForm.newPassword !== "" || passwordForm.confirmPassword !== "";
    const isPasswordSubmitDisabled = !isPasswordChanged || passwordForm.newPassword !== passwordForm.confirmPassword || passwordForm.newPassword === "";

    return (
      <div className="space-y-12">
        <section className="space-y-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Account Information</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 flex-1 gap-2">
                <span className="w-full sm:w-32 text-slate-500 font-bold shrink-0">SkillSwap Id:</span>
                {isEditingId ? (
                  <input
                    type="text"
                    value={tempId}
                    onChange={e => setTempId(e.target.value)}
                    className="flex-1 max-w-sm px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-bold"
                  />
                ) : (
                  <span className="text-slate-900 dark:text-white font-bold">{formData.skillswapId}</span>
                )}
              </div>
              <div className="flex items-center space-x-4 justify-end">
                {isEditingId ? (
                  <>
                    <button onClick={() => { setIsEditingId(false); setTempId(formData.skillswapId); }} className="text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
                    <button onClick={handleSaveId} disabled={loading || !isIdChanged} className={cn("px-4 py-2 rounded-lg font-bold transition-all", isIdChanged ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>Save</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditingId(true)} className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Edit</button>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 py-2 gap-2">
              <span className="w-full sm:w-32 text-slate-500 font-bold">Email:</span>
              <span className="text-slate-900 dark:text-white font-semi-bold">{formData.email}</span>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Update Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
            {[
              { id: "current", label: "Original Password:", placeholder: "Old Password", key: "currentPassword" },
              { id: "new", label: "New Password:", placeholder: "New Password", key: "newPassword" },
              { id: "confirm", label: "Confirm Password:", placeholder: "Confirm Password", key: "confirmPassword" }
            ].map(field => (
              <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-6">
                <label className="w-48 text-slate-900 dark:text-white font-bold">{field.label}</label>
                <div className="flex-1 relative">
                  <input
                    type={showPasswords[field.id] ? "text" : "password"}
                    placeholder={field.placeholder}
                    value={passwordForm[field.key]}
                    onChange={e => setPasswordForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-white/10 rounded-xl focus:border-indigo-500 outline-none transition-all pr-12 text-slate-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPasswords[field.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading || isPasswordSubmitDisabled}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold transition-all shadow-lg",
                  isPasswordSubmitDisabled 
                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                )}
              >
                Save
              </button>
            </div>
          </form>
        </section>

        <section className="pt-10 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Delete Account</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button onClick={handleDeleteAccount} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 whitespace-nowrap">Delete Account</button>
          </div>
        </section>
      </div>
    );
  };

  const renderSkills = () => {
    const addSkill = () => {
      if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill.trim()]
        }));
        setNewSkill("");
      }
    };

    const removeSkill = (skillToRemove) => {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skillToRemove)
      }));
    };

    return (
      <div className="space-y-12">
        <section className="space-y-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Add Your Skills</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Add the technology and tools you are proficient in.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="Type a skill (e.g., React, Node.js)..."
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-bold h-16 shadow-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <button
              onClick={addSkill}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider h-16 whitespace-nowrap flex items-center justify-center"
            >
              Add Skill
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Added Skills</h4>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence mode="popLayout">
                {formData.skills.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-16 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10"
                  >
                    <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 font-medium">No skills added yet. Start by typing above!</p>
                  </motion.div>
                ) : (
                  formData.skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="group flex items-center space-x-2 px-5 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-200">{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <div className="pt-10 flex justify-end border-t border-slate-100 dark:border-white/5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex items-center space-x-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-80 shrink-0 space-y-4 md:sticky md:top-28">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 text-[#F97316] hover:text-[#EA580C] transition-colors font-bold group px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Profile</span>
            </button>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 md:p-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex md:flex-col overflow-x-auto md:overflow-visible scrollbar-hide space-x-2 md:space-x-0 md:space-y-1.5 backdrop-blur-xl">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveItem(item.id); setShowAddForm(false); }}
                  className={cn(
                    "flex-1 md:w-full flex items-center justify-center md:justify-start space-x-3 md:space-x-4 px-5 py-3.5 md:p-4 rounded-[1.5rem] transition-all relative group whitespace-nowrap",
                    activeItem === item.id 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-black" 
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 md:w-6 md:h-6 flex items-center justify-center transition-all shrink-0",
                    activeItem === item.id ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
                  )}>
                    {item.icon && <item.icon className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className={cn(
                    "font-bold text-sm md:text-base transition-colors",
                    activeItem === item.id ? "text-white" : ""
                  )}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <main className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/5 min-h-[800px]">
            <div className="max-w-4xl mx-auto md:mx-0">
              <header className="mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{sidebarItems.find(i => i.id === activeItem)?.label}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-medium">{activeItem === "basic" ? "You can manage your details here." : activeItem === "platform" ? "You can update and verify your platform details here." : activeItem === "accounts" ? "You can manage your accounts here." : "Update your section settings and preferences."}</p>
              </header>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeItem === "basic" ? renderBasicInfo() : activeItem === "details" ? renderProfileDetails() : activeItem === "platform" ? renderPlatform() : activeItem === "skills" ? renderSkills() : activeItem === "accounts" ? renderAccounts() : (
                  <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center text-indigo-500">{(() => { const ActiveIcon = { details: Settings, platform: LayoutGrid, skills: Star, accounts: Fingerprint }[activeItem]; return ActiveIcon ? <ActiveIcon className="w-10 h-10" /> : <User className="w-10 h-10" />; })()}</div>
                    <div className="space-y-1"><h3 className="text-xl font-black text-slate-900 dark:text-white">Section Ready</h3><p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Standing by for your input. Please provide the elements you'd like to add to this section.</p></div>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {message.content && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 font-bold flex items-center space-x-3", message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span>{message.content}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
