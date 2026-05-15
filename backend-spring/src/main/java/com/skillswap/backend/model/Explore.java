package com.skillswap.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "explores")
public class Explore {
    @Id
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String name;
    private String description;
    private String category;
    @JsonProperty("owner_id")
    private String ownerId; // User ID
    private java.util.List<String> languages = new java.util.ArrayList<>();
    private int duration = 7;
    private String durationUnit = "days";
    private java.time.LocalDateTime startDate;
    private java.time.LocalDateTime endDate;
    private String desiredSkill;
    private String criteria;
    private String status = "open"; // open, ongoing, occupied, completed
    private java.util.List<String> endorsements = new java.util.ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    @JsonProperty("owner")
    private OwnerInfo ownerInfo;

    @Data
    public static class OwnerInfo {
        @JsonProperty("_id")
        private String id;
        private String name;
        private String avatar;
        private LocalDateTime lastActive;
    }

}
