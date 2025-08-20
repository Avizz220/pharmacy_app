package com.pharmacy.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "suppliers")
public class Supplier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;
    
    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 100, message = "Supplier name must be between 2 and 100 characters")
    @Column(name = "supplier_name", nullable = false, length = 100)
    private String supplierName;
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    @Column(name = "company", nullable = false, length = 100)
    private String company;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(\\d{3}\\) \\d{3}-\\d{4}$", message = "Phone number must be in format (XXX) XXX-XXXX")
    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;
    
    @NotBlank(message = "Supply type is required")
    @Column(name = "supply_type", nullable = false, length = 50)
    private String supplyType;
    
    // Default constructor
    public Supplier() {}
    
    // Constructor with required fields
    public Supplier(String supplierName, String company, String email, String phoneNumber, String supplyType) {
        this.supplierName = supplierName;
        this.company = company;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.supplyType = supplyType;
    }
    
    // Getters and Setters
    public Long getSupplierId() {
        return supplierId;
    }
    
    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }
    
    public String getSupplierName() {
        return supplierName;
    }
    
    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getSupplyType() {
        return supplyType;
    }
    
    public void setSupplyType(String supplyType) {
        this.supplyType = supplyType;
    }
    
    @Override
    public String toString() {
        return "Supplier{" +
                "supplierId=" + supplierId +
                ", supplierName='" + supplierName + '\'' +
                ", company='" + company + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", supplyType='" + supplyType + '\'' +
                '}';
    }
}
