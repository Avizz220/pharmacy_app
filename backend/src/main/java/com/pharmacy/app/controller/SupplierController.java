package com.pharmacy.app.controller;

import com.pharmacy.app.dto.SupplierRequest;
import com.pharmacy.app.dto.SupplierResponse;
import com.pharmacy.app.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;
    
    // Create new supplier
    @PostMapping
    public ResponseEntity<?> createSupplier(@Valid @RequestBody SupplierRequest request) {
        try {
            System.out.println("Creating supplier: " + request.getSupplierName());
            SupplierResponse supplier = supplierService.createSupplier(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Supplier created successfully");
            response.put("supplier", supplier);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Error creating supplier: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create supplier: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get all suppliers with pagination and search
    @GetMapping
    public ResponseEntity<?> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "supplierId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        try {
            Page<SupplierResponse> suppliers = supplierService.getAllSuppliers(
                page, size, sortBy, sortDir, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("suppliers", suppliers.getContent());
            response.put("currentPage", suppliers.getNumber());
            response.put("totalItems", suppliers.getTotalElements());
            response.put("totalPages", suppliers.getTotalPages());
            response.put("hasNext", suppliers.hasNext());
            response.put("hasPrevious", suppliers.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get supplier by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable Long id) {
        try {
            SupplierResponse supplier = supplierService.getSupplierById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("supplier", supplier);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Update supplier
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        try {
            SupplierResponse supplier = supplierService.updateSupplier(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Supplier updated successfully");
            response.put("supplier", supplier);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Delete supplier
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Supplier deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get suppliers by supply type
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getSuppliersByType(@PathVariable String type) {
        try {
            List<SupplierResponse> suppliers = supplierService.getSuppliersByType(type);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("suppliers", suppliers);
            response.put("supplyType", type);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get supplier statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getSupplierStats() {
        try {
            SupplierService.SupplierStats stats = supplierService.getSupplierStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get distinct supply types
    @GetMapping("/supply-types")
    public ResponseEntity<?> getDistinctSupplyTypes() {
        try {
            List<String> supplyTypes = supplierService.getDistinctSupplyTypes();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("supplyTypes", supplyTypes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get distinct companies
    @GetMapping("/companies")
    public ResponseEntity<?> getDistinctCompanies() {
        try {
            List<String> companies = supplierService.getDistinctCompanies();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("companies", companies);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Supplier API is working!");
        
        return ResponseEntity.ok(response);
    }
}
