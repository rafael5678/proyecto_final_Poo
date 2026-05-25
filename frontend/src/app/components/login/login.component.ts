import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type PortalType = 'admin' | 'medico' | 'paciente';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  portal: PortalType = 'paciente';
  email = '';
  password = '';
  error = signal('');
  success = signal('');
  loading = signal(false);

  ngOnInit() {
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
    this.auth.login({ email: this.email, password: this.password, rol: this.rol }).subscribe({
      next: () => { this.loading.set(false); this.auth.redirectByRole(); },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.error ?? 'Error al iniciar sesión');
      }
    });
  }
}
