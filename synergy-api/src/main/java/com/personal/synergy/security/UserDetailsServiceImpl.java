package com.personal.synergy.security;

import com.personal.synergy.entity.User;
import com.personal.synergy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;


@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String name)  throws UsernameNotFoundException {

        User user = userRepository.findByUserName(name).orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + name));;
        return new SpringUser(
            user.getName(),
            user.getPassword(),
            Collections.singleton(new SimpleGrantedAuthority(user.getRoles()))
        );
    }

}
