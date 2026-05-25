package com.usuario.Medico.repository;

import com.usuario.Medico.model.Cita;
import com.usuario.Medico.model.EstadoCita;
import com.usuario.Medico.model.Medico;
import com.usuario.Medico.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPacienteOrderByFechaHoraDesc(Paciente paciente);
    List<Cita> findByMedicoOrderByFechaHoraAsc(Medico medico);
    List<Cita> findAllByOrderByFechaHoraDesc();

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.estado = :estado")
    long countByEstado(@Param("estado") EstadoCita estado);

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.fechaHora BETWEEN :inicio AND :fin")
    long countByFechaHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    boolean existsByMedicoAndFechaHoraAndEstadoIn(Medico medico, LocalDateTime fechaHora, List<EstadoCita> estados);
}
