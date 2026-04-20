import { api } from "./api";

export const authService = {
  login: async (credentials) => {
    return api.post("/auth/login", credentials);
  },
  register: async (userData) => {
    return api.post("/auth/signup", userData);
  },
  logout: async () => {
    return api.post("/auth/logout", {});
  },
  getCurrentUser: async () => {
    return api.get("/auth/me");
  },
  updateProfile: async (updates) => {
    return api.put("/auth/profile", updates);
  },
  changePassword: async (passwordData) => {
    return api.put("/auth/change-password", passwordData);
  },
  deleteAccount: async () => {
    return api.delete("/auth/delete-account");
  },
};
