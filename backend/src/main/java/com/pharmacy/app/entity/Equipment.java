package com.pharmacy.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "equipment")
public class Equipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Equipment name is required")
    @Column(name = "equipment_name", nullable = false, length = 100)
    private String equipmentName;
    
    @NotBlank(message = "Model is required")
    @Column(name = "model", nullable = false, length = 100)
    private String model;
    
    @NotNull(message = "Number of equipments is required")
    @Positive(message = "Number of equipments must be positive")
    @Column(name = "no_of_equipments", nullable = false)
    private Integer noOfEquipments;
    
    // Default constructor
    public Equipment() {}
    
    // Constructor
    public Equipment(String equipmentName, String model, Integer noOfEquipments) {
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
        return "Equipment{" +
                "id=" + id +
                ", equipmentName='" + equipmentName + '\'' +
                ", model='" + model + '\'' +
                ", noOfEquipments=" + noOfEquipments +
                '}';
    }
}
