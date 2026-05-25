import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { Cita } from '../../models/cita.model';
import { Usuario } from '../../models/usuario.model';
import { Horario } from '../../models/horario.model';
import { PacienteDashboard, PacientePerfil } from '../../models/paciente-perfil.model';
import { PortalSidebarComponent, SidebarItem } from '../portal-sidebar/portal-sidebar.component';

type PacienteTab = 'inicio' | 'agendar' | 'historial' | 'proximas' | 'medicos' | 'perfil';
type PacienteSub = '' | 'agendar' | 'historial' | 'proximas' | 'directorio' | 'editar';

@Component({
  selector: 'app-paciente-portal',
  standalone: true,
  imports: [FormsModule, DatePipe, PortalSidebarComponent],
  templateUrl: './paciente-portal.component.html',
  styleUrl: './paciente-portal.component.css'
})
export class PacientePortalComponent implements OnInit {
  auth = inject(AuthService);
  private svc = inject(PacienteService);

  tab = signal<PacienteTab>('inicio');
  sub = signal<PacienteSub>('');
  expandedMenus = signal<string[]>(['citas', 'medicos']);

  readonly menuItems: SidebarItem[] = [
    { id: 'inicio', label: 'Inicio', icon: '🏠', tab: 'inicio' },
    {
      id: 'citas',
      label: 'Mis citas',
      icon: '📅',
      children: [
        { id: 'c-agendar', label: 'Agendar cita', tab: 'agendar', sub: 'agendar' },
        { id: 'c-hist', label: 'Historial', tab: 'historial', sub: 'historial' },
        { id: 'c-prox', label: 'Próximas citas', tab: 'proximas', sub: 'proximas' }
      ]
    },
    {
      id: 'medicos',
      label: 'Médicos',
      icon: '🩺',
      children: [
        { id: 'm-dir', label: 'Directorio médicos', tab: 'medicos', sub: 'directorio' }
      ]
    },
    {
      id: 'perfil',
      label: 'Mi perfil',
      icon: '👤',
      children: [
        { id: 'p-edit', label: 'Editar perfil', tab: 'perfil', sub: 'editar' }
      ]
    }
  ];

  dashboard = signal<PacienteDashboard | null>(null);
  perfil = signal<PacientePerfil | null>(null);
  medicos = signal<Usuario[]>([]);
  medicoDetalle = signal<Usuario | null>(null);
  horarios = signal<Horario[]>([]);
  citas = signal<Cita[]>([]);
  proximas = signal<Cita[]>([]);

  medicoId: number | null = null;
  fechaHora = '';
  motivo = '';
  filtroEspecialidad = '';
  error = signal('');
  ok = signal('');
  loading = signal(false);
  guardandoPerfil = signal(false);

  ngOnInit() {
    this.cargarInicio();
    this.cargarMedicos();
    this.cargarHistorial();
  }

  onNavigate(item: SidebarItem) {
    if (!item.tab) return;
    this.tab.set(item.tab as PacienteTab);
    this.sub.set((item.sub ?? '') as PacienteSub);
    this.error.set('');
    this.ok.set('');
    if (item.tab === 'perfil') this.cargarPerfil();
    if (item.tab === 'proximas') this.svc.proximas().subscribe({ next: c => this.proximas.set(c) });
    const group = this.menuItems.find(m => m.children?.some(c => c.id === item.id));
    if (group && !this.expandedMenus().includes(group.id)) {
      this.expandedMenus.set([...this.expandedMenus(), group.id]);
    }
  }

  onToggleGroup(id: string) {
    const list = this.expandedMenus();
    if (list.includes(id)) {
      this.expandedMenus.set(list.filter(x => x !== id));
    } else {
      this.expandedMenus.set([...list, id]);
    }
  }

  pageTitle(): string {
    const map: Record<string, string> = {
      inicio: 'Panel del paciente',
      agendar: 'Agendar cita médica',
      historial: 'Historial de citas',
      proximas: 'Próximas citas',
      'medicos-directorio': 'Directorio de médicos',
      'perfil-editar': 'Mi perfil'
    };
    const key = this.sub() ? `${this.tab()}-${this.sub()}` : this.tab();
    return map[key] ?? map[this.tab()] ?? 'Portal del paciente';
  }

  cargarInicio() {
    this.svc.dashboard().subscribe({ next: d => this.dashboard.set(d) });
    this.svc.proximas().subscribe({ next: c => this.proximas.set(c) });
  }

  cargarPerfil() {
    this.svc.perfil().subscribe({ next: p => this.perfil.set({ ...p }) });
  }

  cargarMedicos() {
    this.svc.listarMedicos().subscribe({ next: m => this.medicos.set(m) });
  }

  medicosFiltrados(): Usuario[] {
    const f = this.filtroEspecialidad.toLowerCase();
    if (!f) return this.medicos();
    return this.medicos().filter(m => m.especialidad?.toLowerCase().includes(f));
  }

  verMedico(m: Usuario) {
    this.medicoDetalle.set(m);
    this.tab.set('medicos');
    this.sub.set('directorio');
    this.svc.horariosMedico(m.id).subscribe({ next: h => this.horarios.set(h) });
  }

  onMedicoChange() {
    if (!this.medicoId) return;
    this.svc.horariosMedico(this.medicoId).subscribe({ next: h => this.horarios.set(h) });
  }

  cargarHistorial() {
    this.svc.historial().subscribe({ next: c => this.citas.set(c) });
  }

  agendar() {
    if (!this.medicoId || !this.fechaHora) {
      this.error.set('Selecciona médico y fecha/hora');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.svc.agendarCita({
      medicoId: this.medicoId,
      fechaHora: new Date(this.fechaHora).toISOString().slice(0, 19),
      motivo: this.motivo
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.ok.set('Cita agendada correctamente');
        this.fechaHora = '';
        this.motivo = '';
        this.cargarInicio();
        this.cargarHistorial();
        this.tab.set('historial');
        this.sub.set('historial');
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.error ?? 'Error al agendar');
      }
    });
  }

  guardarPerfil() {
    const p = this.perfil();
    if (!p) return;
    this.guardandoPerfil.set(true);
    this.svc.actualizarPerfil(p).subscribe({
      next: (res) => {
        this.perfil.set(res);
        this.guardandoPerfil.set(false);
        this.ok.set('Perfil actualizado');
      },
      error: (e) => {
        this.guardandoPerfil.set(false);
        this.error.set(e.error?.error ?? 'Error al guardar');
      }
    });
  }

  cancelar(id: number) {
    if (!confirm('¿Cancelar esta cita?')) return;
    this.svc.cancelarCita(id).subscribe({
      next: () => { this.cargarHistorial(); this.cargarInicio(); },
      error: (e) => this.error.set(e.error?.error ?? 'Error')
    });
  }

  irAgendarConMedico(m: Usuario) {
    this.medicoId = m.id;
    this.medicoDetalle.set(null);
    this.tab.set('agendar');
    this.sub.set('agendar');
    this.onMedicoChange();
  }

  badgeClass(estado: string): string {
    return 'badge badge-' + estado.toLowerCase();
  }
}
