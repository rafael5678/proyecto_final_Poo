export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  pacienteDocumento?: string;
  medicoId: number;
  medicoNombre: string;
  medicoEspecialidad?: string;
  fechaHora: string;
  estado: string;
  motivo?: string;
  notas?: string;
}

export interface CitaRequest {
  medicoId: number;
  fechaHora: string;
  motivo?: string;
}
