package com.skillswap.backend.controller;

import com.skillswap.backend.model.PlatformSettings;
import com.skillswap.backend.repository.PlatformSettingsRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlatformSettingsRepository platformSettingsRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable String id) {
        return userRepository.findById(id).map(user -> {
            user.setBlocked(!user.isBlocked());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", user.isBlocked() ? "User blocked" : "User unblocked",
                "isBlocked", user.isBlocked()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        List<PlatformSettings> list = platformSettingsRepository.findAll();
        PlatformSettings settings = list.isEmpty() ? new PlatformSettings() : list.get(0);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> body) {
        List<PlatformSettings> list = platformSettingsRepository.findAll();
        PlatformSettings settings = list.isEmpty() ? new PlatformSettings() : list.get(0);

        if (body.containsKey("platformName")) settings.setPlatformName((String) body.get("platformName"));
        if (body.containsKey("maintenanceMode")) settings.setMaintenanceMode((Boolean) body.get("maintenanceMode"));
        if (body.containsKey("systemNotice")) settings.setSystemNotice((String) body.get("systemNotice"));
        platformSettingsRepository.save(settings);
        return ResponseEntity.ok(settings);
    }
}
