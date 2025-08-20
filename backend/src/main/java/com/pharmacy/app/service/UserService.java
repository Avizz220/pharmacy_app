package com.pharmacy.app.service;

import com.pharmacy.app.dto.PasswordChangeRequest;
import com.pharmacy.app.dto.ProfileUpdateRequest;
import com.pharmacy.app.dto.UserProfileResponse;
import com.pharmacy.app.entity.User;
import com.pharmacy.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Get current user profile
    public UserProfileResponse getCurrentUserProfile() {
        User currentUser = getCurrentUser();
        return convertToProfileResponse(currentUser);
    }
    
    // Update user profile
    @Transactional
    public UserProfileResponse updateProfile(ProfileUpdateRequest request) {
        User currentUser = getCurrentUser();
        
        // Check if email is being changed and if it already exists
        if (!currentUser.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
        }
        
        // Update user fields
        currentUser.setFullName(request.getFullName());
        currentUser.setEmail(request.getEmail());
        
        User updatedUser = userRepository.save(currentUser);
        return convertToProfileResponse(updatedUser);
    }
    
    // Change password
    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        User currentUser = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }
        
        // Encode and set new password
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        currentUser.setPassword(encodedNewPassword);
        
        userRepository.save(currentUser);
    }
    
    // Get user by ID (for admin purposes)
    public UserProfileResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToProfileResponse(user);
    }
    
    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
    
    // Helper method to convert User entity to UserProfileResponse DTO
    private UserProfileResponse convertToProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getBirthday(),
            user.getGender()
        );
    }
}
