# 🏢 Park Access Control — Sistema de Control de Acceso

Sistema de control de acceso vehicular y peatonal para parques industriales (Prologis / Martel), con integración a terminales Hikvision, lectura de placas (LPR), generación de QR y notificaciones en tiempo real vía WebSocket.

---

## 📁 Estructura del Proyecto

```
park-acces-control/
├── public/                     # Frontend estático (HTML/CSS/JS)
│   ├── index.html              # Pantalla de inicio + login/registro
│   ├── visitor_request.html    # Formulario de registro de visitantes
│   ├── resident_generator.html # Panel del residente/admin
│   ├── check_status.html       # Consulta de estado de solicitud o token
│   ├── qr_display.html         # Vista del QR generado (imprimible/compartible)
│   ├── api-config.js           # Configuración dinámica del backend URL
│   ├── sw.js                   # Service Worker (PWA offline)
│   └── manifest.json           # Manifiesto PWA
│
├── src/
│   ├── controllers/
│   │   ├── accessController.js # Lógica de pases, LPR, aprobación, historial
│   │   └── authController.js   # Login y registro de usuarios
│   ├── middleware/
│   │   ├── auth.js             # Verificación JWT para rutas protegidas
│   │   └── cameraAuth.js       # Autenticación por clave para cámaras/LPR
│   ├── models/
│   │   ├── AccessToken.js      # Modelo de pase de acceso (QR/token)
│   │   ├── PendingRequest.js   # Modelo de solicitud pendiente de visitante
│   │   ├── AccessLog.js        # Registro de eventos de acceso
│   │   └── user.js             # Modelo de usuarios (residentes/admin)
│   ├── routes/
│   │   ├── accessRoutes.js     # Rutas REST de acceso
│   │   └── authRoutes.js       # Rutas de autenticación
│   └── config/
│       └── db.js               # Configuración de conexión MongoDB
│
├── tests/
│   └── access.test.js          # Tests de integración (Jest + Supertest)
│
├── server.js                   # Punto de entrada: Express + Socket.IO
├── package.json
├── .env                        # Variables de entorno (NO commitear)
├── netlify.toml                # Configuración de despliegue en Netlify
├── capacitor.config.json       # Configuración para app móvil (Capacitor)
├── INICIAR.bat                 # Script Windows: iniciar servidor
└── INSTALAR.bat                # Script Windows: instalar dependencias
```

---

## ⚙️ Requisitos

- **Node.js** 20.x
- **MongoDB** (local o Atlas)
- **npm** 8+

---

## 🚀 Instalación y Arranque

### Windows (scripts .bat incluidos)

```bat
:: 1. Instalar dependencias
INSTALAR.bat

:: 2. Iniciar el servidor
INICIAR.bat
```

> `INSTALAR.bat` verifica que Node.js esté instalado y ejecuta `npm install --production`.
> `INICIAR.bat` instala dependencias si faltan y lanza el servidor en el puerto 3000.

### Manual (cualquier sistema)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env (ver sección Variables de Entorno)
cp .env.example .env

# 3. Iniciar
npm start
```

La aplicación queda disponible en **http://localhost:3000**

---

## 🔑 Variables de Entorno (`.env`)

```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/martel_db

# Autenticación JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_TTL=8h

# Credenciales de acceso por defecto (admin hardcoded, para desarrollo)
ADMIN_USER=admin
ADMIN_PASS=password

# Puerto del servidor
PORT=3000

# CORS: dominio(s) del frontend (separados por coma; usa * para desarrollo)
CORS_ORIGIN=*

# Clave de autenticación para cámaras/terminales LPR
CAMERA_KEY=dev_camera_key
```

> En producción reemplaza todos los valores por defecto con datos seguros.

---

## 🔐 Credenciales por Defecto (Desarrollo)

| Campo      | Valor      |
|------------|------------|
| Usuario    | `admin`    |
| Contraseña | `password` |
| Rol        | Admin      |

Puedes crear usuarios adicionales desde la pantalla de inicio → **"¿No tienes cuenta? Regístrate aquí"**.

---

## 🌐 Flujo del Sistema

```
Visitante llena formulario (visitor_request.html)
        ↓
POST /api/access/request  →  PendingRequest en MongoDB
        ↓ (WebSocket notifica al residente)
Residente aprueba en su panel (resident_generator.html)
        ↓
POST /api/access/approve/:id  →  AccessToken creado + registro en Hikvision
        ↓
QR con el token se envía al visitante vía Socket.IO
        ↓
Visitante muestra QR en la entrada
        ↓
Terminal Hikvision escanea QR → POST /event-qr
  ó  Cámara LPR lee placa    → POST /event-lpr
        ↓
ejecutarBaja() marca el pase como "used"
```

---

## 📡 API REST

### Autenticación

| Método | Ruta                  | Descripción                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/auth/login`     | Iniciar sesión, retorna JWT        |
| POST   | `/api/auth/register`  | Registrar nuevo usuario residente  |

### Acceso (rutas públicas)

| Método | Ruta                                  | Descripción                           |
|--------|---------------------------------------|---------------------------------------|
| POST   | `/api/access/request`                 | Crear solicitud de visitante          |
| GET    | `/api/access/check/:token`            | Verificar estado de token QR          |
| GET    | `/api/access/request-status/:id`      | Consultar solicitud pendiente         |
| GET    | `/api/access/token-info/:token`       | Info detallada del pase               |

### Acceso (requieren JWT)

| Método | Ruta                            | Descripción                              |
|--------|---------------------------------|------------------------------------------|
| POST   | `/api/access/generate-manual`   | Generar pase directo (sin solicitud)     |
| GET    | `/api/access/pending`           | Listar solicitudes pendientes            |
| POST   | `/api/access/approve/:id`       | Aprobar solicitud y generar token+QR     |
| POST   | `/api/access/deny/:id`          | Denegar solicitud                        |
| GET    | `/api/access/active`            | Pases activos                            |
| GET    | `/api/access/history`           | Historial de accesos utilizados          |
| POST   | `/api/access/provision/:token`  | Re-provisionar token en Hikvision        |

### Dispositivos (requieren `x-camera-key`)

| Método | Ruta           | Descripción                                |
|--------|----------------|--------------------------------------------|
| POST   | `/event-lpr`   | Evento de lectura de placa (LPR)           |
| POST   | `/event-qr`    | Evento de escaneo QR desde terminal        |
| GET    | `/api/health`  | Estado del servidor y conexión MongoDB     |

---

## 🔒 Tipos de Acceso

| Tipo       | Comportamiento                                                        |
|------------|-----------------------------------------------------------------------|
| `single`   | Una sola entrada/salida. Se cierra automáticamente al escanear.      |
| `frequent` | Múltiples usos (por defecto hasta 10). Cierra al llegar al máximo.  |

Los pases de tipo `single` expiran automáticamente a las 8 horas si no son utilizados.

---

## 📱 PWA (Progressive Web App)

La aplicación puede instalarse como app en móviles y escritorio. Incluye:
- `manifest.json` con íconos y colores del tema
- `sw.js` con caché de archivos estáticos para uso offline básico

---

## 📲 App Móvil (Capacitor)

El proyecto incluye soporte para Android e iOS mediante Capacitor. El backend apuntado por defecto es `https://avalon-ju7h.onrender.com` (configurable en `capacitor.config.json`).

```bash
# Sincronizar web → móvil
npx cap sync

# Abrir en Android Studio
npx cap open android

# Abrir en Xcode
npx cap open ios
```

---

## 🖥️ Despliegue

### Frontend → Netlify

El directorio `public/` se despliega directamente en Netlify. La configuración ya está en `netlify.toml`:

```toml
[build]
  publish = "public"
  command = "echo Netlify static deploy ready"
```

Luego edita `public/api-config.js` con la URL de tu backend:

```js
var backendUrl = "https://tu-backend.onrender.com";
```

### Backend → Render / Railway / VPS

Despliega `server.js` como servidor Node.js con las variables de entorno del `.env`.

Variables mínimas necesarias en producción:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=https://tu-sitio.netlify.app
CAMERA_KEY=...
```

---

## 🏗️ Integración Hikvision

El sistema se comunica con el terminal Hikvision en `192.168.1.68` (configurable en `accessController.js`) para:

- **Provisionar usuarios** (`UserInfo/Record`) al aprobar un pase
- **Registrar tarjeta/credencial** (`CardInfo/Record`) vinculada al token
- **Eliminar el acceso** (`UserInfo/Delete`) al ejecutar la baja del pase

Para que el terminal envíe eventos al servidor, configura en su panel web una acción HTTP POST hacia:

```
POST http://<ip-servidor>:3000/event-qr
Header: x-camera-key: <CAMERA_KEY>
Body: { "authCardNo": "<token>" }
```

---

## 🧪 Tests

```bash
npm test
```

Usa Jest + Supertest. Los tests conectan a una base de datos de prueba (`martel_db_test`) y verifican:
- Login y generación de JWT
- Validación de campos en solicitudes
- Flujo completo: solicitud → aprobación → LPR con placa normalizada

---

## 🗒️ Notas de Seguridad

- Los tokens JWT expiran en 8 horas (configurable con `JWT_TTL`).
- Las contraseñas se almacenan con bcrypt (10 rondas de sal).
- Las rutas del residente/admin requieren JWT válido en el header `Authorization: Bearer <token>`.
- Las rutas de cámara/LPR requieren la cabecera `x-camera-key`.
- **Nunca subas el `.env` al repositorio.**
- Cambia `ADMIN_PASS`, `JWT_SECRET` y `CAMERA_KEY` antes de pasar a producción.
