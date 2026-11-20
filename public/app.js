(function () {
  'use strict';

  const ICON_NAMES = ['edit', 'server', 'info', 'warning', 'critical', 'check', 'checkDouble', 'undo', 'bell', 'upload', 'gear'];
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const $ = (id) => document.getElementById(id);

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
      uptime24: '24 h: {value}%', ping: '{value} ms', statusUp: 'Activo', statusDown: 'Caído',
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
      openNamed: 'Abrir {name}', openMany: 'Abrir {name} (varios enlaces)', configureLinks: 'Configurar enlaces de {name}',
      unreadCount: 'Notificaciones, {count} sin leer', removeNamed: 'Quitar {name}', removeLink: 'Quitar enlace', usePreset: 'Usar fondo {name}',
      removePreset: 'Quitar preset {name}', monitorLinks: 'Enlaces del monitor', linkLabel: 'Etiqueta del enlace', linkUrl: 'URL del enlace',
      accept: 'Aceptar', delete: 'Borrar', iconService: 'Icono de servicio', searchIcon: 'Buscar icono de servicio', uploadImage: 'Subir imagen',
      closeDetail: 'Cerrar detalle', closeNotice: 'Cerrar aviso', resizeWidth: 'Cambiar el ancho del panel de Gotify', resizeHeight: 'Cambiar el alto del panel de Gotify',
      searchMessages: 'Buscar mensajes', summary: 'Resumen',
      editLink: 'Editar enlace', editNamed: 'Editar {name}', clearIcon: 'Quitar icono',
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
      uptime24: '24h: {value}%', ping: '{value} ms', statusUp: 'Up', statusDown: 'Down',
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
      openNamed: 'Open {name}', openMany: 'Open {name} (several links)', configureLinks: 'Configure links for {name}',
      unreadCount: 'Notifications, {count} unread', removeNamed: 'Remove {name}', removeLink: 'Remove link', usePreset: 'Use background {name}',
      removePreset: 'Remove preset {name}', monitorLinks: 'Monitor links', linkLabel: 'Link label', linkUrl: 'Link URL',
      accept: 'OK', delete: 'Delete', iconService: 'Service icon', searchIcon: 'Search service icon', uploadImage: 'Upload image',
      closeDetail: 'Close details', closeNotice: 'Dismiss notice', resizeWidth: 'Resize the Gotify panel width', resizeHeight: 'Resize the Gotify panel height',
      searchMessages: 'Search messages', summary: 'Summary',
      editLink: 'Edit link', editNamed: 'Edit {name}', clearIcon: 'Remove icon',
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

  /* ------------------------------- helpers ------------------------------- */

  function svgIcon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + (ICON_NAMES.includes(name) ? name : 'info'));
    svg.appendChild(use);
    return svg;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (tag === 'button') n.type = 'button';
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function setText(node, text) {
    const t = String(text ?? '');
    if (node.textContent !== t) node.textContent = t;
  }

  function setClass(node, cls) {
    if (node.className !== cls) node.className = cls;
  }

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* cuota o modo privado: la preferencia no se recuerda */ }
  }
  function lsRemove(key) {
    try { localStorage.removeItem(key); } catch { /* sin almacenamiento */ }
  }

  // Solo http(s): cualquier otro esquema (javascript:, data:...) no se abre.
  function safeHttpUrl(u) {
    if (typeof u !== 'string') return null;
    const v = u.trim();
    try {
      const p = new URL(v);
      return p.protocol === 'http:' || p.protocol === 'https:' ? v : null;
    } catch { return null; }
  }

  function safeImageUrl(u) {
    if (typeof u !== 'string') return null;
    const v = u.trim();
    if (/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i.test(v)) return v;
    return safeHttpUrl(v);
  }

  function cssUrl(u) {
    const esc = u.replace(/["\\\n\r]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
    return 'url("' + esc + '")';
  }

  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function warn(what) {
    return (err) => console.warn('[' + what + ']', err);
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

  function formatAppName(name) {
    const clean = String(name ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Reconciliacion por clave: el DOM existente se reutiliza y solo se
  // actualiza lo que cambia. Reconstruirlo en cada tick SSE (1 s) hacia
  // perder el foco del teclado y reiniciaba las transiciones CSS.
  // `update` puede devolver un nodo nuevo que sustituya al existente.
  function reconcile(container, items, keyOf, create, update) {
    const existing = new Map();
    for (const child of container.children) {
      if (child.dataset.key !== undefined) existing.set(child.dataset.key, child);
    }
    const seen = new Map();
    const wanted = [];
    for (const item of items) {
      const base = String(keyOf(item));
      const n = seen.get(base) || 0;
      seen.set(base, n + 1);
      const key = n ? base + '#' + n : base;
      let node = existing.get(key);
      if (node) existing.delete(key);
      else { node = create(item); node.dataset.key = key; }
      const replacement = update(node, item);
      if (replacement && replacement !== node) {
        replacement.dataset.key = key;
        node.replaceWith(replacement);
        node = replacement;
      }
      wanted.push(node);
    }
    existing.forEach((n) => n.remove());
    wanted.forEach((node, i) => {
      if (container.children[i] !== node) container.insertBefore(node, container.children[i] || null);
    });
  }

  // Un cambio de estado (cae, se recupera) es raro y importante: la tarjeta
  // lo marca una vez con un destello; la animacion vive en el CSS y solo
  // corre si el usuario no pide menos movimiento.
  function flashOnChange(node, status) {
    const prev = node._prevStatus;
    node._prevStatus = status;
    if (prev === undefined || prev === status) return;
    node.classList.remove('status-flash');
    void node.offsetWidth;
    node.classList.add('status-flash');
    node.addEventListener('animationend', () => node.classList.remove('status-flash'), { once: true });
  }

  /* ------------------------------- dialogs ------------------------------- */

  function isDialogOpen(d) { return d.hasAttribute('open'); }
  function openDialog(d) {
    if (isDialogOpen(d)) return;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDialog(d) {
    if (!isDialogOpen(d)) return;
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  const askDialog = $('ask-dialog');
  const askForm = $('ask-form');
  const askMessage = $('ask-message');
  const askInput = $('ask-input');
  let askResolve = null;

  function ask(opts) {
    return new Promise((resolve) => {
      if (askResolve) askResolve(askInput.hidden ? false : null);
      askResolve = resolve;
      setText(askMessage, opts.message);
      askInput.hidden = !opts.input;
      askInput.value = opts.value || '';
      setText($('ask-ok'), opts.okLabel || t('accept'));
      openDialog(askDialog);
      (opts.input ? askInput : $('ask-ok')).focus();
    });
  }

  function finishAsk(accepted) {
    const resolve = askResolve;
    if (!resolve) return;
    askResolve = null;
    const isText = !askInput.hidden;
    closeDialog(askDialog);
    if (isText) resolve(accepted ? (askInput.value.trim() || null) : null);
    else resolve(accepted);
  }

  askForm.addEventListener('submit', (e) => { e.preventDefault(); finishAsk(true); });
  $('ask-cancel').addEventListener('click', () => finishAsk(false));
  askDialog.addEventListener('cancel', (e) => { e.preventDefault(); finishAsk(false); });
  askDialog.addEventListener('click', (e) => { if (e.target === askDialog) finishAsk(false); });

  /* ------------------------------- hero stats ------------------------------- */

  function renderHero(summary) {
    const box = $('overview');
    const stats = [];

    const beszel = byId(summary.services, 'beszel')?.metrics;
    if (beszel) {
      const nodes = beszel.systems || [];
      const down = nodes.filter((n) => n.status === 'down').length;
      const active = nodes.filter((n) => n.status !== 'down');
      const avgCpu = active.length ? active.reduce((s, n) => s + (n.cpu ?? 0), 0) / active.length : 0;
      const avgMem = active.length ? active.reduce((s, n) => s + (n.mem ?? 0), 0) / active.length : 0;
      stats.push({ label: t('statSystems'), value: (nodes.length - down) + '/' + nodes.length, tone: down ? 'crit' : 'ok' });
      stats.push({ label: t('statCpu'), value: fmt(avgCpu, '%'), tone: tone(avgCpu) });
      stats.push({ label: t('statRam'), value: fmt(avgMem, '%'), tone: tone(avgMem) });
    }
    const kuma = byId(summary.services, 'uptimekuma')?.metrics;
    if (kuma) {
      const mons = kuma.monitors || [];
      const down = mons.filter((m) => m.status === 'down').length;
      stats.push({ label: t('statMonitors'), value: (mons.length - down) + '/' + mons.length, tone: down ? 'crit' : 'ok' });
    }
    const gotify = byId(summary.services, 'gotify')?.metrics;
    if (gotify) {
      const crit = gotify.messages.filter((m) => m.priority >= 8).length;
      stats.push({ label: t('statMessages'), value: String(gotify.totalMessages), tone: crit ? 'crit' : 'ok' });
    }
    const alerts = summary.alerts || [];
    const unreadAl = alerts.filter((a) => a.state !== 'read');
    const critAl = unreadAl.filter((a) => a.level === 'critical').length;
    stats.push({ label: t('statAlerts'), value: String(unreadAl.length), tone: critAl ? 'crit' : unreadAl.length ? 'warn' : 'ok' });

    reconcile(box, stats, (s) => s.label, (s) => {
      const node = el('div', 'hstat');
      node._l = el('dt', 'hstat-l', s.label);
      node._v = el('dd', 'hstat-v');
      node.append(node._l, node._v);
      return node;
    }, (node, s) => {
      setClass(node, 'hstat ' + s.tone);
      setText(node._v, s.value);
    });
  }

  /* ------------------------------- beszel ------------------------------- */

  function createMetric(m) {
    const node = el('div', 'nmetric');
    node._l = el('span', 'nmetric-l', m.key);
    node._v = el('span', 'nmetric-v');
    node._bar = el('div', 'nbar');
    node._bar.setAttribute('role', 'meter');
    node._bar.setAttribute('aria-label', m.key);
    node._bar.setAttribute('aria-valuemin', '0');
    node._bar.setAttribute('aria-valuemax', '100');
    node._fill = el('div', 'nbar-fill ok');
    node._bar.appendChild(node._fill);
    node.append(node._l, node._v, node._bar);
    return node;
  }

  function updateMetric(node, m) {
    setText(node._v, m.value);
    const pct = Math.max(0, Math.min(100, m.pct));
    node._fill.style.width = pct + '%';
    setClass(node._fill, 'nbar-fill ' + m.tone);
    node._bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function createNode() {
    const node = el('a', 'node');
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
    const top = el('div', 'node-top');
    node._dot = dot('unknown');
    node._name = el('span', 'node-name');
    node._badge = el('span', 'node-badge');
    top.append(node._dot, node._name, node._badge);
    node._row = el('div', 'node-metrics');
    node.append(top, node._row);
    return node;
  }

  function updateNode(node, s) {
    flashOnChange(node, s.status);
    if (beszelUrl) node.setAttribute('href', beszelUrl); else node.removeAttribute('href');
    setClass(node._dot, 'dot ' + (s.status || 'unknown'));
    setText(node._name, s.name);
    setClass(node._badge, 'node-badge ' + (s.status || 'unknown'));
    setText(node._badge, s.status);
    const cpu = s.cpu ?? 0;
    const mem = s.mem ?? 0;
    const disk = s.disk ?? 0;
    const metrics = [
      { key: 'CPU', value: (Math.round(cpu * 10) / 10).toFixed(1), pct: cpu, tone: tone(cpu) },
      { key: 'RAM', value: (Math.round(mem * 10) / 10).toFixed(1), pct: mem, tone: tone(mem) },
      { key: 'DISK', value: (Math.round(disk * 10) / 10).toFixed(1), pct: disk, tone: tone(disk) },
    ];
    if (s.temp != null) metrics.push({ key: 'TEMP', value: Math.round(s.temp) + '°', pct: Math.min(100, s.temp), tone: tempTone(s.temp) });
    reconcile(node._row, metrics, (m) => m.key, createMetric, updateMetric);
  }

  function renderBeszel(metrics) {
    const systems = metrics?.systems || [];
    const down = systems.filter((n) => n.status === 'down').length;
    setText($('beszel-count'), t('nodeCount', { count: systems.length }) + (down ? ' · ' + t('nodesDown', { count: down }) : ''));
    reconcile($('beszel'), systems, (s) => s.name, createNode, updateNode);
    $('beszel-wrap').hidden = false;
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
    'ansible semaphore': 'ansible',
    'docker': 'docker',
    'linux': 'linux',
    'windows': 'windows',
    'macos': 'apple',
  };

  const SVC_ICONS = ['n8n', 'nextcloud', 'vaultwarden', 'beszel', 'portainer', 'upsnap', 'gotify', 'nginx-proxy-manager', 'deluge', 'downtify', 'jellyfin', 'prowlarr', 'radarr', 'sonarr', 'plex', 'emby', 'home-assistant', 'pihole', 'traefik', 'syncthing', 'filebrowser', 'flaresolverr', 'proxmox', 'qbittorrent', 'transmission', 'gitea', 'grafana', 'influxdb', 'mosquitto', 'node-red', 'prometheus', 'zabbix', 'wireguard', 'unifi', 'opnsense', 'pfsense', 'adguard', 'duckdns', 'cloudflare', 'ansible', 'docker', 'linux', 'windows', 'apple', 'uptime-kuma', 'paperless', 'immich', 'mealie', 'authentik', 'crowdsec', 'dozzle', 'homepage', 'glance', 'homarr', 'dashy', 'organizr'];

  const loadedIcons = new Set();
  const failedIcons = new Set();

  function normalizeSlug(name) {
    return (name || '').toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  function cdnImg(src, cls) {
    const img = document.createElement('img');
    if (cls) img.className = cls;
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.src = src;
    return img;
  }

  function serviceIcon(name) {
    const key = (name || '').toLowerCase().trim();
    const img = cdnImg(`${ICON_CDN}/${failedIcons.has(key) ? 'docker' : (SERVICE_LOGOS[key] || normalizeSlug(name))}.png`, 'service-icon');
    img.loading = 'lazy';
    if (failedIcons.has(key) || loadedIcons.has(key)) return img;
    img.onerror = () => {
      if (!failedIcons.has(key)) {
        failedIcons.add(key);
        img.src = `${ICON_CDN}/docker.png`;
      }
    };
    img.onload = () => { loadedIcons.add(key); };
    return img;
  }

  let monitorUrlsData = {};

  function closeMonitorMenus(except) {
    document.querySelectorAll('.monitor-menu').forEach((menu) => {
      if (menu === except) return;
      menu.hidden = true;
      const btn = menu.parentElement && menu.parentElement.querySelector('.monitor-link[aria-haspopup]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function monitorEntries(m) {
    const cur = monitorUrlsData[m.name] || [];
    const all = cur.length ? cur : (m.url ? [{ label: t('open'), url: m.url }] : []);
    return all.filter((e) => safeHttpUrl(e.url));
  }

  function openMonitorMenu(row, btn, menu) {
    const wasHidden = menu.hidden;
    closeMonitorMenus();
    if (!wasHidden) return;
    menu.replaceChildren();
    for (const entry of row._entries) {
      const item = el('a', 'monitor-menu-item', entry.label || t('open'));
      item.href = entry.url.trim();
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.setAttribute('role', 'menuitem');
      menu.appendChild(item);
    }
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const first = menu.querySelector('a');
    if (first) first.focus();
  }

  // El enlace del monitor es un <a> (una URL) o un <button> con menu
  // (varias URLs) que cubre la tarjeta; el boton de ajustes queda aparte.
  function syncMonitorLink(row, m) {
    const entries = monitorEntries(m);
    const mode = entries.length === 0 ? 'none' : entries.length === 1 ? 'one' : 'many';
    const sig = currentLanguage + mode + (mode === 'one' ? entries[0].url : '');
    row._entries = entries;
    if (row._linkSig === sig) return;
    row._linkSig = sig;
    if (row._link) row._link.remove();
    if (row._menu) row._menu.remove();
    row._link = null;
    row._menu = null;
    row.classList.toggle('has-link', mode !== 'none');
    if (mode === 'none') return;
    if (mode === 'one') {
      const a = el('a', 'monitor-link');
      a.href = entries[0].url.trim();
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', t('openNamed', { name: m.name }));
      row._link = a;
      row.prepend(a);
      return;
    }
    const btn = el('button', 'monitor-link');
    btn.setAttribute('aria-label', t('openMany', { name: m.name }));
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    const menu = el('div', 'monitor-menu');
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    btn.addEventListener('click', () => openMonitorMenu(row, btn, menu));
    row._link = btn;
    row._menu = menu;
    row.prepend(btn);
    row.appendChild(menu);
  }

  function createMonitor(m) {
    const row = el('div', 'monitor');
    row._dot = dot(m.status);
    const info = el('div', 'monitor-info');
    const nameRow = el('div', 'monitor-name-row');
    nameRow.appendChild(serviceIcon(m.name));
    nameRow.appendChild(el('span', 'monitor-name', m.name));
    info.appendChild(nameRow);
    row._uptime = el('div', 'monitor-uptime');
    row._latency = el('div', 'monitor-latency');
    info.append(row._uptime, row._latency);
    row._badge = el('span', 'monitor-badge');
    const cfgBtn = el('button', 'monitor-cfg');
    cfgBtn.setAttribute('aria-haspopup', 'dialog');
    row._cfg = cfgBtn;
    cfgBtn.appendChild(svgIcon('gear'));
    cfgBtn.addEventListener('click', () => openCfgPopup(m.name, cfgBtn));
    row.append(row._dot, info, row._badge, cfgBtn);
    row.addEventListener('focusout', (e) => {
      if (row._menu && e.relatedTarget && !row.contains(e.relatedTarget)) closeMonitorMenus();
    });
    return row;
  }

  const badgeLabel = (st) => ({ up: t('statusUpShort'), down: t('statusDownShort'), pending: t('statusPendingShort'), maintenance: t('statusMaintenanceShort') })[st] || t('statusUnknownShort');

  function updateMonitor(row, m) {
    row._m = m;
    flashOnChange(row, m.status);
    row._cfg.setAttribute('aria-label', t('configureLinks', { name: m.name }));
    setClass(row._dot, 'dot ' + m.status);
    setText(row._uptime, m.uptime24h != null ? t('uptime24', { value: m.uptime24h.toFixed(2) }) : '');
    setText(row._latency, m.latency != null ? t('ping', { value: Math.round(m.latency) }) : '');
    setText(row._badge, badgeLabel(m.status));
    setClass(row._badge, 'monitor-badge ' + (m.status || 'unknown'));
    syncMonitorLink(row, m);
  }

  function syncAllMonitorLinks() {
    document.querySelectorAll('#kuma .monitor').forEach((row) => { if (row._m) syncMonitorLink(row, row._m); });
  }

  function renderKuma(metrics) {
    const monitors = metrics?.monitors || [];
    if (!monitors.length) {
      $('kuma-wrap').hidden = true;
      return;
    }
    const down = monitors.filter((m) => m.status === 'down').length;
    setText($('kuma-count'), t('monitorCount', { count: monitors.length }) + (down ? ' · ' + t('monitorsDown', { count: down }) : ''));
    reconcile($('kuma'), monitors, (m) => m.name, createMonitor, updateMonitor);
    $('kuma-wrap').hidden = false;
  }

  /* ------------------------------- alerts ------------------------------- */

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

  /* ------------------------------- dropdowns ------------------------------- */

  const notifBtn = $('notif-btn');
  const notifDropdown = $('notif-dropdown');
  const settingsBtn = $('settings-btn');
  const settingsDropdown = $('settings-dropdown');

  function setDropdown(btn, dropdown, open) {
    dropdown.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  function closeDropdowns() {
    setDropdown(notifBtn, notifDropdown, false);
    setDropdown(settingsBtn, settingsDropdown, false);
  }

  /* ------------------------------- notif detail dialog ------------------------------- */

  const detailPopup = $('notif-detail-popup');

  function showNotifDetail(a) {
    setText($('notif-detail-title'), localizeAlertSource(a.source) + ' — ' + (a.level === 'critical' ? t('alertCritical') : a.level === 'warning' ? t('alertWarning') : t('alertInfo')));
    $('notif-detail-body').replaceChildren(
      el('div', 'detail-msg-title', localizeAlertMessage(a.message) || t('noTitle')),
      el('div', 'detail-msg-time', new Date(a.time).toLocaleString('es')),
      el('div', 'detail-msg-body', a.fullMessage || localizeAlertMessage(a.message)),
    );
    setDropdown(notifBtn, notifDropdown, false);
    openDialog(detailPopup);
  }

  function closeNotifDetail() { closeDialog(detailPopup); }

  detailPopup.addEventListener('click', (e) => {
    if (e.target.closest('.notif-detail-close') || e.target === detailPopup) closeNotifDetail();
  });
  // El detalle se abre desde el dropdown, que se cierra al abrirlo: el foco
  // vuelve al boton de notificaciones en vez de perderse en un nodo oculto.
  detailPopup.addEventListener('close', () => { notifBtn.focus(); });

  // Clicar fuera del popup (en la pagina) lo cierra; Escape tambien.
  // Se ignoran los clicks en el propio dropdown y su boton: ahi se abre.
  document.addEventListener('click', (e) => {
    if (!isDialogOpen(detailPopup)) return;
    if (e.target.closest('#notif-detail-popup, #notif-dropdown, #notif-btn')) return;
    closeNotifDetail();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeNotifDetail();
    closeMonitorMenus();
    closeCfgPopup();
    closeBookmarkPopup();
    const active = document.activeElement;
    const back = notifDropdown.contains(active) ? notifBtn : settingsDropdown.contains(active) ? settingsBtn : null;
    closeDropdowns();
    if (back) back.focus();
  });

  function actionBtn(icon, title, onClick) {
    const b = el('button', 'notif-action');
    b.title = title;
    b.setAttribute('aria-label', title);
    b.appendChild(svgIcon(icon));
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return b;
  }

  function alertSig(a, resolved) {
    return [currentLanguage, resolved ? 'r' : a.state, a.level, a.source, a.message].join('|');
  }

  // El contenido clicable (abre el detalle) y las acciones son hermanos:
  // un control interactivo no puede contener a otro.
  function buildAlertRow(a, resolved) {
    const row = el('div', 'notif-item ' + a.level + (resolved ? ' is-resolved' : a.state === 'read' ? ' is-read' : ''));
    row._sig = alertSig(a, resolved);
    row._alert = a;
    const main = el('button', 'notif-item-main');
    const ico = el('span', 'notif-item-ico');
    ico.appendChild(svgIcon(a.level === 'critical' ? 'critical' : a.level === 'warning' ? 'warning' : 'info'));
    const body = el('div', 'notif-item-body');
    body.appendChild(el('div', 'notif-item-src', formatAppName(localizeAlertSource(a.source))));
    body.appendChild(el('div', 'notif-item-msg', localizeAlertMessage(a.message)));
    row._time = el('span', 'notif-item-time', timeAgo(a.time));
    main.append(ico, body, row._time);
    main.addEventListener('click', () => showNotifDetail(row._alert));
    row.appendChild(main);
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
    return row;
  }

  function updateAlertRow(row, a, resolved) {
    if (row._sig !== alertSig(a, resolved)) return buildAlertRow(a, resolved);
    row._alert = a;
    setText(row._time, timeAgo(a.time));
    return null;
  }

  function buildResolvedSection() {
    const sec = el('div', 'notif-resolved');
    sec._head = el('button', 'notif-resolved-head');
    sec._head.setAttribute('aria-expanded', 'false');
    sec._head.addEventListener('click', (e) => {
      e.stopPropagation();
      resolvedOpen = !resolvedOpen;
      sec.classList.toggle('open', resolvedOpen);
      sec._head.setAttribute('aria-expanded', String(resolvedOpen));
    });
    sec._clear = el('button', 'notif-resolved-clear');
    sec._clear.hidden = true;
    sec._clear.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!await ask({ message: t('confirmClearResolved'), okLabel: t('delete') })) return;
      postJson('/api/alerts/clear-resolved', {})
        .then(() => { /* el server re-emite el resumen por SSE */ })
        .catch((err) => console.error('[alerts] no se pudieron limpiar:', err));
      lastSummary.resolvedAlerts = [];
      resolvedOpen = false;
      rerenderAlerts();
    });
    sec._body = el('div', 'notif-resolved-body');
    sec.append(sec._head, sec._clear, sec._body);
    return sec;
  }

  function updateResolvedSection(sec, resolvedAlerts) {
    sec.classList.toggle('open', resolvedOpen);
    sec._head.setAttribute('aria-expanded', String(resolvedOpen));
    setText(sec._head, t('resolvedCount', { count: resolvedAlerts.length }));
    setText(sec._clear, t('clear'));
    sec._clear.hidden = resolvedAlerts.length <= 5;
    reconcile(sec._body, resolvedAlerts, (a) => 'a:' + a.id, (a) => buildAlertRow(a, true), (row, a) => updateAlertRow(row, a, true));
  }

  function renderAlerts(alerts, resolvedAlerts) {
    alerts = alerts || [];
    resolvedAlerts = resolvedAlerts || [];
    const badge = $('notif-badge');
    const readAllBtn = $('notif-read-all');

    const unread = alerts.filter((a) => a.state !== 'read');
    badge.hidden = !unread.length;
    setText(badge, unread.length);
    readAllBtn.hidden = !unread.length;
    notifBtn.setAttribute('aria-label', unread.length ? t('unreadCount', { count: unread.length }) : t('notifications'));

    const entries = [];
    if (!alerts.length && !resolvedAlerts.length) entries.push({ kind: 'empty', text: t('noNotifications') });
    else if (!alerts.length) entries.push({ kind: 'empty', text: t('noActiveNotifications') });
    for (const a of alerts) entries.push({ kind: 'alert', a });
    if (resolvedAlerts.length) entries.push({ kind: 'resolved', list: resolvedAlerts });

    reconcile($('notif-list'), entries, (e) => e.kind === 'alert' ? 'a:' + e.a.id : e.kind, (e) => {
      if (e.kind === 'alert') return buildAlertRow(e.a, false);
      if (e.kind === 'resolved') return buildResolvedSection();
      return el('div', 'notif-empty');
    }, (node, e) => {
      if (e.kind === 'alert') return updateAlertRow(node, e.a, false);
      if (e.kind === 'resolved') updateResolvedSection(node, e.list);
      else setText(node, e.text);
      return null;
    });
  }

  $('notif-read-all').addEventListener('click', (e) => {
    e.stopPropagation();
    markAllRead();
  });

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setDropdown(settingsBtn, settingsDropdown, false);
    setDropdown(notifBtn, notifDropdown, notifDropdown.hidden);
  });
  // Los clicks dentro del dropdown no deben cerrarlo (el cierre es por el
  // boton o por clicks fuera); sin esto, "Resueltas" se abria y cerraba
  // en el mismo click.
  notifDropdown.addEventListener('click', (e) => e.stopPropagation());
  // Mismo trato para el de Configuracion: sin esto, cualquier click dentro
  // (input de imagen, slider, presets) lo cerraba en el mismo click.
  settingsDropdown.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closeDropdowns);

  // Con teclado, salir del dropdown con Tab lo cierra.
  for (const [btn, dd] of [[notifBtn, notifDropdown], [settingsBtn, settingsDropdown]]) {
    btn.parentElement.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !btn.parentElement.contains(e.relatedTarget)) setDropdown(btn, dd, false);
    });
  }

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setDropdown(notifBtn, notifDropdown, false);
    setDropdown(settingsBtn, settingsDropdown, settingsDropdown.hidden);
  });

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

  function refreshGotify() {
    if (!gotifyMetrics) return;
    msgLimit = MSG_STEP;
    renderGotifyFilter(gotifyMetrics);
    renderGotifyMessages(gotifyMetrics);
  }

  $('gotify-priority-level').addEventListener('change', (e) => {
    priorityFilter = e.target.value;
    refreshGotify();
  });

  function renderGotifyFilter(metrics) {
    // Si la app seleccionada ya no existe en Gotify, volvemos a "Todas" en
    // vez de quedar filtrando algo que no se ve (filtro fantasma).
    if (filterApp !== 'all' && !(metrics.apps || []).some((a) => String(a.id) === filterApp)) {
      filterApp = 'all';
    }
    const chips = [{ id: 'all', label: t('allApps'), muted: false }];
    for (const a of metrics.apps || []) {
      chips.push({ id: String(a.id), label: formatAppName(a.name) + ' · ' + a.count, muted: !a.count });
    }
    reconcile($('gotify-filter'), chips, (c) => c.id, (c) => {
      const b = el('button', 'chip-chip');
      b.addEventListener('click', () => { filterApp = c.id; refreshGotify(); });
      return b;
    }, (b, c) => {
      setClass(b, 'chip-chip' + (filterApp === c.id ? ' active' : '') + (c.muted ? ' muted' : ''));
      setText(b, c.label);
      b.setAttribute('aria-pressed', String(filterApp === c.id));
    });
  }

  function createMsg() {
    const row = el('div', 'msg');
    const body = el('div', 'msg-body');
    const top = el('div', 'msg-top');
    row._app = el('span', 'msg-app');
    row._time = el('span', 'msg-time');
    top.append(row._app, row._time);
    const titleLine = el('div', 'msg-title');
    row._prio = el('span', 'prio info');
    row._title = el('span', 'msg-title-text');
    titleLine.append(row._prio, row._title);
    row._text = el('div', 'msg-text');
    row._toggle = el('button', 'msg-toggle');
    row._toggle.addEventListener('click', () => {
      if (expandedMsgs.has(row._id)) expandedMsgs.delete(row._id); else expandedMsgs.add(row._id);
      updateMsg(row, row._m);
    });
    body.append(top, titleLine, row._text, row._toggle);
    row.appendChild(body);
    return row;
  }

  function updateMsg(row, m) {
    row._id = m.id;
    row._m = m;
    const lv = levelOf(m.priority);
    setText(row._app, formatAppName(m.appName));
    setText(row._time, timeAgo(m.date));
    setClass(row._prio, 'prio ' + lv);
    setText(row._prio, lv === 'critical' ? t('priorityCriticalBadge') : lv === 'warning' ? t('priorityWarningBadge') : t('priorityInfoBadge'));
    setText(row._title, m.title || t('noTitleMessage'));
    const long = !!m.message && m.message.length > 180;
    const isExpanded = expandedMsgs.has(m.id);
    row._text.hidden = !m.message;
    setText(row._text, m.message || '');
    setClass(row._text, 'msg-text' + (long && !isExpanded ? ' collapsed' : ''));
    row._toggle.hidden = !long;
    setText(row._toggle, isExpanded ? t('showLess') : t('showMore'));
    row._toggle.setAttribute('aria-expanded', String(isExpanded));
  }

  function renderGotifyMessages(metrics) {
    const box = $('gotify-msgs');
    const empty = $('gotify-empty');

    let msgs = metrics?.messages || [];
    if (filterApp !== 'all') msgs = msgs.filter((m) => String(m.appId) === filterApp);
    if (priorityFilter !== 'all') msgs = msgs.filter((m) => levelOf(m.priority) === priorityFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      msgs = msgs.filter((m) => (m.title + ' ' + m.message).toLowerCase().includes(q));
    }

    if (!msgs.length) { empty.hidden = false; box.hidden = true; $('gotify-wrap').hidden = false; return; }
    empty.hidden = true;
    box.hidden = false;

    const shown = msgs.slice(0, msgLimit);
    const entries = shown.map((m) => ({ kind: 'msg', m }));
    if (msgs.length > shown.length) entries.push({ kind: 'more', remaining: msgs.length - shown.length });

    reconcile(box, entries, (e) => e.kind === 'msg' ? 'm:' + e.m.id : 'more', (e) => {
      if (e.kind === 'msg') return createMsg();
      const more = el('button', 'msg-toggle');
      more.addEventListener('click', () => { msgLimit += MSG_STEP; renderGotifyMessages(gotifyMetrics); });
      return more;
    }, (node, e) => {
      if (e.kind === 'msg') updateMsg(node, e.m);
      else setText(node, t('loadMore', { count: e.remaining }));
      return null;
    });
    $('gotify-wrap').hidden = false;
  }

  /* ------------------------- honestidad: caducidad y conexion ------------------------- */

  // Un servicio que deja de responder conserva sus ultimas metricas buenas
  // en el backend (con metricsStaleSince); aqui las apagamos y lo decimos,
  // en vez de pintar datos viejos como si estuvieran en vivo.
  function markStale(wrapId, svc) {
    const wrap = $(wrapId);
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
      setText(note, t('staleSince', { time: timeAgo(svc.metricsStaleSince) }));
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
    const indicator = $('live-indicator');
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
    const target = $('last-update');
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
    $('loading').hidden = true;
    $('error').hidden = true;

    const status = summary.overallStatus || 'unknown';
    setClass($('status'), 'pill ' + status);
    setText($('status-text'), STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : status);

    const heroStatus = $('hero-status');
    setClass(heroStatus, 'hero-status ' + status);
    setText(heroStatus, STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : status);

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
  // El espacio que ocupa se reserva con :has() en el CSS.
  let svcBannerDismissed = false;

  function renderServiceAlerts(services) {
    const banner = $('svc-alert-banner');
    const criticalServices = ['beszel', 'uptimekuma'];
    const down = services.filter((s) => criticalServices.includes(s.id) && (s.status === 'unknown' || s.status === 'down'));
    if (!down.length) {
      svcBannerDismissed = false;
      banner.hidden = true;
      return;
    }
    if (svcBannerDismissed) {
      banner.hidden = true;
      return;
    }
    const names = down.map((s) => s.name).join(', ');
    setText($('svc-alert-text'), t(down.length === 1 ? 'oneServiceDown' : 'manyServicesDown', { names }));
    banner.hidden = false;
  }

  $('svc-alert-close').addEventListener('click', () => {
    svcBannerDismissed = true;
    $('svc-alert-banner').hidden = true;
  });

  function showError(err) {
    $('loading').hidden = true;
    const e = $('error');
    e.hidden = false;
    e.textContent = t('loadError', { error: err && err.message ? err.message : err });
  }

  // El polling es solo un respaldo: mientras el SSE esta vivo no se usa y,
  // si falla, no debe pintar un error encima de una UI que si funciona.
  function fetchOnce() {
    fetch('/api/summary')
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(render)
      .catch((err) => { if (sseState !== 'live' || !lastSummary) showError(err); });
  }

  let stream = null;
  let retryTimer = null;

  function connectLive() {
    if (typeof EventSource === 'undefined') { fetchOnce(); return; }
    let retryMs = 1000;
    const maxRetry = 30000;
    function open() {
      retryTimer = null;
      const es = new EventSource('/api/stream');
      stream = es;
      es.onopen = () => { retryMs = 1000; setLive('live'); };
      es.onmessage = (e) => {
        try {
          render(JSON.parse(e.data));
        } catch (err) { console.error('[SSE] parse error:', err); }
      };
      es.onerror = () => {
        es.close();
        if (stream === es) stream = null;
        setLive('reconnecting');
        retryTimer = setTimeout(open, retryMs);
        retryMs = Math.min(retryMs * 2, maxRetry);
      };
    }
    open();
    // Una pestaña oculta no necesita el stream: se cierra y se reabre al volver.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (stream) { stream.close(); stream = null; }
        if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      } else if (!stream && !retryTimer) {
        retryMs = 1000;
        open();
      }
    });
  }

  $('gotify-search').addEventListener('input', (e) => {
    searchText = e.target.value.trim();
    // Solo re-renderizamos los mensajes: escribir no debe reiniciar el
    // limite de "Cargar más" (eso lo hace refreshGotify al cambiar de filtro).
    if (gotifyMetrics) renderGotifyMessages(gotifyMetrics);
  });

  // Actualiza "Actualizado hace Xs" cada segundo y detecta si los datos se
  // quedan viejos (SSE caido): feedback honesto de "en vivo".
  setInterval(updateFreshness, 1000);

  /* ------------------------------- sidebar resize ------------------------------- */

  const gotifyWrap = $('gotify-wrap');

  // Pointer Events (raton, tactil y lapiz) y flechas del teclado.
  function makeResizer(handle, cfg) {
    const read = () => (cfg.axis === 'x' ? gotifyWrap.offsetWidth : gotifyWrap.offsetHeight);
    const apply = (size) => {
      const v = Math.round(Math.max(cfg.min, Math.min(cfg.max(), size)));
      gotifyWrap.style[cfg.axis === 'x' ? 'width' : 'height'] = v + 'px';
      handle.setAttribute('aria-valuenow', String(v));
      return v;
    };
    const saved = Number(lsGet(cfg.key));
    if (saved) apply(saved);
    handle.setAttribute('aria-valuemin', String(cfg.min));
    handle.setAttribute('aria-valuemax', String(cfg.max()));
    handle.setAttribute('aria-valuenow', String(saved || cfg.initial));

    let start = null;
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      start = { p: cfg.axis === 'x' ? e.clientX : e.clientY, size: read() };
      handle.classList.add('dragging');
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!start) return;
      const delta = (cfg.axis === 'x' ? e.clientX : e.clientY) - start.p;
      apply(cfg.axis === 'x' ? start.size - delta : start.size + delta);
    });
    const end = () => {
      if (!start) return;
      start = null;
      handle.classList.remove('dragging');
      lsSet(cfg.key, String(read()));
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', (e) => {
      const grow = cfg.axis === 'x' ? 'ArrowLeft' : 'ArrowDown';
      const shrink = cfg.axis === 'x' ? 'ArrowRight' : 'ArrowUp';
      if (e.key !== grow && e.key !== shrink) return;
      e.preventDefault();
      apply(read() + (e.key === grow ? 20 : -20));
      lsSet(cfg.key, String(read()));
    });
  }

  makeResizer($('gotify-resize'), { axis: 'x', min: 200, max: () => 800, key: 'gotify-width', initial: 380 });
  makeResizer($('gotify-resize-bottom'), { axis: 'y', min: 150, max: () => Math.max(150, window.innerHeight - 100), key: 'gotify-height', initial: 400 });

  connectLive();
  setInterval(() => { if (sseState !== 'live') fetchOnce(); }, 60000);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.monitor')) closeMonitorMenus();
  });

  fetch('/api/health').then((r) => r.json()).then((h) => {
    if (h && h.version) {
      const v = $('app-version');
      if (v) v.textContent = h.version;
    }
  }).catch(() => { /* sin version: se queda vacio */ });

  /* ------------------------------- background ------------------------------- */

  const bgInput = $('bg-input');

  function applyBg(url) {
    const safe = url ? safeImageUrl(url) : null;
    if (safe) {
      document.documentElement.style.setProperty('--bg-image', cssUrl(safe));
      document.body.classList.remove('no-bg-image');
      return true;
    }
    document.documentElement.style.removeProperty('--bg-image');
    document.body.classList.add('no-bg-image');
    return false;
  }

  function saveBg(patch) {
    postJson('/api/config/bg', patch).catch(warn('config'));
  }

  function setBlur(v) {
    document.documentElement.style.setProperty('--bg-blur', v + 'px');
    setText($('blur-value'), v + 'px');
  }

  fetch('/api/config').then((r) => r.json()).then((cfg) => {
    beszelUrl = safeHttpUrl(cfg.beszelUrl);
    applyBg(cfg.bgImage || lsGet('bg-image'));
    if (cfg.bgImage) bgInput.value = cfg.bgImage;
    const blurVal = lsGet('bg-blur') || cfg.bgBlur || 20;
    $('bg-blur').value = blurVal;
    setBlur(blurVal);
    if (cfg.bgPresets && cfg.bgPresets.length) renderBgPresets(cfg.bgPresets);
  }).catch(() => { document.body.classList.add('no-bg-image'); });

  const savedBg = lsGet('bg-image');
  if (savedBg) bgInput.value = savedBg;

  function bgInputInvalid(invalid) {
    if (invalid) bgInput.setAttribute('aria-invalid', 'true'); else bgInput.removeAttribute('aria-invalid');
  }

  $('bg-apply').addEventListener('click', () => {
    const url = bgInput.value.trim();
    if (!url) return;
    if (!safeImageUrl(url)) { bgInputInvalid(true); bgInput.focus(); return; }
    bgInputInvalid(false);
    lsSet('bg-image', url);
    saveBg({ bgImage: url });
    applyBg(url);
  });

  $('bg-clear').addEventListener('click', () => {
    lsRemove('bg-image');
    bgInput.value = '';
    bgInputInvalid(false);
    saveBg({ bgImage: null });
    fetch('/api/config').then((r) => r.json()).then((cfg) => { applyBg(cfg.bgImage); }).catch(() => { applyBg(null); });
  });

  $('bg-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (!safeImageUrl(dataUrl)) return;
      lsSet('bg-image', dataUrl);
      saveBg({ bgImage: dataUrl });
      applyBg(dataUrl);
      bgInput.value = dataUrl;
    };
    reader.readAsDataURL(file);
  });

  // El slider solo previsualiza mientras se arrastra; se guarda al soltar.
  const blurSlider = $('bg-blur');
  blurSlider.addEventListener('input', () => setBlur(blurSlider.value));
  blurSlider.addEventListener('change', () => {
    lsSet('bg-blur', blurSlider.value);
    saveBg({ bgBlur: Number(blurSlider.value) });
  });

  /* ------------------------------- background presets ------------------------------- */

  let bgPresets = [];

  function renderBgPresets(presets) {
    bgPresets = presets || [];
    const box = $('bg-presets');
    box.replaceChildren();
    if (!bgPresets.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    bgPresets.forEach((p, i) => {
      const item = el('div', 'bg-preset');
      const apply = el('button', 'bg-preset-apply');
      apply.title = t('usePreset', { name: p.name });
      const thumb = el('span', 'bg-preset-thumb');
      const safe = safeImageUrl(p.url);
      if (safe) thumb.style.backgroundImage = cssUrl(safe);
      apply.append(thumb, el('span', 'bg-preset-name', p.name));
      apply.addEventListener('click', () => {
        if (!safe) return;
        lsSet('bg-image', p.url);
        saveBg({ bgImage: p.url });
        applyBg(p.url);
        bgInput.value = p.url;
      });
      const rm = el('button', 'bg-preset-rm', '×');
      rm.setAttribute('aria-label', t('removePreset', { name: p.name }));
      rm.addEventListener('click', () => {
        bgPresets.splice(i, 1);
        saveBg({ bgPresets });
        renderBgPresets(bgPresets);
      });
      item.append(apply, rm);
      box.appendChild(item);
    });
  }

  $('bg-save-preset').addEventListener('click', async () => {
    const url = bgInput.value.trim();
    if (!url) return;
    if (!safeImageUrl(url)) { bgInputInvalid(true); bgInput.focus(); return; }
    const name = await ask({ message: t('backgroundPrompt'), input: true, value: t('backgroundName', { count: bgPresets.length + 1 }), okLabel: t('save') });
    if (!name) return;
    bgPresets.push({ name, url });
    saveBg({ bgPresets });
    renderBgPresets(bgPresets);
  });

  /* ------------------------------- monitor links popup ------------------------------- */

  const cfgPopup = el('form', 'monitor-cfg-popup');
  cfgPopup.setAttribute('role', 'dialog');
  cfgPopup.setAttribute('aria-label', t('monitorLinks'));
  cfgPopup.noValidate = true;
  cfgPopup.hidden = true;
  document.body.appendChild(cfgPopup);
  let cfgAnchor = null;

  function closeCfgPopup() {
    if (cfgPopup.hidden) return;
    cfgPopup.hidden = true;
    if (cfgAnchor) {
      cfgAnchor.setAttribute('aria-expanded', 'false');
      if (document.activeElement === document.body || cfgPopup.contains(document.activeElement)) cfgAnchor.focus();
    }
  }

  function cfgEntryRow(u) {
    const row = el('div', 'cfg-entry');
    const label = el('input', 'cfg-input cfg-label');
    label.type = 'text'; label.value = u.label || ''; label.placeholder = t('label');
    label.setAttribute('aria-label', t('linkLabel'));
    const url = el('input', 'cfg-input cfg-url');
    url.type = 'url'; url.value = u.url || ''; url.placeholder = 'https://...';
    url.setAttribute('aria-label', t('linkUrl'));
    const rm = el('button', 'cfg-rm', '×');
    rm.setAttribute('aria-label', t('removeLink'));
    rm.addEventListener('click', () => row.remove());
    row.append(label, url, rm);
    return row;
  }

  function renderCfgPopup(name) {
    cfgPopup.replaceChildren();
    cfgPopup.dataset.name = name;
    const entries = el('div', 'cfg-entries');
    for (const u of monitorUrlsData[name] || []) entries.appendChild(cfgEntryRow(u));
    cfgPopup.appendChild(entries);
    const addBtn = el('button', 'cfg-add', t('add'));
    addBtn.addEventListener('click', () => {
      const row = cfgEntryRow({ label: '', url: '' });
      entries.appendChild(row);
      row.querySelector('.cfg-label').focus();
    });
    cfgPopup.appendChild(addBtn);
    const saveBtn = el('button', 'cfg-save', t('save'));
    saveBtn.type = 'submit';
    cfgPopup.appendChild(saveBtn);
  }

  cfgPopup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = cfgPopup.dataset.name;
    const newUrls = [];
    let invalid = null;
    cfgPopup.querySelectorAll('.cfg-entry').forEach((row) => {
      const l = row.querySelector('.cfg-label').value.trim();
      const urlInput = row.querySelector('.cfg-url');
      const u = urlInput.value.trim();
      urlInput.removeAttribute('aria-invalid');
      if (!u) return;
      if (!safeHttpUrl(u)) {
        urlInput.setAttribute('aria-invalid', 'true');
        if (!invalid) invalid = urlInput;
        return;
      }
      newUrls.push({ label: l || t('open'), url: u });
    });
    if (invalid) { invalid.focus(); return; }
    const next = { ...monitorUrlsData };
    if (newUrls.length) next[name] = newUrls; else delete next[name];
    postJson('/api/monitor-urls', { urls: next }).then(() => {
      monitorUrlsData = next;
      syncAllMonitorLinks();
      closeCfgPopup();
    }).catch(warn('monitor-urls'));
  });

  function openCfgPopup(name, anchor) {
    closeMonitorMenus();
    closeBookmarkPopup();
    renderCfgPopup(name);
    cfgAnchor = anchor;
    anchor.setAttribute('aria-expanded', 'true');
    const row = anchor.closest('.monitor');
    const rect = row ? row.getBoundingClientRect() : anchor.getBoundingClientRect();
    cfgPopup.style.position = 'fixed';
    cfgPopup.style.top = Math.max(8, rect.top) + 'px';
    cfgPopup.style.left = Math.max(8, Math.min(rect.left + (rect.width / 2) - 140, window.innerWidth - 296)) + 'px';
    cfgPopup.hidden = false;
    const first = cfgPopup.querySelector('input') || cfgPopup.querySelector('.cfg-add');
    if (first) first.focus();
  }

  document.addEventListener('click', (e) => {
    if (cfgPopup.hidden) return;
    // composedPath: un clic en un elemento que el propio popup acaba de quitar
    // (la x de una fila) ya no cuelga del popup cuando llega aqui.
    if (e.composedPath().includes(cfgPopup) || e.target.closest('.monitor-cfg')) return;
    closeCfgPopup();
  });

  fetch('/api/monitor-urls').then((r) => r.json()).then((data) => {
    monitorUrlsData = data.urls || {};
    syncAllMonitorLinks();
  }).catch(() => {});

  /* ------------------------------- bookmarks ------------------------------- */

  let bookmarks = [];
  const bookmarksList = $('bookmarks-list');
  const bookmarkAddBtn = $('bookmark-add');

  function bookmarkIcon(b) {
    const ico = el('span', 'bookmark-ico');
    const src = b.icon && /^(data:image\/|https?:\/\/)/.test(b.icon) ? safeImageUrl(b.icon) : null;
    if (src) {
      const img = cdnImg(src);
      img.onerror = () => { img.hidden = true; };
      ico.appendChild(img);
    } else if (b.icon) {
      ico.textContent = b.icon;
    } else {
      ico.textContent = (b.title || b.url || '?').slice(0, 2).toUpperCase();
    }
    return ico;
  }

  function renderBookmarks() {
    bookmarksList.replaceChildren();
    bookmarks.forEach((b, i) => {
      const row = el('div', 'bookmark-item');
      const url = safeHttpUrl(b.url);
      const link = url ? el('a', 'bookmark-link') : el('div', 'bookmark-link');
      if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      link.appendChild(bookmarkIcon(b));
      const info = el('div', 'bookmark-info');
      info.appendChild(el('span', 'bookmark-title', b.title || b.url));
      if (b.url) info.appendChild(el('span', 'bookmark-url', b.url.replace(/^https?:\/\//, '').replace(/\/$/, '')));
      link.appendChild(info);
      row.appendChild(link);
      const edit = el('button', 'bookmark-edit');
      edit.setAttribute('aria-label', t('editNamed', { name: b.title || b.url || t('links') }));
      edit.setAttribute('aria-haspopup', 'dialog');
      edit.appendChild(svgIcon('edit'));
      edit.addEventListener('click', (e) => {
        e.stopPropagation();
        openBookmarkPopup(i, edit);
      });
      row.appendChild(edit);
      const rm = el('button', 'bookmark-rm', '×');
      rm.setAttribute('aria-label', t('removeNamed', { name: b.title || b.url || t('links') }));
      rm.addEventListener('click', () => {
        bookmarks.splice(i, 1);
        saveBookmarks();
        renderBookmarks();
      });
      row.appendChild(rm);
      bookmarksList.appendChild(row);
    });
  }

  function saveBookmarks() {
    postJson('/api/bookmarks', { bookmarks }).catch(warn('bookmarks'));
  }

  let bookmarkPopup = null;
  let bookmarkOpener = null;

  function closeBookmarkPopup() {
    if (!bookmarkPopup) return;
    bookmarkPopup.remove();
    bookmarkPopup = null;
    bookmarkAddBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClickBookmark);
    const opener = bookmarkOpener && document.contains(bookmarkOpener) ? bookmarkOpener : bookmarkAddBtn;
    bookmarkOpener = null;
    if (document.activeElement === document.body) opener.focus();
  }

  function onDocClickBookmark(ev) {
    if (bookmarkPopup && !ev.composedPath().includes(bookmarkPopup) && ev.target !== bookmarkAddBtn) closeBookmarkPopup();
  }

  function labelled(text, input) {
    const wrap = el('label', 'popup-field');
    wrap.append(el('span', 'popup-field-label', text), input);
    return wrap;
  }

  function openBookmarkPopup(editIndex, opener) {
    closeBookmarkPopup();
    closeCfgPopup();
    const editing = editIndex != null ? bookmarks[editIndex] : null;
    const popup = el('form', 'bookmark-popup');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', editing ? t('editLink') : t('addLink'));
    popup.noValidate = true;
    let selectedIcon = (editing && editing.icon) || '';
    const INITIAL_COUNT = 24;

    popup.appendChild(el('div', 'icon-section-label', t('iconService')));
    const svcSearch = el('input', 'cfg-input svc-search');
    svcSearch.type = 'search'; svcSearch.placeholder = t('searchService');
    svcSearch.setAttribute('aria-label', t('searchIcon'));
    popup.appendChild(svcSearch);
    const svcGrid = el('div', 'emoji-grid');
    popup.appendChild(svcGrid);
    const iconPreview = el('div', 'icon-preview');
    const showPreview = () => {
      const src = selectedIcon && /^(data:image\/|https?:\/\/)/.test(selectedIcon) ? safeImageUrl(selectedIcon) : null;
      if (src) iconPreview.replaceChildren(cdnImg(src, 'icon-preview-img'));
      else iconPreview.textContent = selectedIcon || t('noIcon');
    };
    showPreview();
    let svcShowAll = false;
    let svcMoreBtn = null;

    const selectIcon = (src, btn) => {
      popup.querySelectorAll('.svc-icon-btn').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }
      selectedIcon = src;
      showPreview();
    };

    const renderServices = () => {
      const q = svcSearch.value.toLowerCase().trim();
      const list = q ? SVC_ICONS.filter((s) => s.includes(q)) : SVC_ICONS;
      svcGrid.replaceChildren();
      for (const slug of svcShowAll ? list : list.slice(0, INITIAL_COUNT)) {
        const btn = el('button', 'svc-icon-btn');
        btn.title = slug;
        btn.setAttribute('aria-label', slug);
        btn.setAttribute('aria-pressed', String(selectedIcon === `${ICON_CDN}/${slug}.png`));
        const img = cdnImg(`${ICON_CDN}/${slug}.png`);
        img.onerror = () => { img.hidden = true; };
        btn.appendChild(img);
        btn.addEventListener('click', () => selectIcon(`${ICON_CDN}/${slug}.png`, btn));
        svcGrid.appendChild(btn);
      }
      if (svcMoreBtn) { svcMoreBtn.remove(); svcMoreBtn = null; }
      if (list.length > INITIAL_COUNT) {
        svcMoreBtn = el('button', 'show-more-btn', svcShowAll ? t('showLess') : `${t('showMore')} (${list.length - INITIAL_COUNT})`);
        svcMoreBtn.addEventListener('click', () => { svcShowAll = !svcShowAll; renderServices(); });
        svcGrid.after(svcMoreBtn);
      }
    };
    renderServices();
    svcSearch.addEventListener('input', () => { svcShowAll = false; renderServices(); });

    popup.appendChild(iconPreview);
    const clearIconBtn = el('button', 'show-more-btn', t('clearIcon'));
    clearIconBtn.addEventListener('click', () => {
      popup.querySelectorAll('.svc-icon-btn').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      selectedIcon = '';
      showPreview();
    });
    popup.appendChild(clearIconBtn);

    const fileLabel = el('label', 'cfg-upload', t('uploadImage'));
    const fileInput = el('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.hidden = true;
    fileInput.addEventListener('change', (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (!safeImageUrl(reader.result)) return;
        selectIcon(reader.result, null);
      };
      reader.readAsDataURL(file);
    });
    fileLabel.appendChild(fileInput);
    popup.appendChild(fileLabel);

    const titleInput = el('input', 'cfg-input');
    titleInput.type = 'text'; titleInput.placeholder = t('title'); titleInput.autocomplete = 'off';
    if (editing) titleInput.value = editing.title || '';
    popup.appendChild(labelled(t('title'), titleInput));

    const urlInput = el('input', 'cfg-input');
    urlInput.type = 'url'; urlInput.placeholder = 'https://...'; urlInput.autocomplete = 'off';
    if (editing) urlInput.value = editing.url || '';
    popup.appendChild(labelled(t('url'), urlInput));

    const actions = el('div', 'bookmark-popup-actions');
    const cancelBtn = el('button', 'cfg-cancel', t('cancel'));
    cancelBtn.addEventListener('click', closeBookmarkPopup);
    const saveBtn = el('button', 'cfg-save', t('save'));
    saveBtn.type = 'submit';
    actions.append(cancelBtn, saveBtn);
    popup.appendChild(actions);

    popup.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const t = titleInput.value.trim();
      const u = urlInput.value.trim();
      urlInput.removeAttribute('aria-invalid');
      if (!t && !u) { titleInput.focus(); return; }
      if (u && !safeHttpUrl(u)) {
        urlInput.setAttribute('aria-invalid', 'true');
        urlInput.focus();
        return;
      }
      const entry = { ...(editing || {}), title: t, url: u, icon: selectedIcon || undefined };
      if (editing) bookmarks[editIndex] = entry; else bookmarks.push(entry);
      saveBookmarks();
      renderBookmarks();
      closeBookmarkPopup();
    });

    const anchor = opener || bookmarkAddBtn;
    bookmarkOpener = opener || null;
    const rect = anchor.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 266)) + 'px';
    popup.style.top = rect.bottom + 4 + 'px';
    document.body.appendChild(popup);
    popup.style.top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - popup.offsetHeight - 8)) + 'px';
    bookmarkPopup = popup;
    bookmarkAddBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => document.addEventListener('click', onDocClickBookmark), 0);
    titleInput.focus();
  }

  bookmarkAddBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBookmarkPopup();
  });

  fetch('/api/bookmarks').then((r) => r.json()).then((data) => {
    bookmarks = data.bookmarks || [];
    renderBookmarks();
  }).catch(() => {});
})();
