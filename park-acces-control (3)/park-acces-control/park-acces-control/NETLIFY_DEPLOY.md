# Despliegue en Netlify

Este proyecto tiene frontend estatico en `public` y backend Express en `server.js`.
Netlify puede publicar el frontend, pero no ejecuta `server.js` como servidor permanente.

## Configuracion de Netlify

Si Netlify toma como raiz esta carpeta (`park-acces-control/park-acces-control`):

- Build command: `echo Netlify static deploy ready`
- Publish directory: `public`

Si Netlify toma como raiz la carpeta mas superior (`park-acces-control (3)`):

- Base directory: `park-acces-control/park-acces-control`
- Publish directory: `public`

Si Netlify toma como raiz la carpeta superior (`park-acces-control`):

- Base directory: `park-acces-control`
- Publish directory: `public`

Los archivos `netlify.toml` ya dejan esas rutas configuradas para los casos comunes de esta copia anidada.

## Backend

Para que login, registro, QR, solicitudes y panel funcionen, despliega el backend Express aparte
(Render, Railway, VPS, etc.) con estas variables:

- `MONGO_URI`: cadena de conexion de MongoDB
- `CORS_ORIGIN`: dominio de Netlify, por ejemplo `https://tu-sitio.netlify.app`

Luego edita `public/api-config.js` y coloca la URL del backend:

```js
var backendUrl = "https://tu-backend.onrender.com";
```

Si corres todo local con `node server.js`, puedes dejar `backendUrl` vacio y la app usara el mismo dominio.