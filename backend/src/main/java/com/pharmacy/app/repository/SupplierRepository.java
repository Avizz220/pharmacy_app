package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    // Find supplier by email
    Optional<Supplier> findByEmail(String email);
    
    // Find suppliers by supply type
    List<Supplier> findBySupplyType(String supplyType);
    
    // Find suppliers by company
    List<Supplier> findByCompany(String company);
    
    // Search suppliers by name, company, or email
    @Query("SELECT s FROM Supplier s WHERE " +
           "(LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.company) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Supplier> findSuppliersWithSearch(@Param("search") String search, Pageable pageable);
    
    // Check if email exists (for duplicate validation)
    boolean existsByEmail(String email);
    
    // Count by supply type
    long countBySupplyType(String supplyType);
    
    // Find all distinct supply types
    @Query("SELECT DISTINCT s.supplyType FROM Supplier s ORDER BY s.supplyType")
    List<String> findDistinctSupplyTypes();
    
    // Find all distinct companies
    @Query("SELECT DISTINCT s.company FROM Supplier s ORDER BY s.company")
    List<String> findDistinctCompanies();
}
