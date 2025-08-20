package com.pharmacy.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SaleResponse {
    private Long saleId;
    private String saleType;
    private LocalDate date;
    private String customer;
    private BigDecimal amount;
    private String status;

    // Default constructor
    public SaleResponse() {}

    // Constructor with parameters
    public SaleResponse(Long saleId, String saleType, LocalDate date, String customer, BigDecimal amount, String status) {
        this.saleId = saleId;
        this.saleType = saleType;
        this.date = date;
        this.customer = customer;
        this.amount = amount;
        this.status = status;
    }

    // Getters and Setters
    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public String getSaleType() {
        return saleType;
    }

    public void setSaleType(String saleType) {
        this.saleType = saleType;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
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
        return "SaleResponse{" +
                "saleId=" + saleId +
                ", saleType='" + saleType + '\'' +
                ", date=" + date +
                ", customer='" + customer + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
