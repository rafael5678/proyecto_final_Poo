package com.usuario.Medico;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/** Crea las 6 tablas del sistema en Render PostgreSQL */
public class DbSetup {

    private static final String URL =
            "jdbc:postgresql://dpg-d89nak5ckfvc738qg0v0-a.oregon-postgres.render.com:5432/medico_db_868n";
    private static final String USER = "medico_user";
    private static final String PASS = "3hIMVjtLUa6SXgOZvpgUfXElqY5TtCZp";

    public static void main(String[] args) throws Exception {
        System.out.println("Conectando a Render...");
        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             Statement st = conn.createStatement()) {

            st.execute("""
                CREATE TABLE IF NOT EXISTS usuarios (
                    id BIGSERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
                    rol VARCHAR(255) NOT NULL, telefono VARCHAR(255), activo BOOLEAN DEFAULT TRUE)
                """);
            st.execute("""
                CREATE TABLE IF NOT EXISTS pacientes (
                    id BIGSERIAL PRIMARY KEY, usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
                    documento VARCHAR(255), fecha_nacimiento DATE)
                """);
            st.execute("""
                CREATE TABLE IF NOT EXISTS medicos (
                    id BIGSERIAL PRIMARY KEY, usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
                    especialidad VARCHAR(255) NOT NULL, numero_licencia VARCHAR(255))
                """);
            st.execute("""
                CREATE TABLE IF NOT EXISTS administradores (
                    id BIGSERIAL PRIMARY KEY, usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
                    cargo VARCHAR(255))
                """);
            st.execute("""
                CREATE TABLE IF NOT EXISTS horarios (
                    id BIGSERIAL PRIMARY KEY, medico_id BIGINT NOT NULL REFERENCES medicos(id),
                    dia_semana INTEGER NOT NULL, hora_inicio TIME NOT NULL,
                    hora_fin TIME NOT NULL, disponible BOOLEAN DEFAULT TRUE)
                """);
            st.execute("""
                CREATE TABLE IF NOT EXISTS citas (
                    id BIGSERIAL PRIMARY KEY, paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
                    medico_id BIGINT NOT NULL REFERENCES medicos(id),
                    fecha_hora TIMESTAMP NOT NULL, estado VARCHAR(255) NOT NULL,
                    motivo VARCHAR(255), notas VARCHAR(255))
                """);

            System.out.println("\nTablas:");
            try (ResultSet rs = st.executeQuery(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1")) {
                while (rs.next()) System.out.println("  - " + rs.getString(1));
            }
            System.out.println("\nListo. Refresca pgAdmin.");
        }
    }
}
