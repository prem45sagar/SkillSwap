package com.skillswap.backend.controller;

import com.skillswap.backend.model.Notification;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> currentUser.getId().equals(n.getRecipientId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal User currentUser, @PathVariable String id) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok(n);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> currentUser.getId().equals(n.getRecipientId()) && !n.isRead())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);

        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@AuthenticationPrincipal User currentUser, @PathVariable String id) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
