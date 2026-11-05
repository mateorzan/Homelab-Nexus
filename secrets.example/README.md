# Secretos de ejemplo

Este directorio documenta qué archivos crear en `./secrets/` (gitignored) para que
el contenedor lea cada valor. El contenedor lee cada archivo desde
`/run/secrets/<nombre>`.

## Crear los archivos

```bash
mkdir -p secrets

# --- Beszel ---
# URL del hub de Beszel (la web, sin path)
echo "http://beszel.example.local:8090" > secrets/beszel_url
# Usuario de Beszel (solo lectura recomendado). La credencial se usa para autenticar via API.
echo "tu_email@dominio"   > secrets/beszel_user_email
echo "tu_password"        > secrets/beszel_user_password

# --- Uptime Kuma ---
# URL de la instancia (sin /dashboard)
echo "http://uptime-kuma.example.local:3001" > secrets/uptimekuma_url
# Slug de la STATUS PAGE publica (Settings -> Status Page). Ej: si la URL es
# http://uptime-kuma.example.local:3001/status/mi-slug  ->  el slug es "mi-slug"
echo "mi-slug"             > secrets/uptimekuma_status_page

# --- Gotify ---
# URL de Gotify (sin trailing slash)
echo "http://gotify.example.local:8081" > secrets/gotify_url
# Token de un cliente de mensajes (Apps -> tu app -> Messages)
echo "A.Tu.token"          > secrets/gotify_token
```

> OPNsense queda pendiente. Cuando lo quieras activar, agregá
> `opnsense_url`, `opnsense_api_key` y `opnsense_api_secret`
> (ademas de re-agregar sus entradas en el `docker-compose.yml`).

> Si preferís variables de entorno en vez de Docker secrets, creá un `.env`
> local (gitignored) con las variables equivalentes: `BESZEL_URL`,
> `BESZEL_USER_EMAIL`, `BESZEL_USER_PASSWORD`, `UPTIMEKUMA_URL`,
> `UPTIMEKUMA_STATUS_PAGE`, `GOTIFY_URL`, `GOTIFY_TOKEN`.
