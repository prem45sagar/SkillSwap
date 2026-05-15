package com.skillswap.backend.controller;

import com.skillswap.backend.model.Explore;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.ExploreRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private ExploreRepository exploreRepository;

    @Autowired
    private UserRepository userRepository;

    private List<Explore> populateOwnerInfo(List<Explore> skills) {
        for (Explore skill : skills) {
            String ownerId = skill.getUserId();
            if (ownerId != null) {
                userRepository.findById(ownerId).ifPresent(user -> {
                    Explore.OwnerInfo info = new Explore.OwnerInfo();
                    info.setId(user.getId());
                    info.setName(user.getName());
                    info.setAvatar(user.getAvatar());
                    info.setLastActive(user.getLastActive());
                    skill.setOwnerInfo(info);
                });
            }
        }
        return skills;
    }

    @GetMapping
    public ResponseEntity<?> getAllSkills() {
        List<Explore> skills = exploreRepository.findAll();
        return ResponseEntity.ok(populateOwnerInfo(skills));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMySkills(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        List<Explore> skills = exploreRepository.findAll().stream()
                .filter(s -> currentUser.getId().equals(s.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(populateOwnerInfo(skills));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSkillsByUser(@PathVariable String userId) {
        List<Explore> skills = exploreRepository.findAll().stream()
                .filter(s -> userId.equals(s.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(populateOwnerInfo(skills));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSkillById(@PathVariable String id) {
        return exploreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSkill(@AuthenticationPrincipal User currentUser,
                                         @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        
        Explore skill = new Explore();
        skill.setUserId(currentUser.getId());
        skill.setName((String) body.get("name"));
        skill.setDescription((String) body.get("description"));
        skill.setCategory((String) body.get("category"));
        skill.setDesiredSkill((String) body.get("desiredSkill"));
        skill.setCriteria((String) body.get("criteria"));
        skill.setLanguages((List<String>) body.get("languages"));
        
        if (body.get("duration") != null) {
            skill.setDuration(Integer.parseInt(body.get("duration").toString()));
        }
        if (body.get("durationUnit") != null) {
            skill.setDurationUnit((String) body.get("durationUnit"));
        }
        
        skill.setCreatedAt(LocalDateTime.now());
        skill.setStatus("open");
        
        exploreRepository.save(skill);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkill(@AuthenticationPrincipal User currentUser,
                                         @PathVariable String id,
                                         @RequestBody Map<String, Object> body) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        
        Optional<Explore> skillOpt = exploreRepository.findById(id);
        if (skillOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Skill not found"));
        
        Explore skill = skillOpt.get();
        if (!skill.getUserId().equals(currentUser.getId())) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authorized to update this skill"));
        }
        
        if (body.containsKey("name")) skill.setName((String) body.get("name"));
        if (body.containsKey("description")) skill.setDescription((String) body.get("description"));
        if (body.containsKey("category")) skill.setCategory((String) body.get("category"));
        if (body.containsKey("desiredSkill")) skill.setDesiredSkill((String) body.get("desiredSkill"));
        if (body.containsKey("criteria")) skill.setCriteria((String) body.get("criteria"));
        if (body.containsKey("languages")) skill.setLanguages((List<String>) body.get("languages"));
        
        if (body.containsKey("duration") && body.get("duration") != null) {
            skill.setDuration(Integer.parseInt(body.get("duration").toString()));
        }
        if (body.containsKey("durationUnit") && body.get("durationUnit") != null) {
            skill.setDurationUnit((String) body.get("durationUnit"));
        }
        
        exploreRepository.save(skill);
        return ResponseEntity.ok(skill);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(@AuthenticationPrincipal User currentUser,
                                         @PathVariable String id) {
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Not authorized"));
        Optional<Explore> skillOpt = exploreRepository.findById(id);
        if (skillOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Skill not found"));
        Explore skill = skillOpt.get();
        if (!skill.getUserId().equals(currentUser.getId())) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authorized to delete this skill"));
        }
        exploreRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Skill deleted"));
    }
}
