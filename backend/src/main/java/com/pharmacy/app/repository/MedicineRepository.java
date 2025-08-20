package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    
    // Find by medicine name (case-insensitive)
    Optional<Medicine> findByMedicineNameIgnoreCase(String medicineName);
    
    // Find by medicine type
    List<Medicine> findByMedicineType(String medicineType);
    
    // Find by status
    List<Medicine> findByStatus(String status);
    
    // Find medicines by batch number
    Optional<Medicine> findByBatchNumber(String batchNumber);
    
    // Find medicines expiring soon (within specified days)
    @Query("SELECT m FROM Medicine m WHERE m.expiredDate <= :expiryDate")
    List<Medicine> findMedicinesExpiringSoon(@Param("expiryDate") LocalDate expiryDate);
    
    // Find expired medicines
    @Query("SELECT m FROM Medicine m WHERE m.expiredDate < :currentDate")
    List<Medicine> findExpiredMedicines(@Param("currentDate") LocalDate currentDate);
    
    // Find medicines with low stock (less than specified quantity)
    @Query("SELECT m FROM Medicine m WHERE m.noOfMedicines < :threshold")
    List<Medicine> findLowStockMedicines(@Param("threshold") Integer threshold);
    
    // Search medicines by name, type, or manufacturer
    @Query("SELECT m FROM Medicine m WHERE " +
           "(LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.medicineType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medicine> findMedicinesWithSearch(@Param("search") String search, Pageable pageable);
    
    // Count by status
    long countByStatus(String status);
    
    // Find medicines by manufacturer
    List<Medicine> findByManufacturer(String manufacturer);
    
    // Check if medicine name exists (for duplicate validation)
    boolean existsByMedicineNameIgnoreCase(String medicineName);
    
    // Check if batch number exists (for duplicate validation)
    boolean existsByBatchNumber(String batchNumber);
    
    // Find all medicine types (distinct)
    @Query("SELECT DISTINCT m.medicineType FROM Medicine m ORDER BY m.medicineType")
    List<String> findDistinctMedicineTypes();
    
    // Find all manufacturers (distinct)
    @Query("SELECT DISTINCT m.manufacturer FROM Medicine m WHERE m.manufacturer IS NOT NULL ORDER BY m.manufacturer")
    List<String> findDistinctManufacturers();
}
