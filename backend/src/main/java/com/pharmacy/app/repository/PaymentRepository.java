package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find payments by payment type
    List<Payment> findByPaymentType(String paymentType);
    
    // Find payments by status
    List<Payment> findByStatus(String status);
    
    // Find payments by payment by (supplier)
    List<Payment> findByPaymentBy(String paymentBy);
    
    // Find payments by date range
    @Query("SELECT p FROM Payment p WHERE p.date BETWEEN :startDate AND :endDate")
    List<Payment> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find payments by amount range
    @Query("SELECT p FROM Payment p WHERE p.amount BETWEEN :minAmount AND :maxAmount")
    List<Payment> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    // Search payments by payment type, payment by, or status
    @Query("SELECT p FROM Payment p WHERE " +
           "(LOWER(p.paymentType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.paymentBy) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.status) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payment> findPaymentsWithSearch(@Param("search") String search, Pageable pageable);
    
    // Count by status
    long countByStatus(String status);
    
    // Count by payment type
    long countByPaymentType(String paymentType);
    
    // Get total amount by status
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") String status);
    
    // Get total amount by payment type
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentType = :paymentType")
    BigDecimal getTotalAmountByPaymentType(@Param("paymentType") String paymentType);
    
    // Find all distinct payment types
    @Query("SELECT DISTINCT p.paymentType FROM Payment p ORDER BY p.paymentType")
    List<String> findDistinctPaymentTypes();
    
    // Find all distinct suppliers (payment by)
    @Query("SELECT DISTINCT p.paymentBy FROM Payment p ORDER BY p.paymentBy")
    List<String> findDistinctSuppliers();
    
    // Find all distinct statuses
    @Query("SELECT DISTINCT p.status FROM Payment p ORDER BY p.status")
    List<String> findDistinctStatuses();
}
