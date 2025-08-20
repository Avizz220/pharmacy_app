package com.pharmacy.app.service;

import com.pharmacy.app.dto.AuthResponse;
import com.pharmacy.app.dto.LoginRequest;
import com.pharmacy.app.dto.RegisterRequest;
import com.pharmacy.app.entity.User;
import com.pharmacy.app.repository.UserRepository;
import com.pharmacy.app.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = (User) authentication.getPrincipal();

            return new AuthResponse(jwt,
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name());

        } catch (Exception e) {
            return new AuthResponse("Invalid username/email or password");
        }
    }

    public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new AuthResponse("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new AuthResponse("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getFullName());

        user.setRole(User.Role.USER);
        userRepository.save(user);

        // Generate JWT token for the new user
        String jwt = jwtUtils.generateJwtToken(user.getUsername());

        return new AuthResponse(jwt,
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name());
    }
}
