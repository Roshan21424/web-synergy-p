package com.personal.synergy.service;

import com.personal.synergy.entity.User;
import com.personal.synergy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }
    public Optional<User> findByUserName(String userName){return userRepository.findByUserName(userName);}
    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }
}
