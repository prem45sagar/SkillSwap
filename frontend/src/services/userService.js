import { api } from "./api";

export const userService = {
  getUserProfile: async (id) => {
    return api.get(`/users/${id}`);
  },
  followUser: async (id) => {
    return api.post(`/users/${id}/follow`);
  },
  getFollowers: async (id) => {
    return api.get(`/users/${id}/followers`);
  },
  getFollowing: async (id) => {
    return api.get(`/users/${id}/following`);
  },
  syncProfileStats: async () => {
    return api.get("/users/profile/sync");
  },
};
