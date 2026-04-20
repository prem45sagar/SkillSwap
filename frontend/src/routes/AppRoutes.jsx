import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/src/pages/Home";
import Login from "@/src/pages/Login";
import Register from "@/src/pages/Register";
import Dashboard from "@/src/pages/Dashboard";
import Profile from "@/src/pages/Profile";
import SearchSkills from "@/src/pages/SearchSkills";
import Chat from "@/src/pages/Chat";
import Notifications from "@/src/pages/Notifications";
import History from "@/src/pages/History";
import SwapRequests from "@/src/pages/SwapRequests";
import PublicProfile from "@/src/pages/PublicProfile";
import EditProfile from "@/src/pages/EditProfile";
import NotFound from "@/src/pages/NotFound";
import MySkills from "@/src/pages/MySkills";
import AllReviews from "@/src/pages/AllReviews";
import ProfileCard from "@/src/pages/ProfileCard";
import LegalPrivacy from "@/src/pages/LegalPrivacy";
import TermsOfService from "@/src/pages/TermsOfService";
import ContactUs from "@/src/pages/ContactUs";
import AdminLogin from "@/src/pages/AdminLogin";
import AdminDashboard from "@/src/pages/AdminDashboard";
import { useAuth } from "@/src/context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-slow" />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-[0.3em] uppercase italic">
            Skill<span className="text-indigo-500">Swap</span>
          </h2>
          <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Establishing Secure Connection...
          </p>
        </div>
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-slow" />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-[0.3em] uppercase italic">
            Skill<span className="text-indigo-500">Swap</span>
          </h2>
          <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Syncing Experience...
          </p>
        </div>
      </div>
    );
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/search" element={<SearchSkills />} />
      <Route path="/privacy" element={<LegalPrivacy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:id/reviews"
        element={
          <ProtectedRoute>
            <AllReviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/swaps"
        element={
          <ProtectedRoute>
            <SwapRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-skills"
        element={
          <ProtectedRoute>
            <MySkills />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile-card"
        element={
          <ProtectedRoute>
            <ProfileCard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
