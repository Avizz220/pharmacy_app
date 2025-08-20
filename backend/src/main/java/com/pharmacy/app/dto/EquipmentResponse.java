package com.pharmacy.app.dto;

public class EquipmentResponse {
    
    private Long id;
    private String equipmentName;
    private String model;
    private Integer noOfEquipments;
    
    // Default constructor
    public EquipmentResponse() {}
    
    // Constructor
    public EquipmentResponse(Long id, String equipmentName, String model, Integer noOfEquipments) {
        this.id = id;
        this.equipmentName = equipmentName;
        this.model = model;
        this.noOfEquipments = noOfEquipments;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
        return "EquipmentResponse{" +
                "id=" + id +
                ", equipmentName='" + equipmentName + '\'' +
                ", model='" + model + '\'' +
                ", noOfEquipments=" + noOfEquipments +
                '}';
    }
}
