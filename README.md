# Homelab Nexus

> A self-hosted dashboard that brings your homelab services and monitoring into one place.

Homelab Nexus combines **Beszel**, **Uptime Kuma**, and **Gotify** in a lightweight dashboard. It is built for Docker; no personal configuration or service data is included in the image.

> **Beszel, Uptime Kuma and Gotify are required.** Every metric, status and message in the dashboard comes from these three services, so without them there is nothing to show. The container still starts if one is missing, but logs a warning naming the missing settings. OPNsense is an optional, experimental integration.

![Homelab Nexus dashboard using synthetic demo data](image/README/demo.png)

> **Status:** personal project, shared as-is. Contributions and feedback are welcome.

## Features

- **Everything in one view:** host metrics from Beszel, monitor status and latency from Uptime Kuma, and Gotify messages with infrastructure alerts.
- **Live updates** over Server-Sent Events (SSE).
- **Custom background:** use any image you like (URL or upload), set the blur level, and save as many backgrounds as you want to switch between them quickly.
- **Resizable Gotify widget:** drag its edges to make it wider, narrower or taller to suit your layout. The size is remembered in your browser.
- **Links / bookmarks:** a dedicated section where you can add any links you want, with custom labels and icons.
- **Alerts you can manage:** mark them as read or resolved, and review resolved ones later.
- **English and Spanish interface:** detected from the browser language, with a selector in Settings. The choice is stored per browser.
- **Persistent data:** bookmarks, monitor links, alert states and background settings are kept in the data directory.
- **Docker-ready:** the image runs as a non-root user and includes a health check; multi-arch (`amd64` and `arm64`).

## Quick start with Docker Compose

1. Download `docker-compose.yml` and `.env.example` from this repository, then create your local environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set the URL and credentials of **Beszel, Uptime Kuma and Gotify** (all three are required).

3. Start the dashboard:

   ```bash
   docker compose up -d
   ```

4. Open <http://localhost:3000>.

Compose stores persistent dashboard data in `./data`. Back up this directory before changing or removing it. The container runs as UID 1000; make sure the host directory is writable by that UID.

### Try the image directly

The published image will be available at:

```text
ghcr.io/mateorzan/homelab-nexus-public:latest
```

The image can also be built locally from the repository:

```bash
docker build -t homelab-nexus:local .
```

### Choose how to provide your configuration

You can provide settings in whichever way suits your setup; the app reads a Docker secret first and falls back to the environment variable of the same setting:

| Option | Best for | How |
|---|---|---|
| `.env` file | Most home setups | `docker-compose.yml` with `env_file: .env` (above) |
| Inline in the Compose file | A single self-contained `compose.yml` | Put the variables under `environment:` (example below) |
| Docker Secrets | Shared servers | `docker-compose.secrets.yml` (next section) |

Inline example (no `.env` or secret files needed):

```yaml
services:
  homelab-nexus:
    image: ghcr.io/mateorzan/homelab-nexus-public:latest
    container_name: homelab-nexus
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      BESZEL_URL: http://beszel.example.local:8090
      BESZEL_USER_EMAIL: readonly@example.local
      BESZEL_USER_PASSWORD: change-me
      UPTIMEKUMA_URL: http://uptime-kuma.example.local:3001
      UPTIMEKUMA_STATUS_PAGE: /status/your-page
      GOTIFY_URL: http://gotify.example.local:8081
      GOTIFY_TOKEN: change-me
    volumes:
      - ./data:/app/data
```

Credentials written directly in a Compose file are readable by anyone with access to that file, so keep it private.

### Docker Secrets

For a shared server, prefer Docker Secrets over putting credentials in `.env`. Create the files described in [`secrets.example/README.md`](secrets.example/README.md), then start the secrets-based Compose configuration:

```bash
docker compose -f docker-compose.secrets.yml up -d
```

Never commit `.env`, secret files, or your `data/` directory.

## Configuration

| Variable | Required | Description |
|---|---:|---|
| `PORT` | No | HTTP port (default `3000`). |
| `HOST` | No | Bind address (default `0.0.0.0`). |
| `POLL_INTERVAL_MS` | No | Poll interval in milliseconds (default `5000`). |
| `ALLOWED_ORIGINS` | No | Comma-separated additional CORS origins, useful behind a reverse proxy. |
| `DATA_DIR` | No | Persistent data directory (default `data/`). |
| `BESZEL_URL` | **Yes** | Beszel hub URL. |
| `BESZEL_USER_EMAIL` / `BESZEL_USER_PASSWORD` | **Yes** | Read-only Beszel account credentials. |
| `UPTIMEKUMA_URL` | **Yes** | Uptime Kuma URL. |
| `UPTIMEKUMA_STATUS_PAGE` | Recommended | Public status-page slug (for example `/status/your-page`). |
| `GOTIFY_URL` | **Yes** | Gotify URL. |
| `GOTIFY_TOKEN` | **Yes** | Gotify application/client token. |
| `OPNSENSE_URL` | No | Optional OPNsense URL (integration is currently a stub). |
| `OPNSENSE_API_KEY` / `OPNSENSE_API_SECRET` | For OPNsense | Optional API credentials. |

> URLs must be reachable **from inside the container**. Use a Docker network, a reachable host name, or the host's LAN address as appropriate for your setup.

## Development

Requirements: Node.js 24 or later and npm.

```bash
npm ci
cp .env.example .env
npm run dev
```

Checks:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

Build and run the Docker image locally:

```bash
npm run build
docker build -t homelab-nexus:local .
IMAGE=homelab-nexus:local docker compose up -d
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/summary` | Dashboard summary and alerts. |
| `GET` | `/api/stream` | Live updates (SSE). |
| `GET` | `/api/health` | Container health check and version. |
| `GET` | `/api/services/:id` | Service details. |

## Releases and container image

GitHub Actions runs type-checking, lint, unit/DOM tests, and browser tests. Version tags build multi-architecture images (`linux/amd64` and `linux/arm64`) and publish them to GitHub Container Registry. After the first successful publish, the maintainer must set the GHCR package visibility to **Public** in the package settings so anyone can pull it without signing in. See the **Packages** section of the repository for the final image name and pull commands.

## Privacy and security

- The project does not ship with your service URLs, credentials, background image, bookmarks, or dashboard data.
- Keep `.env`, Docker secret files, and `data/` private.
- Use a read-only Beszel account where possible, and expose the dashboard only to trusted networks or behind your authenticated reverse proxy.
- Report security issues privately to the repository owner rather than opening a public issue containing sensitive details.

## License

MIT. See [`LICENSE`](LICENSE).

### Third-party assets

- The bundled Inter font is licensed under the SIL Open Font License 1.1; see [`public/fonts/OFL.txt`](public/fonts/OFL.txt).
- Service logos are loaded on demand from [dashboard-icons](https://github.com/walkxcode/dashboard-icons) (Apache-2.0); product names and trademarks belong to their respective owners.
