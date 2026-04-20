import { api } from "./api";

export const swapService = {
  getSwapRequests: async () => {
    return api.get("/swaps");
  },
  createSwapRequest: async (swapData) => {
    return api.post("/swaps", swapData);
  },
  updateSwapStatus: async (id, status) => {
    return api.patch(`/swaps/${id}`, { status });
  },
};
