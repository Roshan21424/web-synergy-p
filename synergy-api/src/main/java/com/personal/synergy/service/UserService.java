package com.personal.synergy.service;

import com.personal.synergy.entity.User;
import com.personal.synergy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor   // FIX: constructor injection
public class UserService {

    private final UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByUserName(String userName) {
        return userRepository.findByName(userName);   // FIX: updated to match renamed repository method
    }

    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }
}