package com.pharmacy.app.service;

import com.pharmacy.app.dto.MedicineRequest;
import com.pharmacy.app.dto.MedicineResponse;
import com.pharmacy.app.entity.Medicine;
import com.pharmacy.app.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicineService {
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Create new medicine
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        // Check if medicine name already exists
        if (medicineRepository.existsByMedicineNameIgnoreCase(request.getMedicineName())) {
            throw new RuntimeException("Medicine already exists: " + request.getMedicineName());
        }
        
        // Create new medicine
        Medicine medicine = new Medicine();
        medicine.setMedicineName(request.getMedicineName());
        medicine.setMedicineType(request.getMedicineType());
        medicine.setNoOfMedicines(request.getNoOfMedicines());
        medicine.setStatus(request.getStatus());
        medicine.setExpiredDate(request.getExpiredDate());
        if (request.getPrice() != null) {
            medicine.setPrice(request.getPrice());
        }
        if (request.getBatchNumber() != null) {
            medicine.setBatchNumber(request.getBatchNumber());
        }
        if (request.getManufacturer() != null) {
            medicine.setManufacturer(request.getManufacturer());
        }
        if (request.getDescription() != null) {
            medicine.setDescription(request.getDescription());
        }
        
        Medicine savedMedicine = medicineRepository.save(medicine);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(savedMedicine);
    }
    
    // Update existing medicine
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        
        // Check if medicine name already exists (excluding current medicine)
        if (medicineRepository.existsByMedicineNameIgnoreCase(request.getMedicineName())) {
            Optional<Medicine> existingMedicine = medicineRepository.findByMedicineNameIgnoreCase(request.getMedicineName());
            if (existingMedicine.isPresent() && !existingMedicine.get().getId().equals(id)) {
                throw new RuntimeException("Medicine already exists: " + request.getMedicineName());
            }
        }
        
        // Update medicine fields
        medicine.setMedicineName(request.getMedicineName());
        medicine.setMedicineType(request.getMedicineType());
        medicine.setNoOfMedicines(request.getNoOfMedicines());
        medicine.setStatus(request.getStatus());
        medicine.setExpiredDate(request.getExpiredDate());
        if (request.getPrice() != null) {
            medicine.setPrice(request.getPrice());
        }
        if (request.getBatchNumber() != null) {
            medicine.setBatchNumber(request.getBatchNumber());
        }
        if (request.getManufacturer() != null) {
            medicine.setManufacturer(request.getManufacturer());
        }
        if (request.getDescription() != null) {
            medicine.setDescription(request.getDescription());
        }
        
        Medicine updatedMedicine = medicineRepository.save(medicine);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(updatedMedicine);
    }
    
    // Get medicine by ID
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        return convertToResponse(medicine);
    }
    
    // Get all medicines with pagination
    public Page<MedicineResponse> getAllMedicines(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Medicine> medicines;
        if (search != null && !search.trim().isEmpty()) {
            medicines = medicineRepository.findMedicinesWithSearch(search.trim(), pageable);
        } else {
            medicines = medicineRepository.findAll(pageable);
        }
        
        return medicines.map(this::convertToResponse);
    }
    
    // Get medicines by type
    public List<MedicineResponse> getMedicinesByType(String medicineType) {
        List<Medicine> medicines = medicineRepository.findByMedicineType(medicineType);
        return medicines.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Update medicine stock
    @Transactional
    public MedicineResponse updateMedicineStock(Long medicineId, Integer newQuantity) {
        Medicine medicine = medicineRepository.findById(medicineId)
            .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + medicineId));
        
        medicine.setNoOfMedicines(newQuantity);
        Medicine updatedMedicine = medicineRepository.save(medicine);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(updatedMedicine);
    }
    
    // Delete medicine
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        
        medicineRepository.delete(medicine);
        
        // Force flush and commit
        entityManager.flush();
    }
    
    // Get low stock medicines (quantity < 10)
    public List<MedicineResponse> getLowStockMedicines() {
        List<Medicine> medicines = medicineRepository.findLowStockMedicines(10);
        return medicines.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get expired medicines
    public List<MedicineResponse> getExpiredMedicines() {
        List<Medicine> medicines = medicineRepository.findExpiredMedicines(LocalDate.now());
        return medicines.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get medicine statistics
    public MedicineStats getMedicineStats() {
        long totalMedicines = medicineRepository.count();
        long lowStockCount = medicineRepository.findLowStockMedicines(10).size();
        long expiredCount = medicineRepository.findExpiredMedicines(LocalDate.now()).size();
        
        return new MedicineStats(totalMedicines, lowStockCount, expiredCount);
    }
    
    // Helper method to convert Medicine entity to MedicineResponse
    private MedicineResponse convertToResponse(Medicine medicine) {
        MedicineResponse response = new MedicineResponse();
        response.setId(medicine.getId());
        response.setMedicineName(medicine.getMedicineName());
        response.setMedicineType(medicine.getMedicineType());
        response.setNoOfMedicines(medicine.getNoOfMedicines());
        response.setStatus(medicine.getStatus());
        response.setExpiredDate(medicine.getExpiredDate());
        response.setPrice(medicine.getPrice());
        response.setBatchNumber(medicine.getBatchNumber());
        response.setManufacturer(medicine.getManufacturer());
        response.setDescription(medicine.getDescription());
        return response;
    }
    
    // Inner class for medicine statistics
    public static class MedicineStats {
        private long totalMedicines;
        private long lowStockCount;
        private long expiredCount;
        
        public MedicineStats(long totalMedicines, long lowStockCount, long expiredCount) {
            this.totalMedicines = totalMedicines;
            this.lowStockCount = lowStockCount;
            this.expiredCount = expiredCount;
        }
        
        // Getters
        public long getTotalMedicines() { return totalMedicines; }
        public long getLowStockCount() { return lowStockCount; }
        public long getExpiredCount() { return expiredCount; }
    }
}
