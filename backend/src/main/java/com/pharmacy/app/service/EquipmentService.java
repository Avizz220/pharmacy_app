package com.pharmacy.app.service;

import com.pharmacy.app.dto.EquipmentRequest;
import com.pharmacy.app.dto.EquipmentResponse;
import com.pharmacy.app.entity.Equipment;
import com.pharmacy.app.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {
    
    @Autowired
    private EquipmentRepository equipmentRepository;
    
    // Create new equipment
    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        // Check if equipment with same name and model already exists
        if (equipmentRepository.existsByEquipmentNameAndModel(request.getEquipmentName(), request.getModel())) {
            throw new RuntimeException("Equipment with name '" + request.getEquipmentName() + 
                                     "' and model '" + request.getModel() + "' already exists");
        }
        
        Equipment equipment = new Equipment();
        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setModel(request.getModel());
        equipment.setNoOfEquipments(request.getNoOfEquipments());
        
        Equipment savedEquipment = equipmentRepository.save(equipment);
        return convertToResponse(savedEquipment);
    }
    
    // Update equipment
    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        
        // Check if another equipment with same name and model exists (excluding current equipment)
        Equipment existingEquipment = equipmentRepository.findAll().stream()
            .filter(e -> !e.getId().equals(id) && 
                        e.getEquipmentName().equalsIgnoreCase(request.getEquipmentName()) &&
                        e.getModel().equalsIgnoreCase(request.getModel()))
            .findFirst()
            .orElse(null);
        
        if (existingEquipment != null) {
            throw new RuntimeException("Equipment with name '" + request.getEquipmentName() + 
                                     "' and model '" + request.getModel() + "' already exists");
        }
        
        // Update equipment fields
        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setModel(request.getModel());
        equipment.setNoOfEquipments(request.getNoOfEquipments());
        
        Equipment updatedEquipment = equipmentRepository.save(equipment);
        return convertToResponse(updatedEquipment);
    }
    
    // Get equipment by ID
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        
        return convertToResponse(equipment);
    }
    
    // Get all equipment with pagination and search
    public Page<EquipmentResponse> getAllEquipment(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Equipment> equipmentPage;
        
        if (search != null && !search.trim().isEmpty()) {
            equipmentPage = equipmentRepository.findByEquipmentNameContainingIgnoreCaseOrModelContainingIgnoreCase(
                search.trim(), pageable);
        } else {
            equipmentPage = equipmentRepository.findAll(pageable);
        }
        
        return equipmentPage.map(this::convertToResponse);
    }
    
    // Get all equipment (without pagination)
    public List<EquipmentResponse> getAllEquipment() {
        List<Equipment> equipment = equipmentRepository.findAll(Sort.by(Sort.Direction.ASC, "equipmentName"));
        return equipment.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Delete equipment
    @Transactional
    public void deleteEquipment(Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new RuntimeException("Equipment not found with id: " + id);
        }
        
        equipmentRepository.deleteById(id);
    }
    
    // Search equipment by name
    public List<EquipmentResponse> searchByName(String name) {
        List<Equipment> equipment = equipmentRepository.findByEquipmentNameContainingIgnoreCase(name);
        return equipment.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Search equipment by model
    public List<EquipmentResponse> searchByModel(String model) {
        List<Equipment> equipment = equipmentRepository.findByModelContainingIgnoreCase(model);
        return equipment.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get equipment with low stock
    public List<EquipmentResponse> getEquipmentWithLowStock(Integer threshold) {
        List<Equipment> equipment = equipmentRepository.findEquipmentWithLowStock(threshold);
        return equipment.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get equipment statistics
    public EquipmentStats getEquipmentStats() {
        long totalEquipmentTypes = equipmentRepository.count();
        long totalEquipmentCount = equipmentRepository.getTotalEquipmentCount();
        long lowStockCount = equipmentRepository.findEquipmentWithLowStock(5).size(); // Less than 5 items
        
        return new EquipmentStats(totalEquipmentTypes, totalEquipmentCount, lowStockCount);
    }
    
    // Convert Equipment entity to EquipmentResponse DTO
    private EquipmentResponse convertToResponse(Equipment equipment) {
        return new EquipmentResponse(
            equipment.getId(),
            equipment.getEquipmentName(),
            equipment.getModel(),
            equipment.getNoOfEquipments()
        );
    }
    
    // Equipment statistics inner class
    public static class EquipmentStats {
        private long totalEquipmentTypes;
        private long totalEquipmentCount;
        private long lowStockCount;
        
        public EquipmentStats(long totalEquipmentTypes, long totalEquipmentCount, long lowStockCount) {
            this.totalEquipmentTypes = totalEquipmentTypes;
            this.totalEquipmentCount = totalEquipmentCount;
            this.lowStockCount = lowStockCount;
        }
        
        // Getters
        public long getTotalEquipmentTypes() { return totalEquipmentTypes; }
        public long getTotalEquipmentCount() { return totalEquipmentCount; }
        public long getLowStockCount() { return lowStockCount; }
    }
}
