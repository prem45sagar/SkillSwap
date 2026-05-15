package com.skillswap.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    @JsonProperty("_id")
    private String id;
    private String recipientId;
    private String senderId;
    private String type;
    private String content;
    private String link;
    private String relatedId;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
