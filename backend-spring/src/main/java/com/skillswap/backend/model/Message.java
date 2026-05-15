package com.skillswap.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    @JsonProperty("_id")
    private String id;
    private String senderId;
    private String receiverId;
    private String content; // Replaces text
    private String messageType = "text"; // text, image, document, video_call, system
    private String fileUrl;
    private String fileName;
    private String swapRequestId;
    private boolean isRead = false;

    private boolean isSystemMessage = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
