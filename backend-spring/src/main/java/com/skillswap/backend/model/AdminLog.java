package com.skillswap.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "adminlogs")
public class AdminLog {
    @Id
    private String id;
    private String adminId;
    private String action;
    private String details;
    private LocalDateTime createdAt = LocalDateTime.now();
}
