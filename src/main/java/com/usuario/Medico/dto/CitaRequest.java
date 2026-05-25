package com.usuario.Medico.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CitaRequest {
    @NotNull
    private Long medicoId;
    @NotNull
    private LocalDateTime fechaHora;
    private String motivo;
}
