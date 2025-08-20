package com.pharmacy.app.repository;

import com.pharmacy.app.entity.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    
    // Find equipment by name (case insensitive)
    @Query("SELECT e FROM Equipment e WHERE LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Equipment> findByEquipmentNameContainingIgnoreCase(@Param("name") String name);
    
    // Find equipment by model (case insensitive)
    @Query("SELECT e FROM Equipment e WHERE LOWER(e.model) LIKE LOWER(CONCAT('%', :model, '%'))")
    List<Equipment> findByModelContainingIgnoreCase(@Param("model") String model);
    
    // Search equipment by name or model
    @Query("SELECT e FROM Equipment e WHERE " +
           "LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Equipment> findByEquipmentNameContainingIgnoreCaseOrModelContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);
    
    // Check if equipment exists by name and model
    boolean existsByEquipmentNameAndModel(String equipmentName, String model);
    
    // Find equipment with low stock (less than specified count)
    @Query("SELECT e FROM Equipment e WHERE e.noOfEquipments < :threshold")
    List<Equipment> findEquipmentWithLowStock(@Param("threshold") Integer threshold);
    
    // Get total count of all equipment
    @Query("SELECT COALESCE(SUM(e.noOfEquipments), 0) FROM Equipment e")
    Long getTotalEquipmentCount();
    
    // Get equipment count by name pattern
    @Query("SELECT COUNT(e) FROM Equipment e WHERE LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Long countByEquipmentNameContainingIgnoreCase(@Param("name") String name);
}
