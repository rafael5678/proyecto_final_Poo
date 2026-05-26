import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

type PortalType = 'admin' | 'medico' | 'paciente';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  readonly environment = environment;
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  portal: PortalType = 'paciente';
  email = '';
  password = '';
  error = signal('');
  success = signal('');
  loading = signal(false);
  wakingServer = signal(false);

  ngOnInit() {
    if (environment.production) {
      this.wakingServer.set(true);
      fetch(`${environment.apiUrl}/health`)
        .catch(() => {})
        .finally(() => this.wakingServer.set(false));
    }

    const url = this.router.url;
    if (url.includes('admin')) this.portal = 'admin';
    else if (url.includes('medico')) this.portal = 'medico';
    else this.portal = 'paciente';

    if (this.route.snapshot.queryParamMap.get('registrado') === '1') {
      this.success.set('¡Registro exitoso! Inicie sesión con su email y contraseña.');
    }
    if (this.route.snapshot.queryParamMap.get('sesionExpirada') === '1') {
      if (this.portal === 'admin') {
        this.error.set('Sesión cerrada por seguridad: 10 segundos sin actividad.');
      } else if (this.portal === 'medico') {
        this.error.set('Sesión cerrada por seguridad: 7 minutos sin actividad.');
      }
    }
  }

  get title(): string {
    return this.portal === 'admin' ? 'Panel Administrativo'
      : this.portal === 'medico' ? 'Portal Médico' : 'Portal del Paciente';
  }

  get rol(): string {
    return this.portal === 'admin' ? 'ADMIN'
      : this.portal === 'medico' ? 'MEDICO' : 'PACIENTE';
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.login({ email: this.email, password: this.password, rol: this.rol }).pipe(
      timeout(120000)
    ).subscribe({
      next: () => { this.loading.set(false); this.auth.redirectByRole(); },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.mapLoginError(e));
      }
    });
  }

  private mapLoginError(e: unknown): string {
    const err = e as { status?: number; error?: { error?: string }; message?: string };
    if (err?.error?.error) return err.error.error;
    if (err?.status === 0) {
      return 'No se pudo conectar con el servidor. Revise CORS en Render (CORS_ORIGINS con su URL de Vercel) o espere 1 min y reintente.';
    }
    if (err?.status === 401 || err?.status === 403) {
      return 'Credenciales incorrectas o no tiene acceso a este portal (use el rol correcto).';
    }
    if (err?.name === 'TimeoutError' || err?.message?.includes('Timeout')) {
      return 'El servidor tardó demasiado (Render free). Espere 1 minuto, recargue la página e intente de nuevo.';
    }
    return 'Error al iniciar sesión. Pruebe admin@hospy.com / admin123 en Panel Admin.';
  }
}
