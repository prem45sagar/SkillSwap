package com.skillswap.backend.controller;

import com.skillswap.backend.model.Notification;
import com.skillswap.backend.model.SwapRequest;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.ExploreRepository;
import com.skillswap.backend.repository.NotificationRepository;
import com.skillswap.backend.repository.SwapRequestRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/swaps")
public class SwapController {

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExploreRepository exploreRepository;

    @PostMapping
    public ResponseEntity<?> createSwapRequest(@AuthenticationPrincipal User currentUser,
                                               @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        SwapRequest swap = new SwapRequest();
        swap.setSenderId(currentUser.getId());
        swap.setReceiverId((String) body.get("receiverId"));
        swap.setSenderSkill(body.containsKey("senderSkillId") ? (String) body.get("senderSkillId") : (String) body.get("senderSkill"));
        swap.setReceiverSkill(body.containsKey("receiverSkillId") ? (String) body.get("receiverSkillId") : (String) body.get("receiverSkill"));
        swap.setMessage((String) body.get("message"));
        swap.setStatus("pending");

        swap.setCreatedAt(LocalDateTime.now());
        swap.setUpdatedAt(LocalDateTime.now());
        swapRequestRepository.save(swap);

        // Create notification for receiver
        Notification notif = new Notification();
        notif.setRecipientId(swap.getReceiverId());
        notif.setSenderId(currentUser.getId());
        notif.setType("request");
        notif.setRelatedId(swap.getId());
        notif.setContent(currentUser.getName() + " wants to swap skills with you.");
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        return ResponseEntity.status(HttpStatus.CREATED).body(swap);
    }

    @GetMapping
    public ResponseEntity<?> getSwapRequests(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        List<Map<String, Object>> swaps = swapRequestRepository.findAll().stream()
                .filter(s -> currentUser.getId().equals(s.getSenderId()) || currentUser.getId().equals(s.getReceiverId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(s -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("_id", s.getId());
                    map.put("id", s.getId());
                    
                    if (s.getSenderId() != null) {
                        User sender = userRepository.findById(s.getSenderId()).orElse(null);
                        map.put("sender", Map.of("_id", s.getSenderId(), "name", sender != null ? sender.getName() : "Unknown"));
                    }
                    if (s.getReceiverId() != null) {
                        User receiver = userRepository.findById(s.getReceiverId()).orElse(null);
                        map.put("receiver", Map.of("_id", s.getReceiverId(), "name", receiver != null ? receiver.getName() : "Unknown"));
                    }
                    
                    map.put("senderSkill", s.getSenderSkill() != null ? exploreRepository.findById(s.getSenderSkill()).map(e -> e.getName()).orElse(s.getSenderSkill()) : "Unknown");
                    map.put("receiverSkill", s.getReceiverSkill() != null ? exploreRepository.findById(s.getReceiverSkill()).map(e -> e.getName()).orElse(s.getReceiverSkill()) : "Unknown");
                    map.put("status", s.getStatus());
                    map.put("message", s.getMessage());
                    map.put("createdAt", s.getCreatedAt());
                    map.put("updatedAt", s.getUpdatedAt());
                    map.put("senderReviewed", s.isSenderReviewed());
                    map.put("receiverReviewed", s.isReceiverReviewed());
                    map.put("offeredSkills", s.getOfferedSkills());
                    map.put("requestedSkills", s.getRequestedSkills());
                    map.put("meetingLink", s.getMeetingLink());
                    map.put("scheduledAt", s.getScheduledAt());
                    
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(swaps);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateSwapStatus(@AuthenticationPrincipal User currentUser,
                                              @PathVariable String id,
                                              @RequestBody Map<String, String> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        Optional<SwapRequest> swapOpt = swapRequestRepository.findById(id);
        if (swapOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Swap request not found"));

        SwapRequest swap = swapOpt.get();
        String status = body.get("status");
        boolean isSender = swap.getSenderId().equals(currentUser.getId());
        boolean isReceiver = swap.getReceiverId().equals(currentUser.getId());

        if (!isSender && !isReceiver) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authorized to update this request"));
        }

        swap.setStatus(status);
        swap.setUpdatedAt(LocalDateTime.now());
        swapRequestRepository.save(swap);

        // Notify the other party
        String otherUserId = isSender ? swap.getReceiverId() : swap.getSenderId();
        Notification notif = new Notification();
        notif.setRecipientId(otherUserId);
        notif.setSenderId(currentUser.getId());
        notif.setType(status);
        notif.setContent(currentUser.getName() + " has " + status + " your swap request.");
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        return ResponseEntity.ok(swap);
    }
}
