package com.pharmacy.app.service;

import com.pharmacy.app.dto.CustomerRequest;
import com.pharmacy.app.dto.CustomerResponse;
import com.pharmacy.app.entity.Customer;
import com.pharmacy.app.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Create new customer
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check if email already exists
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        
        // Check if phone number already exists
        if (customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists: " + request.getPhoneNumber());
        }
        
        // Create new customer
        Customer customer = new Customer();
        customer.setCustomerName(request.getCustomerName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setGender(request.getGender());
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(savedCustomer);
    }
    
    // Update existing customer
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        // Check if email already exists (excluding current customer)
        Optional<Customer> existingByEmail = customerRepository.findByEmail(request.getEmail());
        if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        
        // Check if phone number already exists (excluding current customer)
        Optional<Customer> existingByPhone = customerRepository.findByPhoneNumber(request.getPhoneNumber());
        if (existingByPhone.isPresent() && !existingByPhone.get().getId().equals(id)) {
            throw new RuntimeException("Phone number already exists: " + request.getPhoneNumber());
        }
        
        // Update customer fields
        customer.setCustomerName(request.getCustomerName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setGender(request.getGender());
        
        Customer updatedCustomer = customerRepository.save(customer);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(updatedCustomer);
    }
    
    // Get customer by ID
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return convertToResponse(customer);
    }
    
    // Get all customers with pagination
    public Page<CustomerResponse> getAllCustomers(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Customer> customers;
        if (search != null && !search.trim().isEmpty()) {
            customers = customerRepository.findCustomersWithSearch(search.trim(), pageable);
        } else {
            customers = customerRepository.findAll(pageable);
        }
        
        return customers.map(this::convertToResponse);
    }
    
    // Get customers by gender
    public List<CustomerResponse> getCustomersByGender(String gender) {
        List<Customer> customers = customerRepository.findByGender(gender);
        return customers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Delete customer
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        customerRepository.delete(customer);
        
        // Force flush and commit
        entityManager.flush();
    }
    
    // Get customer statistics
    public CustomerStats getCustomerStats() {
        long totalCustomers = customerRepository.count();
        long maleCustomers = customerRepository.countByGender("Male");
        long femaleCustomers = customerRepository.countByGender("Female");
        
        return new CustomerStats(totalCustomers, maleCustomers, femaleCustomers);
    }
    
    // Convert Customer entity to CustomerResponse DTO
    private CustomerResponse convertToResponse(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getCustomerName(),
            customer.getPhoneNumber(),
            customer.getEmail(),
            customer.getGender()
        );
    }
    
    // Customer statistics inner class
    public static class CustomerStats {
        private long totalCustomers;
        private long maleCustomers;
        private long femaleCustomers;
        
        public CustomerStats(long totalCustomers, long maleCustomers, long femaleCustomers) {
            this.totalCustomers = totalCustomers;
            this.maleCustomers = maleCustomers;
            this.femaleCustomers = femaleCustomers;
        }
        
        // Getters
        public long getTotalCustomers() { return totalCustomers; }
        public long getMaleCustomers() { return maleCustomers; }
        public long getFemaleCustomers() { return femaleCustomers; }
    }
}
