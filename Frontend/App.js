// ─── CONFIG ────────────────────────────────────────────────
const API = 'http://localhost:5180/api';

// ─── STATE ─────────────────────────────────────────────────
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentPage: 'search',
  searchFilters: {},
};

// ─── HELPERS ───────────────────────────────────────────────
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
  };
}

async function api(method, path, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: authHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) {
      const msg = typeof data === 'object'
        ? (data.message || data.title || data.detail || JSON.stringify(data))
        : data;
      throw new Error(msg || `Error ${res.status}`);
    }
    return data;
  } catch (e) {
    throw e;
  }
}

// ─── TOAST ─────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 4000) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(20px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, duration);
}

// ─── PAGES ─────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(`page-${name}`);
  if (pg) pg.classList.add('active');
  state.currentPage = name;

  if (name === 'search') loadProperties();
  if (name === 'bookings') loadMyBookings();
  if (name === 'properties') loadMyProperties();
  if (name === 'notifications') loadNotifications();
}

// ─── NAV UPDATE ────────────────────────────────────────────
function updateNav() {
  const isLoggedIn = !!state.token;
  const roles = state.user?.roles || [];
  const canGuest = roles.includes('Guest');
  const canHost = roles.includes('Host');
  document.getElementById('nav-guest-links').style.display = isLoggedIn ? 'none' : '';
  document.getElementById('nav-auth-links').style.display = isLoggedIn ? 'flex' : 'none';
  // Show role-specific nav
  const navBookings = document.getElementById('nav-bookings');
  const navProps = document.getElementById('nav-properties');
  if (navBookings) navBookings.style.display = (isLoggedIn && canGuest) ? '' : 'none';
  if (navProps) navProps.style.display = (isLoggedIn && canHost) ? '' : 'none';
  
  // Greeting
  const greetingEl = document.getElementById('nav-greeting');
  if (greetingEl) {
    if (isLoggedIn && state.user) {
      const displayRoles = roles.map(r => r === 'Host' ? 'Host' : 'Huésped').join(' & ');
      greetingEl.textContent = `${displayRoles}: ${state.user.name}`;
      greetingEl.style.display = '';
    } else {
      greetingEl.style.display = 'none';
    }
  }

  if (isLoggedIn) loadUnreadCount();
}

async function loadUnreadCount() {
  try {
    const notifs = await api('GET', '/Notifications?onlyUnread=true');
    const badge = document.getElementById('notif-badge');
    if (notifs && notifs.length > 0) {
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  } catch {}
}

// ─── AUTH ───────────────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { toast('Completa todos los campos', 'error'); return; }
  try {
    const data = await api('POST', '/Auth/login', { email, password });
    const roles = (data.roles && data.roles.length)
      ? data.roles
      : (data.role ? String(data.role).split(',').map(r => r.trim()).filter(Boolean) : []);
    state.token = data.token;
    state.user = { name: data.name, email: data.email, role: data.role, roles };
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    updateNav();
    toast(`¡Bienvenido, ${data.name}!`, 'success');
    showPage('search');
  } catch (e) { toast(e.message, 'error'); }
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const roles = [];
  if (document.getElementById('reg-role-host').checked) roles.push(1);
  if (document.getElementById('reg-role-guest').checked) roles.push(2);
  if (!name || !email || !password) { toast('Completa todos los campos', 'error'); return; }
  if (roles.length === 0) { toast('Selecciona al menos un rol', 'error'); return; }
  try {
    await api('POST', '/Auth/register', { name, email, password, roles });
    toast('¡Cuenta creada! Revisa tu correo para confirmar la cuenta.', 'success', 6000);
    showPage('login');
  } catch (e) { toast(e.message, 'error'); }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNav();
  showPage('search');
  toast('Sesión cerrada', 'info');
}

function showResend() {
  document.getElementById('modal-resend').classList.add('open');
}

async function doResend() {
  const email = document.getElementById('resend-email').value.trim();
  if (!email) { toast('Ingresa tu correo', 'error'); return; }
  try {
    await api('POST', `/Auth/resend-confirmation/${encodeURIComponent(email)}`);
    toast('Correo de confirmación enviado', 'success');
    closeModal('modal-resend');
  } catch (e) { toast(e.message, 'error'); }
}

// ─── PROPERTIES (PUBLIC) ────────────────────────────────────
const EMOJIS = ['🏠','🏡','🏢','🌊','🏔️','🌴','🏕️','🌆','🌿','🏖️'];
function propEmoji(id) { return EMOJIS[Math.abs(hashStr(id||'x')) % EMOJIS.length]; }
function hashStr(s) { let h=0; for(let c of s){h=(h<<5)-h+c.charCodeAt(0)|0;} return h; }

async function loadProperties() {
  const grid = document.getElementById('properties-grid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const filters = state.searchFilters;
    let qs = new URLSearchParams();
    if (filters.location) qs.append('location', filters.location);
    if (filters.checkIn) qs.append('checkIn', filters.checkIn);
    if (filters.checkOut) qs.append('checkOut', filters.checkOut);
    if (filters.capacity) qs.append('capacity', filters.capacity);
    if (filters.maxPrice) qs.append('maxPrice', filters.maxPrice);
    const props = await api('GET', `/Properties?${qs}`);
    if (!props || props.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><p>No se encontraron propiedades disponibles.</p></div>`;
      return;
    }
    grid.innerHTML = props.map(p => `
      <div class="property-card" onclick="openDetail('${p.id}')">
        <div class="property-img">
          <div class="property-img-bg">${propEmoji(p.id)}</div>
          <div class="property-img-badge">⭐ ${p.averageRating > 0 ? p.averageRating.toFixed(1) : 'Nuevo'}</div>
        </div>
        <div class="property-body">
          <div class="property-title">${esc(p.title)}</div>
          <div class="property-location">📍 ${esc(p.location)}</div>
          <div class="property-meta">
            <div class="property-price">RD$ ${Number(p.pricePerNight).toLocaleString()} <span>/ noche</span></div>
          </div>
          <div class="property-caps">👥 Hasta ${p.capacity} huéspedes</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">⚠️</div><p>${esc(e.message)}</p></div>`;
  }
}

function searchProperties() {
  state.searchFilters = {
    location: document.getElementById('f-location').value.trim(),
    checkIn: document.getElementById('f-checkin').value,
    checkOut: document.getElementById('f-checkout').value,
    capacity: document.getElementById('f-capacity').value,
    maxPrice: document.getElementById('f-maxprice').value,
  };
  loadProperties();
}

// ─── PROPERTY DETAIL ────────────────────────────────────────
async function openDetail(id) {
  showPage('detail');
  const el = document.getElementById('detail-content');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const [prop, reviewData] = await Promise.all([
      api('GET', `/Properties/${id}`),
      api('GET', `/Reviews/property/${id}`).catch(() => ({ reviews: [], averageRating: 0 }))
    ]);
    const isLoggedIn = !!state.token;
    const isGuest = (state.user?.roles || []).includes('Guest');
    const checkin = state.searchFilters.checkIn || '';
    const checkout = state.searchFilters.checkOut || '';
    const reviews = reviewData.reviews || reviewData || [];

    el.innerHTML = `
      <button class="btn-ghost" onclick="showPage('search')" style="margin-bottom:20px;">← Volver</button>
      <div class="detail-hero">${propEmoji(prop.id)}</div>
      <div class="detail-grid">
        <div class="detail-main">
          <h1>${esc(prop.title)}</h1>
          <div class="detail-meta">
            <span>📍 <strong>${esc(prop.location)}</strong></span>
            <span>👥 <strong>${prop.capacity}</strong> huéspedes</span>
            <span>⭐ <strong>${prop.averageRating > 0 ? prop.averageRating.toFixed(1) : 'Sin reseñas'}</strong></span>
          </div>
          <p class="detail-desc">${esc(prop.description)}</p>
          <h3 style="font-family:var(--font-display);margin-bottom:16px;">Reseñas (${reviews.length})</h3>
          ${reviews.length === 0 ? '<p style="color:var(--muted);font-size:0.9rem;">Aún no hay reseñas para esta propiedad.</p>' :
            reviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <span class="review-name">${esc(r.guestName || 'Huésped')}</span>
                  <span class="stars">${'⭐'.repeat(r.rating)}</span>
                </div>
                <p class="review-text">${esc(r.comment || '')}</p>
              </div>
            `).join('')
          }
        </div>
        <div>
          <div class="booking-box">
            <div class="booking-box-price">RD$ ${Number(prop.pricePerNight).toLocaleString()} <span>/ noche</span></div>
            ${isLoggedIn && isGuest ? `
              <div class="form-group">
                <label>Check-in</label>
                <input type="date" id="detail-checkin" value="${checkin}" />
              </div>
              <div class="form-group">
                <label>Check-out</label>
                <input type="date" id="detail-checkout" value="${checkout}" />
              </div>
              <button class="btn-primary" onclick="createBooking('${prop.id}')" style="width:100%;padding:13px;margin-top:8px;">Reservar ahora</button>
            ` : !isLoggedIn ? `
              <p style="color:var(--muted);font-size:0.9rem;margin-bottom:16px;">Inicia sesión para realizar una reserva.</p>
              <button class="btn-primary" onclick="showPage('login')" style="width:100%;padding:13px;">Iniciar sesión</button>
            ` : `<p style="color:var(--muted);font-size:0.9rem;">Solo los huéspedes pueden realizar reservas.</p>`}
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);">Error cargando propiedad: ${esc(e.message)}</p>`;
  }
}

// ─── BOOKINGS ───────────────────────────────────────────────
async function createBooking(propertyId) {
  const checkIn = document.getElementById('detail-checkin').value;
  const checkOut = document.getElementById('detail-checkout').value;
  if (!checkIn || !checkOut) { toast('Selecciona fechas de check-in y check-out', 'error'); return; }
  if (checkIn >= checkOut) { toast('El check-out debe ser posterior al check-in', 'error'); return; }
  try {
    await api('POST', '/Bookings', { propertyId, checkIn, checkOut });
    toast('¡Reserva confirmada exitosamente!', 'success');
    showPage('bookings');
  } catch (e) { toast(e.message, 'error'); }
}

async function loadMyBookings() {
  const el = document.getElementById('bookings-list');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const bookings = await api('GET', '/Bookings/my');
    if (!bookings || bookings.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="icon">🧳</div><p>No tienes reservas aún. ¡Explora propiedades!</p></div>';
      return;
    }
    el.innerHTML = bookings.map(b => `
      <div class="booking-card">
        <div class="booking-info">
          <h4>Propiedad</h4>
          <p>Check-in: <strong>${b.checkIn}</strong> → Check-out: <strong>${b.checkOut}</strong></p>
          <span class="status-badge status-${b.status}">${translateStatus(b.status)}</span>
        </div>
        <div class="booking-actions">
          ${b.status === 'Confirmed' ? `
            <button class="btn-danger" onclick="cancelBooking('${b.id}')">Cancelar</button>
            <button class="btn-warn" onclick="completeBooking('${b.id}', ${b.checkOut > new Date().toISOString().split('T')[0]})">
              ${b.checkOut > new Date().toISOString().split('T')[0] ? 'Checkout Anticipado' : 'Completar'}
            </button>
          ` : ''}
          ${b.status === 'Completed' ? `
            <button class="btn-success" onclick="openReview('${b.id}')">Reseña</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);">Error: ${esc(e.message)}</p>`;
  }
}

async function cancelBooking(id) {
  if (!confirm('¿Cancelar esta reserva?')) return;
  try {
    await api('POST', `/Bookings/${id}/cancel`);
    toast('Reserva cancelada', 'info');
    loadMyBookings();
  } catch (e) { toast(e.message, 'error'); }
}

async function completeBooking(id, isEarly = false) {
  const msg = isEarly ? '¿Hacer checkout anticipado? La fecha de salida se ajustará a hoy y liberarás los días restantes.' : '¿Marcar como completada?';
  if (!confirm(msg)) return;
  try {
    await api('POST', `/Bookings/${id}/complete`);
    toast(isEarly ? 'Checkout anticipado exitoso' : 'Reserva completada', 'success');
    loadMyBookings();
  } catch (e) { toast(e.message, 'error'); }
}

function translateStatus(s) {
  return { Confirmed: 'Confirmada', Cancelled: 'Cancelada', Completed: 'Completada' }[s] || s;
}

// ─── MY PROPERTIES (HOST) ───────────────────────────────────
async function loadMyProperties() {
  const el = document.getElementById('my-properties-list');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const props = await api('GET', '/Properties');
    // Filter only own properties
    const mine = props.filter(p => p.hostId === getUserId());
    if (!mine.length) {
      el.innerHTML = '<div class="empty-state"><div class="icon">🏠</div><p>Aún no tienes propiedades. ¡Crea la primera!</p></div>';
      return;
    }
    el.innerHTML = mine.map(p => `
      <div class="booking-card">
        <div class="booking-info">
          <h4>${propEmoji(p.id)} ${esc(p.title)}</h4>
          <p>📍 ${esc(p.location)} • 👥 ${p.capacity} • RD$ ${Number(p.pricePerNight).toLocaleString()}/noche</p>
          ${p.averageRating > 0 ? `<p>⭐ ${p.averageRating.toFixed(1)}</p>` : ''}
        </div>
        <div class="booking-actions">
          <button class="btn-ghost" onclick="openPropertyModal('${p.id}','${esc(p.title)}','${esc(p.description)}','${esc(p.location)}','${p.pricePerNight}','${p.capacity}')">Editar</button>
          <button class="btn-ghost" onclick="viewHostBookings('${p.id}')">Ver reservas</button>
          <button class="btn-ghost" onclick="openBlockDates('${p.id}')">Bloquear fechas</button>
          <button class="btn-ghost" onclick="openUnblockDates('${p.id}')">Desbloquear fechas</button>
          <button class="btn-danger" onclick="deleteProperty('${p.id}')">Eliminar</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);">Error: ${esc(e.message)}</p>`;
  }
}

function getUserId() {
  // Decode JWT to get user id
  if (!state.token) return null;
  try {
    const payload = JSON.parse(atob(state.token.split('.')[1]));
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      || payload.nameid || payload.sub || null;
  } catch { return null; }
}

async function viewHostBookings(propertyId) {
  const el = document.getElementById('host-bookings-list');
  el.innerHTML = '<div class="spinner"></div>';
  document.getElementById('modal-host-bookings').classList.add('open');
  
  try {
    const bookings = await api('GET', `/Bookings/property/${propertyId}`);
    if (!bookings.length) {
      el.innerHTML = '<p>No hay reservas para esta propiedad.</p>';
      return;
    }
    
    el.innerHTML = bookings.map(b => `
      <div class="booking-card">
        <div class="booking-info">
          <h4>Reserva - Huésped ID: ${b.guestId.substring(0, 8)}</h4>
          <p>Fechas: ${b.checkIn} a ${b.checkOut}</p>
          <span class="status-badge status-${b.status}">${translateStatus(b.status)}</span>
        </div>
        <div class="booking-actions">
          ${b.status === 'Confirmed' ? `
            <button class="btn-danger" onclick="cancelBooking('${b.id}'); closeModal('modal-host-bookings'); setTimeout(loadMyProperties, 500)">Cancelar</button>
            <button class="btn-warn" onclick="completeHostBooking('${b.id}', ${b.checkOut > new Date().toISOString().split('T')[0]})">
              ${b.checkOut > new Date().toISOString().split('T')[0] ? 'Checkout Anticipado' : 'Completar'}
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);">Error: ${esc(e.message)}</p>`;
  }
}

async function completeHostBooking(id, isEarly = false) {
  const msg = isEarly ? '¿Hacer checkout anticipado? La fecha de salida se ajustará a hoy.' : '¿Marcar como completada?';
  if (!confirm(msg)) return;
  try {
    await api('POST', `/Bookings/${id}/complete`);
    toast(isEarly ? 'Checkout anticipado exitoso' : 'Reserva completada', 'success');
    closeModal('modal-host-bookings');
    setTimeout(loadMyProperties, 500);
  } catch (e) { toast(e.message, 'error'); }
}

function openPropertyModal(id='', title='', desc='', location='', price='', capacity='') {
  document.getElementById('prop-edit-id').value = id;
  document.getElementById('property-modal-title').textContent = id ? 'Editar Propiedad' : 'Nueva Propiedad';
  document.getElementById('prop-title').value = title;
  document.getElementById('prop-desc').value = desc;
  document.getElementById('prop-location').value = location;
  document.getElementById('prop-price').value = price;
  document.getElementById('prop-capacity').value = capacity;
  document.getElementById('modal-property').classList.add('open');
}

async function saveProperty() {
  const id = document.getElementById('prop-edit-id').value;
  const body = {
    title: document.getElementById('prop-title').value.trim(),
    description: document.getElementById('prop-desc').value.trim(),
    location: document.getElementById('prop-location').value.trim(),
    pricePerNight: parseFloat(document.getElementById('prop-price').value),
    capacity: parseInt(document.getElementById('prop-capacity').value),
  };
  if (!body.title || !body.description || !body.location || !body.pricePerNight || !body.capacity) {
    toast('Completa todos los campos', 'error'); return;
  }
  try {
    if (id) {
      await api('PUT', `/Properties/${id}`, body);
      toast('Propiedad actualizada', 'success');
    } else {
      await api('POST', '/Properties', body);
      toast('Propiedad creada', 'success');
    }
    closeModal('modal-property');
    loadMyProperties();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteProperty(id) {
  if (!confirm('¿Eliminar esta propiedad?')) return;
  try {
    await api('DELETE', `/Properties/${id}`);
    toast('Propiedad eliminada', 'info');
    loadMyProperties();
  } catch (e) { toast(e.message, 'error'); }
}

function openBlockDates(propId) {
  document.getElementById('block-action-type').value = 'block';
  document.getElementById('block-modal-title').textContent = 'Bloquear Fechas';
  document.getElementById('block-action-btn').textContent = 'Bloquear';
  document.getElementById('block-action-btn').className = 'btn-primary';
  document.getElementById('block-action-note').textContent = 'Selecciona un rango para bloquearlo en la propiedad.';
  document.getElementById('block-prop-id').value = propId;
  document.getElementById('block-start').value = '';
  document.getElementById('block-end').value = '';
  document.getElementById('modal-block-dates').classList.add('open');
}

function openUnblockDates(propId) {
  document.getElementById('block-action-type').value = 'unblock';
  document.getElementById('block-modal-title').textContent = 'Desbloquear Fechas';
  document.getElementById('block-action-btn').textContent = 'Desbloquear';
  document.getElementById('block-action-btn').className = 'btn-ghost';
  document.getElementById('block-action-note').textContent = 'Selecciona un rango para desbloquearlo en la propiedad.';
  document.getElementById('block-prop-id').value = propId;
  document.getElementById('block-start').value = '';
  document.getElementById('block-end').value = '';
  document.getElementById('modal-block-dates').classList.add('open');
}

function getDatesInRange(start, end) {
  const dates = [];
  let cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

async function blockDates() {
  const propId = document.getElementById('block-prop-id').value;
  const start = document.getElementById('block-start').value;
  const end = document.getElementById('block-end').value;
  if (!start || !end) { toast('Selecciona fechas', 'error'); return; }
  try {
    await api('POST', `/Properties/${propId}/block-dates`, getDatesInRange(start, end));
    toast('Fechas bloqueadas', 'success');
    closeModal('modal-block-dates');
  } catch (e) { toast(e.message, 'error'); }
}

async function unblockDates() {
  const propId = document.getElementById('block-prop-id').value;
  const start = document.getElementById('block-start').value;
  const end = document.getElementById('block-end').value;
  if (!start || !end) { toast('Selecciona fechas', 'error'); return; }
  try {
    await api('POST', `/Properties/${propId}/unblock-dates`, getDatesInRange(start, end));
    toast('Fechas desbloqueadas', 'info');
    closeModal('modal-block-dates');
  } catch (e) { toast(e.message, 'error'); }
}

async function submitDateAction() {
  const actionType = document.getElementById('block-action-type').value;
  if (actionType === 'unblock') {
    await unblockDates();
    return;
  }

  await blockDates();
}

// ─── REVIEWS ────────────────────────────────────────────────
function openReview(bookingId) {
  document.getElementById('review-booking-id').value = bookingId;
  document.getElementById('review-comment').value = '';
  document.getElementById('review-rating').value = '5';
  document.getElementById('modal-review').classList.add('open');
}

async function submitReview() {
  const bookingId = document.getElementById('review-booking-id').value;
  const rating = parseInt(document.getElementById('review-rating').value);
  const comment = document.getElementById('review-comment').value.trim();
  try {
    await api('POST', '/Reviews', { bookingId, rating, comment });
    toast('¡Reseña publicada!', 'success');
    closeModal('modal-review');
  } catch (e) { toast(e.message, 'error'); }
}

// ─── NOTIFICATIONS ──────────────────────────────────────────
async function loadNotifications() {
  const el = document.getElementById('notifications-list');
  el.innerHTML = '<div class="spinner"></div>';
  const onlyUnread = document.getElementById('only-unread')?.checked;
  try {
    const notifs = await api('GET', `/Notifications${onlyUnread ? '?onlyUnread=true' : ''}`);
    if (!notifs || notifs.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="icon">🔔</div><p>Sin notificaciones.</p></div>';
      return;
    }
    el.innerHTML = notifs.map(n => `
      <div class="notif-card ${!n.isRead ? 'unread' : ''}">
        <div>
          <p class="notif-msg">${esc(n.message)}</p>
          <p class="notif-date">${new Date(n.createdAt).toLocaleString('es-DO')}</p>
        </div>
        ${!n.isRead ? `<button class="btn-ghost" style="padding:6px 12px;font-size:0.8rem;flex-shrink:0;" onclick="markRead('${n.id}')">Marcar leída</button>` : '<span style="color:var(--muted);font-size:0.8rem;">✓ Leída</span>'}
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = `<p style="color:var(--danger);">Error: ${esc(e.message)}</p>`;
  }
}

async function markRead(id) {
  try {
    await api('PUT', `/Notifications/${id}/read`);
    loadNotifications();
    loadUnreadCount();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── MODALS ─────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ─── UTILS ──────────────────────────────────────────────────
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ───────────────────────────────────────────────────
function setLoginConfirmMessage(message, type = 'success') {
  const box = document.getElementById('login-confirm-message');
  const banner = document.getElementById('login-confirm-banner');
  if (!box || !banner) return;

  if (!message) {
    banner.style.display = 'none';
    box.textContent = '';
    return;
  }

  box.textContent = message;
  banner.style.display = 'block';
  if (type === 'success') {
    banner.style.background = 'rgba(39,174,96,0.15)';
    banner.style.borderColor = 'rgba(39,174,96,0.4)';
    box.style.color = '#7ee2a8';
  } else {
    banner.style.background = 'rgba(192,57,43,0.15)';
    banner.style.borderColor = 'rgba(192,57,43,0.4)';
    box.style.color = '#ff9f96';
  }
}

function guardPageAccess(name) {
  if (!state.token && ['bookings', 'properties', 'notifications'].includes(name)) {
    toast('Debes iniciar sesión para acceder a esta sección.', 'error');
    return false;
  }

  if (name === 'bookings' && !(state.user?.roles || []).includes('Guest')) {
    toast('Esta sección es para huéspedes.', 'error');
    return false;
  }

  if (name === 'properties' && !(state.user?.roles || []).includes('Host')) {
    toast('Esta sección es para anfitriones.', 'error');
    return false;
  }

  return true;
}

const _originalShowPage = showPage;
showPage = function(name) {
  if (!guardPageAccess(name)) {
    _originalShowPage(state.token ? 'search' : 'login');
    return;
  }
  _originalShowPage(name);
};

async function confirmFromUrlIfNeeded() {
  const url = new URL(window.location.href);
  const queryToken = url.searchParams.get('confirmToken');

  let token = queryToken;
  if (!token) {
    // Compatibilidad con enlaces viejos /confirm/{token}
    const path = window.location.pathname || '';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 2 && parts[0].toLowerCase() === 'confirm') {
      token = parts[1];
    }
  }

  if (!token) return;

  showPage('login');
  try {
    const result = await api('GET', `/Auth/confirm/${encodeURIComponent(token)}`);
    const message = result?.message || 'Cuenta verificada. Inicia sesión.';
    setLoginConfirmMessage(message, 'success');
    toast(message, 'success', 6000);
  } catch (e) {
    const message = e.message || 'No se pudo verificar el token.';
    setLoginConfirmMessage(message, 'error');
    toast(message, 'error', 7000);
  } finally {
    window.history.replaceState({}, '', '/');
  }
}

updateNav();
loadProperties();
confirmFromUrlIfNeeded();