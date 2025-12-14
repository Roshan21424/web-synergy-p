package com.personal.synergy.security;

import com.personal.synergy.security.jwtutils.AuthEntryPoint;
import com.personal.synergy.security.jwtutils.AuthTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true,securedEnabled = true,jsr250Enabled = true)
public class SecurityConfiguration {

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;
    @Autowired
    public AuthEntryPoint authEntryPoint;
    @Autowired
    public AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsServiceImpl);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }


    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.disable());
        http.csrf(
                csrf->csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/auth/**"));

        http.authorizeHttpRequests(
                requests -> requests
                        .requestMatchers("/auth/**","/synergy-chat/**") //if request matches this url
                        .permitAll() //then permit them all
                        .anyRequest() //if any other request
                        .authenticated()); //then authenticate them

        http.authenticationProvider(daoAuthenticationProvider());
        http.exceptionHandling(
                exception->exception
                        .authenticationEntryPoint(authEntryPoint));
        http.addFilterBefore(
                authTokenFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();

    }

}