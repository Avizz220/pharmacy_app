package com.pharmacy.app.service;

import com.pharmacy.app.dto.SupplierRequest;
import com.pharmacy.app.dto.SupplierResponse;
import com.pharmacy.app.entity.Supplier;
import com.pharmacy.app.repository.SupplierRepository;
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
import java.util.stream.Collectors;

@Service
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Create new supplier
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        // Check if email already exists
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        
        // Create new supplier
        Supplier supplier = new Supplier();
        supplier.setSupplierName(request.getSupplierName());
        supplier.setCompany(request.getCompany());
        supplier.setEmail(request.getEmail());
        supplier.setPhoneNumber(request.getPhoneNumber());
        supplier.setSupplyType(request.getSupplyType());
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(savedSupplier);
    }
    
    // Update existing supplier
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        // Check if email is being changed and if it already exists
        if (!supplier.getEmail().equals(request.getEmail())) {
            if (supplierRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
        }
        
        // Update supplier fields
        supplier.setSupplierName(request.getSupplierName());
        supplier.setCompany(request.getCompany());
        supplier.setEmail(request.getEmail());
        supplier.setPhoneNumber(request.getPhoneNumber());
        supplier.setSupplyType(request.getSupplyType());
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        
        // Force flush and commit
        entityManager.flush();
        
        return convertToResponse(updatedSupplier);
    }
    
    // Get supplier by ID
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        return convertToResponse(supplier);
    }
    
    // Get all suppliers with pagination
    public Page<SupplierResponse> getAllSuppliers(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Supplier> suppliers;
        if (search != null && !search.trim().isEmpty()) {
            suppliers = supplierRepository.findSuppliersWithSearch(search.trim(), pageable);
        } else {
            suppliers = supplierRepository.findAll(pageable);
        }
        
        return suppliers.map(this::convertToResponse);
    }
    
    // Get suppliers by supply type
    public List<SupplierResponse> getSuppliersByType(String supplyType) {
        List<Supplier> suppliers = supplierRepository.findBySupplyType(supplyType);
        return suppliers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Delete supplier
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        supplierRepository.delete(supplier);
        
        // Force flush and commit
        entityManager.flush();
    }
    
    // Get supplier statistics
    public SupplierStats getSupplierStats() {
        long totalSuppliers = supplierRepository.count();
        long medicineSuppliers = supplierRepository.countBySupplyType("Medicine");
        long equipmentSuppliers = supplierRepository.countBySupplyType("Equipment");
        
        return new SupplierStats(totalSuppliers, medicineSuppliers, equipmentSuppliers);
    }
    
    // Get distinct supply types
    public List<String> getDistinctSupplyTypes() {
        return supplierRepository.findDistinctSupplyTypes();
    }
    
    // Get distinct companies
    public List<String> getDistinctCompanies() {
        return supplierRepository.findDistinctCompanies();
    }
    
    // Helper method to convert Supplier entity to SupplierResponse
    private SupplierResponse convertToResponse(Supplier supplier) {
        return new SupplierResponse(
            supplier.getSupplierId(),
            supplier.getSupplierName(),
            supplier.getCompany(),
            supplier.getEmail(),
            supplier.getPhoneNumber(),
            supplier.getSupplyType()
        );
    }
    
    // Supplier statistics inner class
    public static class SupplierStats {
        private long totalSuppliers;
        private long medicineSuppliers;
        private long equipmentSuppliers;
        
        public SupplierStats(long totalSuppliers, long medicineSuppliers, long equipmentSuppliers) {
            this.totalSuppliers = totalSuppliers;
            this.medicineSuppliers = medicineSuppliers;
            this.equipmentSuppliers = equipmentSuppliers;
        }
        
        // Getters
        public long getTotalSuppliers() { return totalSuppliers; }
        public long getMedicineSuppliers() { return medicineSuppliers; }
        public long getEquipmentSuppliers() { return equipmentSuppliers; }
    }
}
