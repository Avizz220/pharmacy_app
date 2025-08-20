package com.pharmacy.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentResponse {
    
    private Long paymentId;
    private String paymentType;
    private LocalDate date;
    private String paymentBy;
    private BigDecimal amount;
    private String status;
    
    // Default constructor
    public PaymentResponse() {}
    
    // Constructor
    public PaymentResponse(Long paymentId, String paymentType, LocalDate date, 
                          String paymentBy, BigDecimal amount, String status) {
        this.paymentId = paymentId;
        this.paymentType = paymentType;
        this.date = date;
        this.paymentBy = paymentBy;
        this.amount = amount;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }
    
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
        return "PaymentResponse{" +
                "paymentId=" + paymentId +
                ", paymentType='" + paymentType + '\'' +
                ", date=" + date +
                ", paymentBy='" + paymentBy + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
