package com.pharmacy.app.service;

import com.pharmacy.app.dto.SaleRequest;
import com.pharmacy.app.dto.SaleResponse;
import com.pharmacy.app.entity.Sale;
import com.pharmacy.app.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Create a new sale
    public SaleResponse createSale(SaleRequest saleRequest) {
        Sale sale = new Sale();
        sale.setSaleType(saleRequest.getSaleType());
        sale.setDate(saleRequest.getDate());
        sale.setCustomer(saleRequest.getCustomer());
        sale.setAmount(saleRequest.getAmount());
        sale.setStatus(saleRequest.getStatus());
        
        Sale savedSale = saleRepository.save(sale);
        return convertToResponse(savedSale);
    }

    // Get all sales
    public List<SaleResponse> getAllSales() {
        List<Sale> sales = saleRepository.findAllByOrderBySaleIdDesc();
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get sale by ID
    public Optional<SaleResponse> getSaleById(Long saleId) {
        Optional<Sale> sale = saleRepository.findById(saleId);
        return sale.map(this::convertToResponse);
    }

    // Update sale
    public Optional<SaleResponse> updateSale(Long saleId, SaleRequest saleRequest) {
        Optional<Sale> existingSale = saleRepository.findById(saleId);
        if (existingSale.isPresent()) {
            Sale sale = existingSale.get();
            sale.setSaleType(saleRequest.getSaleType());
            sale.setDate(saleRequest.getDate());
            sale.setCustomer(saleRequest.getCustomer());
            sale.setAmount(saleRequest.getAmount());
            sale.setStatus(saleRequest.getStatus());
            
            Sale updatedSale = saleRepository.save(sale);
            return Optional.of(convertToResponse(updatedSale));
        }
        return Optional.empty();
    }

    // Delete sale
    public boolean deleteSale(Long saleId) {
        if (saleRepository.existsById(saleId)) {
            saleRepository.deleteById(saleId);
            return true;
        }
        return false;
    }

    // Get sales with pagination
    public Page<SaleResponse> getSalesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Sale> salesPage = saleRepository.findAllByOrderBySaleIdDesc(pageable);
        return salesPage.map(this::convertToResponse);
    }

    // Search sales
    public List<SaleResponse> searchSales(String saleType, String status, String customer, 
                                         LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = saleRepository.findSalesWithFilters(saleType, status, customer, startDate, endDate);
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get sales by status
    public List<SaleResponse> getSalesByStatus(String status) {
        List<Sale> sales = saleRepository.findByStatusOrderBySaleIdDesc(status);
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get sales by type
    public List<SaleResponse> getSalesBySaleType(String saleType) {
        List<Sale> sales = saleRepository.findBySaleTypeOrderBySaleIdDesc(saleType);
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get sales by customer
    public List<SaleResponse> getSalesByCustomer(String customer) {
        List<Sale> sales = saleRepository.findByCustomerContainingIgnoreCaseOrderBySaleIdDesc(customer);
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get sales by date range
    public List<SaleResponse> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = saleRepository.findByDateBetween(startDate, endDate);
        return sales.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    // Get total sales amount
    public BigDecimal getTotalSalesAmount() {
        return saleRepository.getTotalSalesAmount();
    }

    // Get sales statistics
    public SalesStatistics getSalesStatistics() {
        List<Sale> allSales = saleRepository.findAll();
        
        long totalSales = allSales.size();
        BigDecimal totalAmount = saleRepository.getTotalSalesAmount();
        
        long completedSales = allSales.stream()
                                    .filter(sale -> "Completed".equalsIgnoreCase(sale.getStatus()))
                                    .count();
        
        long pendingSales = allSales.stream()
                                  .filter(sale -> "Pending".equalsIgnoreCase(sale.getStatus()))
                                  .count();
        
        long medicineSales = allSales.stream()
                                   .filter(sale -> "Medicine".equalsIgnoreCase(sale.getSaleType()))
                                   .count();
        
        long equipmentSales = allSales.stream()
                                    .filter(sale -> "Equipment".equalsIgnoreCase(sale.getSaleType()))
                                    .count();
        
        return new SalesStatistics(totalSales, totalAmount, completedSales, pendingSales, medicineSales, equipmentSales);
    }

    // Convert Sale entity to SaleResponse DTO
    private SaleResponse convertToResponse(Sale sale) {
        return new SaleResponse(
            sale.getSaleId(),
            sale.getSaleType(),
            sale.getDate(),
            sale.getCustomer(),
            sale.getAmount(),
            sale.getStatus()
        );
    }

    // Inner class for sales statistics
    public static class SalesStatistics {
        private long totalSales;
        private BigDecimal totalAmount;
        private long completedSales;
        private long pendingSales;
        private long medicineSales;
        private long equipmentSales;

        public SalesStatistics(long totalSales, BigDecimal totalAmount, long completedSales, 
                              long pendingSales, long medicineSales, long equipmentSales) {
            this.totalSales = totalSales;
            this.totalAmount = totalAmount;
            this.completedSales = completedSales;
            this.pendingSales = pendingSales;
            this.medicineSales = medicineSales;
            this.equipmentSales = equipmentSales;
        }

        // Getters
        public long getTotalSales() { return totalSales; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public long getCompletedSales() { return completedSales; }
        public long getPendingSales() { return pendingSales; }
        public long getMedicineSales() { return medicineSales; }
        public long getEquipmentSales() { return equipmentSales; }
    }
}
