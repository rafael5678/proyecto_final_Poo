package com.usuario.Medico.repository;

import com.usuario.Medico.model.Medico;
import com.usuario.Medico.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicoRepository extends JpaRepository<Medico, Long> {
    Optional<Medico> findByUsuario(Usuario usuario);
    Optional<Medico> findByUsuarioId(Long usuarioId);
    Optional<Medico> findByUsuario_Email(String email);
    List<Medico> findByUsuario_ActivoTrue();
}
