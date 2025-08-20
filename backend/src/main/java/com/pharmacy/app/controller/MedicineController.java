package com.pharmacy.app.controller;

import com.pharmacy.app.dto.MedicineRequest;
import com.pharmacy.app.dto.MedicineResponse;
import com.pharmacy.app.service.MedicineService;
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
@RequestMapping("/api/medicines")
public class MedicineController {
    
    @Autowired
    private MedicineService medicineService;
    
    // Create new medicine
    @PostMapping
    public ResponseEntity<?> createMedicine(@Valid @RequestBody MedicineRequest request) {
        try {
            System.out.println("Creating medicine: " + request.getMedicineName());
            MedicineResponse medicine = medicineService.createMedicine(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine created successfully");
            response.put("medicine", medicine);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Error creating medicine: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create medicine: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get all medicines with pagination and search
    @GetMapping
    public ResponseEntity<?> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        try {
            Page<MedicineResponse> medicines = medicineService.getAllMedicines(
                page, size, sortBy, sortDir, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicines", medicines.getContent());
            response.put("currentPage", medicines.getNumber());
            response.put("totalItems", medicines.getTotalElements());
            response.put("totalPages", medicines.getTotalPages());
            response.put("hasNext", medicines.hasNext());
            response.put("hasPrevious", medicines.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicineById(@PathVariable Long id) {
        try {
            MedicineResponse medicine = medicineService.getMedicineById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicine", medicine);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        try {
            MedicineResponse medicine = medicineService.updateMedicine(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine updated successfully");
            response.put("medicine", medicine);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Delete medicine (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get medicines by category
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getMedicinesByCategory(@PathVariable String category) {
        try {
            List<MedicineResponse> medicines = medicineService.getMedicinesByType(category);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicines", medicines);
            response.put("category", category);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Update medicine stock
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateMedicineStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer newQuantity = request.get("quantity");
            if (newQuantity == null || newQuantity < 0) {
                throw new RuntimeException("Invalid quantity");
            }
            
            MedicineResponse medicine = medicineService.updateMedicineStock(id, newQuantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Stock updated successfully");
            response.put("medicine", medicine);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get low stock medicines
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockMedicines() {
        try {
            List<MedicineResponse> medicines = medicineService.getLowStockMedicines();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicines", medicines);
            response.put("count", medicines.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get expired medicines
    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredMedicines() {
        try {
            List<MedicineResponse> medicines = medicineService.getExpiredMedicines();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("medicines", medicines);
            response.put("count", medicines.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get medicine statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getMedicineStats() {
        try {
            MedicineService.MedicineStats stats = medicineService.getMedicineStats();
            
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
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Medicine API is working!");
        
        return ResponseEntity.ok(response);
    }
}
