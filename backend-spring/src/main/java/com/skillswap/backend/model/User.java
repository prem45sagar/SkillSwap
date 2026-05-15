package com.skillswap.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    @JsonProperty("_id")
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    @Indexed(unique = true, sparse = true)
    private String googleId;
    
    private boolean isVerified = false;
    private String verificationToken;
    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpires;
    
    private List<String> skills = new ArrayList<>();
    private String bio;
    private String avatar;
    private String title;
    
    private Avatar3d avatar3d;
    private String avatarMode = "2d";
    
    private Settings settings = new Settings();
    private LocalDateTime lastActive = LocalDateTime.now();
    
    private Links links = new Links();
    
    @Indexed(unique = true, sparse = true)
    private String skillswapId;
    private String country = "India";
    
    private List<Education> education = new ArrayList<>();
    private List<Experience> experience = new ArrayList<>();
    private List<Achievement> achievements = new ArrayList<>();
    
    private Platforms platforms = new Platforms();
    
    private List<String> followers = new ArrayList<>();
    private List<String> following = new ArrayList<>();
    
    private double rating = 0.0;
    private int numReviews = 0;
    private double totalRatingPoints = 0.0;
    private int completedSwaps = 0;
    private int totalEndorsements = 0;
    private int totalHours = 0;
    
    private List<TopSkill> topSkills = new ArrayList<>();
    private List<String> unlockedBadges = new ArrayList<>();
    
    private boolean isBlocked = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class Avatar3d {
        private String model;
        private String color;
        private Double rotation;
    }

    @Data
    public static class Settings {
        private boolean emailNotifications = true;
        private boolean pushNotifications = true;
        private String profilePrivacy = "public";
        private String theme = "dark";
    }

    @Data
    public static class Links {
        private String github = "";
        private String linkedin = "";
        private String leetcode = "";
        private String codechef = "";
        private String codeforces = "";
        private String website = "";
        private String portfolio = "";
    }

    @Data
    public static class Education {
        private String school;
        private String degree;
        private String gradeType = "CGPA";
        private String grade;
        private String fromMonth;
        private String fromYear;
        private String toMonth;
        private String toYear;
    }

    @Data
    public static class Experience {
        private String title;
        private String company;
        private String description;
        private String fromMonth;
        private String fromYear;
        private String toMonth;
        private String toYear;
        private boolean current = false;
    }

    @Data
    public static class Achievement {
        private String title;
        private String description;
        private String url;
        private String issueMonth;
        private String issueYear;
    }

    @Data
    public static class Platforms {
        private PlatformDetail github = new PlatformDetail();
        private PlatformDetail leetcode = new PlatformDetail();
        private PlatformDetail codeforces = new PlatformDetail();
        private PlatformDetail codechef = new PlatformDetail();
        private PlatformDetail geeksforgeeks = new PlatformDetail();
        private PlatformDetail hackerrank = new PlatformDetail();
        private PlatformDetail interviewbit = new PlatformDetail();
        private PlatformDetail codestudio = new PlatformDetail();
        private PlatformDetail atcoder = new PlatformDetail();
    }

    @Data
    public static class PlatformDetail {
        private String username = "";
        private boolean verified = false;
    }

    @Data
    public static class TopSkill {
        private String name;
        private int count = 0;
    }
}
