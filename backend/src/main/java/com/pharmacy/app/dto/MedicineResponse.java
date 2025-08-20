package com.pharmacy.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MedicineResponse {
    
    private Long id;
    private String medicineName;
    private String medicineType;
    private Integer noOfMedicines;
    private String status;
    private LocalDate expiredDate;
    private BigDecimal price;
    private String batchNumber;
    private String manufacturer;
    private String description;
    
    // Default constructor
    public MedicineResponse() {}
    
    // Constructor
    public MedicineResponse(Long id, String medicineName, String medicineType, 
                           Integer noOfMedicines, String status, LocalDate expiredDate) {
        this.id = id;
        this.medicineName = medicineName;
        this.medicineType = medicineType;
        this.noOfMedicines = noOfMedicines;
        this.status = status;
        this.expiredDate = expiredDate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
