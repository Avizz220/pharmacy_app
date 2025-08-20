package com.pharmacy.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class EquipmentRequest {
    
    @NotBlank(message = "Equipment name is required")
    @Size(min = 2, max = 100, message = "Equipment name must be between 2 and 100 characters")
    private String equipmentName;
    
    @NotBlank(message = "Model is required")
    @Size(min = 2, max = 100, message = "Model must be between 2 and 100 characters")
    private String model;
    
    @NotNull(message = "Number of equipments is required")
    @Positive(message = "Number of equipments must be positive")
    private Integer noOfEquipments;
    
    // Default constructor
    public EquipmentRequest() {}
    
    // Constructor
    public EquipmentRequest(String equipmentName, String model, Integer noOfEquipments) {
        this.equipmentName = equipmentName;
        this.model = model;
        this.noOfEquipments = noOfEquipments;
    }
    
    // Getters and Setters
    public String getEquipmentName() {
        return equipmentName;
    }
    
    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    public Integer getNoOfEquipments() {
        return noOfEquipments;
    }
    
    public void setNoOfEquipments(Integer noOfEquipments) {
        this.noOfEquipments = noOfEquipments;
    }
    
    @Override
    public String toString() {
        return "EquipmentRequest{" +
                "equipmentName='" + equipmentName + '\'' +
                ", model='" + model + '\'' +
                ", noOfEquipments=" + noOfEquipments +
                '}';
    }
}
