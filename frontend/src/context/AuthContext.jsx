import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        const userData = {
          ...data,
          id: data._id,
          skills: data.skills || [],
        };
        setUser(userData);
        localStorage.setItem("skillswap_user", JSON.stringify(userData));
        // Also ensure token is synced if backend returns it
        if (data.token) localStorage.setItem("skillswap_token", data.token);
      } catch (err) {
        console.warn("No active session found:", err);
        localStorage.removeItem("skillswap_token");
        localStorage.removeItem("skillswap_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    const userData = {
      ...data,
      id: data._id,
      skills: data.skills || [],
    };
    setUser(userData);
    localStorage.setItem("skillswap_token", data.token);
    localStorage.setItem("skillswap_user", JSON.stringify(userData));
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillswap_token");
    localStorage.removeItem("skillswap_user");
    authService.logout().catch(() => {});
  };

  const updateProfile = async (updates) => {
    if (user) {
      const updatedData = await authService.updateProfile(updates);
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Safety check for localStorage quota
      try {
        localStorage.setItem("skillswap_user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn("LocalStorage quota exceeded, updated profile will not persist across refreshes.");
      }
    }
  };

  const changePassword = async (passwordData) => {
    await authService.changePassword(passwordData);
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    setUser(null);
    localStorage.removeItem("skillswap_token");
    localStorage.removeItem("skillswap_user");
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      const userData = {
        ...data,
        id: data._id,
        skills: data.skills || [],
      };
      setUser(userData);
      localStorage.setItem("skillswap_user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        changePassword,
        deleteAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
