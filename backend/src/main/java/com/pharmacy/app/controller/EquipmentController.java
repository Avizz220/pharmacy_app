package com.pharmacy.app.controller;

import com.pharmacy.app.dto.EquipmentRequest;
import com.pharmacy.app.dto.EquipmentResponse;
import com.pharmacy.app.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {
    
    @Autowired
    private EquipmentService equipmentService;
    
    // Create new equipment
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('PHARMACIST')")
    public ResponseEntity<?> createEquipment(@Valid @RequestBody EquipmentRequest request) {
        try {
            EquipmentResponse equipment = equipmentService.createEquipment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Equipment created successfully");
            response.put("equipment", equipment);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get all equipment with pagination and search
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('PHARMACIST') or hasRole('MANAGER')")
    public ResponseEntity<?> getAllEquipment(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "equipmentName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search) {
        try {
            Page<EquipmentResponse> equipmentPage = equipmentService.getAllEquipment(page, size, sortBy, sortDir, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipmentPage.getContent());
            response.put("currentPage", equipmentPage.getNumber());
            response.put("totalItems", equipmentPage.getTotalElements());
            response.put("totalPages", equipmentPage.getTotalPages());
            response.put("pageSize", equipmentPage.getSize());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get equipment by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('PHARMACIST') or hasRole('MANAGER')")
    public ResponseEntity<?> getEquipmentById(@PathVariable Long id) {
        try {
            EquipmentResponse equipment = equipmentService.getEquipmentById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Update equipment
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('PHARMACIST')")
    public ResponseEntity<?> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentRequest request) {
        try {
            EquipmentResponse equipment = equipmentService.updateEquipment(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Equipment updated successfully");
            response.put("equipment", equipment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Delete equipment
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('PHARMACIST')")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id) {
        try {
            equipmentService.deleteEquipment(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Equipment deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get all equipment (without pagination)
    @GetMapping("/all")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('PHARMACIST') or hasRole('MANAGER')")
    public ResponseEntity<?> getAllEquipmentList() {
        try {
            List<EquipmentResponse> equipment = equipmentService.getAllEquipment();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipment);
            response.put("total", equipment.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Search equipment by name
    @GetMapping("/search/name")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('PHARMACIST') or hasRole('MANAGER')")
    public ResponseEntity<?> searchByName(@RequestParam String name) {
        try {
            List<EquipmentResponse> equipment = equipmentService.searchByName(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipment);
            response.put("total", equipment.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Search equipment by model
    @GetMapping("/search/model")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('PHARMACIST') or hasRole('MANAGER')")
    public ResponseEntity<?> searchByModel(@RequestParam String model) {
        try {
            List<EquipmentResponse> equipment = equipmentService.searchByModel(model);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipment);
            response.put("total", equipment.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get equipment with low stock
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('PHARMACIST')")
    public ResponseEntity<?> getEquipmentWithLowStock(@RequestParam(defaultValue = "5") Integer threshold) {
        try {
            List<EquipmentResponse> equipment = equipmentService.getEquipmentWithLowStock(threshold);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("equipment", equipment);
            response.put("total", equipment.size());
            response.put("threshold", threshold);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get equipment statistics
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('PHARMACIST')")
    public ResponseEntity<?> getEquipmentStats() {
        try {
            EquipmentService.EquipmentStats stats = equipmentService.getEquipmentStats();
            
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
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Equipment API is working!");
    }
}
