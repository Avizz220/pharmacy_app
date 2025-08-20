package com.pharmacy.app.service;

import com.pharmacy.app.dto.PaymentRequest;
import com.pharmacy.app.dto.PaymentResponse;
import com.pharmacy.app.entity.Payment;
import com.pharmacy.app.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Create new payment
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        // Create new payment
        Payment payment = new Payment();
        payment.setPaymentType(request.getPaymentType());
        payment.setDate(request.getDate());
        payment.setPaymentBy(request.getPaymentBy());
        payment.setAmount(request.getAmount());
        payment.setStatus(request.getStatus());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(savedPayment);
    }
    
    // Update existing payment
    @Transactional
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        // Update payment fields
        payment.setPaymentType(request.getPaymentType());
        payment.setDate(request.getDate());
        payment.setPaymentBy(request.getPaymentBy());
        payment.setAmount(request.getAmount());
        payment.setStatus(request.getStatus());
        
        Payment updatedPayment = paymentRepository.save(payment);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(updatedPayment);
    }
    
    // Get payment by ID
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return convertToResponse(payment);
    }
    
    // Get all payments with pagination
    public Page<PaymentResponse> getAllPayments(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Payment> payments;
        if (search != null && !search.trim().isEmpty()) {
            payments = paymentRepository.findPaymentsWithSearch(search.trim(), pageable);
        } else {
            payments = paymentRepository.findAll(pageable);
        }
        
        return payments.map(this::convertToResponse);
    }
    
    // Get payments by payment type
    public List<PaymentResponse> getPaymentsByType(String paymentType) {
        List<Payment> payments = paymentRepository.findByPaymentType(paymentType);
        return payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get payments by status
    public List<PaymentResponse> getPaymentsByStatus(String status) {
        List<Payment> payments = paymentRepository.findByStatus(status);
        return payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get payments by supplier
    public List<PaymentResponse> getPaymentsBySupplier(String supplier) {
        List<Payment> payments = paymentRepository.findByPaymentBy(supplier);
        return payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get payments by date range
    public List<PaymentResponse> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<Payment> payments = paymentRepository.findByDateRange(startDate, endDate);
        return payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Delete payment
    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        paymentRepository.delete(payment);
        
        // Force flush and commit
        entityManager.flush();
    }
    
    // Get payment statistics
    public PaymentStats getPaymentStats() {
        long totalPayments = paymentRepository.count();
        long completedPayments = paymentRepository.countByStatus("Completed");
        long pendingPayments = paymentRepository.countByStatus("Pending");
        
        BigDecimal totalAmount = paymentRepository.getTotalAmountByStatus("Completed");
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        
        return new PaymentStats(totalPayments, completedPayments, pendingPayments, totalAmount);
    }
    
    // Get distinct payment types
    public List<String> getDistinctPaymentTypes() {
        return paymentRepository.findDistinctPaymentTypes();
    }
    
    // Get distinct suppliers
    public List<String> getDistinctSuppliers() {
        return paymentRepository.findDistinctSuppliers();
    }
    
    // Get distinct statuses
    public List<String> getDistinctStatuses() {
        return paymentRepository.findDistinctStatuses();
    }
    
    // Helper method to convert Payment entity to PaymentResponse
    private PaymentResponse convertToResponse(Payment payment) {
        return new PaymentResponse(
            payment.getPaymentId(),
            payment.getPaymentType(),
            payment.getDate(),
            payment.getPaymentBy(),
            payment.getAmount(),
            payment.getStatus()
        );
    }
    
    // Payment statistics inner class
    public static class PaymentStats {
        private long totalPayments;
        private long completedPayments;
        private long pendingPayments;
        private BigDecimal totalAmount;
        
        public PaymentStats(long totalPayments, long completedPayments, long pendingPayments, BigDecimal totalAmount) {
            this.totalPayments = totalPayments;
            this.completedPayments = completedPayments;
            this.pendingPayments = pendingPayments;
            this.totalAmount = totalAmount;
        }
        
        // Getters
        public long getTotalPayments() { return totalPayments; }
        public long getCompletedPayments() { return completedPayments; }
        public long getPendingPayments() { return pendingPayments; }
        public BigDecimal getTotalAmount() { return totalAmount; }
    }
}
