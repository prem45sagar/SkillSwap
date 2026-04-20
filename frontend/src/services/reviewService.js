import { api } from "./api";

export const reviewService = {
  submitReview: async (reviewData) => {
    return api.post("/reviews", reviewData);
  },
  getUserReviews: async (userId) => {
    return api.get(`/reviews/user/${userId}`);
  }
};
