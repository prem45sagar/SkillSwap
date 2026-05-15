package com.skillswap.backend.repository;

import com.skillswap.backend.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {
}
