package com.skillswap.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "swaprequests")
public class SwapRequest {
    @Id
    @JsonProperty("_id")
    private String id;

    private String senderId;
    private String receiverId;
    private String senderSkill; // ID of Explore skill
    private String receiverSkill; // ID of Explore skill
    private String status = "pending";
    private String message;
    private boolean senderReviewed = false;
    private boolean receiverReviewed = false;
    private List<String> offeredSkills = new ArrayList<>();
    private List<String> requestedSkills = new ArrayList<>();

    private String meetingLink;
    private LocalDateTime scheduledAt;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
