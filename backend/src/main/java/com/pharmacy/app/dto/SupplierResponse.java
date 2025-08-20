package com.pharmacy.app.dto;

public class SupplierResponse {
    
    private Long supplierId;
    private String supplierName;
    private String company;
    private String email;
    private String phoneNumber;
    private String supplyType;
    
    // Default constructor
    public SupplierResponse() {}
    
    // Constructor
    public SupplierResponse(Long supplierId, String supplierName, String company, 
                          String email, String phoneNumber, String supplyType) {
        this.supplierId = supplierId;
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
        return "SupplierResponse{" +
                "supplierId=" + supplierId +
                ", supplierName='" + supplierName + '\'' +
                ", company='" + company + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", supplyType='" + supplyType + '\'' +
                '}';
    }
}
