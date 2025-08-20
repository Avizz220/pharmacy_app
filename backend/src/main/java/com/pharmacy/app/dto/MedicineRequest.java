package com.pharmacy.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MedicineRequest {
    
    @NotBlank(message = "Medicine name is required")
    @Size(min = 2, max = 100, message = "Medicine name must be between 2 and 100 characters")
    private String medicineName;
    
    @NotBlank(message = "Medicine type is required")
    @Size(max = 50, message = "Medicine type must not exceed 50 characters")
    private String medicineType;
    
    @NotNull(message = "Number of medicines is required")
    @Min(value = 0, message = "Number of medicines cannot be negative")
    private Integer noOfMedicines;
    
    @NotBlank(message = "Status is required")
    private String status;
    
    @NotNull(message = "Expired date is required")
    private LocalDate expiredDate;
    
    private BigDecimal price;
    private String batchNumber;
    private String manufacturer;
    private String description;
    
    // Default constructor
    public MedicineRequest() {}
    
    // Constructor
    public MedicineRequest(String medicineName, String medicineType, Integer noOfMedicines,
                          String status, LocalDate expiredDate) {
        this.medicineName = medicineName;
        this.medicineType = medicineType;
        this.noOfMedicines = noOfMedicines;
        this.status = status;
        this.expiredDate = expiredDate;
    }
    
    // Getters and Setters
    public String getMedicineName() {
        return medicineName;
    }
    
    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }
    
    public String getMedicineType() {
        return medicineType;
    }
    
    public void setMedicineType(String medicineType) {
        this.medicineType = medicineType;
    }
    
    public Integer getNoOfMedicines() {
        return noOfMedicines;
    }
    
    public void setNoOfMedicines(Integer noOfMedicines) {
        this.noOfMedicines = noOfMedicines;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDate getExpiredDate() {
        return expiredDate;
    }
    
    public void setExpiredDate(LocalDate expiredDate) {
        this.expiredDate = expiredDate;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getBatchNumber() {
        return batchNumber;
    }
    
    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }
    
    public String getManufacturer() {
        return manufacturer;
    }
    
    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
