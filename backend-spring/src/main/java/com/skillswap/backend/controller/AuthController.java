package com.skillswap.backend.controller;

import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.PlatformSettingsRepository;
import com.skillswap.backend.repository.UserRepository;
import com.skillswap.backend.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlatformSettingsRepository platformSettingsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email and password are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }

        String hashedPassword = passwordEncoder.encode(password);
        String verificationToken = generateToken();

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setVerificationToken(verificationToken);
        user.setVerified(true); // Auto-verify in dev
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully. Auto-verified (Development Mode)."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();

        if (user.isBlocked()) {
            return ResponseEntity.status(403).body(Map.of("message", "User blocked by Admin."));
        }

        if (!user.isVerified()) {
            return ResponseEntity.status(401).body(Map.of("message", "Please verify your email first"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        String token = jwtTokenProvider.generateToken(user.getId());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60);
        response.addCookie(cookie);

        Map<String, Object> result = buildUserResponse(user);
        result.put("token", token);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        // Update lastActive
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(buildUserResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getVerificationToken()))
                .findFirst();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired verification token"));
        }
        User user = userOpt.get();
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();
        String resetToken = generateToken();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetPasswordToken())
                        && u.getResetPasswordExpires() != null
                        && u.getResetPasswordExpires().isAfter(LocalDateTime.now()))
                .findFirst();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset token"));
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User currentUser,
                                           @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("bio")) user.setBio((String) body.get("bio"));
        if (body.containsKey("avatar")) user.setAvatar((String) body.get("avatar"));
        if (body.containsKey("title")) user.setTitle((String) body.get("title"));
        if (body.containsKey("country")) user.setCountry((String) body.get("country"));
        if (body.containsKey("skillswapId")) user.setSkillswapId((String) body.get("skillswapId"));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(buildUserResponse(user));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User currentUser,
                                            @RequestBody Map<String, String> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        if (!passwordEncoder.matches(body.get("currentPassword"), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
        }
        user.setPassword(passwordEncoder.encode(body.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal User currentUser,
                                           HttpServletResponse response) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        userRepository.deleteById(currentUser.getId());
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    // Helper
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> result = new HashMap<>();
        result.put("_id", user.getId());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("bio", user.getBio());
        result.put("avatar", user.getAvatar());
        result.put("avatar3d", user.getAvatar3d());
        result.put("avatarMode", user.getAvatarMode());
        result.put("skills", user.getSkills());
        result.put("title", user.getTitle());
        result.put("settings", user.getSettings());
        result.put("links", user.getLinks());
        result.put("skillswapId", user.getSkillswapId());
        result.put("country", user.getCountry());
        result.put("education", user.getEducation());
        result.put("experience", user.getExperience());
        result.put("achievements", user.getAchievements());
        result.put("platforms", user.getPlatforms());
        result.put("followers", user.getFollowers());
        result.put("following", user.getFollowing());
        result.put("rating", user.getRating());
        result.put("numReviews", user.getNumReviews());
        result.put("completedSwaps", user.getCompletedSwaps());
        result.put("totalHours", user.getTotalHours());
        result.put("topSkills", user.getTopSkills());
        result.put("totalEndorsements", user.getTotalEndorsements());
        result.put("isVerified", user.isVerified());
        return result;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
