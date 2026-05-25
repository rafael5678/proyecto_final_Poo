# Sistema Hospy — Plataforma Hospitalaria

Backend Spring Boot + PostgreSQL (Render) | Frontend Angular (Vercel)

## Requisitos

- Java 17+
- Node.js 20+
- PostgreSQL en Render (ya configurado)

## Configuración local del backend

1. Copia `src/main/resources/application-local.properties.example` a `application-local.properties`
2. Pega tus credenciales de Render (URL **externa** con puerto `5432`):

```properties
spring.datasource.url=jdbc:postgresql://dpg-XXXX.oregon-postgres.render.com:5432/medico_db_868n
spring.datasource.username=medico_user
spring.datasource.password=TU_PASSWORD
jwt.secret=ClaveSecretaJWTMinimo32CaracteresLarga
app.cors.allowed-origins=http://localhost:4200
```

3. Ejecuta:

```bash
./mvnw spring-boot:run
```

API: `http://localhost:8080/api/health`

**Admin por defecto:** `admin@hospy.com` / `admin123`

## Frontend local

```bash
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`

Edita `frontend/src/environments/environment.ts` si el backend usa otro puerto.

## Postman — ejemplos

| Método | URL | Body |
|--------|-----|------|
| POST | `/api/auth/login` | `{"email":"admin@hospy.com","password":"admin123","rol":"ADMIN"}` |
| POST | `/api/auth/register` | `{"nombre":"Juan","email":"juan@test.com","password":"123456","documento":"123"}` |
| POST | `/api/admin/medicos` | Header `Authorization: Bearer TOKEN` + médico |
| GET | `/api/admin/reportes?anio=2026` | Header Bearer (admin) |

## Despliegue (Render + Vercel)

Guía paso a paso: **[DEPLOY.md](./DEPLOY.md)**

### Backend → Render (Docker)

- `Dockerfile` en la raíz del repo
- Web Service → Runtime: **Docker** → Health: `/api/health`
- Variables: ver `.env.example` (`SPRING_DATASOURCE_*`, `JWT_SECRET`, `CORS_ORIGINS`, `SPRING_PROFILES_ACTIVE=prod`)
- Opcional: despliegue con **Blueprint** usando `render.yaml`

### Frontend → Vercel

- **Root directory:** `frontend`
- **Variable de entorno:** `API_URL=https://tu-api.onrender.com/api`
- El build genera `environment.prod.ts` automáticamente (`scripts/set-api-url.mjs`)

## Historias de usuario implementadas

- HU-01 a HU-15 (registro, citas, médico, admin, reportes)
- JWT + BCrypt (HN-01)
- Recursividad en reportes mensuales (`ReporteService.agregarMesRecursivo`)
- Diseño responsive (HN-04)
