package com.pharmacy.app.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SaleRequest {
    @NotBlank(message = "Sale type is required")
    private String saleType;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Customer is required")
    private String customer;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Status is required")
    private String status;

    // Default constructor
    public SaleRequest() {}

    // Constructor with parameters
    public SaleRequest(String saleType, LocalDate date, String customer, BigDecimal amount, String status) {
        this.saleType = saleType;
        this.date = date;
        this.customer = customer;
        this.amount = amount;
        this.status = status;
    }

    // Getters and Setters
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
        return "SaleRequest{" +
                "saleType='" + saleType + '\'' +
                ", date=" + date +
                ", customer='" + customer + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
