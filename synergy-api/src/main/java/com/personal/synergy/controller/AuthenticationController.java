package com.personal.synergy.controller;

import com.personal.synergy.DTO.LoginRequest;
import com.personal.synergy.DTO.LoginResponse;
import com.personal.synergy.DTO.SignupRequest;
import com.personal.synergy.DTO.UserInfoResponse;
import com.personal.synergy.entity.User;
import com.personal.synergy.security.jwtutils.JwtUtils;
import com.personal.synergy.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/auth")
@Validated
@RequiredArgsConstructor   // FIX: constructor injection instead of @Autowired field injection
public class AuthenticationController {

    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // FIX: removed /auth/csrf endpoint — CSRF is disabled for stateless JWT API (see SecurityConfiguration)

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Signup attempt for username: {}", signupRequest.getName());

        // FIX: removed redundant manual null/blank/length checks — @Valid + @NotBlank/@Size handles these

        Optional<User> existingUser = userService.findByUserName(signupRequest.getName());
        if (existingUser.isPresent()) {
            log.warn("Signup failed: username {} already taken", signupRequest.getName());
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
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for username: {}", loginRequest.getUsername());

        try {
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
                    .map(a -> a.getAuthority())
                    .collect(Collectors.toList());

            String jwtToken = jwtUtils.generateTokenFromUsername(userDetails);

            log.info("User {} logged in successfully", loginRequest.getUsername());

            return ResponseEntity.ok(new LoginResponse(jwtToken, userDetails.getUsername(), roles, user.isTwoFactorEnabled()));

        } catch (DisabledException e) {
            log.warn("Login failed: account disabled for {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account is disabled. Please contact support.", "status", false));

        } catch (LockedException e) {
            log.warn("Login failed: account locked for {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account is locked. Please contact support.", "status", false));

        } catch (BadCredentialsException e) {
            log.warn("Login failed: bad credentials for {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password", "status", false));

        } catch (AuthenticationException e) {
            log.error("Authentication error for {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication failed", "status", false));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated", "status", false));
        }

        User user = userService.findByUserName(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
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
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            log.info("User {} logged out", userDetails.getUsername());
            SecurityContextHolder.clearContext();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully", "status", true));
    }
}