package com.pharmacy.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;
    
    @NotBlank(message = "Payment type is required")
    @Size(max = 50, message = "Payment type must not exceed 50 characters")
    @Column(name = "payment_type", nullable = false, length = 50)
    private String paymentType;
    
    @NotNull(message = "Date is required")
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @NotBlank(message = "Payment by (supplier) is required")
    @Size(max = 100, message = "Payment by must not exceed 100 characters")
    @Column(name = "payment_by", nullable = false, length = 100)
    private String paymentBy;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @NotBlank(message = "Status is required")
    @Size(max = 20, message = "Status must not exceed 20 characters")
    @Column(name = "status", nullable = false, length = 20)
    private String status;
    
    // Default constructor
    public Payment() {}
    
    // Constructor with required fields
    public Payment(String paymentType, LocalDate date, String paymentBy, BigDecimal amount, String status) {
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
        return "Payment{" +
                "paymentId=" + paymentId +
                ", paymentType='" + paymentType + '\'' +
                ", date=" + date +
                ", paymentBy='" + paymentBy + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
