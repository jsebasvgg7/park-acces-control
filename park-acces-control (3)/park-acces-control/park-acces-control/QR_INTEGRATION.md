# Integración QR con terminal Hikvision

Este documento explica cómo hacer que un terminal Hikvision (por ejemplo, modelos de la familia DS-K1T...) lea los QR generados por el sistema y los valide contra tu backend.

## 2 enfoques posibles

1) Validación server-side (recomendada)
   - Configuras el terminal para que, al escanear un QR, haga un POST HTTP a tu servidor con el contenido del QR.
   - Tu servidor recibe la petición, extrae el valor (token) y lo valida en la base de datos (`AccessToken`). Si está aprobado, ejecuta `ejecutarBaja(token, ...)` o responde con `granted: true`.
   - Ventaja: no dependes de la estructura interna del lector; control total en el servidor.

2) Provisionar el token en el dispositivo (opción alternativa)
   - Cuando generas el token en el backend, ya llamas a la API del dispositivo (`UserInfo/Record` y `CardInfo/Record`) con `employeeNo` y `cardNo` iguales al token.
   - Si el lector QR del dispositivo decodifica el código y lo interpreta como `cardNo`, el dispositivo aceptará el pase automáticamente.
   - Inconveniente: algunos modelos requieren configurar el tipo de tarjeta o el formato del QR; puede necesitar ajustes en la UI del dispositivo.

---

## Endpoint nuevo añadido: `/event-qr`

He añadido en `server.js` el endpoint protegido por `cameraAuth`:

```
POST /event-qr
Headers: (autenticación por IP/clave de cámara via cameraAuth middleware)
Body JSON: { authCardNo?, cardNo?, AccessEvent?: { employeeNoString? }, qrCode?, qrCodeData?, cardNoString? }

Respuesta: { granted: true|false, token }
```

Esto acepta múltiples formatos que los terminales Hikvision pueden enviar.

---

## Configuración en terminal Hikvision (pasos generales)

1. Accede al panel web del terminal (IP del dispositivo, credenciales del instalador).
2. Busca la sección de "Eventos" o "Alarm -> Linkage Method" o "Access Control -> Event".
3. Añade una acción de tipo "Send HTTP" o "Alarm/Access Event -> Remote Host" y configura:
   - URL: `http://<tu-servidor>:3000/event-qr`
   - Método: POST
   - Content Type: application/json
   - Body / Payload: configura que incluya el campo `authCardNo` o `cardNo` o el contenido del QR (consulta manual del dispositivo para ver el nombre exacto del campo). Algunos terminales permiten plantillas tipo: `{"authCardNo":"${cardNo}"}`
4. Asegura que la cámara/terminal esté autorizada (si usas `cameraAuth`, configura la cabecera o la IP en el middleware). Si no quieres protección en pruebas, puedes usar `/event-qr` directamente y luego hardenear.

---

## Pruebas locales (simular desde terminal o curl)

Simula un POST hacia `/event-qr`:

```bash
curl -X POST http://localhost:3000/event-qr \
  -H "Content-Type: application/json" \
  -d '{"authCardNo":"12345678"}'
```

Respuesta esperada:

```json
{ "granted": true, "token": "12345678" }
```

Si la respuesta `granted` es `true`, el servidor llamó a `ejecutarBaja()` y marcó el pase como usado.

---

## Notas sobre provisioning (si eliges opción 2)

- En los controladores (`generateManual` / `approveRequest`) ya se invoca `UserInfo/Record` y `CardInfo/Record` con `employeeNo` y `cardNo` igual al token; eso provisiona el pase en el dispositivo.
- Si el terminal no reconoce QR como `cardNo`, revisa la sección de configuración de "QR code" en el menú del dispositivo. Algunos modelos permiten seleccionar el "QR decode mode" o el formato de salida (p. ej. `employeeNo` como texto).
- En caso de duda, prueba primero la opción server-side (POST a `/event-qr`), es más simple y controlable.

---

## Resumen y próximos pasos sugeridos

- Paso 1: Verifica si el terminal puede enviar un HTTP POST con el contenido del QR; si sí, configura la acción a `http://<tu_ip>/event-qr`.
- Paso 2: Prueba con `curl` desde tu máquina para confirmar que `ejecutarBaja()` funciona con un token de prueba.
- Paso 3: Si necesitas que el dispositivo valide localmente (sin llamadas al servidor), prueba provisioning de `CardInfo` y ajusta el `cardType`/format en el dispositivo.

Si quieres, puedo:
- Añadir logging más detallado en `/event-qr` (ej.: guardar todas las peticiones en una colección `Events` para auditoría).
- Preparar un snippet de payload exacto si me pasas la sección del manual donde indica el template de `Send HTTP` del terminal.

