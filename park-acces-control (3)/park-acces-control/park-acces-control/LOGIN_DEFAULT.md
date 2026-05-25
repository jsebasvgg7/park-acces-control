# 🔐 Credenciales de Acceso por Defecto

## Acceso a Panel de Residente / Admin

### Credenciales de Demostración
- **Usuario:** `admin`
- **Contraseña:** `password`
- **Rol:** Residente o Administrador

## Cómo Iniciar Sesión

1. Ve a `http://localhost:3000`
2. Haz clic en el botón **ACCESO RESIDENTE**
3. Se abrirá un formulario de login donde debes:
   - Seleccionar el **Tipo de Usuario** (Residente o Administrador)
   - Ingresar el **Usuario**: `admin`
   - Ingresar la **Contraseña**: `password`
   - Hacer clic en **INICIAR SESIÓN**

## Variables de Entorno (Personalización)

Puedes cambiar las credenciales usando variables de entorno en tu archivo `.env`:

```env
ADMIN_USER=tuusuario
ADMIN_PASS=tucontraseña
JWT_SECRET=tu_clave_secreta_jwt
JWT_TTL=8h
```

Si no defines estas variables, se usan los valores por defecto mencionados arriba.

## Funciones del Panel de Residente

Una vez autenticado, puedes:

### 1. **Generar Pase Rápido**
   - Ingresa el nombre del visitante
   - Haz clic en "GENERAR QR"
   - Se abrirá una nueva ventana con el código QR imprimible

### 2. **Ver Pases Activos**
   - Tabla en tiempo real de todos los accesos aprobados
   - Muestra tipo (Temporal o Frecuente), destino y estado

### 3. **Gestionar Solicitudes Pendientes**
   - Visualiza solicitudes de visitantes en espera
   - Botones para **Aceptar** o **Denegar** cada solicitud
   - Se abre automáticamente la página QR cuando apruebas

### 4. **Consultar Historial**
   - Registro de todos los accesos completados
   - Incluye fecha, hora, nombre del visitante y motivo de cierre

### 5. **Cerrar Sesión**
   - Usa el botón de "Cerrar Sesión" en la parte superior derecha

---

**Nota:** Las credenciales están almacenadas en variables de entorno por seguridad. ¡Nunca hardcodees credenciales en producción!
