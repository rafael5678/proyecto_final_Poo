export interface Usuario {
  id: number;
  usuarioId?: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  documento?: string;
  especialidad?: string;
  consultorio?: string;
  anosExperiencia?: number;
  biografia?: string;
  activo?: boolean;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  telefono?: string;
  documento?: string;
  especialidad?: string;
  activo?: boolean;
}
