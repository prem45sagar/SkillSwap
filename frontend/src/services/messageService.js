import { api } from "./api";

export const messageService = {
  getContacts: async () => {
    return api.get("/messages/contacts");
  },
  getMessages: async (contactId) => {
    return api.get(`/messages/${contactId}`);
  },
  sendMessage: async (messageData) => {
    return api.post("/messages", messageData);
  },
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/messages/upload", formData);
  },
  deleteMessage: async (messageId) => {
    return api.delete(`/messages/delete/${messageId}`);
  },
};
