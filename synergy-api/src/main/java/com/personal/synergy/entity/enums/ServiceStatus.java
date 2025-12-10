package com.personal.synergy.entity.enums;

public enum ServiceStatus {
    PENDING,    // waiting for expert
    ACTIVE,     // session ongoing
    COMPLETED,  // session done
    CANCELLED,  // user/expert cancelled
    REFUNDED    // payment refunded
}