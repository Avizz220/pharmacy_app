package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Sale;
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
public interface SaleRepository extends JpaRepository<Sale, Long> {
    
    // Find all sales ordered by saleId descending
    List<Sale> findAllByOrderBySaleIdDesc();
    
    // Find sales by status
    List<Sale> findByStatusOrderBySaleIdDesc(String status);
    
    // Find sales by sale type
    List<Sale> findBySaleTypeOrderBySaleIdDesc(String saleType);
    
    // Find sales by customer (case insensitive)
    List<Sale> findByCustomerContainingIgnoreCaseOrderBySaleIdDesc(String customer);
    
    // Find sales by date range
    @Query("SELECT s FROM Sale s WHERE s.date BETWEEN :startDate AND :endDate ORDER BY s.saleId DESC")
    List<Sale> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find sales by amount range
    @Query("SELECT s FROM Sale s WHERE s.amount BETWEEN :minAmount AND :maxAmount ORDER BY s.saleId DESC")
    List<Sale> findByAmountBetween(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    // Search sales by multiple criteria
    @Query("SELECT s FROM Sale s WHERE " +
           "(:saleType IS NULL OR s.saleType = :saleType) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:customer IS NULL OR LOWER(s.customer) LIKE LOWER(CONCAT('%', :customer, '%'))) AND " +
           "(:startDate IS NULL OR s.date >= :startDate) AND " +
           "(:endDate IS NULL OR s.date <= :endDate) " +
           "ORDER BY s.saleId DESC")
    List<Sale> findSalesWithFilters(@Param("saleType") String saleType,
                                   @Param("status") String status,
                                   @Param("customer") String customer,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
    
    // Get total sales amount
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Sale s")
    BigDecimal getTotalSalesAmount();
    
    // Get total sales amount by status
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Sale s WHERE s.status = :status")
    BigDecimal getTotalSalesAmountByStatus(@Param("status") String status);
    
    // Get sales count by type
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleType = :saleType")
    Long getCountBySaleType(@Param("saleType") String saleType);
    
    // Get sales statistics
    @Query("SELECT s.saleType, COUNT(s), COALESCE(SUM(s.amount), 0) FROM Sale s GROUP BY s.saleType")
    List<Object[]> getSalesStatistics();
    
    // Find sales with pagination
    Page<Sale> findAllByOrderBySaleIdDesc(Pageable pageable);
}
