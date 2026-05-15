package com.skillswap.backend.repository;

import com.skillswap.backend.model.SwapRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SwapRequestRepository extends MongoRepository<SwapRequest, String> {
}
