import { api } from "./api";

export const notificationService = {
  getNotifications: async () => {
    return api.get("/notifications");
  },
  markAllAsRead: async () => {
    return api.put("/notifications/mark-read");
  },
  deleteNotification: async (id) => {
    return api.delete(`/notifications/${id}`);
  },
};
