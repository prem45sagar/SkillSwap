package com.skillswap.backend.repository;

import com.skillswap.backend.model.Explore;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExploreRepository extends MongoRepository<Explore, String> {
}
