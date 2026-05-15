package com.skillswap.backend.controller;

import com.skillswap.backend.model.Review;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.ReviewRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createReview(@AuthenticationPrincipal User currentUser,
                                          @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        Review review = new Review();
        review.setReviewerId(currentUser.getId());
        review.setRevieweeId((String) body.get("revieweeId"));
        review.setSwapRequestId((String) body.get("swapRequestId"));
        review.setRating(((Number) body.get("rating")).doubleValue());
        review.setComment((String) body.get("comment"));
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);

        // Update reviewee rating
        String revieweeId = review.getRevieweeId();
        List<Review> allReviews = reviewRepository.findAll().stream()
                .filter(r -> revieweeId.equals(r.getRevieweeId()))
                .collect(Collectors.toList());
        double totalPoints = allReviews.stream().mapToDouble(Review::getRating).sum();
        int numReviews = allReviews.size();
        double avgRating = numReviews > 0 ? totalPoints / numReviews : 0;

        userRepository.findById(revieweeId).ifPresent(u -> {
            u.setNumReviews(numReviews);
            u.setTotalRatingPoints(totalPoints);
            u.setRating(Math.round(avgRating * 10.0) / 10.0);
            userRepository.save(u);
        });

        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsForUser(@PathVariable String userId) {
        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> userId.equals(r.getRevieweeId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }
}
