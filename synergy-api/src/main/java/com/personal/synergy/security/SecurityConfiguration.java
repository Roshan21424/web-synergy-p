package com.personal.synergy.security;

import com.personal.synergy.security.jwtutils.AuthEntryPoint;
import com.personal.synergy.security.jwtutils.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor   // FIX: constructor injection
public class SecurityConfiguration {

    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final AuthEntryPoint authEntryPoint;
    private final AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsServiceImpl);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults());

        // FIX: CSRF disabled — this API uses stateless JWT (Bearer header), not cookie sessions.
        // CSRF protection only applies to cookie-based session auth; enabling it here adds no security
        // and requires frontend workarounds.
        http.csrf(csrf -> csrf.disable());

        // Stateless — no HTTP session needed
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(requests -> requests
                .requestMatchers("/auth/**", "/synergy-chat/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()   // FIX: expose health for load balancer probes
                .anyRequest().authenticated()
        );

        http.authenticationProvider(daoAuthenticationProvider());
        http.exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint));
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}