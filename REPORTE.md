# Sistema de Objetos Perdidos — UAM
### Reporte técnico del proyecto

---

## ¿Qué es este proyecto?

Sistema web para registrar y gestionar objetos perdidos en el campus de la Universidad Americana (UAM), Nicaragua. Tiene dos roles: **Administrador** y **Usuario**.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | C# · ASP.NET Core 8 · Web API |
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite |
| Base de datos | Archivo CSV (`objetos.csv`) |
| Comunicación | HTTP REST · Cookies de sesión |

---

## Estructura del proyecto

```
ObjetosPerdidos.Web/
├── ObjetosPerdidos.API/        ← Backend C#
│   ├── AuthController.cs       Endpoints de login/logout
│   ├── ObjetosController.cs    CRUD de objetos
│   ├── ReportesController.cs   Estadísticas y gráficas
│   ├── ObjetosService.cs       Lógica de negocio + lectura/escritura CSV
│   ├── Modelos.cs              Clase ObjetoPerdido + todos los DTOs
│   ├── Filtros.cs              Control de acceso por sesión/rol
│   ├── Program.cs              Configuración de la app
│   └── objetos.csv             Base de datos (archivo plano)
│
└── ObjetosPerdidos.Client/     ← Frontend React
    └── src/
        ├── components/         Navbar, Sidebar, Layout, AdminRoute, Alert, Badge
        ├── pages/              Todas las pantallas (Login, Dashboard, Objetos, Reportes)
        ├── services/           Llamadas HTTP al backend (api.ts, authService, etc.)
        ├── context.tsx         Estado global de sesión (usuario logueado)
        ├── types.ts            Tipos TypeScript compartidos
        └── App.tsx             Rutas de la aplicación
```

---

## Cómo correr el proyecto

Se necesitan **dos terminales abiertas al mismo tiempo**.

### Terminal 1 — Backend
```bash
cd ObjetosPerdidos.API
dotnet run
```
Corre en: `http://localhost:5000`

### Terminal 2 — Frontend
```bash
cd ObjetosPerdidos.Client
npm install       # solo la primera vez
npm run dev
```
Corre en: `http://localhost:5173`

Abrir el navegador en `http://localhost:5173`.

---

## Credenciales de acceso

| Rol | CIF | Contraseña |
|-----|-----|------------|
| Administrador | `00000000` | `999999` |
| Usuario normal | cualquier 8 dígitos | cualquier 6 dígitos |

---

## Roles y permisos

### Usuario normal
- Ver el inventario de objetos
- Registrar un objeto encontrado
- Buscar objetos por nombre o fecha

### Administrador
- Todo lo anterior
- Editar cualquier objeto
- Marcar objetos como entregados
- Eliminar objetos
- Ver reportes y gráficas estadísticas

---

## Pantallas del frontend

| Ruta | Página | Acceso |
|------|--------|--------|
| `/login` | Inicio de sesión | Público |
| `/inicio` | Panel principal con estadísticas | Todos |
| `/objetos` | Inventario completo | Todos |
| `/objetos/registrar` | Formulario de registro | Todos |
| `/objetos/buscar` | Búsqueda por nombre o fecha | Todos |
| `/objetos/:id/modificar` | Editar objeto | Solo Admin |
| `/objetos/:id/entregar` | Marcar como entregado | Solo Admin |
| `/reportes` | Índice de reportes | Solo Admin |
| `/reportes/general` | Resumen total del sistema | Solo Admin |
| `/reportes/rango` | Objetos por rango de fechas | Solo Admin |
| `/reportes/estados` | Gráfica de estados (pie chart) | Solo Admin |
| `/reportes/lugar` | Objetos por lugar | Solo Admin |
| `/reportes/tendencia` | Registros/entregas por día | Solo Admin |

---

## Endpoints del backend

Todos los endpoints empiezan con `/api`.

### Auth — `/api/auth`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Obtener usuario de la sesión activa |

### Objetos — `/api/objetos` *(requiere sesión)*
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/objetos` | Listar todos | Todos |
| GET | `/api/objetos/{id}` | Obtener uno | Todos |
| POST | `/api/objetos` | Registrar nuevo | Todos |
| GET | `/api/objetos/buscar` | Buscar | Todos |
| PUT | `/api/objetos/{id}` | Modificar | Admin |
| DELETE | `/api/objetos/{id}` | Eliminar | Admin |
| POST | `/api/objetos/{id}/entregar` | Marcar entregado | Admin |

### Reportes — `/api/reportes` *(solo Admin)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/general` | Resumen total |
| GET | `/api/reportes/rango` | Por rango de fechas |
| GET | `/api/reportes/estados` | Conteo por estado |
| GET | `/api/reportes/lugar` | Conteo por lugar |
| GET | `/api/reportes/tendencia` | Registros/entregas por día |

---

## Base de datos (CSV)

El archivo `ObjetosPerdidos.API/objetos.csv` guarda todos los objetos. Cada línea es un objeto con este formato:

```
Nombre, Descripcion, Lugar, FechaRegistro, FechaEntrega, Estado, Id
```

Ejemplo:
```
Mochila,Verde,C-201,2026-01-16,2026-05-20,Entregado,1
Calculadora,Cientifica,Biblioteca,2026-05-05,,Disponible,2
```

- `FechaEntrega` puede estar vacío si el objeto no ha sido entregado.
- `Estado` es `Disponible` o `Entregado`.
- El archivo se actualiza automáticamente cada vez que se registra, modifica o elimina un objeto desde la web.

---

## Cómo funciona la sesión

1. El usuario ingresa su CIF y contraseña en `/login`.
2. El backend valida las credenciales y guarda el CIF y Rol en una **cookie de sesión**.
3. Cada petición al backend incluye esa cookie automáticamente.
4. Si la cookie expira o no existe, el backend devuelve `401` y el frontend redirige a `/login`.
5. La sesión dura 30 minutos de inactividad.

---

## Cómo funciona el proxy de Vite

El frontend (puerto 5173) redirige todas las peticiones `/api/...` al backend (puerto 5000) automáticamente. Esto evita problemas de CORS y hace que las cookies funcionen correctamente.

Configurado en `ObjetosPerdidos.Client/vite.config.ts`.
