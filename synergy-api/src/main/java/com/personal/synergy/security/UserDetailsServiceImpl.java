package com.personal.synergy.security;

import com.personal.synergy.entity.User;
import com.personal.synergy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor   // FIX: constructor injection instead of @Autowired
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * FIX: @Cacheable added — previously every authenticated request hit the DB.
     * Cache is backed by Caffeine (10 min TTL, see CacheConfig).
     * Cache key is the username (same as the method parameter name).
     */
    @Override
    @Cacheable(value = "userDetails", key = "#name")
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        User user = userRepository.findByName(name)   // FIX: updated to match renamed repository method
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + name));

        return new SpringUser(
                user.getName(),
                user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority(user.getRoles()))
        );
    }
}