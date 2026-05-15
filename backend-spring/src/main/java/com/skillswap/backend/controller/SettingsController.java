package com.skillswap.backend.controller;

import com.skillswap.backend.model.PlatformSettings;
import com.skillswap.backend.repository.PlatformSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private PlatformSettingsRepository platformSettingsRepository;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicSettings() {
        List<PlatformSettings> list = platformSettingsRepository.findAll();
        PlatformSettings settings = list.isEmpty() ? new PlatformSettings() : list.get(0);
        return ResponseEntity.ok(Map.of(
            "platformName", settings.getPlatformName(),
            "maintenanceMode", settings.isMaintenanceMode(),
            "systemNotice", settings.getSystemNotice() != null ? settings.getSystemNotice() : ""
        ));
    }
}
