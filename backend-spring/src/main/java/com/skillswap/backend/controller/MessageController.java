package com.skillswap.backend.controller;

import com.skillswap.backend.model.Explore;
import com.skillswap.backend.model.Message;
import com.skillswap.backend.model.SwapRequest;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.ExploreRepository;
import com.skillswap.backend.repository.MessageRepository;
import com.skillswap.backend.repository.SwapRequestRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private ExploreRepository exploreRepository;

    private final String UPLOAD_DIR = "uploads";

    @GetMapping("/{contactId}")
    public ResponseEntity<?> getMessages(@AuthenticationPrincipal User currentUser,
                                         @PathVariable String contactId) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        List<Message> messages = messageRepository.findAll().stream()
                .filter(m -> (m.getSenderId().equals(currentUser.getId()) && m.getReceiverId().equals(contactId))
                        || (m.getSenderId().equals(contactId) && m.getReceiverId().equals(currentUser.getId())))
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<?> createMessage(@AuthenticationPrincipal User currentUser,
                                           @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        Message message = new Message();
        message.setSenderId(currentUser.getId());
        message.setReceiverId((String) body.get("receiver"));
        message.setContent((String) body.get("content"));
        message.setMessageType((String) body.get("messageType") != null ? (String) body.get("messageType") : "text");
        message.setFileUrl((String) body.get("fileUrl"));
        message.setFileName((String) body.get("fileName"));
        message.setSwapRequestId((String) body.get("swapRequest"));
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        messageRepository.save(message);

        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR, fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            String fileUrl = "/uploads/" + fileName;
            Map<String, Object> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("messageType", file.getContentType().startsWith("image/") ? "image" : "document");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error uploading file", "error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMessage(@AuthenticationPrincipal User currentUser,
                                           @PathVariable String id) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        Optional<Message> msgOpt = messageRepository.findById(id);
        if (msgOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Message not found"));

        Message message = msgOpt.get();
        if (!message.getSenderId().equals(currentUser.getId()) && !message.getReceiverId().equals(currentUser.getId())) {
            return ResponseEntity.status(401).body(Map.of("message", "You are not authorized to delete this message"));
        }

        messageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Message removed successfully"));
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));

        List<Message> allMessages = messageRepository.findAll().stream()
                .filter(m -> m.getSenderId().equals(currentUser.getId()) || m.getReceiverId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        Set<String> contactIds = new HashSet<>();
        for (Message m : allMessages) {
            if (!m.getSenderId().equals(currentUser.getId())) contactIds.add(m.getSenderId());
            if (!m.getReceiverId().equals(currentUser.getId())) contactIds.add(m.getReceiverId());
        }

        List<Map<String, Object>> contacts = contactIds.stream()
                .map(cid -> userRepository.findById(cid))
                .filter(Optional::isPresent)
                .map(opt -> {
                    User u = opt.get();
                    Map<String, Object> c = new HashMap<>();
                    c.put("_id", u.getId());
                    c.put("id", u.getId());
                    c.put("name", u.getName());
                    c.put("avatar", u.getAvatar());
                    c.put("bio", u.getBio());
                    c.put("lastActive", u.getLastActive());

                    // Add swapStatus
                    Optional<SwapRequest> swapOpt = swapRequestRepository.findAll().stream()
                            .filter(s -> (s.getSenderId().equals(currentUser.getId()) && s.getReceiverId().equals(u.getId()))
                                    || (s.getSenderId().equals(u.getId()) && s.getReceiverId().equals(currentUser.getId())))
                            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                            .findFirst();

                    if (swapOpt.isPresent()) {
                        SwapRequest swap = swapOpt.get();
                        if ("accepted".equals(swap.getStatus())) {
                            boolean isTrulyOngoing = false;
                            if (swap.getReceiverSkill() != null) {
                                Optional<Explore> rSkill = exploreRepository.findById(swap.getReceiverSkill());
                                if (rSkill.isPresent() && "ongoing".equals(rSkill.get().getStatus())) isTrulyOngoing = true;
                            }
                            if (swap.getSenderSkill() != null) {
                                Optional<Explore> sSkill = exploreRepository.findById(swap.getSenderSkill());
                                if (sSkill.isPresent() && "ongoing".equals(sSkill.get().getStatus())) isTrulyOngoing = true;
                            }
                            c.put("swapStatus", isTrulyOngoing ? "accepted" : "completed");
                        } else {
                            c.put("swapStatus", swap.getStatus());
                        }
                    } else {
                        c.put("swapStatus", "none");
                    }

                    return c;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(contacts);
    }
}
