package com.personal.synergy.repository;

import com.personal.synergy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * FIX: replaced native SQL query with Spring Data derived query.
     * Native query was: "select * from user where name = :name" (breaks on DB rename, skips JPA mapping).
     * Derived query is portable, type-safe, and requires no annotation.
     */
    Optional<User> findByName(String name);
}