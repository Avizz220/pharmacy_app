package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Find customer by email
    Optional<Customer> findByEmail(String email);
    
    // Find customer by phone number
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    
    // Find customers by gender
    List<Customer> findByGender(String gender);
    
    // Search customers by name (case insensitive)
    @Query("SELECT c FROM Customer c WHERE LOWER(c.customerName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Customer> findByCustomerNameContainingIgnoreCase(@Param("name") String name);
    
    // Search customers with pagination
    @Query("SELECT c FROM Customer c WHERE " +
           "(LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.phoneNumber LIKE CONCAT('%', :search, '%'))")
    Page<Customer> findCustomersWithSearch(@Param("search") String search, Pageable pageable);
    
    // Count customers by gender
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.gender = :gender")
    long countByGender(@Param("gender") String gender);
    
    // Check if email exists (for validation)
    boolean existsByEmail(String email);
    
    // Check if phone number exists (for validation)
    boolean existsByPhoneNumber(String phoneNumber);
}
