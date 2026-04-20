import { api } from "./api";

export const skillService = {
  getSkills: async (query) => {
    return api.get(`/skills${query ? `?q=${query}` : ""}`);
  },
  getSkillById: async (id) => {
    return api.get(`/skills/${id}`);
  },
  addSkill: async (skillData) => {
    return api.post("/skills", skillData);
  },
  updateSkill: async (id, skillData) => {
    return api.put(`/skills/${id}`, skillData);
  },
  repostSkill: async (id, skillData) => {
    return api.post(`/skills/${id}/repost`, skillData);
  },
  deleteSkill: async (id) => {
    return api.delete(`/skills/${id}`);
  },
  endorseSkill: async (id) => {
    return api.post(`/skills/${id}/endorse`);
  },
};
