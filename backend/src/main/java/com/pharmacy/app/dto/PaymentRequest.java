package com.pharmacy.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentRequest {
    
    @NotBlank(message = "Payment type is required")
    @Size(max = 50, message = "Payment type must not exceed 50 characters")
    private String paymentType;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotBlank(message = "Payment by (supplier) is required")
    @Size(max = 100, message = "Payment by must not exceed 100 characters")
    private String paymentBy;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotBlank(message = "Status is required")
    @Size(max = 20, message = "Status must not exceed 20 characters")
    private String status;
    
    // Default constructor
    public PaymentRequest() {}
    
    // Constructor
    public PaymentRequest(String paymentType, LocalDate date, String paymentBy, BigDecimal amount, String status) {
        this.paymentType = paymentType;
        this.date = date;
        this.paymentBy = paymentBy;
        this.amount = amount;
        this.status = status;
    }
    
    // Getters and Setters
    public String getPaymentType() {
        return paymentType;
    }
    
    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getPaymentBy() {
        return paymentBy;
    }
    
    public void setPaymentBy(String paymentBy) {
        this.paymentBy = paymentBy;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "PaymentRequest{" +
                "paymentType='" + paymentType + '\'' +
                ", date=" + date +
                ", paymentBy='" + paymentBy + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
