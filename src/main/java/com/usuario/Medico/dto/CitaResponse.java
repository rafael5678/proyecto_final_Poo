package com.usuario.Medico.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CitaResponse {
    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private String pacienteDocumento;
    private Long medicoId;
    private String medicoNombre;
    private String medicoEspecialidad;
    private LocalDateTime fechaHora;
    private String estado;
    private String motivo;
    private String notas;
}
