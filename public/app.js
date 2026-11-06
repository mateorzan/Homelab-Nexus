(function () {
  'use strict';

  const LANGUAGE_KEY = 'homelab-nexus-language';
  const COPY = {
    es: {
      live: ' en vivo', reconnecting: ' reconectando…', offline: ' sin conexión',
      notifications: 'Notificaciones', markAllRead: 'Marcar todas como leídas', settings: 'Configuración', language: 'Idioma',
      backgroundImage: 'Imagen de fondo', backgroundUrlPlaceholder: 'URL de la imagen...', uploadFile: 'Subir archivo',
      apply: 'Aplicar', remove: 'Quitar', savePreset: 'Guardar como preset', backgroundBlur: 'Desenfoque del fondo',
      loading: 'Cargando…', loadingDashboard: 'Cargando estado del homelab…', links: 'Enlaces', addLink: 'Añadir enlace',
      systems: 'Sistemas', monitors: 'Monitores', searchPlaceholder: 'Buscar…', filterByPriority: 'Filtrar por prioridad',
      priorityAll: 'Prioridad: todas', priorityCritical: 'Prioridad: críticas', priorityWarning: 'Prioridad: alertas', priorityInfo: 'Prioridad: info',
      noGotifyMessages: 'Sin mensajes en Gotify', deployedVersion: 'Versión desplegada', close: 'Cerrar',
      allGood: 'Todo OK', attention: 'Atención', critical: 'Crítico', unknown: 'Cargando',
      statSystems: 'Sistemas', statCpu: 'CPU', statRam: 'RAM', statMonitors: 'Monitores', statMessages: 'Mensajes', statAlerts: 'Alertas',
      nodeCount: '{count} nodos', nodesDown: '{count} caídos', monitorCount: '{count} monitores', monitorsDown: '{count} caídos',
      uptime24: 'Disponibilidad 24 h: {value}%', ping: 'Ping: {value} ms', statusUp: 'Activo', statusDown: 'Caído',
      statusPending: 'Pendiente', statusMaintenance: 'Mantenimiento', statusUnknown: 'Desconocido',
      statusUpShort: 'ACTIVO', statusDownShort: 'CAÍDO', statusPendingShort: 'PEND.', statusMaintenanceShort: 'MANT.', statusUnknownShort: 'N/D',
      open: 'Abrir', alertCritical: 'Crítico', alertWarning: 'Alerta', alertInfo: 'Info', noTitle: 'Sin título',
      restoreAlert: 'Restaurar (vuelve a la lista)', markUnread: 'Marcar como no leída', markResolved: 'Marcar como resuelta', markRead: 'Marcar como leída',
      noNotifications: 'Sin notificaciones', noActiveNotifications: 'Sin notificaciones activas', resolvedCount: 'Resueltas ({count})',
      clear: 'Limpiar', confirmClearResolved: '¿Borrar todas las resueltas?', allApps: 'Todas las apps',
      priorityCriticalBadge: 'CRÍTICO', priorityWarningBadge: 'ALERTA', priorityInfoBadge: 'INFO',
      noMatchingMessages: 'No hay mensajes que coincidan', noTitleMessage: 'Sin título', showLess: 'Ver menos', showMore: 'Ver más',
      loadMore: 'Cargar más ({count} restantes)', staleSince: 'Última lectura hace {time}', timeNow: 'ahora',
      updatedAgo: 'Actualizado hace {time}', offlineSince: ' (sin conexión)',
      oneServiceDown: '{names} no responde. Sin este servicio, el dashboard no muestra datos.',
      manyServicesDown: '{names} no responden. Sin estos servicios, el dashboard no muestra datos.',
      loadError: 'No se pudo cargar el estado: {error}', backgroundPrompt: 'Nombre para este fondo:', backgroundName: 'Fondo {count}',
      infrastructure: 'Infraestructura', nodeDownMessage: 'El nodo {name} de Beszel esta caido', serviceUnresponsive: '{name} no responde ({detail})',
      label: 'Etiqueta', add: '+ Agregar', save: 'Guardar', emojis: 'Emojis', searchEmoji: 'Buscar emoji...',
      services: 'Servicios', searchService: 'Buscar servicio...', noIcon: 'Sin icono', uploadPng: 'Subir PNG', title: 'Título', url: 'URL', cancel: 'Cancelar',
    },
    en: {
      live: ' live', reconnecting: ' reconnecting…', offline: ' offline',
      notifications: 'Notifications', markAllRead: 'Mark all as read', settings: 'Settings', language: 'Language',
      backgroundImage: 'Background image', backgroundUrlPlaceholder: 'Image URL...', uploadFile: 'Upload file',
      apply: 'Apply', remove: 'Remove', savePreset: 'Save as preset', backgroundBlur: 'Background blur',
      loading: 'Loading…', loadingDashboard: 'Loading homelab status…', links: 'Links', addLink: 'Add link',
      systems: 'Systems', monitors: 'Monitors', searchPlaceholder: 'Search…', filterByPriority: 'Filter by priority',
      priorityAll: 'Priority: all', priorityCritical: 'Priority: critical', priorityWarning: 'Priority: alerts', priorityInfo: 'Priority: info',
      noGotifyMessages: 'No Gotify messages', deployedVersion: 'Deployed version', close: 'Close',
      allGood: 'All good', attention: 'Attention', critical: 'Critical', unknown: 'Loading',
      statSystems: 'Systems', statCpu: 'CPU', statRam: 'RAM', statMonitors: 'Monitors', statMessages: 'Messages', statAlerts: 'Alerts',
      nodeCount: '{count} nodes', nodesDown: '{count} down', monitorCount: '{count} monitors', monitorsDown: '{count} down',
      uptime24: 'Uptime 24h: {value}%', ping: 'Ping: {value} ms', statusUp: 'Up', statusDown: 'Down',
      statusPending: 'Pending', statusMaintenance: 'Maintenance', statusUnknown: 'Unknown',
      statusUpShort: 'UP', statusDownShort: 'DOWN', statusPendingShort: 'PENDING', statusMaintenanceShort: 'MAINT.', statusUnknownShort: 'N/A',
      open: 'Open', alertCritical: 'Critical', alertWarning: 'Warning', alertInfo: 'Info', noTitle: 'Untitled',
      restoreAlert: 'Restore (move back to active)', markUnread: 'Mark as unread', markResolved: 'Mark as resolved', markRead: 'Mark as read',
      noNotifications: 'No notifications', noActiveNotifications: 'No active notifications', resolvedCount: 'Resolved ({count})',
      clear: 'Clear', confirmClearResolved: 'Clear all resolved alerts?', allApps: 'All apps',
      priorityCriticalBadge: 'CRITICAL', priorityWarningBadge: 'ALERT', priorityInfoBadge: 'INFO',
      noMatchingMessages: 'No matching messages', noTitleMessage: 'Untitled', showLess: 'Show less', showMore: 'Show more',
      loadMore: 'Load more ({count} remaining)', staleSince: 'Last reading {time} ago', timeNow: 'now',
      updatedAgo: 'Updated {time} ago', offlineSince: ' (offline)',
      oneServiceDown: '{names} is unavailable. The dashboard needs this service to show data.',
      manyServicesDown: '{names} are unavailable. The dashboard needs these services to show data.',
      loadError: 'Could not load status: {error}', backgroundPrompt: 'Name this background:', backgroundName: 'Background {count}',
      infrastructure: 'Infrastructure', nodeDownMessage: 'Beszel node {name} is down', serviceUnresponsive: '{name} is not responding ({detail})',
      label: 'Label', add: '+ Add', save: 'Save', emojis: 'Emojis', searchEmoji: 'Search emoji...',
      services: 'Services', searchService: 'Search service...', noIcon: 'No icon', uploadPng: 'Upload PNG', title: 'Title', url: 'URL', cancel: 'Cancel',
    },
  };

  function detectLanguage() {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch { /* use browser locale */ }
    return /^es(?:-|$)/i.test(navigator.language || '') ? 'es' : 'en';
  }

  let currentLanguage = detectLanguage();

  function t(key, values = {}) {
    const template = COPY[currentLanguage][key] || COPY.en[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
  }

  function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-title]').forEach((node) => { node.title = t(node.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
    const select = document.getElementById('language-select');
    if (select) select.value = currentLanguage;
  }

  function setLanguage(language) {
    if (language !== 'es' && language !== 'en') return;
    currentLanguage = language;
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* keep language for this page */ }
    applyStaticTranslations();
    if (lastSummary) render(lastSummary);
    else {
      const label = document.getElementById('status-text');
      if (label) label.textContent = t('loading');
    }
  }

  applyStaticTranslations();
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));

  const STATUS_LABEL = { ok: 'allGood', warning: 'attention', critical: 'critical', unknown: 'unknown' };

  // El servidor genera estas alertas de infraestructura en español; se
  // traducen aquí según el idioma del navegador. Cualquier otro texto
  // (p. ej. mensajes de Gotify) se muestra tal cual.
  function localizeAlertSource(source) {
    return String(source ?? '').replace(/^Infraestructura(?= ·|$)/, () => t('infrastructure'));
  }

  function localizeAlertMessage(message) {
    const text = String(message ?? '');
    const node = text.match(/^El nodo (.+) de Beszel esta caido$/);
    if (node) return t('nodeDownMessage', { name: node[1] });
    const svc = text.match(/^(.+?) no responde \((.*)\)$/);
    if (svc) return t('serviceUnresponsive', { name: svc[1], detail: svc[2] });
    return text;
  }

  const ICONS = {
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    critical: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkDouble: '<polyline points="11 5 16 10 11 15"/><polyline points="8 12 12 16 19 7"/>',
    undo: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  };

  function svgIcon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = ICONS[name] || ICONS.info;
    return svg;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (tag === 'button') n.type = 'button';
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Accesibilidad: los elementos clicables que no son <button> aceptan Enter
  // y Espacio como activadores, con rol de boton y foco.
  function activatable(node, onClick) {
    node.setAttribute('role', 'button');
    node.tabIndex = 0;
    node.addEventListener('click', onClick);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    });
    return node;
  }

  function dot(status) { return el('span', 'dot ' + (status || 'unknown')); }

  function timeAgo(timestamp) {
    const s = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (s < 5) return t('timeNow');
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm';
    return Math.floor(m / 60) + 'h';
  }

  function tone(pct) { if (pct >= 90) return 'crit'; if (pct >= 75) return 'warn'; return 'ok'; }
  function tempTone(t) { if (t >= 80) return 'crit'; if (t >= 65) return 'warn'; return 'ok'; }

  function byId(services, id) { return (services || []).find((s) => s.id === id); }
  function fmt(v, suffix) { return v == null ? '—' : (Math.round(v * 10) / 10) + suffix; }

  /* ------------------------------- hero stats ------------------------------- */

  function hstat(label, value, toneClass) {
    const s = el('div', 'hstat' + (toneClass ? ' ' + toneClass : ''));
    s.appendChild(el('span', 'hstat-l', label));
    s.appendChild(el('span', 'hstat-v', value));
    return s;
  }

  function renderHero(summary) {
    const box = document.getElementById('overview');
    box.textContent = '';
    const stats = [];

    const beszel = byId(summary.services, 'beszel')?.metrics;
    if (beszel) {
      const nodes = beszel.systems || [];
      const down = nodes.filter((n) => n.status === 'down').length;
      const active = nodes.filter((n) => n.status !== 'down');
      const avgCpu = active.length ? active.reduce((s, n) => s + (n.cpu ?? 0), 0) / active.length : 0;
      const avgMem = active.length ? active.reduce((s, n) => s + (n.mem ?? 0), 0) / active.length : 0;
      stats.push(hstat(t('statSystems'), (nodes.length - down) + '/' + nodes.length, down ? 'crit' : 'ok'));
      stats.push(hstat('CPU', fmt(avgCpu, '%'), tone(avgCpu)));
      stats.push(hstat('RAM', fmt(avgMem, '%'), tone(avgMem)));
    }
    const kuma = byId(summary.services, 'uptimekuma')?.metrics;
    if (kuma) {
      const mons = kuma.monitors || [];
      const down = mons.filter((m) => m.status === 'down').length;
      stats.push(hstat(t('statMonitors'), (mons.length - down) + '/' + mons.length, down ? 'crit' : 'ok'));
    }
    const gotify = byId(summary.services, 'gotify')?.metrics;
    if (gotify) {
      const crit = gotify.messages.filter((m) => m.priority >= 8).length;
      stats.push(hstat(t('statMessages'), String(gotify.totalMessages), crit ? 'crit' : 'ok'));
    }
    const alerts = summary.alerts || [];
    const unreadAl = alerts.filter((a) => a.state !== 'read');
    const critAl = unreadAl.filter((a) => a.level === 'critical').length;
    stats.push(hstat(t('statAlerts'), String(unreadAl.length), critAl ? 'crit' : unreadAl.length ? 'warn' : 'ok'));

    stats.forEach((s) => box.appendChild(s));
  }

  /* ------------------------------- beszel ------------------------------- */

  function nmetric(label, value, barPct, toneClass) {
    const m = el('div', 'nmetric');
    m.appendChild(el('span', 'nmetric-l', label));
    m.appendChild(el('span', 'nmetric-v', value));
    if (barPct != null) {
      const bar = el('div', 'nbar');
      const fill = el('div', 'nbar-fill ' + (toneClass || 'ok'));
      fill.style.width = Math.max(0, Math.min(100, barPct)) + '%';
      bar.appendChild(fill);
      m.appendChild(bar);
    }
    return m;
  }

  function renderBeszel(metrics) {
    const box = document.getElementById('beszel');
    box.textContent = '';
    const systems = metrics?.systems || [];
    const down = systems.filter((n) => n.status === 'down').length;
    document.getElementById('beszel-count').textContent = t('nodeCount', { count: systems.length }) + (down ? ' · ' + t('nodesDown', { count: down }) : '');

    for (const s of systems) {
      const node = el('div', 'node');
      if (beszelUrl) {
        node.style.cursor = 'pointer';
        activatable(node, () => {
          window.open(beszelUrl, '_blank', 'noopener');
        });
      }
      const top = el('div', 'node-top');
      top.appendChild(dot(s.status));
      top.appendChild(el('span', 'node-name', s.name));
      top.appendChild(el('span', 'node-badge ' + (s.status || 'unknown'), s.status));
      node.appendChild(top);
      const metricsRow = el('div', 'node-metrics');
      const cpu = s.cpu ?? 0;
      const mem = s.mem ?? 0;
      const disk = s.disk ?? 0;
      metricsRow.appendChild(nmetric('CPU', (Math.round(cpu * 10) / 10).toFixed(1), cpu, tone(cpu)));
      metricsRow.appendChild(nmetric('RAM', (Math.round(mem * 10) / 10).toFixed(1), mem, tone(mem)));
      metricsRow.appendChild(nmetric('DISK', (Math.round(disk * 10) / 10).toFixed(1), disk, tone(disk)));
      if (s.temp != null) metricsRow.appendChild(nmetric('TEMP', Math.round(s.temp) + '°', Math.min(100, s.temp), tempTone(s.temp)));
      node.appendChild(metricsRow);
      box.appendChild(node);
    }
    document.getElementById('beszel-wrap').hidden = false;
  }

  /* ------------------------------- uptime kuma ------------------------------- */

  const ICON_CDN = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png';

  const SERVICE_LOGOS = {
    'n8n': 'n8n',
    'nextcloud': 'nextcloud',
    'vaultwarden': 'vaultwarden',
    'beszel': 'beszel',
    'portainer': 'portainer',
    'upsnap': 'upsnap',
    'gotify': 'gotify',
    'nginx proxy manager': 'nginx-proxy-manager',
    'deluge': 'deluge',
    'downtify': 'downtify',
    'jellyfin': 'jellyfin',
    'prowlar': 'prowlarr',
    'radarr': 'radarr',
    'sonarr': 'sonarr',
    'plex': 'plex',
    'emby': 'emby',
    'home assistant': 'home-assistant',
    'pi-hole': 'pihole',
    'traefik': 'traefik',
    'syncthing': 'syncthing',
    'filebrowser': 'filebrowser',
    'flaresolverr': 'flaresolverr',
    'proxmox': 'proxmox',
    'qbittorrent': 'qbittorrent',
    'transmission': 'transmission',
    'gitea': 'gitea',
    'grafana': 'grafana',
    'influxdb': 'influxdb',
    'mosquitto': 'mosquitto',
    'node-red': 'node-red',
    'prometheus': 'prometheus',
    'zabbix': 'zabbix',
    'wireguard': 'wireguard',
    'unifi': 'unifi',
    'opnsense': 'opnsense',
    'pfsense': 'pfsense',
    'adguard': 'adguard',
    'duckdns': 'duckdns',
    'cloudflare': 'cloudflare',
    'ansible': 'ansible',
    'docker': 'docker',
    'linux': 'linux',
    'windows': 'windows',
    'macos': 'apple',
  };

  const loadedIcons = new Set();
  const failedIcons = new Set();

  function normalizeSlug(name) {
    return (name || '').toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  function serviceIcon(name) {
    const key = (name || '').toLowerCase().trim();
    const img = document.createElement('img');
    img.classList.add('service-icon');
    img.alt = '';
    img.loading = 'lazy';

    if (failedIcons.has(key)) {
      img.src = `${ICON_CDN}/docker.png`;
      return img;
    }

    const slug = SERVICE_LOGOS[key] || normalizeSlug(name);

    if (loadedIcons.has(key)) {
      img.src = `${ICON_CDN}/${slug}.png`;
      return img;
    }

    img.src = `${ICON_CDN}/${slug}.png`;
    img.onerror = () => {
      if (!failedIcons.has(key)) {
        failedIcons.add(key);
        img.src = `${ICON_CDN}/docker.png`;
      }
    };
    img.onload = () => { loadedIcons.add(key); };

    return img;
  }

  function renderKuma(metrics) {
    const box = document.getElementById('kuma');
    const monitors = metrics?.monitors || [];
    if (!monitors.length) {
      document.getElementById('kuma-wrap').hidden = true;
      return;
    }
    const down = monitors.filter((m) => m.status === 'down').length;
    document.getElementById('kuma-count').textContent = t('monitorCount', { count: monitors.length }) + (down ? ' · ' + t('monitorsDown', { count: down }) : '');

    const existing = box.querySelectorAll('.monitor');
    const existingMap = {};
    existing.forEach((row) => { existingMap[row.dataset.name] = row; });

    const seen = new Set();
    for (const m of monitors) {
      seen.add(m.name);
      let row = existingMap[m.name];

      if (!row) {
        row = el('div', 'monitor');
        row.dataset.name = m.name;

        row.appendChild(dot(m.status));
        const info = el('div', 'monitor-info');
        const nameRow = el('div', 'monitor-name-row');
        nameRow.appendChild(serviceIcon(m.name));
        nameRow.appendChild(el('span', 'monitor-name', m.name));
        info.appendChild(nameRow);
        info.appendChild(el('div', 'monitor-uptime'));
        info.appendChild(el('div', 'monitor-latency'));
        row.appendChild(info);
        row.appendChild(el('span', 'monitor-badge'));

        const cfgBtn = el('button', 'monitor-cfg');
        cfgBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        row.appendChild(cfgBtn);

        cfgBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCfgPopup(m.name, cfgBtn);
        });

        row.style.cursor = 'pointer';
        const menu = el('div', 'monitor-menu');
        menu.hidden = true;
        row.appendChild(menu);
        activatable(row, (e) => {
          if (e.target.closest('.monitor-cfg') || e.target.closest('.monitor-cfg-popup')) return;
          if (menu.contains(e.target)) return;
          const cur = monitorUrlsData[m.name] || [];
          const all = cur.length ? cur : (m.url ? [{ label: t('open'), url: m.url }] : []);
          if (!all.length) return;
          if (all.length === 1) {
            window.open(all[0].url, '_blank', 'noopener');
            return;
          }
          e.stopPropagation();
          menu.textContent = '';
          for (const entry of all) {
            const item = el('div', 'monitor-menu-item', entry.label);
            item.addEventListener('click', (ev) => { ev.stopPropagation(); window.open(entry.url, '_blank', 'noopener'); });
            menu.appendChild(item);
          }
          const wasHidden = menu.hidden;
          document.querySelectorAll('.monitor-menu').forEach((m2) => { m2.hidden = true; });
          menu.hidden = !wasHidden;
        });
        row.addEventListener('mouseleave', () => { menu.hidden = true; });
      }

      const dotEl = row.querySelector('.dot');
      if (dotEl) dotEl.className = 'dot ' + m.status;

      const uptimeEl = row.querySelector('.monitor-uptime');
      if (uptimeEl) uptimeEl.textContent = m.uptime24h != null ? t('uptime24', { value: m.uptime24h.toFixed(2) }) : '';

      const latencyEl = row.querySelector('.monitor-latency');
      if (latencyEl) latencyEl.textContent = m.latency != null ? t('ping', { value: Math.round(m.latency) }) : '';

      const badge = row.querySelector('.monitor-badge');
      if (badge) {
        const badgeLabel = ({ up: t('statusUpShort'), down: t('statusDownShort'), pending: t('statusPendingShort'), maintenance: t('statusMaintenanceShort') })[m.status] || t('statusUnknownShort');
        badge.textContent = badgeLabel;
        badge.className = 'monitor-badge ' + (m.status || 'unknown');
      }

      if (!existingMap[m.name]) box.appendChild(row);
    }

    for (const [name, row] of Object.entries(existingMap)) {
      if (!seen.has(name)) row.remove();
    }

    document.getElementById('kuma-wrap').hidden = false;
  }

  /* ------------------------------- alerts ------------------------------- */

  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  let lastSummary = null;
  let resolvedOpen = false;

  function rerenderAlerts() {
    renderAlerts(lastSummary.alerts || [], lastSummary.resolvedAlerts || []);
  }

  function setAlertState(id, state) {
    postJson('/api/alerts/' + encodeURIComponent(id) + '/state', { state })
      .then(() => { /* el server re-emite el resumen por SSE */ })
      .catch((err) => console.error('[alerts] no se pudo actualizar el estado:', err));
    if (!lastSummary) return;
    const idx = (lastSummary.alerts || []).findIndex((a) => a.id === id);
    if (idx >= 0) {
      const alert = lastSummary.alerts[idx];
      if (state === 'resolved') {
        lastSummary.alerts.splice(idx, 1);
        lastSummary.resolvedAlerts = [{ ...alert, state: 'resolved' }, ...(lastSummary.resolvedAlerts || [])];
      } else {
        alert.state = state;
      }
    } else if (state !== 'resolved') {
      const ridx = (lastSummary.resolvedAlerts || []).findIndex((a) => a.id === id);
      if (ridx >= 0) {
        const alert = lastSummary.resolvedAlerts[ridx];
        lastSummary.resolvedAlerts.splice(ridx, 1);
        lastSummary.alerts = [{ ...alert, state }, ...(lastSummary.alerts || [])];
      }
    }
    rerenderAlerts();
  }

  function markAllRead() {
    if (!lastSummary || !(lastSummary.alerts || []).length) return;
    const ids = lastSummary.alerts.filter((a) => a.state !== 'read').map((a) => a.id);
    if (!ids.length) return;
    postJson('/api/alerts/read-all', {})
      .then(() => { /* el server re-emite el resumen por SSE */ })
      .catch((err) => console.error('[alerts] no se pudieron marcar como leídas:', err));
    for (const a of lastSummary.alerts) a.state = 'read';
    rerenderAlerts();
  }

  /* ------------------------------- notif detail popup ------------------------------- */

  function showNotifDetail(a) {
    const popup = document.getElementById('notif-detail-popup');
    const title = document.getElementById('notif-detail-title');
    const body = document.getElementById('notif-detail-body');
    popup.hidden = false;
    title.textContent = localizeAlertSource(a.source) + ' — ' + (a.level === 'critical' ? t('alertCritical') : a.level === 'warning' ? t('alertWarning') : t('alertInfo'));
    body.innerHTML = '';
    const msgTitle = el('div', 'detail-msg-title', localizeAlertMessage(a.message) || t('noTitle'));
    body.appendChild(msgTitle);
    const msgTime = el('div', 'detail-msg-time', new Date(a.time).toLocaleString('es'));
    body.appendChild(msgTime);
    if (a.fullMessage) {
      const msgBody = el('div', 'detail-msg-body', a.fullMessage);
      body.appendChild(msgBody);
    } else {
      const msgBody = el('div', 'detail-msg-body', localizeAlertMessage(a.message));
      body.appendChild(msgBody);
    }
    notifDropdown.hidden = true;
  }

  function closeNotifDetail() {
    document.getElementById('notif-detail-popup').hidden = true;
  }

  document.getElementById('notif-detail-popup').addEventListener('click', (e) => {
    if (e.target.closest('.notif-detail-close')) closeNotifDetail();
  });

  // Clicar fuera del popup (en la pagina) lo cierra; Escape tambien.
  // Se ignoran los clicks en el propio dropdown y su boton: ahi se abre.
  document.addEventListener('click', (e) => {
    const popup = document.getElementById('notif-detail-popup');
    if (popup.hidden) return;
    if (e.target.closest('#notif-detail-popup, #notif-dropdown, #notif-btn')) return;
    closeNotifDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeNotifDetail();
    // Escape tambien cierra los dropdowns (ademas del boton y el click fuera).
    notifDropdown.hidden = true;
    settingsDropdown.hidden = true;
  });

  function actionBtn(icon, title, onClick) {
    const b = el('button', 'notif-action');
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.appendChild(svgIcon(icon));
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return b;
  }

  function alertRow(a, resolved) {
    const row = el('div', 'notif-item ' + a.level + (resolved ? ' is-resolved' : a.state === 'read' ? ' is-read' : ''));
    row.style.cursor = 'pointer';
    const ico = el('span', 'notif-item-ico');
    ico.appendChild(svgIcon(a.level === 'critical' ? 'critical' : a.level === 'warning' ? 'warning' : 'info'));
    row.appendChild(ico);
    const body = el('div', 'notif-item-body');
    body.appendChild(el('div', 'notif-item-src', formatAppName(localizeAlertSource(a.source))));
    body.appendChild(el('div', 'notif-item-msg', localizeAlertMessage(a.message)));
    row.appendChild(body);
    row.appendChild(el('span', 'notif-item-time', timeAgo(a.time)));
    const actions = el('div', 'notif-item-actions');
    if (resolved) {
      actions.appendChild(actionBtn('undo', t('restoreAlert'), () => setAlertState(a.id, 'read')));
    } else if (a.state === 'read') {
      actions.appendChild(actionBtn('undo', t('markUnread'), () => setAlertState(a.id, 'unread')));
      actions.appendChild(actionBtn('checkDouble', t('markResolved'), () => setAlertState(a.id, 'resolved')));
    } else {
      actions.appendChild(actionBtn('check', t('markRead'), () => setAlertState(a.id, 'read')));
      actions.appendChild(actionBtn('checkDouble', t('markResolved'), () => setAlertState(a.id, 'resolved')));
    }
    row.appendChild(actions);
    activatable(row, (e) => {
      if (e.target.closest('.notif-action')) return;
      showNotifDetail(a);
    });
    return row;
  }

  function renderAlerts(alerts, resolvedAlerts) {
    alerts = alerts || [];
    resolvedAlerts = resolvedAlerts || [];
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    const readAllBtn = document.getElementById('notif-read-all');
    list.textContent = '';

    const unread = alerts.filter((a) => a.state !== 'read');
    badge.hidden = !unread.length;
    badge.textContent = unread.length;
    readAllBtn.hidden = !unread.length;

    if (!alerts.length && !resolvedAlerts.length) {
      list.appendChild(el('div', 'notif-empty', t('noNotifications')));
      return;
    }
    if (!alerts.length) list.appendChild(el('div', 'notif-empty', t('noActiveNotifications')));
    for (const a of alerts) list.appendChild(alertRow(a, false));

    if (resolvedAlerts.length) {
      const sec = el('div', 'notif-resolved' + (resolvedOpen ? ' open' : ''));
      const head = el('button', 'notif-resolved-head');
      head.type = 'button';
      head.textContent = t('resolvedCount', { count: resolvedAlerts.length });
      head.addEventListener('click', (e) => {
        e.stopPropagation();
        resolvedOpen = !resolvedOpen;
        sec.classList.toggle('open', resolvedOpen);
      });
      sec.appendChild(head);
      if (resolvedAlerts.length > 5) {
        const clearBtn = el('button', 'notif-resolved-clear');
        clearBtn.textContent = t('clear');
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!confirm(t('confirmClearResolved'))) return;
          postJson('/api/alerts/clear-resolved', {})
            .then(() => { /* el server re-emite el resumen por SSE */ })
            .catch((err) => console.error('[alerts] no se pudieron limpiar:', err));
          lastSummary.resolvedAlerts = [];
          resolvedOpen = false;
          rerenderAlerts();
        });
        sec.appendChild(clearBtn);
      }
      const box = el('div', 'notif-resolved-body');
      for (const a of resolvedAlerts) box.appendChild(alertRow(a, true));
      sec.appendChild(box);
      list.appendChild(sec);
    }
  }

  document.getElementById('notif-read-all').addEventListener('click', (e) => {
    e.stopPropagation();
    markAllRead();
  });

  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsDropdown = document.getElementById('settings-dropdown');

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.hidden = true;
    notifDropdown.hidden = !notifDropdown.hidden;
  });
  // Los clicks dentro del dropdown no deben cerrarlo (el cierre es por el
  // boton o por clicks fuera); sin esto, "Resueltas" se abria y cerraba
  // en el mismo click.
  notifDropdown.addEventListener('click', (e) => e.stopPropagation());
  // Mismo trato para el de Configuracion: sin esto, cualquier click dentro
  // (input de imagen, slider, presets) lo cerraba en el mismo click.
  settingsDropdown.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => { notifDropdown.hidden = true; settingsDropdown.hidden = true; });

  /* ------------------------------- gotify ------------------------------- */

  let filterApp = 'all';
  let priorityFilter = 'all';
  let searchText = '';
  let gotifyMetrics = null;
  let lastUpdated = 0;
  let msgLimit = 30;
  const MSG_STEP = 30;
  const expandedMsgs = new Set();

  function levelOf(p) { return p >= 8 ? 'critical' : p >= 5 ? 'warning' : 'info'; }

  function priorityBadge(p) {
    const lv = levelOf(p);
    const label = lv === 'critical' ? t('priorityCriticalBadge') : lv === 'warning' ? t('priorityWarningBadge') : t('priorityInfoBadge');
    return el('span', 'prio ' + lv, label);
  }

  function chipBtn(label, active, onClick) {
    const c = el('button', 'chip-chip' + (active ? ' active' : ''), label);
    c.addEventListener('click', onClick);
    return c;
  }

  function refreshGotify() {
    if (!gotifyMetrics) return;
    msgLimit = MSG_STEP;
    renderGotifyFilter(gotifyMetrics);
    renderGotifyMessages(gotifyMetrics);
  }

  function formatAppName(name) {
    const clean = String(name ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  document.getElementById('gotify-priority-level').addEventListener('change', (e) => {
    priorityFilter = e.target.value;
    refreshGotify();
  });

  function renderGotifyFilter(metrics) {
    const box = document.getElementById('gotify-filter');
    // Si la app seleccionada ya no existe en Gotify, volvemos a "Todas" en
    // vez de quedar filtrando algo que no se ve (filtro fantasma).
    if (filterApp !== 'all' && !(metrics.apps || []).some((a) => String(a.id) === filterApp)) {
      filterApp = 'all';
    }
    box.textContent = '';
    box.appendChild(chipBtn(t('allApps'), filterApp === 'all', () => { filterApp = 'all'; refreshGotify(); }));
    for (const a of metrics.apps || []) {
      const chip = chipBtn(formatAppName(a.name) + ' · ' + a.count, filterApp === String(a.id), () => { filterApp = String(a.id); refreshGotify(); });
      if (!a.count) chip.classList.add('muted');
      box.appendChild(chip);
    }
  }

  function renderGotifyMessages(metrics) {
    const box = document.getElementById('gotify-msgs');
    const empty = document.getElementById('gotify-empty');
    box.textContent = '';

    let msgs = metrics?.messages || [];
    if (filterApp !== 'all') msgs = msgs.filter((m) => String(m.appId) === filterApp);
    if (priorityFilter !== 'all') msgs = msgs.filter((m) => levelOf(m.priority) === priorityFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      msgs = msgs.filter((m) => (m.title + ' ' + m.message).toLowerCase().includes(q));
    }

    if (!msgs.length) { empty.hidden = false; box.hidden = true; document.getElementById('gotify-wrap').hidden = false; return; }
    empty.hidden = true;
    box.hidden = false;

    const shown = msgs.slice(0, msgLimit);
    for (const m of shown) {
      const row = el('div', 'msg');
      const body = el('div', 'msg-body');
      const top = el('div', 'msg-top');
      top.appendChild(el('span', 'msg-app', formatAppName(m.appName)));
      top.appendChild(el('span', 'msg-time', timeAgo(m.date)));
      body.appendChild(top);
      const titleLine = el('div', 'msg-title');
      titleLine.appendChild(priorityBadge(m.priority));
      titleLine.appendChild(el('span', 'msg-title-text', m.title || t('noTitleMessage')));
      body.appendChild(titleLine);
      if (m.message) {
        const long = m.message.length > 180;
        const isExpanded = expandedMsgs.has(m.id);
        const txt = el('div', 'msg-text' + (long && !isExpanded ? ' collapsed' : ''), m.message);
        body.appendChild(txt);
        if (long) {
          const toggle = el('button', 'msg-toggle', isExpanded ? t('showLess') : t('showMore'));
          toggle.addEventListener('click', () => {
            const collapsed = txt.classList.toggle('collapsed');
            if (collapsed) expandedMsgs.delete(m.id); else expandedMsgs.add(m.id);
            toggle.textContent = collapsed ? t('showMore') : t('showLess');
          });
          body.appendChild(toggle);
        }
      }
      row.appendChild(body);
      box.appendChild(row);
    }
    if (msgs.length > shown.length) {
      const more = el('button', 'msg-toggle', t('loadMore', { count: msgs.length - shown.length }));
      more.addEventListener('click', () => { msgLimit += MSG_STEP; renderGotifyMessages(gotifyMetrics); });
      box.appendChild(more);
    }
    document.getElementById('gotify-wrap').hidden = false;
  }

  /* ------------------------- honestidad: caducidad y conexion ------------------------- */

  // Un servicio que deja de responder conserva sus ultimas metricas buenas
  // en el backend (con metricsStaleSince); aqui las apagamos y lo decimos,
  // en vez de pintar datos viejos como si estuvieran en vivo.
  function markStale(wrapId, svc) {
    const wrap = document.getElementById(wrapId);
    const head = wrap && wrap.querySelector('.section-head');
    if (!head) return;
    let note = head.querySelector('.stale-note');
    if (!note) {
      note = el('span', 'stale-note');
      note.hidden = true;
      head.appendChild(note);
    }
    if (svc && svc.metricsStaleSince) {
      wrap.classList.add('stale');
      note.textContent = t('staleSince', { time: timeAgo(svc.metricsStaleSince) });
      note.hidden = false;
    } else {
      wrap.classList.remove('stale');
      note.hidden = true;
    }
  }

  let sseState = 'live';
  const FRESHNESS_STALE_MS = 30000;

  function setLive(state) {
    if (sseState === state) return;
    sseState = state;
    const indicator = document.getElementById('live-indicator');
    if (!indicator) return;
    indicator.classList.toggle('reconnecting', state === 'reconnecting');
    indicator.classList.toggle('offline', state === 'offline');
    const label = indicator.querySelector('.live-text');
    if (label) {
      label.textContent = state === 'live' ? t('live')
        : state === 'reconnecting' ? t('reconnecting')
        : t('offline');
    }
  }

  // "En vivo" solo es honesto si ademas miramos la antiguedad del ultimo dato.
  function updateFreshness() {
    if (!lastUpdated) return;
    const stale = Date.now() - lastUpdated > FRESHNESS_STALE_MS;
    const target = document.getElementById('last-update');
    if (target) {
      target.classList.toggle('stale', stale);
      target.textContent = t('updatedAgo', { time: timeAgo(lastUpdated) }) + (stale ? t('offlineSince') : '');
    }
    if (stale) setLive('offline');
  }

  /* ------------------------------- render ------------------------------- */

  let beszelUrl = null;

  function render(summary) {
    lastSummary = summary;
    document.getElementById('loading').hidden = true;
    document.getElementById('error').hidden = true;

    const status = summary.overallStatus || 'unknown';
    const pill = document.getElementById('status');
    pill.className = 'pill ' + status;
    document.getElementById('status-text').textContent = STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : status;

    const heroStatus = document.getElementById('hero-status');
    heroStatus.className = 'hero-status ' + status;
    heroStatus.textContent = STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : status;

    lastUpdated = summary.generatedAt || Date.now();

    renderHero(summary);
    const beszelSvc = byId(summary.services, 'beszel');
    if (beszelSvc?.metrics) renderBeszel(beszelSvc.metrics);
    markStale('beszel-wrap', beszelSvc);
    const kumaSvc = byId(summary.services, 'uptimekuma');
    if (kumaSvc?.metrics) renderKuma(kumaSvc.metrics);
    markStale('kuma-wrap', kumaSvc);
    renderAlerts(summary.alerts || [], summary.resolvedAlerts || []);

    const gotifySvc = byId(summary.services, 'gotify');
    gotifyMetrics = gotifySvc?.metrics || null;
    if (gotifyMetrics) { renderGotifyFilter(gotifyMetrics); renderGotifyMessages(gotifyMetrics); }
    markStale('gotify-wrap', gotifySvc);

    renderServiceAlerts(summary.services || []);
    updateFreshness();
  }

  // El usuario puede descartar el banner; no vuelve a aparecer hasta que se
  // recuperen los servicios y vuelvan a caer (asi no parpadea cada segundo).
  let svcBannerDismissed = false;

  function renderServiceAlerts(services) {
    const banner = document.getElementById('svc-alert-banner');
    const text = document.getElementById('svc-alert-text');
    const criticalServices = ['beszel', 'uptimekuma'];
    const down = services.filter((s) => criticalServices.includes(s.id) && (s.status === 'unknown' || s.status === 'down'));
    if (!down.length) {
      svcBannerDismissed = false;
      banner.hidden = true;
      document.body.classList.remove('svc-alert-visible');
      return;
    }
    if (svcBannerDismissed) {
      banner.hidden = true;
      document.body.classList.remove('svc-alert-visible');
      return;
    }
    const names = down.map((s) => s.name).join(', ');
    text.textContent = t(down.length === 1 ? 'oneServiceDown' : 'manyServicesDown', { names });
    banner.hidden = false;
    document.body.classList.add('svc-alert-visible');
  }

  document.getElementById('svc-alert-close').addEventListener('click', () => {
    svcBannerDismissed = true;
    document.getElementById('svc-alert-banner').hidden = true;
    document.body.classList.remove('svc-alert-visible');
  });

  function showError(err) {
    document.getElementById('loading').hidden = true;
    const e = document.getElementById('error');
    e.hidden = false;
    e.textContent = t('loadError', { error: err && err.message ? err.message : err });
  }

  function fetchOnce() {
    fetch('/api/summary').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(render).catch(showError);
  }

  function connectLive() {
    if (typeof EventSource === 'undefined') { fetchOnce(); return; }
    let retryMs = 1000;
    const maxRetry = 30000;
    function open() {
      const es = new EventSource('/api/stream');
      es.onopen = () => { retryMs = 1000; setLive('live'); };
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          console.log('[SSE]', new Date().toLocaleTimeString(), 'genAt=' + d.generatedAt, 'status=' + d.overallStatus);
          render(d);
        } catch (err) { console.error('[SSE] parse error:', err); }
      };
      es.onerror = () => {
        es.close();
        setLive('reconnecting');
        setTimeout(open, retryMs);
        retryMs = Math.min(retryMs * 2, maxRetry);
      };
    }
    open();
  }

  document.getElementById('gotify-search').addEventListener('input', (e) => {
    searchText = e.target.value.trim();
    // Solo re-renderizamos los mensajes: escribir no debe reiniciar el
    // limite de "Cargar más" (eso lo hace refreshGotify al cambiar de filtro).
    if (gotifyMetrics) renderGotifyMessages(gotifyMetrics);
  });

  // Actualiza "Actualizado hace Xs" cada segundo y detecta si los datos se
  // quedan viejos (SSE caido): feedback honesto de "en vivo".
  setInterval(updateFreshness, 1000);

  const gotifyResize = document.getElementById('gotify-resize');
  const gotifyResizeBottom = document.getElementById('gotify-resize-bottom');
  const gotifyWrap = document.getElementById('gotify-wrap');
  const savedWidth = localStorage.getItem('gotify-width');
  const savedHeight = localStorage.getItem('gotify-height');
  if (savedWidth) gotifyWrap.style.width = savedWidth + 'px';
  if (savedHeight) gotifyWrap.style.height = savedHeight + 'px';

  let dragging = false, startX = 0, startW = 0;
  let draggingV = false, startY = 0, startH = 0;
  gotifyResize.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    startW = gotifyWrap.offsetWidth;
    gotifyResize.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  gotifyResizeBottom.addEventListener('mousedown', (e) => {
    e.preventDefault();
    draggingV = true;
    startY = e.clientY;
    startH = gotifyWrap.offsetHeight;
    gotifyResizeBottom.classList.add('dragging');
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (dragging) {
      const w = Math.max(200, Math.min(800, startW - (e.clientX - startX)));
      gotifyWrap.style.width = w + 'px';
    }
    if (draggingV) {
      const h = Math.max(150, Math.min(window.innerHeight - 100, startH + (e.clientY - startY)));
      gotifyWrap.style.height = h + 'px';
    }
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      gotifyResize.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('gotify-width', gotifyWrap.offsetWidth);
    }
    if (draggingV) {
      draggingV = false;
      gotifyResizeBottom.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('gotify-height', gotifyWrap.offsetHeight);
    }
  });

  connectLive();
  setInterval(fetchOnce, 60000);

  document.addEventListener('click', () => {
    document.querySelectorAll('.monitor-menu').forEach((m) => { m.hidden = true; });
  });

  fetch('/api/health').then((r) => r.json()).then((h) => {
    if (h && h.version) {
      const v = document.getElementById('app-version');
      if (v) v.textContent = h.version;
    }
  }).catch(() => { /* sin version: se queda vacio */ });

  fetch('/api/config').then((r) => r.json()).then((cfg) => {
    beszelUrl = cfg.beszelUrl || null;
    const bgUrl = cfg.bgImage || localStorage.getItem('bg-image');
    if (bgUrl) {
      document.documentElement.style.setProperty('--bg-image', `url("${bgUrl}")`);
      document.body.classList.remove('no-bg-image');
    } else {
      document.body.classList.add('no-bg-image');
    }
    const bgInput = document.getElementById('bg-input');
    if (cfg.bgImage) bgInput.value = cfg.bgImage;
    const blurVal = localStorage.getItem('bg-blur') || cfg.bgBlur || 20;
    document.documentElement.style.setProperty('--bg-blur', blurVal + 'px');
    const blurSlider = document.getElementById('bg-blur');
    const blurValue = document.getElementById('blur-value');
    blurSlider.value = blurVal;
    blurValue.textContent = blurVal + 'px';
    if (cfg.bgPresets && cfg.bgPresets.length) renderBgPresets(cfg.bgPresets);
  }).catch(() => { document.body.classList.add('no-bg-image'); });

  const bgInput = document.getElementById('bg-input');
  const savedBg = localStorage.getItem('bg-image');
  if (savedBg) bgInput.value = savedBg;

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.hidden = !settingsDropdown.hidden;
    notifDropdown.hidden = true;
  });

  document.getElementById('bg-apply').addEventListener('click', () => {
    const url = bgInput.value.trim();
    if (!url) return;
    localStorage.setItem('bg-image', url);
    fetch('/api/config/bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bgImage: url }) });
    document.documentElement.style.setProperty('--bg-image', `url("${url}")`);
    document.body.classList.remove('no-bg-image');
  });

  document.getElementById('bg-clear').addEventListener('click', () => {
    localStorage.removeItem('bg-image');
    bgInput.value = '';
    fetch('/api/config/bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bgImage: null }) });
    fetch('/api/config').then((r) => r.json()).then((cfg) => {
      if (cfg.bgImage) {
        document.documentElement.style.setProperty('--bg-image', `url("${cfg.bgImage}")`);
      } else {
        document.body.classList.add('no-bg-image');
        document.documentElement.style.removeProperty('--bg-image');
      }
    }).catch(() => {
      document.body.classList.add('no-bg-image');
      document.documentElement.style.removeProperty('--bg-image');
    });
  });

  document.getElementById('bg-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      localStorage.setItem('bg-image', dataUrl);
      fetch('/api/config/bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bgImage: dataUrl }) });
      document.documentElement.style.setProperty('--bg-image', `url("${dataUrl}")`);
      document.body.classList.remove('no-bg-image');
      bgInput.value = dataUrl;
    };
    reader.readAsDataURL(file);
  });

  const blurSlider = document.getElementById('bg-blur');
  blurSlider.addEventListener('input', () => {
    const v = blurSlider.value;
    document.getElementById('blur-value').textContent = v + 'px';
    document.documentElement.style.setProperty('--bg-blur', v + 'px');
    localStorage.setItem('bg-blur', v);
    fetch('/api/config/bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bgBlur: Number(v) }) });
  });

  /* ------------------------------- background presets ------------------------------- */

  let bgPresets = [];

  function renderBgPresets(presets) {
    bgPresets = presets || [];
    const box = document.getElementById('bg-presets');
    if (!box) return;
    box.textContent = '';
    if (!bgPresets.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    for (let i = 0; i < bgPresets.length; i++) {
      const p = bgPresets[i];
      const item = el('div', 'bg-preset');
      const thumb = el('div', 'bg-preset-thumb');
      thumb.style.backgroundImage = 'url("' + p.url + '")';
      item.appendChild(thumb);
      item.appendChild(el('span', 'bg-preset-name', p.name));
      const rm = el('button', 'bg-preset-rm', '×');
      rm.addEventListener('click', (ev) => {
        ev.stopPropagation();
        bgPresets.splice(i, 1);
        saveBgPresets();
        renderBgPresets(bgPresets);
      });
      item.appendChild(rm);
      item.addEventListener('click', () => {
        localStorage.setItem('bg-image', p.url);
        fetch('/api/config/bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bgImage: p.url }) });
        document.documentElement.style.setProperty('--bg-image', 'url("' + p.url + '")');
        document.body.classList.remove('no-bg-image');
        document.getElementById('bg-input').value = p.url;
      });
      box.appendChild(item);
    }
  }

  function saveBgPresets() {
    fetch('/api/config/bg', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bgPresets }),
    }).catch(() => {});
  }

  document.getElementById('bg-save-preset').addEventListener('click', () => {
    const url = document.getElementById('bg-input').value.trim();
    if (!url) return;
    const name = prompt(t('backgroundPrompt'), t('backgroundName', { count: bgPresets.length + 1 }));
    if (!name) return;
    bgPresets.push({ name, url });
    saveBgPresets();
    renderBgPresets(bgPresets);
  });

  let monitorUrlsData = {};
  const cfgPopup = el('div', 'monitor-cfg-popup');
  cfgPopup.hidden = true;
  document.body.appendChild(cfgPopup);

  function renderCfgPopup(name) {
    cfgPopup.textContent = '';
    const urls = monitorUrlsData[name] || [];
    const entries = el('div', 'cfg-entries');
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      const row = el('div', 'cfg-entry');
      const label = el('input', 'cfg-input cfg-label');
      label.type = 'text'; label.value = u.label || ''; label.placeholder = t('label');
      const url = el('input', 'cfg-input cfg-url');
      url.type = 'text'; url.value = u.url || ''; url.placeholder = 'https://...';
      const rm = el('button', 'cfg-rm', '×');
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        urls.splice(i, 1);
        row.remove();
      });
      row.appendChild(label); row.appendChild(url); row.appendChild(rm);
      entries.appendChild(row);
    }
    cfgPopup.appendChild(entries);
    const addBtn = el('button', 'cfg-add', t('add'));
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!monitorUrlsData[name]) monitorUrlsData[name] = [];
      monitorUrlsData[name].push({ label: '', url: '' });
      renderCfgPopup(name);
    });
    cfgPopup.appendChild(addBtn);
    const saveBtn = el('button', 'cfg-save', t('save'));
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newUrls = [];
      entries.querySelectorAll('.cfg-entry').forEach((row2) => {
        const l = row2.querySelector('.cfg-label').value.trim();
        const u2 = row2.querySelector('.cfg-url').value.trim();
        if (u2) newUrls.push({ label: l || t('open'), url: u2 });
      });
      if (newUrls.length) monitorUrlsData[name] = newUrls; else delete monitorUrlsData[name];
      fetch('/api/monitor-urls', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: monitorUrlsData }),
      }).then(() => {
        cfgPopup.hidden = true;
      }).catch(() => {});
    });
    cfgPopup.appendChild(saveBtn);
  }

  function openCfgPopup(name, anchor) {
    document.querySelectorAll('.monitor-menu').forEach((m2) => { m2.hidden = true; });
    cfgPopup.hidden = true;
    renderCfgPopup(name);
    const row = anchor.closest('.monitor');
    const rect = row ? row.getBoundingClientRect() : anchor.getBoundingClientRect();
    cfgPopup.style.position = 'fixed';
    cfgPopup.style.top = rect.top + 'px';
    cfgPopup.style.left = rect.left + (rect.width / 2) - 140 + 'px';
    cfgPopup.hidden = false;
  }

  document.addEventListener('click', (e) => {
    if (cfgPopup.hidden) return;
    if (e.target.closest('.monitor-cfg-popup') || e.target.closest('.monitor-cfg')) return;
    cfgPopup.hidden = true;
  });

  fetch('/api/monitor-urls').then((r) => r.json()).then((data) => {
    monitorUrlsData = data.urls || {};
  }).catch(() => {});

  let bookmarks = [];
  const bookmarksList = document.getElementById('bookmarks-list');
  const bookmarkAddBtn = document.getElementById('bookmark-add');

  function renderBookmarks() {
    bookmarksList.textContent = '';
    for (let i = 0; i < bookmarks.length; i++) {
      const b = bookmarks[i];
      const row = el('div', 'bookmark-item');
      const ico = el('span', 'bookmark-ico');
      if (b.icon && (b.icon.startsWith('data:') || b.icon.startsWith('http'))) {
        const img = document.createElement('img');
        img.src = b.icon; img.style.cssText = 'width:100%;height:100%;border-radius:6px;object-fit:contain;';
        img.onerror = () => { img.style.display = 'none'; };
        ico.appendChild(img);
      } else if (b.icon) {
        ico.textContent = b.icon;
      } else {
        ico.textContent = (b.title || b.url || '?').slice(0, 2).toUpperCase();
      }
      row.appendChild(ico);
      const info = el('div', 'bookmark-info');
      info.appendChild(el('span', 'bookmark-title', b.title || b.url));
      if (b.url) info.appendChild(el('span', 'bookmark-url', b.url.replace(/^https?:\/\//, '').replace(/\/$/, '')));
      row.appendChild(info);
      const rm = el('button', 'bookmark-rm', '×');
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        bookmarks.splice(i, 1);
        saveBookmarks();
        renderBookmarks();
      });
      row.appendChild(rm);
      if (b.url) {
        row.style.cursor = 'pointer';
        activatable(row, () => { window.open(b.url, '_blank', 'noopener'); });
      }
      bookmarksList.appendChild(row);
    }
  }

  function saveBookmarks() {
    fetch('/api/bookmarks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarks }),
    }).catch(() => {});
  }

  bookmarkAddBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.bookmark-popup').forEach((p) => p.remove());
    const popup = el('div', 'bookmark-popup');

    const EMOJIS = ['🖥️','📁','🔧','🌐','📡','🏠','💾','🔐','📧','🎬','🎵','📷','🎮','📊','🛠️','🚀','☁️','🔑','📦','🗂️','🍎','🐧','🪟','📱','🤖','👾','🎯','🧠','💡','🔒','🗑️','📝','🔍','⚙️','🧩','🎮','🎲','🏆','🎶','📸','🎨','🏗️','🗄️','🔌','📻','📺','📠','📟','🤖','⚙️','🧰','🧲','🔬','🔭','🧪','🧫','🌡️','⏱️','🕰️','📅','📊','📈','📉','🗂️','📋','📌','📎','✂️','🖋️','🖊️','🖋️','🖍️','📝','💼','📂','🗂️','🗓️','📇','🗃️','🗄️','📒','📕','📖','📗','📘','📙','📚','📓','📔','📰','🗞️','📑','🔖','🏷️'];
    const SVC_ICONS = ['n8n','nextcloud','vaultwarden','beszel','portainer','upsnap','gotify','nginx-proxy-manager','deluge','downtify','jellyfin','prowlarr','radarr','sonarr','plex','emby','home-assistant','pihole','traefik','syncthing','filebrowser','flaresolverr','proxmox','qbittorrent','transmission','gitea','grafana','influxdb','mosquitto','node-red','prometheus','zabbix','wireguard','unifi','opnsense','pfsense','adguard','duckdns','cloudflare','ansible','docker','linux','windows','apple','uptime-kuma','uptimekuma','paperless','immich','mealie','authentik','crowdsec','dozzle','homepage','glance','homarr','dashy','organizr'];
    const ICON_CDN = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png';
    let selectedIcon = '';
    const INITIAL_COUNT = 24;

    const emojiLabel = el('div', 'icon-section-label', t('emojis'));
    popup.appendChild(emojiLabel);
    const emojiSearch = el('input', 'cfg-input svc-search');
    emojiSearch.type = 'text'; emojiSearch.placeholder = t('searchEmoji');
    popup.appendChild(emojiSearch);
    const emojiGrid = el('div', 'emoji-grid');
    popup.appendChild(emojiGrid);
    let emojiShowAll = false;
    let emojiMoreBtn = null;
    const filteredEmojis = () => {
      const q = emojiSearch.value.toLowerCase().trim();
      const list = q ? EMOJIS.filter((e) => e.includes(q)) : EMOJIS;
      return emojiShowAll ? list : list.slice(0, INITIAL_COUNT);
    };
    const renderEmojis = () => {
      emojiGrid.innerHTML = '';
      for (const em of filteredEmojis()) {
        const btn = el('button', 'emoji-btn', em);
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          popup.querySelectorAll('.emoji-btn, .svc-icon-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          selectedIcon = em;
          iconPreview.textContent = em;
        });
        emojiGrid.appendChild(btn);
      }
      if (emojiMoreBtn) { emojiMoreBtn.remove(); emojiMoreBtn = null; }
      const q = emojiSearch.value.toLowerCase().trim();
      const total = q ? EMOJIS.filter((e) => e.includes(q)).length : EMOJIS.length;
      if (total > INITIAL_COUNT) {
        const label = emojiShowAll ? t('showLess') : `${t('showMore')} (${total - INITIAL_COUNT})`;
        emojiMoreBtn = el('button', 'show-more-btn', label);
        emojiGrid.parentElement.insertBefore(emojiMoreBtn, emojiGrid.nextSibling);
        emojiMoreBtn.addEventListener('click', (ev) => { ev.stopPropagation(); emojiShowAll = !emojiShowAll; renderEmojis(); renderServices(); });
      }
    };
    renderEmojis();
    emojiSearch.addEventListener('input', () => { emojiShowAll = false; renderEmojis(); });

    const svcLabel = el('div', 'icon-section-label', t('services'));
    popup.appendChild(svcLabel);
    const svcSearch = el('input', 'cfg-input svc-search');
    svcSearch.type = 'text'; svcSearch.placeholder = t('searchService');
    popup.appendChild(svcSearch);
    const svcGrid = el('div', 'emoji-grid');
    popup.appendChild(svcGrid);
    let svcShowAll = false;
    let svcMoreBtn = null;
    const filteredSvcs = () => {
      const q = svcSearch.value.toLowerCase().trim();
      const list = q ? SVC_ICONS.filter((s) => s.includes(q)) : SVC_ICONS;
      return svcShowAll ? list : list.slice(0, INITIAL_COUNT);
    };
    const renderServices = () => {
      svcGrid.innerHTML = '';
      for (const slug of filteredSvcs()) {
        const btn = el('button', 'svc-icon-btn');
        btn.dataset.slug = slug;
        const img = document.createElement('img');
        img.src = `${ICON_CDN}/${slug}.png`;
        img.alt = slug;
        img.onerror = () => { img.style.display = 'none'; };
        btn.appendChild(img);
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          popup.querySelectorAll('.emoji-btn, .svc-icon-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          selectedIcon = `${ICON_CDN}/${slug}.png`;
          iconPreview.textContent = '';
          const prev = document.createElement('img');
          prev.src = selectedIcon; prev.style.cssText = 'width:24px;height:24px;border-radius:4px;object-fit:contain;';
          prev.onerror = () => { prev.style.display = 'none'; };
          iconPreview.appendChild(prev);
        });
        svcGrid.appendChild(btn);
      }
      if (svcMoreBtn) { svcMoreBtn.remove(); svcMoreBtn = null; }
      const q = svcSearch.value.toLowerCase().trim();
      const total = q ? SVC_ICONS.filter((s) => s.includes(q)).length : SVC_ICONS.length;
      if (total > INITIAL_COUNT) {
        const label = svcShowAll ? t('showLess') : `${t('showMore')} (${total - INITIAL_COUNT})`;
        svcMoreBtn = el('button', 'show-more-btn', label);
        svcGrid.parentElement.insertBefore(svcMoreBtn, svcGrid.nextSibling);
        svcMoreBtn.addEventListener('click', (ev) => { ev.stopPropagation(); svcShowAll = !svcShowAll; renderEmojis(); renderServices(); });
      }
    };
    renderServices();
    svcSearch.addEventListener('input', () => { svcShowAll = false; renderServices(); });

    const iconPreview = el('div', 'icon-preview');
    iconPreview.textContent = t('noIcon');
    popup.appendChild(iconPreview);

    const fileLabel = el('label', 'cfg-upload');
    fileLabel.textContent = t('uploadPng');
    const fileInput = el('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.hidden = true;
    fileInput.addEventListener('change', (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        selectedIcon = reader.result;
        iconPreview.textContent = '';
        const img = document.createElement('img');
        img.src = selectedIcon; img.style.cssText = 'width:24px;height:24px;border-radius:4px;object-fit:cover;';
        iconPreview.appendChild(img);
        popup.querySelectorAll('.emoji-btn, .svc-icon-btn').forEach((b) => b.classList.remove('active'));
      };
      reader.readAsDataURL(file);
    });
    fileLabel.appendChild(fileInput);
    popup.appendChild(fileLabel);

    const titleInput = el('input', 'cfg-input');
    titleInput.type = 'text'; titleInput.placeholder = 'Titulo';
    popup.appendChild(titleInput);

    const urlInput = el('input', 'cfg-input');
    urlInput.type = 'text'; urlInput.placeholder = 'https://...';
    popup.appendChild(urlInput);

    const actions = el('div', 'bookmark-popup-actions');
    const cancelBtn = el('button', 'cfg-rm', t('cancel'));
    cancelBtn.addEventListener('click', (ev) => { ev.stopPropagation(); popup.remove(); document.removeEventListener('click', closePopup); });
    const saveBtn = el('button', 'cfg-save', t('save'));
    saveBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const t = titleInput.value.trim();
      const u = urlInput.value.trim();
      if (!t && !u) return;
      bookmarks.push({ title: t, url: u, icon: selectedIcon || undefined });
      saveBookmarks();
      renderBookmarks();
      popup.remove();
      document.removeEventListener('click', closePopup);
    });
    actions.appendChild(cancelBtn); actions.appendChild(saveBtn);
    popup.appendChild(actions);

    const rect = bookmarkAddBtn.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = rect.bottom + 4 + 'px';
    popup.style.left = Math.min(rect.left, window.innerWidth - 260) + 'px';
    document.body.appendChild(popup);

    const closePopup = (ev) => {
      if (!popup.contains(ev.target) && ev.target !== bookmarkAddBtn) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    };
    setTimeout(() => document.addEventListener('click', closePopup), 0);

    titleInput.focus();
  });

  fetch('/api/bookmarks').then((r) => r.json()).then((data) => {
    bookmarks = data.bookmarks || [];
    renderBookmarks();
  }).catch(() => {});
})();
