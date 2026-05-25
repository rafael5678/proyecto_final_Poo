/** Tiempos de inactividad antes de cerrar sesión (estilo banca / empresa) */
export const INACTIVITY_TIMEOUT_MS = {
  /** Portal médico: 7 minutos sin interacción */
  MEDICO: 7 * 60 * 1000,
  /** Panel admin: 10 segundos sin interacción (máxima seguridad) */
  ADMIN: 10 * 1000
} as const;
