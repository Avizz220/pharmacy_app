package com.pharmacy.app.controller;

import com.pharmacy.app.dto.SaleRequest;
import com.pharmacy.app.dto.SaleResponse;
import com.pharmacy.app.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
@Validated
public class SaleController {

    @Autowired
    private SaleService saleService;

    // Create a new sale
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSale(@Valid @RequestBody SaleRequest saleRequest) {
        try {
            SaleResponse saleResponse = saleService.createSale(saleRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sale created successfully");
            response.put("sale", saleResponse);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create sale: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Get all sales
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSales() {
        try {
            List<SaleResponse> sales = saleService.getAllSales();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalItems", sales.size());
            response.put("sales", sales);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch sales: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get sale by ID
    @GetMapping("/{saleId}")
    public ResponseEntity<Map<String, Object>> getSaleById(@PathVariable Long saleId) {
        try {
            Optional<SaleResponse> sale = saleService.getSaleById(saleId);
            
            if (sale.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("sale", sale.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sale not found with ID: " + saleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch sale: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update sale
    @PutMapping("/{saleId}")
    public ResponseEntity<Map<String, Object>> updateSale(@PathVariable Long saleId, 
                                                         @Valid @RequestBody SaleRequest saleRequest) {
        try {
            Optional<SaleResponse> updatedSale = saleService.updateSale(saleId, saleRequest);
            
            if (updatedSale.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Sale updated successfully");
                response.put("sale", updatedSale.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sale not found with ID: " + saleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update sale: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Delete sale
    @DeleteMapping("/{saleId}")
    public ResponseEntity<Map<String, Object>> deleteSale(@PathVariable Long saleId) {
        try {
            boolean deleted = saleService.deleteSale(saleId);
            
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Sale deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sale not found with ID: " + saleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete sale: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get sales with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getSalesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<SaleResponse> salesPage = saleService.getSalesWithPagination(page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sales", salesPage.getContent());
            response.put("currentPage", salesPage.getNumber());
            response.put("totalItems", salesPage.getTotalElements());
            response.put("totalPages", salesPage.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch sales: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Search sales
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchSales(
            @RequestParam(required = false) String saleType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<SaleResponse> sales = saleService.searchSales(saleType, status, customer, startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalItems", sales.size());
            response.put("sales", sales);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to search sales: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get sales by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getSalesByStatus(@PathVariable String status) {
        try {
            List<SaleResponse> sales = saleService.getSalesByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalItems", sales.size());
            response.put("sales", sales);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch sales by status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get sales statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSalesStatistics() {
        try {
            SaleService.SalesStatistics statistics = saleService.getSalesStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch sales statistics: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
