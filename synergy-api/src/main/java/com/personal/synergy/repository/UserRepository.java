package com.personal.synergy.repository;

import com.personal.synergy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query(value = "select * from user where name = :name ",nativeQuery = true)
    Optional<User> findByUserName(@Param("name") String name);
}

