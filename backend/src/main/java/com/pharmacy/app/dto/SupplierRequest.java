package com.pharmacy.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SupplierRequest {
    
    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 100, message = "Supplier name must be between 2 and 100 characters")
    private String supplierName;
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String company;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(\\d{3}\\) \\d{3}-\\d{4}$", message = "Phone number must be in format (XXX) XXX-XXXX")
    private String phoneNumber;
    
    @NotBlank(message = "Supply type is required")
    private String supplyType;
    
    // Default constructor
    public SupplierRequest() {}
    
    // Constructor
    public SupplierRequest(String supplierName, String company, String email, String phoneNumber, String supplyType) {
        this.supplierName = supplierName;
        this.company = company;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.supplyType = supplyType;
    }
    
    // Getters and Setters
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
        return "SupplierRequest{" +
                "supplierName='" + supplierName + '\'' +
                ", company='" + company + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", supplyType='" + supplyType + '\'' +
                '}';
    }
}
