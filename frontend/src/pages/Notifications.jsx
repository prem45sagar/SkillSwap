import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { useState, useEffect } from "react";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Star,
  CheckCircle2,
  Clock,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { notificationService } from "@/src/services/notificationService";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      // Map backend types to icons
      const iconMap = {
        message: MessageSquare,
        request: UserPlus,
        rating: Star,
        accepted: CheckCircle2,
        rejected: Clock,
        system: Bell,
        follow: Users
      };
      
      const colorMap = {
        message: "text-indigo-400",
        request: "text-emerald-400",
        rating: "text-amber-400",
        accepted: "text-emerald-400",
        rejected: "text-red-400",
        system: "text-purple-400",
        follow: "text-indigo-400"
      };
 
      const bgMap = {
        message: "bg-indigo-500/10",
        request: "bg-emerald-500/10",
        rating: "bg-amber-500/10",
        accepted: "bg-emerald-500/10",
        rejected: "bg-red-500/10",
        system: "bg-purple-500/10",
        follow: "bg-indigo-500/10"
      };

      const mapped = data.map(n => ({
        ...n,
        id: n._id,
        unread: !n.isRead,
        icon: iconMap[n.type] || Bell,
        color: colorMap[n.type] || "text-indigo-400",
        bg: bgMap[n.type] || "bg-indigo-500/10",
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, isRead: true })));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            Notifications
            {notifications.filter((n) => n.unread).length > 0 && (
              <span className="ml-4 px-2 py-0.5 bg-indigo-600 text-xs text-white rounded-full font-bold">
                {notifications.filter((n) => n.unread).length} New
              </span>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Stay updated with your skill swap activity.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.slice(0, visibleCount).map((notification, i) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-6 rounded-3xl border transition-all group relative overflow-hidden",
              notification.unread
                ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                : "bg-white dark:bg-white/5 border-slate-400 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10",
            )}
          >
            {notification.unread && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            )}

            <div className="flex items-start gap-6">
              <div className={cn("p-3 rounded-2xl shrink-0", notification.bg)}>
                <notification.icon
                  className={cn("w-6 h-6", notification.color)}
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 mr-1" />
                    {notification.time}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {notification.description}
                </p>

                <div className="mt-3 flex items-center">
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More / View Less buttons */}
      {notifications.length > 6 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {visibleCount < notifications.length && (
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 5, notifications.length))}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/10"
            >
              <ChevronDown className="w-4 h-4" />
              View More ({notifications.length - visibleCount} remaining)
            </button>
          )}
          {visibleCount > 6 && (
            <button
              onClick={() => setVisibleCount(6)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <ChevronUp className="w-4 h-4" />
              View Less
            </button>
          )}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 rounded-[3rem] shadow-xl">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            All caught up!
          </h3>
          <p className="text-slate-600 dark:text-slate-500 mt-2">
            No new notifications at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
