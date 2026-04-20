import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Repeat, BookOpen, Star, Trash2, ShieldAlert, TrendingUp, Activity, ChevronRight, 
  Search, Filter, BarChart3, Calendar, Settings, Bell, BellRing, LogOut, LayoutDashboard, 
  ShieldCheck, MoreVertical, ArrowUpRight, ArrowDownRight, Download, Ban, CheckCircle, 
  AlertTriangle, History, Terminal, Grid, Globe, Lock, Unlock, Mail, Save, Clock, Menu, X
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const ACTION_ICONS = {
  LOGIN: <Terminal className="w-3.5 h-3.5" />,
  UPDATE_SETTINGS: <Settings className="w-3.5 h-3.5" />,
  BLOCK_USER: <Ban className="w-3.5 h-3.5 text-red-500" />,
  UNBLOCK_USER: <Unlock className="w-3.5 h-3.5 text-indigo-500" />,
  DELETE_USER: <Trash2 className="w-3.5 h-3.5 text-red-500" />,
  BROADCAST: <Bell className="w-3.5 h-3.5 text-amber-500" />,
  DEFAULT: <Activity className="w-3.5 h-3.5" />
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [skills, setSkills] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ maintenanceMode: false, platformName: "SkillSwap", allowNewRegistrations: true, systemNotice: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    if (!adminData) { navigate("/admin-login"); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, swapsRes, reviewsRes, skillsRes, logsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/swaps"),
        fetch("/api/admin/reviews"),
        fetch("/api/admin/skills"),
        fetch("/api/admin/logs"),
        fetch("/api/admin/settings")
      ]);
      
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setSwaps(await swapsRes.json());
      setReviews(await reviewsRes.json());
      setSkills(await skillsRes.json());
      setLogs(await logsRes.json());
      setSettings(await settingsRes.json());
    } catch (err) {
      console.error("Data fetch failure", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(await res.json());
        alert("System configuration updated.");
        fetchData();
      }
    } catch (err) { alert("Settings update failed"); }
  };

  const toggleUserStatus = async (userId, currentBlockedStatus) => {
    try {
      await fetch("/api/admin/users/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: !currentBlockedStatus })
      });
      fetchData();
    } catch (err) { alert("Status update failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete user?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Remove skill asset?")) return;
    await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: broadcastMessage })
    });
    alert("Broadcast transmitted.");
    setBroadcastMessage("");
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-indigo-500">SYNCHRONIZING_GOVERNANCE_HUB...</div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020410] text-slate-800 dark:text-slate-200 flex overflow-hidden font-sans">
      {/* MOBILE SIDEBAR MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#05071a] z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex flex-col
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30"><ShieldCheck className="w-5 h-5 text-white" /></div>
                <span className="font-extrabold text-xs tracking-[0.2em] uppercase">Control<span className="text-indigo-600">Deck</span></span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-500"><X className="w-5 h-5" /></button>
           </div>
           <nav className="space-y-1">
              <NavLink icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} />
              <NavLink icon={Users} label="Identities" active={activeTab === "users"} onClick={() => { setActiveTab("users"); setMobileMenuOpen(false); }} />
              <NavLink icon={Grid} label="Asset Management" active={activeTab === "skills"} onClick={() => { setActiveTab("skills"); setMobileMenuOpen(false); }} />
              <NavLink icon={Repeat} label="Exchange Audit" active={activeTab === "swaps"} onClick={() => { setActiveTab("swaps"); setMobileMenuOpen(false); }} />
              <NavLink icon={Star} label="Reputation Monitor" active={activeTab === "reviews"} onClick={() => { setActiveTab("reviews"); setMobileMenuOpen(false); }} />
              <NavLink icon={History} label="System Activity" active={activeTab === "logs"} onClick={() => { setActiveTab("logs"); setMobileMenuOpen(false); }} />
              <NavLink icon={Settings} label="Global Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} />
           </nav>
        </div>
        <div className="mt-auto p-6 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/5">
           <button onClick={() => { localStorage.removeItem("adminData"); navigate("/"); }} className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-500/5 text-indigo-500/70 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] italic border border-indigo-500/10 shadow-lg shadow-indigo-600/0 hover:shadow-indigo-600/20">
              <LogOut className="w-4 h-4" />
              <span>Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#020410]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm lg:text-lg font-black tracking-tighter uppercase italic">{activeTab.replace('-', ' ')} Hub</h1>
           </div>
           <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                 <span>Operational</span>
              </div>
              <button 
                onClick={() => setActiveTab("broadcast")} 
                className={`p-2 lg:p-2.5 rounded-xl transition-all shadow-lg ${activeTab === 'broadcast' ? 'bg-indigo-700' : 'bg-indigo-600'} text-white shadow-indigo-600/20`}
              >
                <BellRing className="w-4 h-4 lg:w-5 h-5" />
              </button>
           </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto pb-24">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox label="Total Identities" value={stats?.totalUsers || 0} icon={Users} color="text-blue-500" />
                    <StatBox label="Market Flux" value={stats?.totalSwaps || 0} icon={Repeat} color="text-indigo-500" />
                    <StatBox label="Knowledge Assets" value={stats?.totalSkills || 0} icon={Grid} color="text-purple-500" />
                    <StatBox label="Social Signals" value={stats?.totalReviews || 0} icon={Star} color="text-amber-500" />
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                       <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-8 italic flex items-center justify-between">
                          <span>Eco-System Pulse</span>
                          <div className="flex items-center space-x-4">
                             <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[8px] font-black uppercase">Subscribers</span></div>
                             <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-[8px] font-black uppercase">Market Swaps</span></div>
                          </div>
                       </h3>
                       <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={stats?.growthData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                               <defs>
                                 <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="swapGradient" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.05} />
                               <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="italic" />
                               <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                               <Tooltip 
                                 contentStyle={{ backgroundColor: 'rgba(2, 4, 16, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                 itemStyle={{ padding: '2px 0' }}
                                 cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                               />
                               <Area type="monotone" dataKey="users" name="Subscribers" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#userGradient)" animationDuration={2000} />
                               <Area type="monotone" dataKey="swaps" name="Swaps" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#swapGradient)" animationDuration={2500} strokeDasharray="5 5" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                    <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                       <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center justify-between">
                          <span className="flex items-center"><Activity className="w-3 h-3 mr-2 text-indigo-500" /> Pulse Streams</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Live</span>
                       </h3>
                       <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-white/5">
                          {logs.length === 0 ? (
                             <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                   <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                                   <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                                      <Activity className="w-8 h-8 text-indigo-500/50" />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">System Stasis</h4>
                                   <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed max-w-[200px]">No active pulse signals detected in current cycle.</p>
                                </div>
                             </div>
                          ) : logs.slice(0, 6).map(log => (
                            <div key={log._id} className="relative pl-10 group transition-all">
                               <div className="absolute left-0 top-0 w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center z-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                  {ACTION_ICONS[log.action] || ACTION_ICONS.DEFAULT}
                               </div>
                               <div>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{log.action.replace('_', ' ')}</p>
                                    <span className="text-[9px] font-bold text-slate-400 italic">{formatRelativeTime(log.timestamp)}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-medium truncate max-w-[150px] italic">Target: {log.target}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                       <button onClick={() => setActiveTab("logs")} className="mt-8 w-full py-4 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600/5 rounded-2xl transition-all border border-indigo-600/10">Explore Full Audit</button>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Identity Management</h2>
                    <div className="relative group w-full sm:w-auto">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-6 text-xs outline-none focus:ring-1 focus:ring-indigo-600 w-full sm:w-72" placeholder="Search Filter..." />
                    </div>
                 </div>
                 <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto w-full">
                    <table className="w-full text-left font-medium">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <th className="p-6">Subscriber</th>
                             <th className="p-6">Access Protocol</th>
                             <th className="p-6">Verification</th>
                             <th className="p-6 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody>
                          {users.length === 0 ? (
                            <tr><td colSpan="4" className="py-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10">
                                  <Users className="w-6 h-6 text-blue-500/40" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Identity Void</h4>
                              </div>
                            </td></tr>
                          ) : users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                            <tr key={user._id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                               <td className="p-6 flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-black text-xs">{user.name[0]}</div>
                                  <div><p className="text-xs font-black uppercase tracking-tight">{user.name}</p><p className="text-[10px] text-slate-500">{user.email}</p></div>
                               </td>
                               <td className="p-6">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${!user.isBlocked ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                     {!user.isBlocked ? 'Authorized' : 'Blocked'}
                                  </span>
                               </td>
                               <td className="p-6"><span className="text-[10px] font-mono font-bold text-slate-500">REG_{user._id.slice(-6).toUpperCase()}</span></td>
                               <td className="p-6 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                     <button onClick={() => toggleUserStatus(user._id, user.isBlocked)} className={`p-2.5 rounded-lg transition-all ${!user.isBlocked ? 'text-amber-500 hover:bg-amber-500/10' : 'text-green-500 hover:bg-green-500/10'}`}>{!user.isBlocked ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
                                     <button onClick={() => handleDeleteUser(user._id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "skills" && (
              <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Knowledge Asset Moderation</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-[#05071a] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                           <div className="w-16 h-16 bg-purple-500/5 rounded-full flex items-center justify-center border border-purple-500/10">
                              <Grid className="w-6 h-6 text-purple-500/40" />
                           </div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Asset Depletion</h4>
                        </div>
                     ) : skills.map(skill => (
                      <div key={skill._id} className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:shadow-2xl transition-all group relative">
                         <div className="flex justify-between items-start mb-6">
                            <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{skill.category}</span>
                            <button onClick={() => handleDeleteSkill(skill._id)} className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <h4 className="font-black text-lg mb-2 truncate">{skill.name}</h4>
                         <p className="text-xs text-slate-500 font-medium mb-8 line-clamp-2 italic">"{skill.description}"</p>
                         <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                               <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">{skill.owner?.name?.[0]}</div>
                               <span className="text-[10px] font-black uppercase text-slate-400">{skill.owner?.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{new Date(skill.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "swaps" && (
              <motion.div key="swaps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Market Transaction Audit</h2>
                 <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto w-full">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <th className="p-6">Economic Path</th>
                             <th className="p-6">Asset Sync</th>
                             <th className="p-6">State</th>
                             <th className="p-6 text-right">Temporal ID</th>
                          </tr>
                       </thead>
                       <tbody>
                          {swaps.length === 0 ? (
                            <tr><td colSpan="4" className="py-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/10">
                                  <Repeat className="w-6 h-6 text-indigo-500/40" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Economic Stasis</h4>
                              </div>
                            </td></tr>
                          ) : swaps.map(swap => (
                            <tr key={swap._id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 transition-colors">
                               <td className="p-6 font-bold text-xs"><span className="text-indigo-500">{swap.sender?.name}</span> ↔ <span className="text-purple-500">{swap.receiver?.name}</span></td>
                               <td className="p-6 font-black text-[10px] tracking-tight uppercase text-slate-400 italic">"{swap.senderSkill?.name}" for "{swap.receiverSkill?.name}"</td>
                               <td className="p-6">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${swap.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                     {swap.status}
                                  </span>
                               </td>
                               <td className="p-6 text-right text-[10px] font-mono font-bold text-slate-500">{new Date(swap.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Social Reputation Monitor</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-[#05071a] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                           <div className="w-16 h-16 bg-amber-500/5 rounded-full flex items-center justify-center border border-amber-500/10">
                              <Star className="w-6 h-6 text-amber-500/40" />
                           </div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Feedback Silence</h4>
                        </div>
                     ) : reviews.map(review => (
                      <div key={review._id} className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-3xl p-10 hover:shadow-2xl transition-all group">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-xs">{review.reviewer?.name?.[0]}</div>
                               <div><p className="text-xs font-black uppercase tracking-tight">{review.reviewer?.name}</p><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />)}</div></div>
                            </div>
                            <button className="text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                         </div>
                         <p className="text-xs italic font-medium leading-relaxed text-slate-500">"{review.comment}"</p>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "logs" && (
               <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Governance Audit Trail</h2>
                  <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                     <div className="overflow-x-auto w-full">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <th className="p-6">Identity</th><th className="p-6">Operation</th><th className="p-6">Timeline</th><th className="p-6 text-right">Details</th>
                           </tr>
                        </thead>
                        <tbody>
                           {logs.length === 0 ? <tr><td colSpan="4" className="p-20 text-center text-[10px] font-black uppercase text-slate-500 italic opacity-20">Dormant trail.</td></tr> : logs.map(log => (
                             <tr key={log._id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 transition-colors">
                                <td className="p-6 text-[10px] font-black uppercase text-slate-400">{log.admin}</td>
                                <td className="p-6"><span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-mono font-black uppercase border border-indigo-500/20">{log.action}</span></td>
                                <td className="p-6 text-[10px] font-bold text-slate-500 uppercase">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-6 text-right text-[10px] font-bold text-slate-400 italic truncate max-w-[200px]">{log.target}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto space-y-8 lg:py-10">
                 <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
                    <h2 className="text-xl font-black mb-10 italic uppercase tracking-tight flex items-center"><Globe className="w-5 h-5 mr-3 text-indigo-500" /> System Orchestration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-10">
                          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Maintenance Protocol</label><button onClick={() => handleUpdateSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} className={`w-full py-5 rounded-3xl border transition-all flex items-center justify-center space-x-4 ${settings.maintenanceMode ? 'bg-red-500 border-red-600 text-white shadow-2xl shadow-red-500/40' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>{settings.maintenanceMode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}<span className="text-xs font-black uppercase tracking-[0.3em]">{settings.maintenanceMode ? 'DEACTIVATE MODE' : 'ACTIVATE MODE'}</span></button></div>
                          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">New Node Enrollment</label><div className="flex items-center justify-between p-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"><span className="text-xs font-black uppercase tracking-widest">{settings.allowNewRegistrations ? 'Open' : 'Gated'}</span><button onClick={() => handleUpdateSettings({ ...settings, allowNewRegistrations: !settings.allowNewRegistrations })} className={`w-14 h-7 rounded-full relative transition-all ${settings.allowNewRegistrations ? 'bg-green-500' : 'bg-slate-400'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.allowNewRegistrations ? 'right-1' : 'left-1'}`} /></button></div></div>
                       </div>
                       <div className="space-y-10">
                          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Brand Nomenclature</label><input value={settings.platformName} onChange={(e) => setSettings({...settings, platformName: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 text-xs font-black uppercase outline-none focus:ring-1 focus:ring-indigo-600 shadow-inner" placeholder="Platform ID..." /></div>
                          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Global System Directive</label><textarea value={settings.systemNotice} onChange={(e) => setSettings({...settings, systemNotice: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 text-xs font-black uppercase outline-none focus:ring-1 focus:ring-indigo-600 min-h-[140px] shadow-inner" placeholder="Directive..." /></div>
                       </div>
                    </div>
                    <button onClick={() => handleUpdateSettings(settings)} className="mt-14 w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center space-x-3 group"><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>EXECUTE SYSTEM SYNC</span></button>
                 </div>
              </motion.div>
            )}

            {activeTab === "broadcast" && (
               <motion.div key="broadcast" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-3xl mx-auto py-20 text-center space-y-12">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/50 animate-bounce"><BellRing className="w-12 h-12 text-white" /></div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Global Broadcast Unit</h2>
                  <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl">
                     <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 text-xs font-black uppercase italic outline-none focus:ring-1 focus:ring-indigo-600 min-h-[250px] shadow-inner" placeholder="Compose global alert..." />
                     <button onClick={handleBroadcast} className="mt-10 w-full py-6 bg-indigo-600 text-white rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl hover:bg-indigo-700 transition-all">Submit Transmission</button>
                  </div>
               </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavLink({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-5 py-4.5 rounded-[1.25rem] transition-all group relative ${active ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-2" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-white"}`}>
      <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "group-hover:scale-110 group-hover:text-indigo-400 transition-all"}`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-glow" className="absolute right-4 w-1 h-3 rounded-full bg-white shadow-[0_0_15px_#fff]" />}
    </button>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-[#05071a] border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] shadow-sm group hover:border-indigo-600/30 transition-all hover:-translate-y-1">
       <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/10 flex items-center justify-center mb-6 ${color} group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm`}><Icon className="w-6 h-6" /></div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
       <h4 className="text-3xl font-black italic tracking-tighter">{value}</h4>
    </div>
  );
}
