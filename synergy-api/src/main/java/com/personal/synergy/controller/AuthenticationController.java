package com.personal.synergy.controller;


import com.personal.synergy.DTO.LoginRequest;
import com.personal.synergy.DTO.LoginResponse;
import com.personal.synergy.DTO.SignupRequest;
import com.personal.synergy.DTO.UserInfoResponse;
import com.personal.synergy.entity.User;
import com.personal.synergy.security.jwtutils.JwtUtils;
import com.personal.synergy.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Slf4j
@RestController
@RequestMapping("/auth")
@Validated
public class AuthenticationController {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;


    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request){
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

        if (csrfToken != null) {
            Map<String, String> response = new HashMap<>();
            response.put("token", csrfToken.getToken());
            response.put("headerName", csrfToken.getHeaderName());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", "CSRF token not found"));
    }


    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Signup attempt for username: {}", signupRequest.getName());

        try {
            if (signupRequest.getName() == null || signupRequest.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username is required", "status", false));
            }

            if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 8) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 8 characters", "status", false));
            }

            Optional<User> existingUser = userService.findByUserName(signupRequest.getName());
            if (existingUser.isPresent()) {
                log.warn("Signup failed: Username {} already exists", signupRequest.getName());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists", "status", false));
            }

            User user = new User();
            user.setName(signupRequest.getName());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setRoles("USER");
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);
            user.setCreatedDate(LocalDateTime.now());

            userService.saveUser(user);

            log.info("User {} registered successfully", signupRequest.getName());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Account created successfully",
                            "status", true,
                            "username", user.getName()
                    ));

        } catch (Exception e) {
            log.error("Error during signup for username {}: {}", signupRequest.getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed. Please try again.", "status", false));
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for username: {}", loginRequest.getUsername());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            User user = userService.findByUserName(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .collect(Collectors.toList());

            String jwtToken = jwtUtils.generateTokenFromUsername(userDetails);

            log.info("User {} logged in successfully", loginRequest.getUsername());

            LoginResponse response = new LoginResponse(
                    jwtToken,
                    userDetails.getUsername(),
                    roles,
                    user.isTwoFactorEnabled()
            );

            return ResponseEntity.ok(response);

        } catch (DisabledException e) {
            log.warn("Login failed: Account disabled for username {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Account is disabled. Please contact support.",
                            "status", false
                    ));

        } catch (LockedException e) {
            log.warn("Login failed: Account locked for username {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Account is locked. Please contact support.",
                            "status", false
                    ));

        } catch (BadCredentialsException e) {
            log.warn("Login failed: Bad credentials for username {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Invalid username or password",
                            "status", false
                    ));

        } catch (AuthenticationException e) {
            log.error("Authentication error for username {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Authentication failed",
                            "status", false,
                            "error", e.getMessage()
                    ));

        } catch (Exception e) {
            log.error("Unexpected error during login for username {}: {}", loginRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Login failed. Please try again.",
                            "status", false
                    ));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated", "status", false));
        }

        try {
            User user = userService.findByUserName(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .collect(Collectors.toList());

            UserInfoResponse response = new UserInfoResponse();
            response.setId(user.getId());
            response.setUsername(user.getName());
            response.setEmail(user.getEmail());
            response.setAccountNonLocked(user.isAccountNonLocked());
            response.setAccountNonExpired(user.isAccountNonExpired());
            response.setCredentialsNonExpired(user.isCredentialsNonExpired());
            response.setEnabled(user.isEnabled());
            response.setCredentialsExpiryDate(user.getCredentialsExpiryDate() != null ?
                    user.getCredentialsExpiryDate().atStartOfDay() : null);
            response.setAccountExpiryDate(user.getAccountExpiryDate() != null ?
                    user.getAccountExpiryDate().atStartOfDay() : null);
            response.setTwoFactorEnabled(user.isTwoFactorEnabled());
            response.setRoles(roles);

            return ResponseEntity.ok(response);

        } catch (UsernameNotFoundException e) {
            log.error("User not found: {}", userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found", "status", false));

        } catch (Exception e) {
            log.error("Error fetching user details for {}: {}", userDetails.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch user details", "status", false));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            log.info("User {} logged out", userDetails.getUsername());
            SecurityContextHolder.clearContext();
        }

        return ResponseEntity.ok(Map.of(
                "message", "Logged out successfully",
                "status", true
        ));
    }
}