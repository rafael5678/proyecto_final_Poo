package com.usuario.Medico.service;

import com.usuario.Medico.dto.CitaRequest;
import com.usuario.Medico.dto.CitaResponse;
import com.usuario.Medico.dto.PacientePerfilDTO;
import com.usuario.Medico.model.*;
import com.usuario.Medico.repository.CitaRepository;
import com.usuario.Medico.repository.MedicoRepository;
import com.usuario.Medico.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteService pacienteService;

    public CitaResponse agendar(String emailPaciente, CitaRequest req) {
        Paciente paciente = pacienteRepository.findByUsuario_Email(emailPaciente)
                .orElseThrow(() -> new RuntimeException("Perfil de paciente no encontrado"));
        Medico medico = medicoRepository.findById(req.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));
        var ocupados = List.of(EstadoCita.PENDIENTE, EstadoCita.ACEPTADA);
        if (citaRepository.existsByMedicoAndFechaHoraAndEstadoIn(medico, req.getFechaHora(), ocupados)) {
            throw new RuntimeException("El horario ya está ocupado");
        }
        Cita cita = Cita.builder()
                .paciente(paciente)
                .medico(medico)
                .fechaHora(req.getFechaHora())
                .motivo(req.getMotivo())
                .estado(EstadoCita.PENDIENTE)
                .build();
        return CitaMapper.toDto(citaRepository.save(cita));
    }

    public List<CitaResponse> historialPaciente(String email) {
        Paciente paciente = pacienteRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return citaRepository.findByPacienteOrderByFechaHoraDesc(paciente)
                .stream().map(CitaMapper::toDto).toList();
    }

    public List<CitaResponse> proximasCitas(String email) {
        Paciente paciente = pacienteRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return citaRepository.findByPacienteOrderByFechaHoraDesc(paciente).stream()
                .filter(c -> c.getFechaHora().isAfter(java.time.LocalDateTime.now()))
                .filter(c -> c.getEstado() == EstadoCita.PENDIENTE || c.getEstado() == EstadoCita.ACEPTADA)
                .map(CitaMapper::toDto).toList();
    }

    public List<CitaResponse> citasMedico(String email) {
        Medico medico = medicoRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));
        return citaRepository.findByMedicoOrderByFechaHoraAsc(medico)
                .stream().map(CitaMapper::toDto).toList();
    }

    public List<CitaResponse> todasLasCitas() {
        return citaRepository.findAllByOrderByFechaHoraDesc()
                .stream().map(CitaMapper::toDto).toList();
    }

    public CitaResponse cancelar(Long id, String emailPaciente) {
        Cita cita = buscar(id);
        if (!cita.getPaciente().getUsuario().getEmail().equals(emailPaciente)) {
            throw new RuntimeException("No autorizado");
        }
        if (cita.getEstado() == EstadoCita.CANCELADA || cita.getEstado() == EstadoCita.COMPLETADA) {
            throw new RuntimeException("La cita no puede cancelarse");
        }
        cita.setEstado(EstadoCita.CANCELADA);
        return CitaMapper.toDto(citaRepository.save(cita));
    }

    public CitaResponse aceptar(Long id, String emailMedico) {
        Cita cita = buscar(id);
        validarMedico(cita, emailMedico);
        cita.setEstado(EstadoCita.ACEPTADA);
        return CitaMapper.toDto(citaRepository.save(cita));
    }

    public CitaResponse rechazar(Long id, String emailMedico) {
        Cita cita = buscar(id);
        validarMedico(cita, emailMedico);
        cita.setEstado(EstadoCita.RECHAZADA);
        return CitaMapper.toDto(citaRepository.save(cita));
    }

    public PacientePerfilDTO pacienteDeCita(Long citaId, String emailMedico) {
        Cita cita = buscar(citaId);
        validarMedico(cita, emailMedico);
        return pacienteService.toPerfilDto(cita.getPaciente());
    }

    private void validarMedico(Cita cita, String emailMedico) {
        if (!cita.getMedico().getUsuario().getEmail().equals(emailMedico)) {
            throw new RuntimeException("No autorizado");
        }
    }

    private Cita buscar(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }
}
