package com.skillswap.backend.repository;

import com.skillswap.backend.model.AdminLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminLogRepository extends MongoRepository<AdminLog, String> {
}
