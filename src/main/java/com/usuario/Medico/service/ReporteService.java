package com.usuario.Medico.service;

import com.usuario.Medico.dto.ReporteResponse;
import com.usuario.Medico.model.EstadoCita;
import com.usuario.Medico.repository.CitaRepository;
import com.usuario.Medico.repository.MedicoRepository;
import com.usuario.Medico.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HU-15: Reportes con recursividad en agregarMesRecursivo.
 */
@Service
@RequiredArgsConstructor
public class ReporteService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public ReporteResponse generarReporte(int anio) {
        List<Map<String, Object>> desglose = new ArrayList<>();
        agregarMesRecursivo(anio, 1, desglose);
        return ReporteResponse.builder()
                .totalCitas(citaRepository.count())
                .citasPendientes(citaRepository.countByEstado(EstadoCita.PENDIENTE))
                .citasAceptadas(citaRepository.countByEstado(EstadoCita.ACEPTADA))
                .citasCanceladas(citaRepository.countByEstado(EstadoCita.CANCELADA))
                .totalPacientes(pacienteRepository.count())
                .totalMedicos(medicoRepository.count())
                .desgloseMensual(desglose)
                .build();
    }

    private void agregarMesRecursivo(int anio, int mes, List<Map<String, Object>> acumulado) {
        if (mes > 12) return;
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicio = ym.atDay(1).atStartOfDay();
        LocalDateTime fin = ym.atEndOfMonth().atTime(23, 59, 59);
        long total = citaRepository.countByFechaHoraBetween(inicio, fin);
        Map<String, Object> dato = new HashMap<>();
        dato.put("mes", mes);
        dato.put("nombreMes", obtenerNombreMes(mes));
        dato.put("totalCitas", total);
        acumulado.add(dato);
        agregarMesRecursivo(anio, mes + 1, acumulado);
    }

    private String obtenerNombreMes(int mes) {
        String[] nombres = {"", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        return nombres[mes];
    }
}
