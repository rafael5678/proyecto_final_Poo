# Postman — Bearer token, crear, editar y eliminar

## Paso 0: Importar

1. `Sistema-Hospy.postman_collection.json`
2. `Sistema-Hospy.postman_environment.json`
3. Arriba a la derecha: entorno **Sistema Hospy - Local**

---

## Paso 1: Guardar tu token (el del login 200 OK)

Tu respuesta fue algo así:

```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "tipo": "Bearer",
  "id": 1,
  "nombre": "Administrador",
  "email": "admin@hospy.com",
  "rol": "ADMIN"
}
```

### Opción A — Automático (recomendado)

Ejecuta **01 - Auth** → **① Login Admin → guarda token**. El script guarda el token solo.

### Opción B — Manual

1. Clic en el entorno **Sistema Hospy - Local** (ojo arriba a la derecha).
2. Variable **`token`** → en **Current value** pega **solo** el texto del campo `token` (sin comillas).
3. **Save**.

> No subas el token a GitHub. Solo vive en Postman.

---

## Paso 2: Dónde poner el Bearer (en TODOS los requests de Admin)

Cada request de la carpeta **02 - Admin** ya trae el header. Si creas uno manual:

### Forma 1 — Pestaña Authorization (más fácil)

| Campo | Valor |
|-------|--------|
| Type | **Bearer Token** |
| Token | `{{token}}` |

Postman arma solo: `Authorization: Bearer eyJhbGci...`

### Forma 2 — Pestaña Headers

| Key | Value |
|-----|--------|
| Authorization | `Bearer {{token}}` |
| Content-Type | `application/json` *(solo POST y PUT)* |

**Importante:** la palabra `Bearer`, un espacio, y luego el token (o `{{token}}`).

---

## Paso 3: Orden para administradores (NUEVOS, no editar el del sistema)

| # | Request en Postman | Qué hace |
|---|-------------------|----------|
| 1 | **Administradores → 1. Listar usuarios** | Ver `usuarioId` de cada uno |
| 2 | **Administradores → 2. Crear Administrador NUEVO** | Crea otro admin (otro email) |
| 3 | **Administradores → 3. Editar Administrador** | PUT con `{{usuarioId}}` del paso 2 |
| 4 | **Administradores → 4. Eliminar Administrador** | DELETE desactiva ese usuario |

**No edites** `usuarioId = 1` (`admin@hospy.com`) si quieres dejar el admin principal del curso.

### Body crear admin nuevo

`POST {{baseUrl}}/admin/usuarios`

```json
{
  "nombre": "María García",
  "email": "maria.admin@hospy.com",
  "password": "Admin123",
  "rol": "ADMIN",
  "telefono": "3001110001",
  "cargo": "Coordinadora",
  "departamento": "Sistemas"
}
```

### Body editar admin

`PUT {{baseUrl}}/admin/usuarios/{{usuarioId}}`

```json
{
  "nombre": "María García Actualizada",
  "email": "maria.admin@hospy.com",
  "rol": "ADMIN",
  "telefono": "3001110099",
  "cargo": "Jefa de sistemas",
  "departamento": "TI",
  "activo": true
}
```

### Eliminar admin

`DELETE {{baseUrl}}/admin/usuarios/{{usuarioId}}`

---

## Paso 4: Orden para médicos (NUEVOS)

| # | Request | Qué hace |
|---|---------|----------|
| 1 | **Médicos → 1. Listar médicos** | Ver `id` y `usuarioId` |
| 2 | **Médicos → 2. Crear Médico NUEVO** | Otro email (no doctor@hospy.com) |
| 3 | **Médicos → 3. Editar Médico** | PUT con `{{medicoId}}` |
| 4 | **Médicos → 4. Eliminar Médico** | DELETE con `{{usuarioId}}` |

### IDs (muy importante)

| Acción | Variable | De dónde sale |
|--------|----------|----------------|
| Editar médico | `medicoId` | Campo **`id`** en listar médicos |
| Eliminar médico | `usuarioId` | Campo **`usuarioId`** en listar médicos |

### Body crear médico

`POST {{baseUrl}}/admin/medicos`

```json
{
  "nombre": "Dr. Pedro Ruiz",
  "email": "pedro@hospy.com",
  "password": "Medico123",
  "rol": "MEDICO",
  "telefono": "3005554433",
  "especialidad": "Pediatría",
  "numeroLicencia": "MED-002",
  "consultorio": "Piso 2 - 205",
  "anosExperiencia": 8
}
```

### Body editar médico

`PUT {{baseUrl}}/admin/medicos/{{medicoId}}`

```json
{
  "nombre": "Dr. Pedro Ruiz Actualizado",
  "email": "pedro@hospy.com",
  "rol": "MEDICO",
  "telefono": "3005559999",
  "especialidad": "Pediatría",
  "consultorio": "Piso 3 - 301",
  "anosExperiencia": 9,
  "activo": true
}
```

### Eliminar médico

`DELETE {{baseUrl}}/admin/usuarios/{{usuarioId}}`

---

## Variables del entorno

| Variable | Uso |
|----------|-----|
| `token` | JWT del admin logueado |
| `usuarioId` | Editar/eliminar admin o eliminar médico |
| `medicoId` | Editar médico |
| `baseUrl` | `http://localhost:8080/api` |

Después de **Listar**, cambia `usuarioId` y `medicoId` en el entorno con los valores del usuario **nuevo** que creaste.

---

## Errores comunes

| Error | Solución |
|-------|----------|
| 401 | Token vacío o expirado → Login Admin otra vez |
| 403 | Token no es de ADMIN |
| Email ya existe | Cambia el email en el body |
| Usuario no encontrado | Revisa `usuarioId` / `medicoId` del listado |

---

## Resumen visual

```
Login Admin → token guardado en {{token}}
       ↓
Todas las peticiones 02 - Admin:
   Authorization: Bearer {{token}}
       ↓
Crear → Listar (copiar ids) → Editar → Eliminar
```
