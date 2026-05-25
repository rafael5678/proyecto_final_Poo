package com.usuario.Medico.service;

import com.usuario.Medico.dto.CitaResponse;
import com.usuario.Medico.model.Cita;

public final class CitaMapper {

    private CitaMapper() {}

    public static CitaResponse toDto(Cita c) {
        return CitaResponse.builder()
                .id(c.getId())
                .pacienteId(c.getPaciente().getId())
                .pacienteNombre(c.getPaciente().getUsuario().getNombre())
                .pacienteDocumento(c.getPaciente().getDocumento())
                .medicoId(c.getMedico().getId())
                .medicoNombre(c.getMedico().getUsuario().getNombre())
                .medicoEspecialidad(c.getMedico().getEspecialidad())
                .fechaHora(c.getFechaHora())
                .estado(c.getEstado().name())
                .motivo(c.getMotivo())
                .notas(c.getNotas())
                .build();
    }
}
