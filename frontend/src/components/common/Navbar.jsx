import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  LogOut,
  User,
  Search,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Settings,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { notificationService } from "@/src/services/notificationService";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Polling for demo purposes, or just once on mount
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getNotifications();
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  };

  const navLinks = [
    { name: "Explore", path: "/search", icon: Search },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      protected: true,
    },
    { name: "Messages", path: "/chat", icon: MessageSquare, protected: true },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      protected: true,
    },
    { name: "Profile", path: "/profile", icon: User, protected: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.protected || isAuthenticated,
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-400 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center"
            >
              {/* Premium Round Glow Layer */}
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glassmorphic Round Container */}
              <div className="w-11 h-11 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden relative shadow-[0_0_20px_rgba(79,70,229,0.1)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-500">
                <img 
                  src="/assets/logo.png" 
                  alt="SkillSwap Prestige Logo" 
                  className="w-7 h-7 object-contain dark:invert dark:brightness-200 transition-transform duration-500 group-hover:scale-110" 
                />
                
                {/* Subtle internal shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.2em] text-slate-900 dark:text-white leading-none uppercase italic">
                {window.settings?.platformName?.slice(0, 5) || "SKILL"}<span className="text-indigo-500">{window.settings?.platformName?.slice(5) || "SWAP"}</span>
              </span>
              <span className="text-[8px] font-bold tracking-[0.4em] text-slate-500 dark:text-slate-500 uppercase mt-1 leading-none">
                Prestige Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">


            {/* Main Nav Links */}
            <div className="flex items-center space-x-6 px-4 border-r border-slate-200 dark:border-white/10 mr-2">
              {filteredLinks.filter(link => !["Profile", "Logout"].includes(link.name)).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-semibold transition-all hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 relative group",
                    location.pathname === link.path
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <link.icon className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>{link.name}</span>
                  {link.name === "Notifications" && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-indigo-600 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 font-bold"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-5 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full p-[2px] transition-all duration-300",
                    isProfileOpen ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-900 dark:text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(10px)" }}
                      transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                      className="absolute right-0 mt-4 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white dark:border-white/10 overflow-hidden z-[60]"
                    >
                      {/* User Info Header */}
                      <div className="p-6 pb-4 flex flex-col items-center border-b border-slate-100 dark:border-white/5 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-xl">
                          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {user?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{user?.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate w-full text-center mt-1">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-3">
                        <MenuItem 
                          to="/profile" 
                          icon={User} 
                          label="Profile" 
                          onClick={() => setIsProfileOpen(false)} 
                        />
                        <MenuItem 
                          to="/edit-profile" 
                          icon={Settings} 
                          label="Edit Profile" 
                          onClick={() => setIsProfileOpen(false)} 
                        />
                        <MenuItem 
                          to="/profile-card" 
                          icon={CreditCard} 
                          label="Profile Card" 
                          onClick={() => setIsProfileOpen(false)} 
                        />
                        
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-2" />
                        
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold group"
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/5 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <LogOut className="w-5 h-5" />
                          </div>
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">


            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative transition-all duration-300 active:scale-90"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : isAuthenticated ? (
                  <motion.div
                    key="avatar"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/40"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-900 dark:text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 overflow-y-auto max-h-[calc(100vh-64px)] shadow-2xl"
          >
            <div className="px-4 pt-4 pb-8 space-y-3">
              {/* Nav Links Mobile */}

              {filteredLinks
                .filter((link) => link.name !== "Profile")
                .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-4 p-4 rounded-2xl transition-all",
                    location.pathname === link.path
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-bold">{link.name}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-4" />
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4 p-4 mb-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {user?.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-bold"
                    >
                      <User className="w-5 h-5 text-indigo-500" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/edit-profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-bold"
                    >
                      <Settings className="w-5 h-5 text-indigo-500" />
                      <span>Edit Profile</span>
                    </Link>

                    <div
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-bold cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 text-indigo-500" />
                      <span>Profile Card</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="w-full p-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl flex items-center space-x-4 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all mt-4"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="p-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-center rounded-2xl font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="p-4 bg-indigo-600 text-white text-center rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Helper MenuItem component
function MenuItem({ to, icon: Icon, label, onClick }) {
  const content = (
    <div className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group cursor-pointer">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-bold">{label}</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return <div onClick={onClick}>{content}</div>;
}
