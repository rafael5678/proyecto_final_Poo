# Despliegue — Sistema Hospy

Backend en **Render** (Docker) · Frontend en **Vercel** · Base de datos **PostgreSQL en Render**

---

## Resumen rápido

| Plataforma | Qué despliegas | URL ejemplo |
|------------|----------------|-------------|
| Render | API Spring Boot (`Dockerfile`) | `https://hospy-api.onrender.com` |
| Render | PostgreSQL | (interna / externa) |
| Vercel | Angular (`frontend/`) | `https://tu-app.vercel.app` |

---

## 1. Base de datos PostgreSQL (Render)

Si ya tienes la BD en Render, anota:

- **Host externo** (desde tu PC o Postman)
- **Host interno** (desde el Web Service en la misma cuenta Render — recomendado en producción)
- Usuario, contraseña, nombre de BD

URL JDBC típica (externa, con SSL):

```text
jdbc:postgresql://dpg-XXXX.oregon-postgres.render.com:5432/medico_db_868n?sslmode=require
```

---

## 2. Backend en Render (Docker)

### Opción A — Blueprint (`render.yaml`)

1. Sube el repo a **GitHub**.
2. En Render: **New** → **Blueprint** → conecta el repo.
3. Completa las variables marcadas `sync: false` (BD y CORS).

### Opción B — Manual

1. **New** → **Web Service** → conecta el repositorio.
2. **Runtime:** Docker  
3. **Dockerfile path:** `./Dockerfile`  
4. **Root directory:** (raíz del repo, donde está `pom.xml`)
5. **Health Check Path:** `/api/health`

### Variables de entorno (Render → Environment)

Copia desde `.env.example`:

| Variable | Obligatorio | Ejemplo |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Sí | `prod` |
| `SPRING_DATASOURCE_URL` | Sí | `jdbc:postgresql://...?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Sí | `medico_user` |
| `SPRING_DATASOURCE_PASSWORD` | Sí | (password de Render) |
| `JWT_SECRET` | Sí | Clave aleatoria **≥ 32 caracteres** |
| `JWT_EXPIRATION` | No | `86400000` |
| `CORS_ORIGINS` | Sí | `https://tu-app.vercel.app` |

`PORT` lo asigna Render automáticamente; no hace falta definirlo.

**CORS:** cuando tengas la URL de Vercel, actualiza `CORS_ORIGINS` y redeploy del backend.

### Probar el backend

```text
GET https://TU-SERVICIO.onrender.com/api/health
```

Respuesta esperada: `{"status":"ok",...}`

Login admin:

```http
POST https://TU-SERVICIO.onrender.com/api/auth/login
Content-Type: application/json

{"email":"admin@hospy.com","password":"admin123","rol":"ADMIN"}
```

> El plan free de Render puede tardar ~1 min en “despertar” el servicio.

### Probar Docker en local (opcional)

```powershell
cd "ruta\al\proyecto\Medico"
docker build -t hospy-api .
docker run -p 8080:8080 `
  -e SPRING_PROFILES_ACTIVE=prod `
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://..." `
  -e SPRING_DATASOURCE_USERNAME=medico_user `
  -e SPRING_DATASOURCE_PASSWORD=tu_pass `
  -e JWT_SECRET=ClaveSecretaJWTMinimo32CaracteresLarga `
  -e CORS_ORIGINS=http://localhost:4200 `
  hospy-api
```

---

## 3. Frontend en Vercel

1. **New Project** → importa el mismo repo de GitHub.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Angular (detecta `vercel.json`)
4. **Build Command:** `npm run build` (ya ejecuta `set-api-url.mjs`)
5. **Output Directory:** `dist/frontend/browser`

### Variable de entorno en Vercel

| Variable | Entorno | Valor |
|----------|---------|-------|
| `API_URL` | Production (y Preview si quieres) | `https://TU-SERVICIO.onrender.com/api` |

Sin barra final. Debe incluir `/api`.

6. **Deploy**.

La URL será algo como `https://sistema-hospy.vercel.app`.

---

## 4. Enlazar frontend y backend

1. Copia la URL de Vercel (sin `/` al final).
2. En Render, edita `CORS_ORIGINS`:

```text
https://tu-proyecto.vercel.app,http://localhost:4200
```

3. **Save** → Render redeploy automático.
4. En Vercel confirma que `API_URL` apunta a `https://tu-api.onrender.com/api`.
5. Si cambiaste `API_URL`, haz **Redeploy** en Vercel.

---

## 5. Orden recomendado (primera vez)

1. PostgreSQL en Render (si no existe).
2. Web Service Docker + variables de BD y JWT.
3. Probar `/api/health` y login admin.
4. Vercel con `API_URL` apuntando al backend.
5. Actualizar `CORS_ORIGINS` con la URL de Vercel.
6. Probar login desde la web desplegada.

---

## 6. Archivos del proyecto

| Archivo | Uso |
|---------|-----|
| `Dockerfile` | Imagen multi-stage Java 17 |
| `.dockerignore` | Excluye `frontend/`, `target/`, secretos |
| `render.yaml` | Blueprint opcional Render |
| `.env.example` | Plantilla variables backend |
| `frontend/.env.example` | Plantilla `API_URL` |
| `frontend/scripts/set-api-url.mjs` | Inyecta API en build Vercel |
| `frontend/vercel.json` | SPA + rutas Angular |

---

## 7. Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| CORS error en el navegador | `CORS_ORIGINS` debe incluir exactamente la URL de Vercel (`https://...`) |
| 401 en todas las rutas | Token expirado o login con `rol` incorrecto |
| BD connection refused | Usa URL **interna** en Render; externa con `?sslmode=require` |
| Frontend llama a localhost | Falta `API_URL` en Vercel o redeploy sin rebuild |
| Render muy lento al inicio | Plan free — primera petición tras inactividad |
| Build Docker falla | Revisa que `mvnw` y `pom.xml` estén en la raíz del repo |

---

## 8. Seguridad

- No subas `application-local.properties` ni `.env` con passwords (están en `.gitignore`).
- Genera `JWT_SECRET` único para producción.
- Cambia la contraseña del admin por defecto después del primer despliegue si es entorno real.
