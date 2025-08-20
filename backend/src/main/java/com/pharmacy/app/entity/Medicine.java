package com.pharmacy.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medicines")
public class Medicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Medicine name is required")
    @Size(min = 2, max = 100, message = "Medicine name must be between 2 and 100 characters")
    @Column(name = "medicine_name", nullable = false, length = 100)
    private String medicineName;
    
    @NotBlank(message = "Medicine type is required")
    @Size(max = 50, message = "Medicine type must not exceed 50 characters")  
    @Column(name = "medicine_type", nullable = false, length = 50)
    private String medicineType;
    
    @NotNull(message = "Number of medicines is required")
    @Min(value = 0, message = "Number of medicines cannot be negative")
    @Column(name = "no_of_medicines", nullable = false)
    private Integer noOfMedicines;
    
    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false, length = 20)
    private String status; // Available, Expired, Low Stock
    
    @NotNull(message = "Expired date is required")
    @Column(name = "expired_date", nullable = false)
    private LocalDate expiredDate;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "batch_number", length = 50)
    private String batchNumber;
    
    @Column(name = "manufacturer", length = 100)
    private String manufacturer;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // Default constructor
    public Medicine() {}
    
    // Constructor with essential fields
    public Medicine(String medicineName, String medicineType, Integer noOfMedicines, 
                   String status, LocalDate expiredDate) {
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
    
    @Override
    public String toString() {
        return "Medicine{" +
                "id=" + id +
                ", medicineName='" + medicineName + '\'' +
                ", medicineType='" + medicineType + '\'' +
                ", noOfMedicines=" + noOfMedicines +
                ", status='" + status + '\'' +
                ", expiredDate=" + expiredDate +
                ", price=" + price +
                '}';
    }
}
