// ========================================================
// AUTH & USERS CONFIGURATION (DASHBOARD_BRASIL Standard)
// ========================================================
const DEFAULT_USERS = {
  'admin': { password: 'edo2bia', role: 'ADMIN' },
  'user': { password: 'user123', role: 'USER' },
  '01 alfonso': { password: 'alfonso', role: 'USER' },
  '02 sergio': { password: 'sergio', role: 'USER' },
  '03 jean-pierre': { password: 'jean-pierre', role: 'USER' },
  '04 stefano': { password: 'stefano', role: 'USER' },
  '05 marco': { password: 'marco', role: 'USER' },
  '06 susik': { password: 'susik', role: 'USER' },
  '07 giorgio': { password: 'giorgio', role: 'USER' },
  '08 marco': { password: 'marco', role: 'USER' },
  '09 edoardo': { password: 'edoardo', role: 'USER' },
  '10 enrico': { password: 'enrico', role: 'USER' },
  '11 glenelg': { password: 'glenelg', role: 'USER' },
  '12 marylene': { password: 'marylene', role: 'USER' },
  '13 adonella': { password: 'adonella', role: 'USER' },
  '16 salvatore': { password: 'salvatore', role: 'USER' },
  '17 mmm': { password: 'mmm', role: 'USER' }
};

let currentUsername = null;
let currentUserRole = null;

function getUsers() {
  try {
    const stored = localStorage.getItem('sombra_mappe_users');
    if (stored !== null) {
      const localUsers = JSON.parse(stored);
      if (localUsers && typeof localUsers === 'object') {
        // Garantisci sempre che l'account admin predefinito esista
        if (!localUsers['admin']) {
          localUsers['admin'] = { password: 'edo2bia', role: 'ADMIN' };
        }
        return localUsers;
      }
    }
  } catch (e) {
    console.error("Errore lettura utenti da localStorage:", e);
  }
  // Inizializzazione iniziale con DEFAULT_USERS
  saveUsers(DEFAULT_USERS);
  return { ...DEFAULT_USERS };
}

function saveUsers(usersObj) {
  try {
    localStorage.setItem('sombra_mappe_users', JSON.stringify(usersObj));
  } catch (e) {
    console.error("Errore salvataggio utenti in localStorage:", e);
  }
}

window.resetDefaultUsers = function() {
  if (confirm('Vuoi davvero ripristinare l\'elenco predefinito degli utenti iniziali?')) {
    saveUsers(DEFAULT_USERS);
    renderUsersTable();
    showToast('Elenco utenti ripristinato ai valori predefiniti.');
  }
};

function initAuth() {
  try {
    currentUserRole = sessionStorage.getItem('sombra_mappe_role');
    currentUsername = sessionStorage.getItem('sombra_mappe_username');
  } catch (e) {}

  const overlay = document.getElementById('loginOverlay');
  if (currentUserRole && currentUsername) {
    if (overlay) overlay.style.display = 'none';
    const nameEl = document.getElementById('sessionUserName');
    const roleEl = document.getElementById('sessionUserRole');
    if (nameEl) nameEl.textContent = currentUsername;
    if (roleEl) {
      roleEl.textContent = currentUserRole;
      roleEl.className = `badge-role ${currentUserRole === 'ADMIN' ? 'admin' : 'user'}`;
    }
    applyRoleRestrictions();
  } else {
    if (overlay) overlay.style.display = 'flex';
  }
}

function applyRoleRestrictions() {
  const adminNavSec = document.getElementById('navSectionAdmin');
  const adminNavItem = document.getElementById('nav-passwords');

  if (currentUserRole === 'ADMIN') {
    if (adminNavSec) adminNavSec.style.display = 'block';
    if (adminNavItem) adminNavItem.style.display = 'flex';
  } else {
    if (adminNavSec) adminNavSec.style.display = 'none';
    if (adminNavItem) adminNavItem.style.display = 'none';
    if (state.activeView === 'view-passwords') {
      switchView('view-mappa');
    }
  }
}

window.togglePasswordVisibility = function(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (iconEl) iconEl.className = 'ph ph-eye-slash toggle-pwd-icon';
  } else {
    input.type = 'password';
    if (iconEl) iconEl.className = 'ph ph-eye toggle-pwd-icon';
  }
};

function setupAuthEventListeners() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const u = (document.getElementById('loginUsername').value || '').trim().toLowerCase();
      const p = (document.getElementById('loginPassword').value || '').trim();
      const errorEl = document.getElementById('loginError');

      const usersObj = getUsers();
      if (usersObj[u] && usersObj[u].password === p) {
        currentUserRole = usersObj[u].role;
        currentUsername = u;
        try {
          sessionStorage.setItem('sombra_mappe_role', currentUserRole);
          sessionStorage.setItem('sombra_mappe_username', currentUsername);
        } catch (err) {}

        // Registra log di accesso
        recordAccessLog('DASHBOARD_MAPPE', u, currentUserRole);

        if (errorEl) errorEl.style.display = 'none';
        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.style.display = 'none';

        initAuth();
        switchView('view-mappa');
        showToast(`Benvenuto, ${u}!`);
      } else {
        if (errorEl) {
          errorEl.textContent = 'Credenziali non corrette. Verifica username e password.';
          errorEl.style.display = 'block';
        }
      }
    });
  }
}

window.logoutApp = function() {
  if (confirm('Sei sicuro di voler effettuare il logout?')) {
    try {
      sessionStorage.removeItem('sombra_mappe_role');
      sessionStorage.removeItem('sombra_mappe_username');
    } catch (e) {}
    currentUserRole = null;
    currentUsername = null;
    location.reload();
  }
};

window.openChangePasswordModal = function() {
  const oldP = document.getElementById('changePwdOld');
  const newP = document.getElementById('changePwdNew');
  const confP = document.getElementById('changePwdConfirm');
  if (oldP) oldP.value = '';
  if (newP) newP.value = '';
  if (confP) confP.value = '';
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeChangePasswordModal = function() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.classList.add('hidden');
};

window.submitChangePassword = function() {
  const oldP = (document.getElementById('changePwdOld').value || '').trim();
  const newP = (document.getElementById('changePwdNew').value || '').trim();
  const confP = (document.getElementById('changePwdConfirm').value || '').trim();

  if (!oldP || !newP || !confP) {
    alert('Compila tutti i campi richiesti.');
    return;
  }

  if (newP !== confP) {
    alert('La nuova password e la conferma non coincidono!');
    return;
  }

  if (newP.length < 3) {
    alert('La nuova password deve contenere almeno 3 caratteri.');
    return;
  }

  const usersObj = getUsers();
  if (!currentUsername || !usersObj[currentUsername]) {
    alert('Utente non trovato o sessione scaduta.');
    return;
  }

  if (usersObj[currentUsername].password !== oldP) {
    alert('La vecchia password inserita non è corretta.');
    return;
  }

  usersObj[currentUsername].password = newP;
  saveUsers(usersObj);
  closeChangePasswordModal();
  showToast('Password modificata con successo!');
  if (currentUserRole === 'ADMIN' && state.activeView === 'view-passwords') {
    renderUsersTable();
  }
};

// ========================================================
// ADMIN USER & PASSWORD MANAGEMENT FUNCTIONS
// ========================================================
let visiblePasswords = new Set();

window.toggleTableRowPassword = function(uname) {
  if (visiblePasswords.has(uname)) {
    visiblePasswords.delete(uname);
  } else {
    visiblePasswords.add(uname);
  }
  const searchInput = document.getElementById('userSearchInput');
  renderUsersTable(searchInput ? searchInput.value : '');
};

window.renderUsersTable = function(filterQuery = '') {
  if (currentUserRole !== 'ADMIN') return;
  const tbody = document.getElementById('usersTableBody');
  const countEl = document.getElementById('usersRowCount');
  if (!tbody) return;

  const usersObj = getUsers();
  let entries = Object.entries(usersObj);

  const query = String(filterQuery || '').toLowerCase().trim();
  if (query) {
    entries = entries.filter(([uname, data]) => uname.toLowerCase().includes(query) || (data.role && data.role.toLowerCase().includes(query)));
  }

  if (countEl) countEl.textContent = entries.length;

  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#94a3b8;">Nessun utente trovato</td></tr>`;
    return;
  }

  tbody.innerHTML = entries.map(([uname, data], idx) => {
    const isVisible = visiblePasswords.has(uname);
    const pwdDisplay = isVisible ? data.password : '••••••••';
    const isCurrent = uname.toLowerCase() === (currentUsername || '').toLowerCase();
    const roleBadge = data.role === 'ADMIN' 
      ? `<span class="badge-role" style="background:#083361; color:#fff;">ADMIN</span>`
      : `<span class="badge-role" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">USER</span>`;

    return `
      <tr>
        <td style="text-align:center; color:#94a3b8; font-weight:600;">${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="ph ph-user" style="color:#083361; font-size:1.1rem;"></i>
            <strong style="color:#0f172a;">${uname}</strong>
            ${isCurrent ? '<span style="font-size:0.7rem; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px; font-weight:700;">TU</span>' : ''}
          </div>
        </td>
        <td>
          <div class="pwd-display-box">
            <span>${pwdDisplay}</span>
            <button class="pwd-toggle-btn" title="${isVisible ? 'Nascondi password' : 'Mostra password'}" onclick="toggleTableRowPassword('${uname}')">
              <i class="ph ${isVisible ? 'ph-eye-slash' : 'ph-eye'}"></i>
            </button>
          </div>
        </td>
        <td style="text-align:center;">${roleBadge}</td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:6px;">
            <button class="table-action-btn" title="Modifica Utente / Password" onclick="openEditUserModal('${uname}', '${data.role}')">
              <i class="ph ph-pencil-simple"></i>
            </button>
            ${!isCurrent ? `
              <button class="table-action-btn btn-delete" title="Elimina Utente" onclick="deleteUser('${uname}')">
                <i class="ph ph-trash"></i>
              </button>
            ` : `
              <button class="table-action-btn" style="opacity:0.3; cursor:not-allowed;" title="Non puoi eliminare il tuo stesso account" disabled>
                <i class="ph ph-trash"></i>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

let editingUsername = null;

window.openAddUserModal = function() {
  editingUsername = null;
  document.getElementById('userModalTitle').textContent = 'Nuovo Utente';
  const unameInput = document.getElementById('userInputUsername');
  unameInput.value = '';
  unameInput.disabled = false;
  document.getElementById('userInputPassword').value = '';
  document.getElementById('userInputRole').value = 'USER';
  const hint = document.getElementById('userPwdHint');
  if (hint) hint.style.display = 'none';
  const modal = document.getElementById('userModal');
  if (modal) modal.classList.remove('hidden');
};

window.openEditUserModal = function(uname, role) {
  editingUsername = uname;
  document.getElementById('userModalTitle').textContent = `Modifica Utente '${uname}'`;
  const unameInput = document.getElementById('userInputUsername');
  unameInput.value = uname;
  unameInput.disabled = true;
  document.getElementById('userInputPassword').value = '';
  document.getElementById('userInputRole').value = role || 'USER';
  const hint = document.getElementById('userPwdHint');
  if (hint) hint.style.display = 'block';
  const modal = document.getElementById('userModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeUserModal = function() {
  const modal = document.getElementById('userModal');
  if (modal) modal.classList.add('hidden');
};

window.saveUserData = function() {
  const uname = (document.getElementById('userInputUsername').value || '').trim().toLowerCase();
  const pwd = (document.getElementById('userInputPassword').value || '').trim();
  const role = document.getElementById('userInputRole').value;

  if (!uname) {
    alert('Inserisci un Username valido.');
    return;
  }

  const usersObj = getUsers();

  if (editingUsername) {
    // Modifica
    if (pwd) {
      usersObj[editingUsername].password = pwd;
    }
    usersObj[editingUsername].role = role;
    saveUsers(usersObj);
    closeUserModal();
    renderUsersTable();
    showToast(`Utente '${editingUsername}' aggiornato con successo!`);
  } else {
    // Nuovo
    if (!pwd) {
      alert('La password è obbligatoria per creare un nuovo utente.');
      return;
    }
    if (usersObj[uname]) {
      alert(`L'utente '${uname}' esiste già! Scegli un altro username o modifica quello esistente.`);
      return;
    }
    usersObj[uname] = { password: pwd, role: role };
    saveUsers(usersObj);
    closeUserModal();
    renderUsersTable();
    showToast(`Nuovo utente '${uname}' creato con successo!`);
  }
};

window.deleteUser = function(uname) {
  if (uname.toLowerCase() === (currentUsername || '').toLowerCase()) {
    alert('Non puoi eliminare il tuo stesso account amministratore.');
    return;
  }

  if (confirm(`Sei sicuro di voler eliminare l'utente '${uname}'? L'accesso sarà revocato immediatamente.`)) {
    const usersObj = getUsers();
    delete usersObj[uname];
    saveUsers(usersObj);
    renderUsersTable();
    showToast(`Utente '${uname}' eliminato.`);
  }
};

// ========================================================
// ACCESS LOGGING & GOOGLE SHEETS WEBHOOK
// ========================================================
function getDeviceAndBrowserInfo() {
  const ua = navigator.userAgent || '';
  let device = 'PC / Desktop';
  if (/android/i.test(ua)) device = 'Android Mobile';
  else if (/iphone/i.test(ua)) device = 'iPhone';
  else if (/ipad/i.test(ua)) device = 'iPad';
  else if (/macintosh|mac os x/i.test(ua)) device = 'Mac Desktop';
  else if (/windows/i.test(ua)) device = 'Windows PC';
  else if (/linux/i.test(ua)) device = 'Linux PC';

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

  return `${device} (${browser})`;
}

function recordAccessLog(appId, username, role) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT');
  const timeStr = now.toLocaleTimeString('it-IT');
  const timestamp = `${dateStr} ${timeStr}`;
  const device = getDeviceAndBrowserInfo();
  const screen = `${window.screen ? window.screen.width : 0}x${window.screen ? window.screen.height : 0}`;

  const entry = {
    app: appId,
    username: username,
    role: role,
    timestamp: timestamp,
    device: device,
    screen: screen
  };

  try {
    const logs = JSON.parse(localStorage.getItem('sombra_access_logs') || '[]');
    logs.unshift(entry);
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem('sombra_access_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Errore salvataggio log accessi:', e);
  }

  // Invio a Google Sheets Webhook se configurato
  sendToGoogleSheetsWebhook(entry);
}

function sendToGoogleSheetsWebhook(entry) {
  try {
    const webhookUrl = localStorage.getItem('sombra_google_sheets_webhook') || '';
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(err => console.log('Ping Google Sheets webhook:', err));
    }
  } catch (e) {}
}

window.renderAccessLogsTable = function(filterQuery = '') {
  if (currentUserRole !== 'ADMIN') return;
  const tbody = document.getElementById('accessLogsTableBody');
  const countEl = document.getElementById('logsRowCount');
  if (!tbody) return;

  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem('sombra_access_logs') || '[]');
  } catch (e) {}

  const query = String(filterQuery || '').toLowerCase().trim();
  if (query) {
    logs = logs.filter(l => 
      (l.username && l.username.toLowerCase().includes(query)) ||
      (l.timestamp && l.timestamp.toLowerCase().includes(query)) ||
      (l.device && l.device.toLowerCase().includes(query)) ||
      (l.app && l.app.toLowerCase().includes(query))
    );
  }

  if (countEl) countEl.textContent = logs.length;

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:#94a3b8;">Nessun accesso registrato finora</td></tr>`;
    return;
  }

  tbody.innerHTML = logs.map((log, idx) => {
    const roleBadge = log.role === 'ADMIN'
      ? `<span class="badge-role" style="background:#083361; color:#fff;">ADMIN</span>`
      : `<span class="badge-role" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">USER</span>`;
    
    return `
      <tr>
        <td style="text-align:center; color:#94a3b8; font-weight:600;">${idx + 1}</td>
        <td style="font-weight:600; color:#0f172a; white-space:nowrap;"><i class="ph ph-clock" style="margin-right:4px; color:#64748b;"></i>${log.timestamp}</td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <i class="ph ph-user" style="color:#083361;"></i>
            <strong>${log.username}</strong>
          </div>
        </td>
        <td style="text-align:center;">${roleBadge}</td>
        <td><i class="ph ph-devices" style="margin-right:4px; color:#64748b;"></i>${log.device || '-'}</td>
        <td style="color:#64748b; font-size:0.82rem;">${log.screen || '-'}</td>
      </tr>
    `;
  }).join('');
};

window.exportAccessLogsToExcel = function() {
  try {
    const logs = JSON.parse(localStorage.getItem('sombra_access_logs') || '[]');
    if (logs.length === 0) {
      alert('Nessun log di accesso da esportare.');
      return;
    }
    const exportData = logs.map((l, i) => ({
      '#': i + 1,
      'Data e Ora': l.timestamp,
      'Applicazione': l.app,
      'Username': l.username,
      'Ruolo': l.role,
      'Dispositivo e Browser': l.device,
      'Risoluzione Schermo': l.screen
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registro Accessi');
    XLSX.writeFile(wb, `Registro_Accessi_Sombra_${Date.now()}.xlsx`);
    showToast('Registro accessi esportato in Excel!');
  } catch (err) {
    alert('Errore esportazione Excel: ' + err.message);
  }
};

window.clearAccessLogs = function() {
  if (confirm('Vuoi davvero cancellare la cronologia degli accessi registrati sul browser?')) {
    localStorage.removeItem('sombra_access_logs');
    renderAccessLogsTable();
    showToast('Cronologia accessi cancellata.');
  }
};

window.initWebhookInput = function() {
  const input = document.getElementById('webhookUrlInput');
  if (input) {
    input.value = localStorage.getItem('sombra_google_sheets_webhook') || '';
  }
};

window.saveWebhookUrl = function() {
  const input = document.getElementById('webhookUrlInput');
  if (!input) return;
  const url = (input.value || '').trim();
  localStorage.setItem('sombra_google_sheets_webhook', url);
  showToast(url ? 'URL Google Sheets Webhook salvato!' : 'Webhook rimosso.');
};

window.testWebhookLog = function() {
  const input = document.getElementById('webhookUrlInput');
  const url = input ? (input.value || '').trim() : '';
  if (!url) {
    alert('Inserisci prima l\'URL del tuo Google Apps Script Webhook.');
    return;
  }
  localStorage.setItem('sombra_google_sheets_webhook', url);
  recordAccessLog('TEST_PING', currentUsername || 'admin', currentUserRole || 'ADMIN');
  renderAccessLogsTable();
  alert('Invio di test eseguito! Controlla il tuo Google Foglio per verificare la nuova riga inserita.');
};

window.openGoogleScriptModal = function() {
  const modal = document.getElementById('googleScriptModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeGoogleScriptModal = function() {
  const modal = document.getElementById('googleScriptModal');
  if (modal) modal.classList.add('hidden');
};

// State Management
const state = {
  excelData: [],
  columns: { hotel: null, year: null, month: null, country: null, region: null, province: null, city: null, channel: null, metrics: [], all: [] },
  activeView: 'view-mappa',
  activeLevel: 'country', // 'country' (World), 'region', 'province'
  activeMetric: 'CLIENTI',
  activeAgg: 'sum',
  activePalette: 'blue',
  activeBaseMap: 'osm_light',
  borderColor: '#64748b',
  borderWidth: 0.8,
  hotelFilter: '',
  availableHotels: [],
  yearFilter: '',
  monthFilter: '',
  countryFilter: '',
  regionFilter: '',
  availableSheets: [],
  currentSheet: '',
  charts: {
    hotelDist: null,
    monthlyTrend: null,
    topCities: null,
    channelShare: null,
    channelByHotel: null
  },
  geoData: {
    world: null,
    italyRegions: null,
    italyProvinces: null,
    usaStates: null,
    brazilStates: null
  },
  map: null,
  geoJsonLayer: null,
  maskLayer: null,
  regionBorderLayer: null,
  countryPerimeterLayer: null,
  baseTileLayer: null
};

// Italian Month Names
const MONTH_NAMES = {
  1: 'Gennaio', 2: 'Febbraio', 3: 'Marzo', 4: 'Aprile',
  5: 'Maggio', 6: 'Giugno', 7: 'Luglio', 8: 'Agosto',
  9: 'Settembre', 10: 'Ottobre', 11: 'Novembre', 12: 'Dicembre'
};

// Color Palettes
const PALETTES = {
  blue: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7', '#0369a1', '#0c4a6e'],
  emerald: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#059669', '#047857', '#064e3b'],
  crimson: ['#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#e11d48', '#be123c', '#881337'],
  purple: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#9333ea', '#7e22ce', '#581c87'],
  heat: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'],
  viridis: ['#fde725', '#7ad151', '#22a884', '#2a788e', '#414487', '#440154'],
  sunset: ['#fee2e2', '#fbcfe8', '#f472b6', '#db2777', '#9333ea', '#4c1d95']
};

// Standard Worldwide Country Aliases & Normalization Map
const COUNTRY_ALIASES = {
  'it': 'Italy', 'ita': 'Italy', 'italia': 'Italy', 'italy': 'Italy',
  'us': 'United States of America', 'usa': 'United States of America', 'stati uniti': 'United States of America', 'united states': 'United States of America', 'usa / stati uniti': 'United States of America',
  'br': 'Brazil', 'bra': 'Brazil', 'brasile': 'Brazil', 'brazil': 'Brazil', 'brasil': 'Brazil',
  'fr': 'France', 'fra': 'France', 'francia': 'France', 'france': 'France',
  'de': 'Germany', 'deu': 'Germany', 'germania': 'Germany', 'germany': 'Germany', 'deutschland': 'Germany',
  'es': 'Spain', 'esp': 'Spain', 'spagna': 'Spain', 'spain': 'Spain', 'españa': 'Spain',
  'uk': 'United Kingdom', 'gbr': 'United Kingdom', 'regno unito': 'United Kingdom', 'gran bretagna': 'United Kingdom', 'great britain': 'United Kingdom', 'england': 'United Kingdom', 'inghilterra': 'United Kingdom',
  'ch': 'Switzerland', 'che': 'Switzerland', 'svizzera': 'Switzerland', 'switzerland': 'Switzerland',
  'at': 'Austria', 'aut': 'Austria', 'austria': 'Austria',
  'nl': 'Netherlands', 'nld': 'Netherlands', 'olanda': 'Netherlands', 'paesi bassi': 'Netherlands',
  'be': 'Belgium', 'bel': 'Belgium', 'belgio': 'Belgium',
  'pt': 'Portugal', 'prt': 'Portugal', 'portogallo': 'Portugal',
  'cn': 'China', 'chn': 'China', 'cina': 'China',
  'jp': 'Japan', 'jpn': 'Japan', 'giappone': 'Japan',
  'in': 'India', 'ind': 'India',
  'au': 'Australia', 'aus': 'Australia',
  'ca': 'Canada', 'can': 'Canada',
  'mx': 'Mexico', 'mex': 'Mexico', 'messico': 'Mexico',
  'ar': 'Argentina', 'arg': 'Argentina', 'argentina': 'Argentina',
  'cl': 'Chile', 'chile': 'Chile', 'cile': 'Chile', 'chl': 'Chile',
  'uy': 'Uruguay', 'uruguay': 'Uruguay',
  'co': 'Colombia', 'colombia': 'Colombia',
  'pe': 'Peru', 'peru': 'Peru', 'perù': 'Peru',
  'se': 'Sweden', 'svezia': 'Sweden', 'sweden': 'Sweden',
  'no': 'Norway', 'norvegia': 'Norway', 'norway': 'Norway',
  'dk': 'Denmark', 'danimarca': 'Denmark', 'denmark': 'Denmark',
  'ie': 'Ireland', 'irlanda': 'Ireland', 'ireland': 'Ireland',
  'pl': 'Poland', 'polonia': 'Poland', 'poland': 'Poland',
  'ru': 'Russia', 'russia': 'Russia', 'federazione russa': 'Russia'
};

// Country to ISO2 2-letter code mapping
const COUNTRY_TO_ISO2 = {
  'it': 'it', 'ita': 'it', 'italia': 'it', 'italy': 'it',
  'br': 'br', 'bra': 'br', 'brasil': 'br', 'brasile': 'br', 'brazil': 'br',
  'fr': 'fr', 'fra': 'fr', 'francia': 'fr', 'france': 'fr',
  'de': 'de', 'deu': 'de', 'germania': 'de', 'germany': 'de', 'deutschland': 'de',
  'es': 'es', 'esp': 'es', 'spagna': 'es', 'spain': 'es', 'espana': 'es', 'españa': 'es',
  'pt': 'pt', 'prt': 'pt', 'portogallo': 'pt', 'portugal': 'pt',
  'gb': 'gb', 'gbr': 'gb', 'uk': 'gb', 'regno unito': 'gb', 'gran bretagna': 'gb', 'great britain': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'inghilterra': 'gb',
  'us': 'us', 'usa': 'us', 'stati uniti': 'us', 'stati uniti damerica': 'us', 'stati uniti d\'america': 'us', 'united states': 'us', 'united states of america': 'us',
  'ch': 'ch', 'che': 'ch', 'svizzera': 'ch', 'switzerland': 'ch', 'suisse': 'ch', 'schweiz': 'ch',
  'at': 'at', 'aut': 'at', 'austria': 'at', 'osterreich': 'at', 'österreich': 'at',
  'nl': 'nl', 'nld': 'nl', 'olanda': 'nl', 'paesi bassi': 'nl', 'netherlands': 'nl', 'holland': 'nl',
  'be': 'be', 'bel': 'be', 'belgio': 'be', 'belgium': 'be', 'belgique': 'be',
  'ar': 'ar', 'arg': 'ar', 'argentina': 'ar',
  'cl': 'cl', 'chl': 'cl', 'cile': 'cl', 'chile': 'cl',
  'uy': 'uy', 'ury': 'uy', 'uruguay': 'uy',
  'py': 'py', 'pry': 'py', 'paraguay': 'py',
  'co': 'co', 'col': 'co', 'colombia': 'co',
  'pe': 'pe', 'per': 'pe', 'peru': 'pe', 'perù': 'pe',
  'mx': 'mx', 'mex': 'mx', 'messico': 'mx', 'mexico': 'mx',
  'ca': 'ca', 'can': 'ca', 'canada': 'ca',
  'au': 'au', 'aus': 'au', 'australia': 'au',
  'nz': 'nz', 'nzl': 'nz', 'nuova zelanda': 'nz', 'new zealand': 'nz',
  'jp': 'jp', 'jpn': 'jp', 'giappone': 'jp', 'japan': 'jp',
  'cn': 'cn', 'chn': 'cn', 'cina': 'cn', 'china': 'cn',
  'in': 'in', 'ind': 'in', 'india': 'in',
  'ru': 'ru', 'rus': 'ru', 'russia': 'ru', 'federazione russa': 'ru', 'russian federation': 'ru',
  'se': 'se', 'swe': 'se', 'svezia': 'se', 'sweden': 'se',
  'no': 'no', 'nor': 'no', 'norvegia': 'no', 'norway': 'no',
  'dk': 'dk', 'dnk': 'dk', 'danimarca': 'dk', 'denmark': 'dk',
  'fi': 'fi', 'fin': 'fi', 'finlandia': 'fi', 'finland': 'fi',
  'pl': 'pl', 'pol': 'pl', 'polonia': 'pl', 'poland': 'pl',
  'ie': 'ie', 'irl': 'ie', 'irlanda': 'ie', 'ireland': 'ie',
  'gr': 'gr', 'grc': 'gr', 'grecia': 'gr', 'greece': 'gr',
  'tr': 'tr', 'tur': 'tr', 'turchia': 'tr', 'turkey': 'tr',
  'hr': 'hr', 'hrv': 'hr', 'croazia': 'hr', 'croatia': 'hr',
  'cz': 'cz', 'cze': 'cz', 'repubblica ceca': 'cz', 'czech republic': 'cz', 'czechia': 'cz',
  'hu': 'hu', 'hun': 'hu', 'ungheria': 'hu', 'hungary': 'hu',
  'ro': 'ro', 'rou': 'ro', 'romania': 'ro',
  'bg': 'bg', 'bgr': 'bg', 'bulgaria': 'bg',
  'ua': 'ua', 'ukr': 'ua', 'ucraina': 'ua', 'ukraine': 'ua',
  'kr': 'kr', 'kor': 'kr', 'corea del sud': 'kr', 'south korea': 'kr',
  'th': 'th', 'tha': 'th', 'tailandia': 'th', 'thailand': 'th',
  'vn': 'vn', 'vnm': 'vn', 'vietnam': 'vn',
  'id': 'id', 'idn': 'id', 'indonesia': 'id',
  'sg': 'sg', 'sgp': 'sg', 'singapore': 'sg',
  'my': 'my', 'mys': 'my', 'malesia': 'my', 'malaysia': 'my',
  'ph': 'ph', 'phl': 'ph', 'filippine': 'ph', 'philippines': 'ph',
  'il': 'il', 'isr': 'il', 'israele': 'il', 'israel': 'il',
  'ae': 'ae', 'are': 'ae', 'emirati arabi uniti': 'ae', 'united arab emirates': 'ae', 'uae': 'ae',
  'eg': 'eg', 'egy': 'eg', 'egitto': 'eg', 'egypt': 'eg',
  'ma': 'ma', 'mar': 'ma', 'marocco': 'ma', 'morocco': 'ma',
  'za': 'za', 'zaf': 'za', 'sudafrica': 'za', 'south africa': 'za',
  've': 've', 'ven': 've', 'venezuela': 've',
  'bo': 'bo', 'bol': 'bo', 'bolivia': 'bo',
  'ec': 'ec', 'ecu': 'ec', 'ecuador': 'ec',
  'pa': 'pa', 'pan': 'pa', 'panama': 'pa',
  'cr': 'cr', 'cri': 'cr', 'costa rica': 'cr',
  'cu': 'cu', 'cub': 'cu', 'cuba': 'cu',
  'do': 'do', 'dom': 'do', 'repubblica dominicana': 'do', 'dominican republic': 'do'
};

// Country Flags Emoji Dictionary (fallback)
const COUNTRY_FLAGS = {
  'italia': '🇮🇹', 'italy': '🇮🇹', 'ita': '🇮🇹', 'it': '🇮🇹',
  'brasile': '🇧🇷', 'brazil': '🇧🇷', 'brasil': '🇧🇷', 'bra': '🇧🇷', 'br': '🇧🇷',
  'germania': '🇩🇪', 'germany': '🇩🇪', 'de': '🇩🇪',
  'francia': '🇫🇷', 'france': '🇫🇷', 'fr': '🇫🇷',
  'regno unito': '🇬🇧', 'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'inghilterra': '🇬🇧', 'gran bretagna': '🇬🇧', 'gb': '🇬🇧',
  'stati uniti': '🇺🇸', 'united states': '🇺🇸', 'usa': '🇺🇸', 'us': '🇺🇸',
  'spagna': '🇪🇸', 'spain': '🇪🇸', 'es': '🇪🇸',
  'portogallo': '🇵🇹', 'portugal': '🇵🇹', 'pt': '🇵🇹',
  'argentina': '🇦🇷', 'ar': '🇦🇷',
  'svizzera': '🇨🇭', 'switzerland': '🇨🇭', 'ch': '🇨🇭',
  'cile': '🇨🇱', 'chile': '🇨🇱', 'cl': '🇨🇱',
  'peru': '🇵🇪', 'perù': '🇵🇪', 'pe': '🇵🇪',
  'paesi bassi': '🇳🇱', 'netherlands': '🇳🇱', 'olanda': '🇳🇱', 'nl': '🇳🇱',
  'austria': '🇦🇹', 'at': '🇦🇹',
  'belgio': '🇧🇪', 'belgium': '🇧🇪', 'be': '🇧🇪',
  'canada': '🇨🇦', 'ca': '🇨🇦',
  'australia': '🇦🇺', 'au': '🇦🇺',
  'giappone': '🇯🇵', 'japan': '🇯🇵', 'jp': '🇯🇵',
  'cina': '🇨🇳', 'china': '🇨🇳', 'cn': '🇨🇳',
  'uruguay': '🇺🇾', 'uy': '🇺🇾',
  'colombia': '🇨🇴', 'co': '🇨🇴',
  'messico': '🇲🇽', 'mexico': '🇲🇽', 'mx': '🇲🇽'
};

// Helper to get ISO2 code from country name or alias
function getCountryIso2(countryNameOrCode) {
  if (!countryNameOrCode) return null;
  const str = String(countryNameOrCode).trim().toLowerCase();
  if (str === '-99' || str === '-90' || str === 'null' || str === 'undefined' || str === '' || str.length < 2) {
    return null;
  }
  const norm = normalizeStr(str);

  if (COUNTRY_TO_ISO2[str]) return COUNTRY_TO_ISO2[str];
  if (COUNTRY_TO_ISO2[norm]) return COUNTRY_TO_ISO2[norm];

  const alias = COUNTRY_ALIASES[str] || COUNTRY_ALIASES[norm];
  if (alias) {
    const aLower = alias.toLowerCase();
    const aNorm = normalizeStr(aLower);
    if (COUNTRY_TO_ISO2[aLower]) return COUNTRY_TO_ISO2[aLower];
    if (COUNTRY_TO_ISO2[aNorm]) return COUNTRY_TO_ISO2[aNorm];
  }

  if (/^[a-z]{2}$/i.test(str)) {
    return str.toLowerCase();
  }

  return null;
}

// Helper to generate flag HTML (high-res image with fallback)
function getCountryFlagHtml(countryNameOrCode, options = {}) {
  const iso2 = getCountryIso2(countryNameOrCode);
  const extraClass = options.className || '';
  const style = options.style || '';
  const alt = options.alt || (countryNameOrCode || 'Flag');

  if (iso2) {
    return `<img src="https://flagcdn.com/w40/${iso2}.png" srcset="https://flagcdn.com/w80/${iso2}.png 2x" alt="${alt}" class="country-flag-icon ${extraClass}" style="${style}" crossorigin="anonymous" loading="lazy">`;
  }

  const str = String(countryNameOrCode || '').toLowerCase();
  const emoji = COUNTRY_FLAGS[str] || COUNTRY_FLAGS[normalizeStr(str)];
  if (emoji) {
    return `<span class="summary-flag-emoji ${extraClass}" style="${style}">${emoji}</span>`;
  }

  return `<span class="summary-flag-emoji ${extraClass}" style="${style}">🌐</span>`;
}

// Italian Province Code / Name Mappings
const IT_PROV_CODES = {
  'AG': 'Agrigento', 'AL': 'Alessandria', 'AN': 'Ancona', 'AO': 'Aosta', 'AP': 'Ascoli Piceno', 'AQ': "L'Aquila", 'AR': 'Arezzo',
  'AT': 'Asti', 'AV': 'Avellino', 'BA': 'Bari', 'BG': 'Bergamo', 'BI': 'Biella', 'BL': 'Belluno', 'BN': 'Benevento',
  'BO': 'Bologna', 'BR': 'Brindisi', 'BS': 'Brescia', 'BT': 'Barletta-Andria-Trani', 'BZ': 'Bolzano', 'CA': 'Cagliari',
  'CB': 'Campobasso', 'CE': 'Caserta', 'CH': 'Chieti', 'CL': 'Caltanissetta', 'CN': 'Cuneo', 'CO': 'Como', 'CR': 'Cremona',
  'CS': 'Cosenza', 'CT': 'Catania', 'CZ': 'Catanzaro', 'EN': 'Enna', 'FC': 'Forlì-Cesena', 'FE': 'Ferrara', 'FG': 'Foggia',
  'FI': 'Firenze', 'FM': 'Fermo', 'FR': 'Frosinone', 'GE': 'Genova', 'GO': 'Gorizia', 'GR': 'Grosseto', 'IM': 'Imperia',
  'IS': 'Isernia', 'KR': 'Crotone', 'LC': 'Lecco', 'LE': 'Lecce', 'LI': 'Livorno', 'LO': 'Lodi', 'LT': 'Latina',
  'LU': 'Lucca', 'MB': 'Monza e della Brianza', 'MC': 'Macerata', 'ME': 'Messina', 'MI': 'Milano', 'MN': 'Mantova',
  'MO': 'Modena', 'MS': 'Massa-Carrara', 'MT': 'Matera', 'NA': 'Napoli', 'NO': 'Novara', 'NU': 'Nuoro', 'OR': 'Oristano',
  'PA': 'Palermo', 'PC': 'Piacenza', 'PD': 'Padova', 'PE': 'Pescara', 'PG': 'Perugia', 'PI': 'Pisa', 'PN': 'Pordenone',
  'PO': 'Prato', 'PR': 'Parma', 'PT': 'Pistoia', 'PU': 'Pesaro e Urbino', 'PV': 'Pavia', 'PZ': 'Potenza', 'RA': 'Ravenna',
  'RC': 'Reggio Calabria', 'RE': 'Reggio Emilia', 'RG': 'Ragusa', 'RI': 'Rieti', 'RM': 'Roma', 'RN': 'Rimini', 'RO': 'Rovigo',
  'SA': 'Salerno', 'SI': 'Siena', 'SO': 'Sondrio', 'SP': 'La Spezia', 'SR': 'Siracusa', 'SS': 'Sassari', 'SU': 'Sud Sardegna',
  'SV': 'Savona', 'TA': 'Taranto', 'TE': 'Teramo', 'TN': 'Trento', 'TO': 'Torino', 'TP': 'Trapani', 'TR': 'Terni',
  'TS': 'Trieste', 'TV': 'Treviso', 'UD': 'Udine', 'VA': 'Varese', 'VB': 'Verbano-Cusio-Ossola', 'VC': 'Vercelli',
  'VE': 'Venezia', 'VI': 'Vicenza', 'VR': 'Verona', 'VT': 'Viterbo', 'VV': 'Vibo Valentia'
};

// Brazilian State / UF Aliases & Normalization
const BRAZIL_STATE_ALIASES = {
  'goianhia': 'Goiás', 'goiania': 'Goiás', 'goiás': 'Goiás', 'goias': 'Goiás', 'go': 'Goiás',
  'sao paulo': 'São Paulo', 'sãopaulo': 'São Paulo', 'san paolo': 'São Paulo', 'sp': 'São Paulo',
  'rio grande do norte': 'Rio Grande do Norte', 'riograndedonorte': 'Rio Grande do Norte', 'rn': 'Rio Grande do Norte',
  'rio grande do sul': 'Rio Grande do Sul', 'riograndedosul': 'Rio Grande do Sul', 'rs': 'Rio Grande do Sul',
  'rio de janeiro': 'Rio de Janeiro', 'riodejaneiro': 'Rio de Janeiro', 'rj': 'Rio de Janeiro',
  'minas gerais': 'Minas Gerais', 'minasgerais': 'Minas Gerais', 'mg': 'Minas Gerais',
  'bahia': 'Bahia', 'ba': 'Bahia',
  'parana': 'Paraná', 'paraná': 'Paraná', 'pr': 'Paraná',
  'santa catarina': 'Santa Catarina', 'santacatarina': 'Santa Catarina', 'sc': 'Santa Catarina',
  'ceara': 'Ceará', 'ceará': 'Ceará', 'ce': 'Ceará',
  'pernambuco': 'Pernambuco', 'pe': 'Pernambuco',
  'maranhao': 'Maranhão', 'maranhão': 'Maranhão', 'ma': 'Maranhão',
  'para': 'Pará', 'pará': 'Pará', 'pa': 'Pará',
  'amazonas': 'Amazonas', 'am': 'Amazonas',
  'espirito santo': 'Espírito Santo', 'espíritosanto': 'Espírito Santo', 'es': 'Espírito Santo',
  'distrito federal': 'Distrito Federal', 'brasilia': 'Distrito Federal', 'brasília': 'Distrito Federal', 'df': 'Distrito Federal',
  'mato grosso': 'Mato Grosso', 'matogrosso': 'Mato Grosso', 'mt': 'Mato Grosso',
  'mato grosso do sul': 'Mato Grosso do Sul', 'matogrossodosul': 'Mato Grosso do Sul', 'ms': 'Mato Grosso do Sul',
  'paraiba': 'Paraíba', 'paraíba': 'Paraíba', 'pb': 'Paraíba',
  'piaui': 'Piauí', 'piauí': 'Piauí', 'pi': 'Piauí',
  'alagoas': 'Alagoas', 'al': 'Alagoas',
  'sergipe': 'Sergipe', 'se': 'Sergipe',
  'rondonia': 'Rondônia', 'rondônia': 'Rondônia', 'ro': 'Rondônia',
  'tocantins': 'Tocantins', 'to': 'Tocantins',
  'acre': 'Acre', 'ac': 'Acre',
  'amapa': 'Amapá', 'amapá': 'Amapá', 'ap': 'Amapá',
  'roraima': 'Roraima', 'rr': 'Roraima'
};

function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeCountryName(countryName) {
  if (!countryName) return '';
  const str = String(countryName).trim().toLowerCase();
  const norm = normalizeStr(str);
  const alias = COUNTRY_ALIASES[str] || COUNTRY_ALIASES[norm];
  if (alias) return normalizeStr(alias);
  return norm;
}

// Comprehensive City -> (Country, Region, Province) Mapping
const CITY_LOOKUP = {
  // Brasile
  'natal': { country: 'BRASILE', region: 'RIO GRANDE DO NORTE', province: 'NATAL' },
  'pipa': { country: 'BRASILE', region: 'RIO GRANDE DO NORTE', province: 'TIBAU DO SUL' },
  'tibaudosul': { country: 'BRASILE', region: 'RIO GRANDE DO NORTE', province: 'TIBAU DO SUL' },
  'belohorizonte': { country: 'BRASILE', region: 'MINAS GERAIS', province: 'BELO HORIZONTE' },
  'sanpaolo': { country: 'BRASILE', region: 'SAO PAULO', province: 'SAO PAULO' },
  'saopaulo': { country: 'BRASILE', region: 'SAO PAULO', province: 'SAO PAULO' },
  'portoalegre': { country: 'BRASILE', region: 'RIO GRANDE DO SUL', province: 'PORTO ALEGRE' },
  'riodejaneiro': { country: 'BRASILE', region: 'RIO DE JANEIRO', province: 'RIO DE JANEIRO' },
  'brasilia': { country: 'BRASILE', region: 'DISTRITO FEDERAL', province: 'BRASILIA' },
  'salvador': { country: 'BRASILE', region: 'BAHIA', province: 'SALVADOR' },
  'fortaleza': { country: 'BRASILE', region: 'CEARA', province: 'FORTALEZA' },
  'recife': { country: 'BRASILE', region: 'PERNAMBUCO', province: 'RECIFE' },
  'curitiba': { country: 'BRASILE', region: 'PARANA', province: 'CURITIBA' },
  'manaus': { country: 'BRASILE', region: 'AMAZONAS', province: 'MANAUS' },
  'florianopolis': { country: 'BRASILE', region: 'SANTA CATARINA', province: 'FLORIANOPOLIS' },
  'goiania': { country: 'BRASILE', region: 'GOIAS', province: 'GOIANIA' },
  'belem': { country: 'BRASILE', region: 'PARA', province: 'BELEM' },
  'joaopessoa': { country: 'BRASILE', region: 'PARAIBA', province: 'JOAO PESSOA' },
  'maceio': { country: 'BRASILE', region: 'ALAGOAS', province: 'MACEIO' },
  'aracaju': { country: 'BRASILE', region: 'SERGIPE', province: 'ARACAJU' },
  'teresina': { country: 'BRASILE', region: 'PIAUI', province: 'TERESINA' },
  'saoluis': { country: 'BRASILE', region: 'MARANHAO', province: 'SAO LUIS' },
  'campinas': { country: 'BRASILE', region: 'SAO PAULO', province: 'CAMPINAS' },
  'santos': { country: 'BRASILE', region: 'SAO PAULO', province: 'SANTOS' },
  'ribeiraopreto': { country: 'BRASILE', region: 'SAO PAULO', province: 'RIBEIRAO PRETO' },
  
  // Italia
  'roma': { country: 'ITALIA', region: 'LAZIO', province: 'ROMA' },
  'milano': { country: 'ITALIA', region: 'LOMBARDIA', province: 'MILANO' },
  'napoli': { country: 'ITALIA', region: 'CAMPANIA', province: 'NAPOLI' },
  'torino': { country: 'ITALIA', region: 'PIEMONTE', province: 'TORINO' },
  'palermo': { country: 'ITALIA', region: 'SICILIA', province: 'PALERMO' },
  'genova': { country: 'ITALIA', region: 'LIGURIA', province: 'GENOVA' },
  'bologna': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'BOLOGNA' },
  'firenze': { country: 'ITALIA', region: 'TOSCANA', province: 'FIRENZE' },
  'bari': { country: 'ITALIA', region: 'PUGLIA', province: 'BARI' },
  'catania': { country: 'ITALIA', region: 'SICILIA', province: 'CATANIA' },
  'venezia': { country: 'ITALIA', region: 'VENETO', province: 'VENEZIA' },
  'verona': { country: 'ITALIA', region: 'VENETO', province: 'VERONA' },
  'messina': { country: 'ITALIA', region: 'SICILIA', province: 'MESSINA' },
  'padova': { country: 'ITALIA', region: 'VENETO', province: 'PADOVA' },
  'trieste': { country: 'ITALIA', region: 'FRIULI VENEZIA GIULIA', province: 'TRIESTE' },
  'taranto': { country: 'ITALIA', region: 'PUGLIA', province: 'TARANTO' },
  'brescia': { country: 'ITALIA', region: 'LOMBARDIA', province: 'BRESCIA' },
  'parma': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'PARMA' },
  'prato': { country: 'ITALIA', region: 'TOSCANA', province: 'PRATO' },
  'modena': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'MODENA' },
  'reggiocalabria': { country: 'ITALIA', region: 'CALABRIA', province: 'REGGIO CALABRIA' },
  'reggioemilia': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'REGGIO EMILIA' },
  'perugia': { country: 'ITALIA', region: 'UMBRIA', province: 'PERUGIA' },
  'ravenna': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'RAVENNA' },
  'livorno': { country: 'ITALIA', region: 'TOSCANA', province: 'LIVORNO' },
  'cagliari': { country: 'ITALIA', region: 'SARDEGNA', province: 'CAGLIARI' },
  'foggia': { country: 'ITALIA', region: 'PUGLIA', province: 'FOGGIA' },
  'rimini': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'RIMINI' },
  'salerno': { country: 'ITALIA', region: 'CAMPANIA', province: 'SALERNO' },
  'ferrara': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'FERRARA' },
  'sassari': { country: 'ITALIA', region: 'SARDEGNA', province: 'SASSARI' },
  'latina': { country: 'ITALIA', region: 'LAZIO', province: 'LATINA' },
  'monza': { country: 'ITALIA', region: 'LOMBARDIA', province: 'MONZA E DELLA BRIANZA' },
  'bergamo': { country: 'ITALIA', region: 'LOMBARDIA', province: 'BERGAMO' },
  'pescara': { country: 'ITALIA', region: 'ABRUZZO', province: 'PESCARA' },
  'siracusa': { country: 'ITALIA', region: 'SICILIA', province: 'SIRACUSA' },
  'forli': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'FORLI-CESENA' },
  'trento': { country: 'ITALIA', region: 'TRENTINO-ALTO ADIGE', province: 'TRENTO' },
  'vicenza': { country: 'ITALIA', region: 'VENETO', province: 'VICENZA' },
  'terni': { country: 'ITALIA', region: 'UMBRIA', province: 'TERNI' },
  'bolzano': { country: 'ITALIA', region: 'TRENTINO-ALTO ADIGE', province: 'BOLZANO' },
  'novara': { country: 'ITALIA', region: 'PIEMONTE', province: 'NOVARA' },
  'piacenza': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'PIACENZA' },
  'ancona': { country: 'ITALIA', region: 'MARCHE', province: 'ANCONA' },
  'udine': { country: 'ITALIA', region: 'FRIULI VENEZIA GIULIA', province: 'UDINE' },
  'arezzo': { country: 'ITALIA', region: 'TOSCANA', province: 'AREZZO' },
  'cesena': { country: 'ITALIA', region: 'EMILIA ROMAGNA', province: 'FORLI-CESENA' },
  'lecce': { country: 'ITALIA', region: 'PUGLIA', province: 'LECCE' },
  'pesaro': { country: 'ITALIA', region: 'MARCHE', province: 'PESARO E URBINO' },
  'alessandria': { country: 'ITALIA', region: 'PIEMONTE', province: 'ALESSANDRIA' },
  'laspezia': { country: 'ITALIA', region: 'LIGURIA', province: 'LA SPEZIA' },
  'pisa': { country: 'ITALIA', region: 'TOSCANA', province: 'PISA' },
  'pistoia': { country: 'ITALIA', region: 'TOSCANA', province: 'PISTOIA' },
  'lucca': { country: 'ITALIA', region: 'TOSCANA', province: 'LUCCA' },
  'trapani': { country: 'ITALIA', region: 'SICILIA', province: 'TRAPANI' },
  
  // Europa & Mondo
  'lima': { country: 'PERU', region: 'LIMA', province: 'LIMA' },
  'cusco': { country: 'PERU', region: 'CUSCO', province: 'CUSCO' },
  'parigi': { country: 'FRANCIA', region: 'ILE-DE-FRANCE', province: 'PARIGI' },
  'paris': { country: 'FRANCIA', region: 'ILE-DE-FRANCE', province: 'PARIGI' },
  'lione': { country: 'FRANCIA', region: 'AUVERGNE-RHONE-ALPES', province: 'LIONE' },
  'marsiglia': { country: 'FRANCIA', region: 'PROVENCE-ALPES-COTE D AZUR', province: 'MARSIGLIA' },
  'nizza': { country: 'FRANCIA', region: 'PROVENCE-ALPES-COTE D AZUR', province: 'NIZZA' },
  'bordeaux': { country: 'FRANCIA', region: 'NOUVELLE-AQUITAINE', province: 'BORDEAUX' },
  'londra': { country: 'REGNO UNITO', region: 'ENGLAND', province: 'GREATER LONDON' },
  'london': { country: 'REGNO UNITO', region: 'ENGLAND', province: 'GREATER LONDON' },
  'manchester': { country: 'REGNO UNITO', region: 'ENGLAND', province: 'MANCHESTER' },
  'birmingham': { country: 'REGNO UNITO', region: 'ENGLAND', province: 'BIRMINGHAM' },
  'edimburgo': { country: 'REGNO UNITO', region: 'SCOTLAND', province: 'EDINBURGH' },
  'zurigo': { country: 'SVIZZERA', region: 'ZURIGO', province: 'ZURIGO' },
  'zurich': { country: 'SVIZZERA', region: 'ZURIGO', province: 'ZURIGO' },
  'ginevra': { country: 'SVIZZERA', region: 'GINEVRA', province: 'GINEVRA' },
  'lugano': { country: 'SVIZZERA', region: 'TICINO', province: 'LUGANO' },
  'berna': { country: 'SVIZZERA', region: 'BERNA', province: 'BERNA' },
  'basilea': { country: 'SVIZZERA', region: 'BASILEA', province: 'BASILEA' },
  'santiago': { country: 'CILE', region: 'SANTIAGO', province: 'SANTIAGO' },
  'valparaiso': { country: 'CILE', region: 'VALPARAISO', province: 'VALPARAISO' },
  'buenosaires': { country: 'ARGENTINA', region: 'BUENOS AIRES', province: 'BUENOS AIRES' },
  'cordoba': { country: 'ARGENTINA', region: 'CORDOBA', province: 'CORDOBA' },
  'rosario': { country: 'ARGENTINA', region: 'SANTA FE', province: 'ROSARIO' },
  'mendoza': { country: 'ARGENTINA', region: 'MENDOZA', province: 'MENDOZA' },
  'madrid': { country: 'SPAGNA', region: 'MADRID', province: 'MADRID' },
  'barcellona': { country: 'SPAGNA', region: 'CATALONIA', province: 'BARCELLONA' },
  'barcelona': { country: 'SPAGNA', region: 'CATALONIA', province: 'BARCELLONA' },
  'valencia': { country: 'SPAGNA', region: 'VALENCIA', province: 'VALENCIA' },
  'siviglia': { country: 'SPAGNA', region: 'ANDALUCIA', province: 'SIVIGLIA' },
  'lisbona': { country: 'PORTOGALLO', region: 'LISBONA', province: 'LISBONA' },
  'porto': { country: 'PORTOGALLO', region: 'PORTO', province: 'PORTO' },
  'berlino': { country: 'GERMANIA', region: 'BERLINO', province: 'BERLINO' },
  'berlin': { country: 'GERMANIA', region: 'BERLINO', province: 'BERLINO' },
  'monaco': { country: 'GERMANIA', region: 'BAVIERA', province: 'MONACO' },
  'monacodibaviera': { country: 'GERMANIA', region: 'BAVIERA', province: 'MONACO' },
  'francoforte': { country: 'GERMANIA', region: 'ASSIA', province: 'FRANCOFORTE' },
  'amburgo': { country: 'GERMANIA', region: 'AMBURGO', province: 'AMBURGO' },
  'vienna': { country: 'AUSTRIA', region: 'VIENNA', province: 'VIENNA' },
  'bruxelles': { country: 'BELGIO', region: 'BRUXELLES', province: 'BRUXELLES' },
  'amsterdam': { country: 'PAESI BASSI', region: 'OLANDA SETTENTRIONALE', province: 'AMSTERDAM' },
  'newyork': { country: 'STATI UNITI', region: 'NEW YORK', province: 'NEW YORK' },
  'losangeles': { country: 'STATI UNITI', region: 'CALIFORNIA', province: 'LOS ANGELES' },
  'sanfrancisco': { country: 'STATI UNITI', region: 'CALIFORNIA', province: 'SAN FRANCISCO' },
  'miami': { country: 'STATI UNITI', region: 'FLORIDA', province: 'MIAMI' },
  'orlando': { country: 'STATI UNITI', region: 'FLORIDA', province: 'ORLANDO' },
  'chicago': { country: 'STATI UNITI', region: 'ILLINOIS', province: 'CHICAGO' },
  'toronto': { country: 'CANADA', region: 'ONTARIO', province: 'TORONTO' },
  'montreal': { country: 'CANADA', region: 'QUEBEC', province: 'MONTREAL' },
  'vancouver': { country: 'CANADA', region: 'BRITISH COLUMBIA', province: 'VANCOUVER' },
  'cittadelmessico': { country: 'MESSICO', region: 'CIUDAD DE MEXICO', province: 'CIUDAD DE MEXICO' },
  'bogota': { country: 'COLOMBIA', region: 'BOGOTA', province: 'BOGOTA' }
};

// Universal Italian Number Formatter (1.000, 3.550, 10.000)
function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || val === '') return '0';
  let num = (typeof val === 'number') ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
  if (isNaN(num)) return String(val);
  
  if (decimals > 0) {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  } else {
    const rounded = Math.round(num).toString();
    return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

// Automatic Geographic Enrichment from City (CITTA -> PAESE, REGIONE, PROVINCIA)
function enrichGeographicData(records, cols) {
  if (!records || records.length === 0) return;
  const cityCol = cols && cols.city ? cols.city : 'CITTA';
  const countryCol = cols && cols.country ? cols.country : 'PAESE';
  const regionCol = cols && cols.region ? cols.region : 'REGIONE';
  const provCol = cols && cols.province ? cols.province : 'PROVINCIA';

  records.forEach(row => {
    let rawCity = row[cityCol];
    if (!rawCity) {
      for (let k of Object.keys(row)) {
        if (/citta|città|city/i.test(k) && row[k]) {
          rawCity = row[k];
          break;
        }
      }
    }

    if (rawCity) {
      const normCity = normalizeStr(rawCity);
      const match = CITY_LOOKUP[normCity];
      if (match) {
        if (!row[countryCol] || String(row[countryCol]).trim() === '') {
          row[countryCol] = match.country;
        }
        if (!row[regionCol] || String(row[regionCol]).trim() === '') {
          row[regionCol] = match.region;
        }
        if (!row[provCol] || String(row[provCol]).trim() === '') {
          row[provCol] = match.province;
        }
      }
    }
  });
}

// Initialize Leaflet Map
function initMap() {
  state.map = L.map('map', {
    center: [-15.0, -55.0],
    zoom: 4,
    zoomControl: true,
    attributionControl: false
  });

  setBaseMap('osm_light');
}

function setBaseMap(style) {
  if (state.baseTileLayer) {
    state.map.removeLayer(state.baseTileLayer);
    state.baseTileLayer = null;
  }

  let tileUrl = '';

  if (style === 'osm_light') {
    tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  } else if (style === 'osm_standard') {
    tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  } else if (style === 'esri_gray') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  } else if (style === 'satellite') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  } else if (style === 'none') {
    return;
  }

  state.baseTileLayer = L.tileLayer(tileUrl, { maxZoom: 18, subdomains: ['a', 'b', 'c'] }).addTo(state.map);
}

// Load GeoJSON files asynchronously
async function loadGeoDatasets() {
  showLoading('Caricamento mappe geografiche mondiali...');
  try {
    const [world, itReg, itProv, usStates, brStates] = await Promise.all([
      fetch('geo_data/world_countries.geojson').then(r => r.json()).catch(() => null),
      fetch('geo_data/italy_regions.geojson').then(r => r.json()).catch(() => null),
      fetch('geo_data/italy_provinces.geojson').then(r => r.json()).catch(() => null),
      fetch('geo_data/usa_states.geojson').then(r => r.json()).catch(() => null),
      fetch('geo_data/brazil_states.geojson').then(r => r.json()).catch(() => null)
    ]);

    state.geoData.world = world;
    state.geoData.italyRegions = itReg;
    state.geoData.italyProvinces = itProv;
    state.geoData.usaStates = usStates;
    state.geoData.brazilStates = brStates;
  } catch (err) {
    console.error('Errore nel caricamento GeoJSON:', err);
  } finally {
    hideLoading();
  }
}

// Helper to look up country GeoJSON feature from World dataset
function getSelectedCountryFeature() {
  if (!state.countryFilter || !state.geoData.world) return null;
  
  const cTargetNorm = normalizeStr(state.countryFilter);
  const alias = COUNTRY_ALIASES[state.countryFilter.toLowerCase()] || COUNTRY_ALIASES[cTargetNorm] || state.countryFilter;
  const aliasNorm = normalizeStr(alias);

  for (let feat of state.geoData.world.features) {
    const p = feat.properties || {};
    const n = p.name || p.NAME || p.ADMIN || '';
    const nNorm = normalizeStr(n);
    const iso2 = normalizeStr(p['ISO3166-1-Alpha-2'] || p.ISO_A2 || '');
    const iso3 = normalizeStr(p['ISO3166-1-Alpha-3'] || p.ISO_A3 || '');

    if (nNorm === cTargetNorm || nNorm === aliasNorm || iso2 === cTargetNorm || iso3 === cTargetNorm) {
      return feat;
    }
    if (aliasNorm && nNorm.includes(aliasNorm)) {
      return feat;
    }
  }
  return null;
}

// Helper to create an Inverted Polygon Mask for Spotlight / Flou effect on surrounding world
function createSpotlightMask(targetCountryFeature) {
  if (!targetCountryFeature || !targetCountryFeature.geometry) return null;

  const worldRing = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90]
  ];

  const geom = targetCountryFeature.geometry;
  let holes = [];

  if (geom.type === 'Polygon') {
    holes = geom.coordinates;
  } else if (geom.type === 'MultiPolygon') {
    holes = geom.coordinates.map(poly => poly[0]);
  }

  return {
    type: 'Feature',
    properties: { name: 'SpotlightMask' },
    geometry: {
      type: 'Polygon',
      coordinates: [worldRing, ...holes]
    }
  };
}

// Fetch Excel Data (supports both local Python API and GitHub Pages static mode)
async function fetchExcelData(sheetName = null) {
  showLoading('Caricamento dati Hotel...');
  try {
    let result = null;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. If running on localhost with Python backend active, fetch from /api/data
    if (isLocalhost) {
      try {
        const url = sheetName ? `/api/data?sheet=${encodeURIComponent(sheetName)}` : '/api/data';
        const resp = await fetch(url);
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.success) {
            result = json;
          }
        }
      } catch (e) {
        console.warn('Backend API not responding, falling back to static file parsing...', e);
      }
    }

    // 2. If running on GitHub Pages or if API failed, read Mappe.xlsx directly in browser via SheetJS
    if (!result || !result.success) {
      try {
        const candidatePaths = ['Mappe.xlsx', './Mappe.xlsx', '/DASHBOARD_MAPPE/Mappe.xlsx'];
        let fileResp = null;
        for (let p of candidatePaths) {
          try {
            const r = await fetch(p, { cache: 'no-cache' });
            if (r.ok) {
              fileResp = r;
              break;
            }
          } catch(errPath) {}
        }

        if (fileResp && fileResp.ok) {
          const arrayBuffer = await fileResp.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: true });
          const sheets = workbook.SheetNames;
          const targetSheet = sheetName && sheets.includes(sheetName) ? sheetName : sheets[0];
          const worksheet = workbook.Sheets[targetSheet];
          
          // Get raw rows
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

          let bestRow = 0;
          let bestScore = -1;
          const searchKeywords = ['hotel', 'paese', 'stato', 'regione', 'provincia', 'clienti', 'canale', 'provenienza', 'anno', 'mese', 'citta', 'città'];

          rawJson.forEach((row, idx) => {
            if (!row || !Array.isArray(row)) return;
            let score = 0;
            row.forEach(cell => {
              if (typeof cell === 'string') {
                const cLower = cell.trim().toLowerCase();
                if (searchKeywords.some(kw => cLower.includes(kw))) {
                  score += 1;
                }
              }
            });
            if (score > bestScore) {
              bestScore = score;
              bestRow = idx;
            }
          });

          const rawHeaders = rawJson[bestRow] || [];
          const headers = rawHeaders.map((h, i) => (h !== undefined && h !== null && String(h).trim()) ? String(h).trim() : `Colonna_${i+1}`);

          const detected = {
            hotel: headers.find(h => /hotel|struttura|albergo|resort/i.test(h)) || null,
            year: headers.find(h => /anno|year/i.test(h)) || null,
            month: headers.find(h => /mese|month/i.test(h)) || null,
            country: headers.find(h => /^paese$|^country$|^nazione$/i.test(h)) || headers.find(h => /paese|country|nazione/i.test(h)) || headers.find(h => /^stato$/i.test(h)) || null,
            region: headers.find(h => /regione|region|estado/i.test(h)) || null,
            province: headers.find(h => /^provincia$|^province$/i.test(h)) || headers.find(h => /provincia|province/i.test(h) && !/citta|città/i.test(h)) || null,
            city: headers.find(h => /citta|città|city/i.test(h)) || null,
            channel: headers.find(h => /preovenienza|provenienza|canale|channel|fonte|agenzia/i.test(h)) || null,
            metrics: headers.filter(h => !/hotel|struttura|albergo|resort|anno|mese|paese|stato|country|regione|region|provincia|citta|città|city|preovenienza|provenienza|canale|channel|fonte|agenzia/i.test(h)),
            all: headers
          };

          const records = [];

          for (let i = bestRow + 1; i < rawJson.length; i++) {
            const row = rawJson[i];
            if (!row || row.length === 0 || row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;
            const item = {};
            let isTotalRow = false;
            headers.forEach((h, cIdx) => {
              let val = row[cIdx];
              if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                  val = val.trim();
                  if (/^(totale|total|somma|grand total)$/i.test(val)) {
                    isTotalRow = true;
                  }
                }
                item[h] = val;
              } else {
                item[h] = null;
              }
            });

            // Ensure row has at least one valid business dimension and is not a total/summary row
            const dimCols = [detected.hotel, detected.country, detected.region, detected.province, detected.city].filter(Boolean);
            const hasDim = dimCols.some(d => item[d] !== null && item[d] !== undefined && String(item[d]).trim() !== '');

            if (hasDim && !isTotalRow) {
              records.push(item);
            }
          }

          const hotelsFound = detected.hotel ? [...new Set(records.map(r => r[detected.hotel]).filter(Boolean))].sort() : [];

          result = {
            success: true,
            filename: 'Mappe.xlsx',
            last_modified: 'GitHub Web',
            current_sheet: targetSheet,
            sheets: sheets,
            data: records,
            detected_columns: detected,
            hotels: hotelsFound,
            row_count: records.length
          };
        }
      } catch (staticErr) {
        console.error('Errore lettura Mappe.xlsx statico:', staticErr);
      }
    }

    if (!result || !result.success) {
      alert(`Attenzione: Impossibile caricare i dati Hotel.\nAssicurati che il file 'Mappe.xlsx' sia presente.`);
      return;
    }

    document.getElementById('excelFileName').textContent = result.filename;
    document.getElementById('excelFileMeta').textContent = `Aggiornato: ${result.last_modified} | ${result.row_count} righe`;

    // Populate Sheet Selector & Sheet Tabs Nav
    const sheetSelect = document.getElementById('sheetSelector');
    if (sheetSelect) sheetSelect.innerHTML = '';
    const sheetNav = document.getElementById('sheetTabsNav');
    if (sheetNav) sheetNav.innerHTML = '';

    result.sheets.forEach(s => {
      // Hidden select option
      if (sheetSelect) {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === result.current_sheet) opt.selected = true;
        sheetSelect.appendChild(opt);
      }

      // Visible Tab Button
      if (sheetNav) {
        const btn = document.createElement('button');
        btn.className = `sheet-tab-btn ${s === result.current_sheet ? 'active' : ''}`;
        
        let flagHtml = '📄';
        const sl = s.toLowerCase();
        if (sl.includes('tutti') || sl.includes('4 hotel') || sl.includes('nord') || sl.includes('consol') || sl.includes('sombra')) {
          flagHtml = '<img src="Loghi/Sombra marca nova sfondo trasparente senza testo.png" class="tab-opt-logo" alt="">';
        } else if (sl.includes('mond')) {
          flagHtml = '🌐';
        } else {
          flagHtml = getCountryFlagHtml(s);
        }

        btn.innerHTML = `<span>${flagHtml}</span> <span>${s}</span>`;
        btn.title = `Passa al foglio '${s}'`;
        btn.addEventListener('click', () => {
          fetchExcelData(s);
        });
        sheetNav.appendChild(btn);
      }
    });

    state.availableSheets = result.sheets || [];
    state.currentSheet = result.current_sheet;
    state.excelData = result.data || [];
    state.columns = result.detected_columns;
    state.availableHotels = result.hotels || [];

    // Auto-enrich geographic data if cities are present
    enrichGeographicData(state.excelData, state.columns);

    // Reset sub-filters on sheet switch
    state.regionFilter = '';

    // Check if the dataset contains multiple countries (like World consolidator sheet)
    const cCol = state.columns.country;
    let distinctCountries = [];
    if (cCol) {
      distinctCountries = [...new Set(state.excelData.map(r => r[cCol]).filter(Boolean).map(c => String(c).trim().toUpperCase()))];
    }

    if (distinctCountries.length > 1) {
      state.countryFilter = '';
      state.activeLevel = 'country';
    } else if (distinctCountries.length === 1) {
      state.countryFilter = distinctCountries[0];
      state.activeLevel = 'region';
    } else {
      state.countryFilter = '';
      state.activeLevel = 'country';
    }

    setupControls();
    renderAll();
  } catch (err) {
    console.error('Errore caricamento dati:', err);
  } finally {
    hideLoading();
  }
}

// Setup Filters and Controls
function setupControls() {
  // 1. Hotel Selector (Gruppo Sombra / 4 Hotel Nord-Est Brasile)
  const hotelSelect = document.getElementById('hotelFilter');
  const hotelDropdownMenu = document.getElementById('hotelDropdownMenu');
  const hotelDropdownSelected = document.getElementById('hotelDropdownSelected');

  let hotelList = new Set();
  if (state.availableHotels && state.availableHotels.length > 0) {
    state.availableHotels.forEach(h => hotelList.add(h));
  }
  
  const hCol = state.columns.hotel;
  if (hCol) {
    state.excelData.map(r => r[hCol]).filter(Boolean).forEach(h => hotelList.add(String(h).trim()));
  }

  if (hotelList.size === 0) {
    hotelList.add('SOMBRA RESORT');
    hotelList.add('SPA SOMBRA');
    hotelList.add('SOMBRA HOTEL');
    hotelList.add('VILLAS SOMBRA');
  }

  const sortedHotels = [...hotelList].sort();

  if (hotelSelect) {
    hotelSelect.innerHTML = '<option value="">Gruppo Sombra (Tutti i 4 Hotel)</option>';
    sortedHotels.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      if (state.hotelFilter && h.toLowerCase() === state.hotelFilter.toLowerCase()) {
        opt.selected = true;
      }
      hotelSelect.appendChild(opt);
    });
  }

  // Populate Custom Hotel Dropdown with Logo for each Hotel!
  if (hotelDropdownMenu && hotelDropdownSelected) {
    const logoImg = '<img src="Loghi/Sombra marca nova sfondo trasparente senza testo.png" class="hotel-opt-logo" alt="Sombra">';
    
    const currentLabel = state.hotelFilter ? state.hotelFilter : 'Gruppo Sombra (Tutti i 4 Hotel)';
    hotelDropdownSelected.innerHTML = `${logoImg} <span>${currentLabel}</span>`;

    let menuHtml = `
      <div class="hotel-dropdown-item ${!state.hotelFilter ? 'active' : ''}" data-value="">
        ${logoImg}
        <span>Gruppo Sombra (Tutti i 4 Hotel)</span>
      </div>
    `;

    sortedHotels.forEach(h => {
      const isActive = state.hotelFilter && h.toLowerCase() === state.hotelFilter.toLowerCase();
      menuHtml += `
        <div class="hotel-dropdown-item ${isActive ? 'active' : ''}" data-value="${h}">
          ${logoImg}
          <span>${h}</span>
        </div>
      `;
    });

    hotelDropdownMenu.innerHTML = menuHtml;

    // Attach click events on dropdown items
    hotelDropdownMenu.querySelectorAll('.hotel-dropdown-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        const val = item.dataset.value;
        state.hotelFilter = val;
        if (hotelSelect) hotelSelect.value = val;
        
        hotelDropdownMenu.querySelectorAll('.hotel-dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const label = val || 'Gruppo Sombra (Tutti i 4 Hotel)';
        hotelDropdownSelected.innerHTML = `${logoImg} <span>${label}</span>`;
        hotelDropdownMenu.classList.remove('open');
        
        renderAll();
      });
    });
  }

  // 2. Year Filter
  const yearSelect = document.getElementById('yearFilter');
  if (yearSelect) {
    yearSelect.innerHTML = '<option value="">Tutti gli Anni</option>';
    const yCol = state.columns.year;
    if (yCol) {
      const years = [...new Set(state.excelData.map(r => r[yCol]).filter(v => v !== null && v !== undefined))].sort();
      years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `Anno ${y}`;
        if (String(y) === String(state.yearFilter)) opt.selected = true;
        yearSelect.appendChild(opt);
      });
    }
  }

  // 3. Month Filter
  const monthSelect = document.getElementById('monthFilter');
  if (monthSelect) {
    monthSelect.innerHTML = '<option value="">Tutti i Mesi</option>';
    const mCol = state.columns.month;
    if (mCol) {
      const months = [...new Set(state.excelData.map(r => r[mCol]).filter(v => v !== null && v !== undefined))].sort((a,b) => Number(a)-Number(b));
      months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        const mName = MONTH_NAMES[parseInt(m)] || `Mese ${m}`;
        opt.textContent = `${mName} (${String(m).padStart(2, '0')})`;
        if (String(m) === String(state.monthFilter)) opt.selected = true;
        monthSelect.appendChild(opt);
      });
    }
  }

  // 4. Metric Select
  const metricSelect = document.getElementById('metricSelect');
  if (metricSelect) {
    metricSelect.innerHTML = '';
    const metrics = state.columns.metrics.length > 0 ? state.columns.metrics : state.columns.all.filter(c => c !== state.columns.hotel && c !== state.columns.year && c !== state.columns.month && c !== state.columns.country && c !== state.columns.region && c !== state.columns.province);
    
    metrics.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      let label = m;
      if (/clienti|ospiti|presenze/i.test(m)) label = `👥 ${m} (Numero Ospiti)`;
      else if (/%|percent/i.test(m)) label = `📊 ${m} (Quota %)`;
      opt.textContent = label;
      metricSelect.appendChild(opt);
    });

    if (!state.activeMetric || !metrics.includes(state.activeMetric)) {
      state.activeMetric = metrics.find(m => /clienti|ospiti|presenze/i.test(m)) || metrics[0] || 'CLIENTI';
    }
    metricSelect.value = state.activeMetric;
  }

  // 5. Populate Country Filter (Visione 2: Scelta Stato da esaminare)
  const countrySelect = document.getElementById('countryFilter');
  if (countrySelect) {
    countrySelect.innerHTML = '<option value="">🌐 Tutti gli Stati (Mappa Mondo)</option>';

    const cCol = state.columns.country;
    let dataCountries = [];
    if (cCol) {
      dataCountries = [...new Set(state.excelData.map(r => r[cCol]).filter(Boolean).map(c => String(c).trim().toUpperCase()))].sort();
    }

    // Add countries from Excel first
    if (dataCountries.length > 0) {
      const optGroupData = document.createElement('optgroup');
      optGroupData.label = '── Stati presenti nei dati Hotel ──';
      dataCountries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        const icon = COUNTRY_FLAGS[c.toLowerCase()] || COUNTRY_FLAGS[normalizeStr(c)] || '📍';
        opt.textContent = `${icon} ${c}`;
        if (state.countryFilter && c.toLowerCase() === state.countryFilter.toLowerCase()) {
          opt.selected = true;
        }
        optGroupData.appendChild(opt);
      });
      countrySelect.appendChild(optGroupData);
    }

    // Additional known major countries
    const standardCountries = [
      'BRASILE', 'ITALIA', 'ARGENTINA', 'CILE', 'PERU', 'FRANCIA', 'INGHILTERRA', 'SVIZZERA',
      'GERMANIA', 'SPAGNA', 'PORTOGALLO', 'STATI UNITI', 'PAESI BASSI', 'BELGIO', 'AUSTRIA',
      'CANADA', 'AUSTRALIA', 'GIAPPONE', 'CINA', 'URUGUAY'
    ];
    const otherCountries = standardCountries.filter(c => !dataCountries.includes(c)).sort();
    if (otherCountries.length > 0) {
      const optGroupOther = document.createElement('optgroup');
      optGroupOther.label = '── Altri Stati ──';
      otherCountries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        const icon = COUNTRY_FLAGS[c.toLowerCase()] || COUNTRY_FLAGS[normalizeStr(c)] || '📍';
        opt.textContent = `${icon} ${c}`;
        if (state.countryFilter && c.toLowerCase() === state.countryFilter.toLowerCase()) {
          opt.selected = true;
        }
        optGroupOther.appendChild(opt);
      });
      countrySelect.appendChild(optGroupOther);
    }
  }

  // Sync Level Tabs active class
  document.querySelectorAll('.level-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.level === state.activeLevel);
  });

  updateRegionFilter();
}

function updateRegionFilter() {
  const regionSelect = document.getElementById('regionFilter');
  if (!regionSelect) return;
  regionSelect.innerHTML = '<option value="">Tutte le Regioni</option>';

  const rCol = state.columns.region;
  const cCol = state.columns.country;
  if (!rCol) return;

  let filtered = state.excelData;
  if (state.countryFilter && cCol) {
    const fNorm = normalizeStr(state.countryFilter);
    filtered = filtered.filter(r => {
      const v = normalizeStr(r[cCol]);
      return v === fNorm || v.includes(fNorm) || fNorm.includes(v);
    });
  }

  const rawRegions = filtered.map(r => (r[rCol] && String(r[rCol]).trim() ? String(r[rCol]).trim() : 'Non indicato'));
  const uniqueRegions = [...new Set(rawRegions)].sort((a, b) => {
    if (a === 'Non indicato') return 1;
    if (b === 'Non indicato') return -1;
    return a.localeCompare(b);
  });

  uniqueRegions.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    let disp = r;
    if (r !== 'Non indicato') {
      disp = BRAZIL_STATE_ALIASES[normalizeStr(r)] || r;
    } else {
      disp = '❓ Non indicato';
    }
    opt.textContent = disp;
    if (state.regionFilter && String(r) === String(state.regionFilter)) opt.selected = true;
    regionSelect.appendChild(opt);
  });
}

// Filter rows by Hotel, Period, Country and Region
function getFilteredRows() {
  const hCol = state.columns.hotel || Object.keys(state.excelData[0] || {}).find(k => /hotel|struttura|albergo|resort/i.test(k));
  const yCol = state.columns.year || Object.keys(state.excelData[0] || {}).find(k => /anno|year/i.test(k));
  const moCol = state.columns.month || Object.keys(state.excelData[0] || {}).find(k => /mese|month/i.test(k));
  const cCol = state.columns.country || Object.keys(state.excelData[0] || {}).find(k => /^paese$|^country$|^nazione$/i.test(k)) || Object.keys(state.excelData[0] || {}).find(k => /paese|country|nazione/i.test(k));
  const rCol = state.columns.region || Object.keys(state.excelData[0] || {}).find(k => /regione|region|estado/i.test(k));

  const targetCountry = state.countryFilter ? String(state.countryFilter).trim() : '';

  return state.excelData.filter(r => {
    // Hotel filter
    if (state.hotelFilter && hCol && r[hCol]) {
      const hVal = String(r[hCol]).toLowerCase();
      const fVal = state.hotelFilter.toLowerCase();
      if (!hVal.includes(fVal) && !fVal.includes(hVal)) return false;
    }
    // Year filter
    if (state.yearFilter && yCol && String(r[yCol]) !== String(state.yearFilter)) return false;
    // Month filter
    if (state.monthFilter && moCol && String(r[moCol]) !== String(state.monthFilter)) return false;
    
    // Country filter (applied when user selects a specific country or is in region/province view)
    if (targetCountry && targetCountry !== 'TUTTI' && targetCountry !== '' && cCol) {
      const cVal = r[cCol];
      if (!cVal && targetCountry !== 'Non indicato') return false;
      if (cVal) {
        const normTarget = normalizeCountryName(targetCountry);
        const normRow = normalizeCountryName(cVal);
        if (normTarget !== normRow) return false;
      }
    }
    // Region filter
    if (state.regionFilter && rCol) {
      const rVal = (r[rCol] && String(r[rCol]).trim()) ? String(r[rCol]).trim() : 'Non indicato';
      if (rVal !== state.regionFilter) return false;
    }
    return true;
  });
}

// Aggregate Data based on active Filters and Level
function getAggregatedData() {
  const level = state.activeLevel;
  const cCol = state.columns.country;
  const rCol = state.columns.region;
  const pCol = state.columns.province;
  const mCol = state.activeMetric;
  const aggType = state.activeAgg;

  // When drilling down to region or province, ensure a country is selected
  if ((level === 'region' || level === 'province') && !state.countryFilter) {
    const firstCountry = cCol ? (state.excelData.find(r => r[cCol]) || {})[cCol] || 'BRASILE' : 'BRASILE';
    state.countryFilter = String(firstCountry).toUpperCase();
    const cSelect = document.getElementById('countryFilter');
    if (cSelect) cSelect.value = state.countryFilter;
    updateRegionFilter();
  }

  const rows = getFilteredRows();

  // Identify client / guest column
  const clientCol = state.columns.all.find(c => /clienti|ospiti|presenze|pernottamenti|vendite/i.test(c)) || mCol;

  // Calculate total hotel guests in filtered slice (adapts strictly to World vs Single Country!)
  let totalHotelGuests = 0;
  rows.forEach(r => {
    const v = r[clientCol];
    if (typeof v === 'number') totalHotelGuests += v;
    else if (v) {
      const parsed = parseFloat(String(v).replace(',', '.'));
      if (!isNaN(parsed)) totalHotelGuests += parsed;
    }
  });

  const groups = {};

  rows.forEach(r => {
    let key = '';
    if (level === 'country' && !state.countryFilter) {
      key = (cCol && r[cCol] && String(r[cCol]).trim()) ? String(r[cCol]).trim() : 'Non indicato';
    } else if (level === 'region' || (level === 'country' && state.countryFilter)) {
      key = (rCol && r[rCol] && String(r[rCol]).trim()) ? String(r[rCol]).trim() : 'Non indicato';
    } else if (level === 'province') {
      key = (pCol && r[pCol] && String(r[pCol]).trim()) ? String(r[pCol]).trim() : 'Non indicato';
    }

    if (!key) {
      key = 'Non indicato';
    }

    let val = 1;
    if (mCol && r[mCol] !== undefined && r[mCol] !== null) {
      const rawV = r[mCol];
      if (typeof rawV === 'number') val = rawV;
      else {
        const parsed = parseFloat(String(rawV).replace(',', '.').replace('%', ''));
        val = isNaN(parsed) ? 0 : parsed;
      }
    }

    let guestVal = 0;
    if (clientCol && r[clientCol] !== undefined && r[clientCol] !== null) {
      const rawG = r[clientCol];
      if (typeof rawG === 'number') guestVal = rawG;
      else {
        const parsedG = parseFloat(String(rawG).replace(',', '.'));
        guestVal = isNaN(parsedG) ? 0 : parsedG;
      }
    }

    if (!groups[key]) {
      groups[key] = {
        name: key,
        values: [],
        guests: 0,
        count: 0,
        rows: []
      };
    }

    groups[key].values.push(val);
    groups[key].guests += guestVal;
    groups[key].count += 1;
    groups[key].rows.push(r);
  });

  const results = {};
  let overallSum = 0;
  let allAggVals = [];
  let topArea = null;
  let maxAreaGuests = -1;

  Object.entries(groups).forEach(([name, g]) => {
    let calculated = 0;
    if (aggType === 'sum') {
      calculated = g.values.reduce((a, b) => a + b, 0);
    } else if (aggType === 'avg') {
      calculated = g.values.reduce((a, b) => a + b, 0) / (g.values.length || 1);
    } else if (aggType === 'max') {
      calculated = Math.max(...g.values);
    } else if (aggType === 'min') {
      calculated = Math.min(...g.values);
    } else if (aggType === 'count') {
      calculated = g.count;
    }

    // Share percentage calculated strictly relative to totalHotelGuests for this scope
    const sharePct = totalHotelGuests > 0 ? ((g.guests / totalHotelGuests) * 100) : 0;

    results[name] = {
      name,
      value: calculated,
      guests: g.guests,
      pct: sharePct,
      count: g.count,
      rows: g.rows
    };

    if (g.guests > maxAreaGuests) {
      maxAreaGuests = g.guests;
      topArea = { name, guests: g.guests, pct: sharePct };
    }

    overallSum += calculated;
    allAggVals.push(calculated);
  });

  const minVal = allAggVals.length > 0 ? Math.min(...allAggVals) : 0;
  const maxVal = allAggVals.length > 0 ? Math.max(...allAggVals) : 0;
  const avgVal = allAggVals.length > 0 ? (overallSum / allAggVals.length) : 0;

  return {
    items: results,
    total: overallSum,
    totalGuests: totalHotelGuests,
    topArea: topArea,
    count: allAggVals.length,
    min: minVal,
    max: maxVal,
    avg: avgVal
  };
}

// Get Color from Value & Palette
function getColor(val, min, max, paletteName) {
  if (val === undefined || val === null) return '#e2e8f0';
  const colors = PALETTES[paletteName] || PALETTES.blue;
  if (min === max) return colors[Math.floor(colors.length / 2)];

  let ratio = (val - min) / (max - min);
  ratio = Math.max(0, Math.min(1, ratio));

  const idx = Math.min(colors.length - 1, Math.floor(ratio * colors.length));
  return colors[idx];
}

// Match GeoJSON Feature with Data Key
function findFeatureData(feature, aggregated, level) {
  if (!feature || !aggregated || !aggregated.items) return null;
  const props = feature.properties || {};
  const normKeys = Object.keys(aggregated.items)
    .filter(k => k && k !== 'Non indicato' && normalizeStr(k).length > 0)
    .map(k => ({
      original: k,
      normalized: normalizeStr(k)
    }));

  if (normKeys.length === 0) return null;

  if (level === 'country') {
    const fName = props.name || props.NAME || props.ADMIN || '';
    const iso2 = props['ISO3166-1-Alpha-2'] || props.ISO_A2 || '';
    const iso3 = props['ISO3166-1-Alpha-3'] || props.ISO_A3 || '';

    const normF = normalizeStr(fName);
    const normIso2 = normalizeStr(iso2);
    const normIso3 = normalizeStr(iso3);

    for (let k of normKeys) {
      if ((normF && k.normalized === normF) || (normIso2 && k.normalized === normIso2) || (normIso3 && k.normalized === normIso3)) {
        return aggregated.items[k.original];
      }
      const alias = COUNTRY_ALIASES[k.original.toLowerCase()] || COUNTRY_ALIASES[k.normalized];
      if (alias) {
        const normAlias = normalizeStr(alias);
        if ((normF && normAlias === normF) || (normIso2 && normAlias === normIso2) || (normIso3 && normAlias === normIso3)) {
          return aggregated.items[k.original];
        }
      }
    }
  } else if (level === 'region') {
    const regName = props.reg_name || props.name || props.NAME || props.Estado || props.STATE_NAME || '';
    const sigla = props.SIGLA || props.PK_sigla || props.prov_acr || '';
    const normReg = normalizeStr(regName);
    const normSigla = normalizeStr(sigla);

    if (!normReg && !normSigla) return null;

    for (let k of normKeys) {
      if ((normReg && k.normalized === normReg) || (normSigla && k.normalized === normSigla)) {
        return aggregated.items[k.original];
      }
      // Brazil Aliases
      const brMapped = BRAZIL_STATE_ALIASES[k.normalized] || BRAZIL_STATE_ALIASES[k.original.toLowerCase()];
      if (brMapped) {
        const normBr = normalizeStr(brMapped);
        if ((normReg && normBr === normReg) || (normSigla && normBr === normSigla)) {
          return aggregated.items[k.original];
        }
      }
      // City lookup mapping (e.g. Natal -> Rio Grande do Norte)
      const cityMatch = (typeof CITY_LOOKUP !== 'undefined') ? CITY_LOOKUP[k.normalized] : null;
      if (cityMatch) {
        const matchReg = normalizeStr(cityMatch.region);
        if ((normReg && matchReg === normReg) || (normSigla && matchReg === normSigla)) {
          return aggregated.items[k.original];
        }
      }
      // Safe substring match only for long distinct strings
      if (normReg.length >= 6 && k.normalized.length >= 6 && (normReg.includes(k.normalized) || k.normalized.includes(normReg))) {
        return aggregated.items[k.original];
      }
    }
  } else if (level === 'province') {
    const provName = props.prov_name || props.name || props.NAME || props.Estado || props.STATE_NAME || '';
    const provAcr = props.prov_acr || props.SIGLA || props.PK_sigla || props.postal || '';
    const normProv = normalizeStr(provName);
    const normAcr = normalizeStr(provAcr);

    if (!normProv && !normAcr) return null;

    for (let k of normKeys) {
      if ((normProv && k.normalized === normProv) || (normAcr && k.normalized === normAcr)) {
        return aggregated.items[k.original];
      }
      const mappedFromCode = (typeof IT_PROV_CODES !== 'undefined') ? IT_PROV_CODES[k.original.toUpperCase()] : null;
      if (mappedFromCode && normProv && normalizeStr(mappedFromCode) === normProv) {
        return aggregated.items[k.original];
      }
      // Brazil State fallback
      const brMapped = BRAZIL_STATE_ALIASES[k.normalized] || BRAZIL_STATE_ALIASES[k.original.toLowerCase()];
      if (brMapped) {
        const normBr = normalizeStr(brMapped);
        if ((normProv && normBr === normProv) || (normAcr && normBr === normAcr)) {
          return aggregated.items[k.original];
        }
      }
      // City lookup mapping (e.g. Natal, Belo Horizonte, San Paolo)
      const cityMatch = (typeof CITY_LOOKUP !== 'undefined') ? CITY_LOOKUP[k.normalized] : null;
      if (cityMatch) {
        const matchState = normalizeStr(cityMatch.region);
        const matchProv = normalizeStr(cityMatch.province);
        if ((normProv && (matchState === normProv || matchProv === normProv)) || (normAcr && matchState === normAcr)) {
          return aggregated.items[k.original];
        }
      }
      // Safe substring match only for long distinct strings
      if (normProv.length >= 6 && k.normalized.length >= 6 && (normProv.includes(k.normalized) || k.normalized.includes(normProv))) {
        return aggregated.items[k.original];
      }
    }
  }

  return null;
}

// Render Map Layers
function renderMap(aggregated) {
  if (state.maskLayer) {
    state.map.removeLayer(state.maskLayer);
    state.maskLayer = null;
  }
  if (state.geoJsonLayer) {
    state.map.removeLayer(state.geoJsonLayer);
    state.geoJsonLayer = null;
  }
  if (state.regionBorderLayer) {
    state.map.removeLayer(state.regionBorderLayer);
    state.regionBorderLayer = null;
  }
  if (state.countryPerimeterLayer) {
    state.map.removeLayer(state.countryPerimeterLayer);
    state.countryPerimeterLayer = null;
  }

  const showPermanentLabels = document.getElementById('chkPermanentLabels') ? document.getElementById('chkPermanentLabels').checked : true;
  const showRegionBorder = document.getElementById('chkRegionBorder') ? document.getElementById('chkRegionBorder').checked : true;
  const showSpotlightFlou = document.getElementById('chkSpotlightFlou') ? document.getElementById('chkSpotlightFlou').checked : true;

  const level = state.activeLevel;
  const selectedFeature = getSelectedCountryFeature();

  // Detect which GeoJSON dataset to use for features
  let geoDataToUse = null;
  let activeCountry = 'world';
  const cTarget = (state.countryFilter || '').toLowerCase();

  if (cTarget.includes('bra') || cTarget.includes('brasil')) {
    activeCountry = 'brazil';
  } else if (cTarget.includes('usa') || cTarget.includes('unit') || cTarget.includes('stati unit')) {
    activeCountry = 'usa';
  } else if (cTarget.includes('ita') || cTarget.includes('ital')) {
    activeCountry = 'italy';
  }

  if (level === 'country' && !state.countryFilter) {
    // WORLD VIEW: Full world map
    geoDataToUse = state.geoData.world;
  } else if (level === 'region' || (level === 'country' && state.countryFilter)) {
    if (activeCountry === 'brazil') {
      geoDataToUse = state.geoData.brazilStates;
    } else if (activeCountry === 'usa') {
      geoDataToUse = state.geoData.usaStates;
    } else if (activeCountry === 'italy') {
      geoDataToUse = state.geoData.italyRegions;
    } else if (selectedFeature) {
      geoDataToUse = { type: 'FeatureCollection', features: [selectedFeature] };
    } else {
      geoDataToUse = state.geoData.world;
    }
  } else if (level === 'province') {
    if (activeCountry === 'brazil') {
      geoDataToUse = state.geoData.brazilStates;
    } else if (activeCountry === 'italy') {
      geoDataToUse = state.geoData.italyProvinces;
    } else if (selectedFeature) {
      geoDataToUse = { type: 'FeatureCollection', features: [selectedFeature] };
    } else {
      geoDataToUse = state.geoData.world;
    }
  }

  if (!geoDataToUse) {
    console.warn('Dataset GeoJSON non disponibile per il livello:', level);
    return;
  }

  // 1. If a Country is selected and Spotlight Flou is enabled -> Render Flou Mask covering all surrounding world
  if (state.countryFilter && showSpotlightFlou && selectedFeature) {
    const maskGeo = createSpotlightMask(selectedFeature);
    if (maskGeo) {
      state.maskLayer = L.geoJSON(maskGeo, {
        style: {
          fillColor: '#0f172a',
          fillOpacity: 0.58,
          weight: 0,
          color: 'transparent',
          interactive: false,
          className: 'map-spotlight-mask'
        }
      }).addTo(state.map);
    }
  }

  // 2. Homogeneous, elegant border styling for all countries across the map
  let bColor = '#64748b'; // Contorno omogeneo per tutti gli Stati
  let bWidth = 0.8;

  if (level === 'country' && !state.countryFilter) {
    bColor = '#64748b'; // Omogeneo pulito per la panoramica mondiale
    bWidth = 0.8;
  } else if (level === 'region' || (level === 'country' && state.countryFilter)) {
    bColor = '#2563eb'; // Blu per regioni interne
    bWidth = 0.9;
  } else if (level === 'province') {
    bColor = '#94a3b8'; // Grigio per province
    bWidth = 0.6;
  }

  // 3. Render Main GeoJSON Features Layer (Foreground)
  state.geoJsonLayer = L.geoJSON(geoDataToUse, {
    style: feature => {
      const dataItem = findFeatureData(feature, aggregated, level);
      const hasData = dataItem !== null && dataItem.value !== undefined;
      const fillColor = hasData ? getColor(dataItem.value, aggregated.min, aggregated.max, state.activePalette) : '#f8fafc';
      
      return {
        fillColor: fillColor,
        weight: bWidth,
        opacity: 1,
        color: bColor,
        fillOpacity: hasData ? 0.92 : ((level === 'country' && !state.countryFilter) ? 0.35 : 0.45)
      };
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      const name = props.prov_name || props.reg_name || props.name || props.NAME || props.Estado || 'Area';
      const dataItem = findFeatureData(feature, aggregated, level);

      // MultiPolygon centering: calculate center on the largest polygon (mainland)
      if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
        const coords = feature.geometry.coordinates;
        if (coords && coords.length > 0) {
          let largestPoly = coords[0];
          let maxPts = (coords[0] && coords[0][0]) ? coords[0][0].length : 0;
          for (let i = 1; i < coords.length; i++) {
            const pts = (coords[i] && coords[i][0]) ? coords[i][0].length : 0;
            if (pts > maxPts) {
              maxPts = pts;
              largestPoly = coords[i];
            }
          }
          if (largestPoly && largestPoly[0]) {
            let sumLat = 0, sumLng = 0, ptCount = 0;
            largestPoly[0].forEach(pt => {
              sumLng += pt[0];
              sumLat += pt[1];
              ptCount++;
            });
            if (ptCount > 0) {
              const centerLatLng = L.latLng(sumLat / ptCount, sumLng / ptCount);
              layer.getCenter = () => centerLatLng;
            }
          }
        }
      }

      // Determine flag HTML
      let flagHtml = '';
      const isCountryLevel = (level === 'country') || !state.countryFilter || (activeCountry === 'world');
      if (isCountryLevel) {
        let countryKey = name;
        const isoProp = props['ISO3166-1-Alpha-2'];
        if (isoProp && isoProp !== '-99') {
          countryKey = isoProp;
        } else if (props.name && props.name !== '-99') {
          countryKey = props.name;
        } else if (dataItem && dataItem.name) {
          countryKey = dataItem.name;
        }
        flagHtml = getCountryFlagHtml(countryKey, { className: 'map-label-flag' });
      }

      // Tooltip / Label formatting
      if (showPermanentLabels) {
        let labelHtml = `<div class="map-label-box"><div class="map-label-header">${flagHtml}<span class="map-label-country-name">${name}</span></div>`;
        if (dataItem) {
          if (dataItem.guests > 0) {
            labelHtml += `<span class="map-label-val">${formatNumber(dataItem.guests)} Ospiti (${dataItem.pct.toFixed(1)}%)</span>`;
          } else {
            labelHtml += `<span class="map-label-val">${formatNumber(dataItem.value)}</span>`;
          }
        }
        labelHtml += `</div>`;

        layer.bindTooltip(labelHtml, {
          permanent: Boolean(dataItem && (dataItem.guests > 0 || dataItem.value > 0)),
          direction: 'center',
          className: dataItem ? 'map-label-permanent map-label-highlight' : 'map-label-permanent'
        });
      } else if (dataItem) {
        let labelText = `<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">${flagHtml}<strong>${name}</strong></div>Ospiti Hotel: <b>${formatNumber(dataItem.guests)}</b> (Quota: <b>${dataItem.pct.toFixed(1)}%</b>)<br><span style="font-size:0.75rem;opacity:0.8">Righe nel periodo: ${formatNumber(dataItem.count)}</span>`;
        layer.bindTooltip(labelText, { sticky: true, className: 'leaflet-tooltip-custom' });
      }

      // Hover Effects
      layer.on({
        mouseover: e => {
          const l = e.target;
          l.setStyle({
            weight: bWidth + 0.8,
            color: '#0f172a',
            fillOpacity: 0.98
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
        },
        mouseout: e => {
          state.geoJsonLayer.resetStyle(e.target);
        },
        click: e => {
          if (level === 'country' && !state.countryFilter) {
            // Click country on world map to drill down and trigger spotlight focus
            const featureCountryName = props.name || props.NAME || props.ADMIN || name;
            
            // Match with excel country key
            let matchedKey = null;
            for (let k of Object.keys(aggregated.items)) {
              if (k === 'Non indicato') continue;
              const kNorm = normalizeStr(k);
              const alias = COUNTRY_ALIASES[k.toLowerCase()] || COUNTRY_ALIASES[kNorm];
              if (normalizeStr(featureCountryName) === kNorm || (alias && normalizeStr(alias) === normalizeStr(featureCountryName))) {
                matchedKey = k;
                break;
              }
            }
            if (!matchedKey) {
              matchedKey = featureCountryName.toUpperCase();
            }

            state.countryFilter = matchedKey;
            state.activeLevel = 'region';
            
            // Sync UI controls
            document.querySelectorAll('.level-tab').forEach(t => {
              t.classList.toggle('active', t.dataset.level === 'region');
            });
            const cSelect = document.getElementById('countryFilter');
            if (cSelect) {
              cSelect.value = state.countryFilter;
            }
            updateRegionFilter();
            renderAll();
          } else {
            state.map.fitBounds(layer.getBounds(), { padding: [20, 20] });
          }
        }
      });
    }
  }).addTo(state.map);

  // 4. Overlay REGIONAL Borders in BLUE if at Province level
  if (level === 'province' && showRegionBorder) {
    const regGeo = activeCountry === 'brazil' ? state.geoData.brazilStates : (activeCountry === 'italy' ? state.geoData.italyRegions : null);
    if (regGeo) {
      state.regionBorderLayer = L.geoJSON(regGeo, {
        style: {
          color: '#2563eb', // BLU REGIONI
          weight: 1.1,
          opacity: 1,
          fill: false,
          interactive: false
        }
      }).addTo(state.map);
    }
  }

  // 5. Highlight Outer Perimeter of Selected Country in Foreground (Crisp highlighted perimeter with elevation)
  if (state.countryFilter && selectedFeature) {
    state.countryPerimeterLayer = L.geoJSON(selectedFeature, {
      style: {
        color: '#1e3a8a', // ELEGANT NAVY BLUE HIGHLIGHT
        weight: 2.2,
        opacity: 1,
        fill: false,
        interactive: false,
        className: 'selected-country-perimeter'
      }
    }).addTo(state.map);
  }

  // Adjust View & Zoom
  if (level === 'country' && !state.countryFilter) {
    state.map.setView([-15.0, -55.0], 4);
  } else if (state.geoJsonLayer.getBounds().isValid()) {
    state.map.fitBounds(state.geoJsonLayer.getBounds(), { padding: [30, 30], maxZoom: level === 'province' ? 8 : 6 });
  }
}

// Update Floating Summary Panel (Prospetto Hotel & Provenienze)
function updateSummaryPanel(aggregated) {
  // 1. Hotel Name Badge
  const hotelBadge = document.getElementById('summaryHotelBadge');
  if (hotelBadge) {
    const iconHtml = '<img src="Loghi/Sombra marca nova sfondo trasparente senza testo.png" class="summary-badge-logo" alt="Sombra">';
    if (!state.hotelFilter || state.hotelFilter === '' || /tutti/i.test(state.hotelFilter)) {
      hotelBadge.innerHTML = `${iconHtml} <span>Gruppo Sombra</span>`;
      hotelBadge.title = 'Gruppo Sombra (Tutti i 4 Hotel Nord-Est)';
    } else {
      const hClean = state.hotelFilter.replace(/^🏨\s*/, '');
      hotelBadge.innerHTML = `${iconHtml} <span>${hClean}</span>`;
      hotelBadge.title = hClean;
    }
  }

  // 2. Period Badge
  const periodBadge = document.getElementById('summaryPeriodBadge');
  if (periodBadge) {
    if (state.yearFilter && state.monthFilter) {
      const mName = MONTH_NAMES[parseInt(state.monthFilter)] || `Mese ${state.monthFilter}`;
      periodBadge.textContent = `📅 ${mName} ${state.yearFilter}`;
    } else if (state.yearFilter) {
      periodBadge.textContent = `📅 Anno ${state.yearFilter}`;
    } else if (state.monthFilter) {
      const mName = MONTH_NAMES[parseInt(state.monthFilter)] || `Mese ${state.monthFilter}`;
      periodBadge.textContent = `📅 ${mName} (Tutti gli anni)`;
    } else {
      periodBadge.textContent = '📅 Tutto il Periodo';
    }
  }

  // 3. Card Title / Context
  const titleEl = document.getElementById('summaryCardTitle');
  if (titleEl) {
    if (!state.countryFilter) {
      titleEl.innerHTML = '🌍 Provenienza Ospiti per Stato (Mondo)';
    } else if (state.activeLevel === 'province') {
      const cLabel = state.countryFilter.toUpperCase();
      const flag = getCountryFlagHtml(state.countryFilter);
      titleEl.innerHTML = `${flag} Provenienza Province (${cLabel})`;
    } else {
      const cLabel = state.countryFilter.toUpperCase();
      const flag = getCountryFlagHtml(state.countryFilter);
      titleEl.innerHTML = `${flag} Provenienza Regioni (${cLabel})`;
    }
  }

  // 4. Populate Items List
  const listEl = document.getElementById('summaryItemsList');
  if (listEl) {
    listEl.innerHTML = '';
    
    // Sort items by guest count descending
    const sortedItems = Object.values(aggregated.items || {}).sort((a, b) => b.guests - a.guests);

    if (sortedItems.length === 0) {
      listEl.innerHTML = '<div style="font-size:0.75rem; color:#94a3b8; text-align:center; padding:8px;">Nessun dato per il filtro attivo</div>';
    } else {
      sortedItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'summary-row';

        let flagHtml = '';
        let displayName = item.name;

        if (item.name === 'Non indicato') {
          flagHtml = '<span class="summary-flag-emoji">❓</span>';
          displayName = 'Non indicato';
        } else if (!state.countryFilter) {
          flagHtml = getCountryFlagHtml(item.name, { className: 'summary-country-flag' });
        } else if (state.activeLevel === 'province') {
          flagHtml = '<span class="summary-flag-emoji">📍</span>';
        } else {
          // Regional view
          flagHtml = '<span class="summary-flag-emoji">🏛️</span>';
          const brAlias = BRAZIL_STATE_ALIASES[normalizeStr(item.name)];
          if (brAlias) {
            displayName = brAlias;
          }
        }

        row.innerHTML = `
          <span class="summary-area-name" title="${displayName}">${flagHtml}<span class="area-title-text">${displayName}</span></span>
          <div class="summary-data-right">
            <span class="summary-guests-badge">${formatNumber(item.guests)}</span>
            <span class="summary-pct-badge">${item.pct.toFixed(1)}%</span>
          </div>
        `;
        listEl.appendChild(row);
      });
    }
  }

  // 5. Total Guests (Adapts strictly to Mondo or single Country)
  const totalEl = document.getElementById('summaryTotalGuests');
  if (totalEl) {
    const scopeLabel = state.countryFilter ? state.countryFilter.toUpperCase() : 'MONDO';
    totalEl.textContent = `${formatNumber(aggregated.totalGuests)} Ospiti (${scopeLabel} · 100%)`;
  }
}

// Update KPI Summary Cards
function updateKPIs(aggregated) {
  document.getElementById('kpiTotal').textContent = `${formatNumber(aggregated.totalGuests)} Ospiti`;
  
  const topAreaEl = document.getElementById('kpiTopArea');
  if (topAreaEl) {
    if (aggregated.topArea) {
      let dispTop = aggregated.topArea.name;
      if (dispTop !== 'Non indicato') {
        dispTop = BRAZIL_STATE_ALIASES[normalizeStr(aggregated.topArea.name)] || aggregated.topArea.name;
      }
      topAreaEl.textContent = `${dispTop} (${formatNumber(aggregated.topArea.guests)} · ${aggregated.topArea.pct.toFixed(1)}%)`;
      topAreaEl.title = `Bacino principale: ${dispTop} con ${formatNumber(aggregated.topArea.guests)} clienti (${aggregated.topArea.pct.toFixed(1)}%)`;
    } else {
      topAreaEl.textContent = '-';
    }
  }

  document.getElementById('kpiCount').textContent = `${formatNumber(aggregated.count)} aree con ospiti`;
  document.getElementById('kpiAvg').textContent = `${formatNumber(aggregated.avg)} ${state.activeMetric === '%' ? '%' : 'ospiti / area'}`;
}

// Update Data Table
function updateDataTable() {
  const headerRow = document.getElementById('tableHeaderRow');
  const tbody = document.getElementById('tableBody');
  const filterVal = (document.getElementById('tableFilter').value || '').toLowerCase();

  headerRow.innerHTML = '';
  tbody.innerHTML = '';

  if (!state.columns.all || state.columns.all.length === 0) return;

  state.columns.all.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    headerRow.appendChild(th);
  });

  let filtered = getFilteredRows();

  // Text search
  if (filterVal) {
    filtered = filtered.filter(row => {
      return Object.values(row).some(v => v !== null && String(v).toLowerCase().includes(filterVal));
    });
  }

  document.getElementById('tableRowCount').textContent = filtered.length;

  const cCol = state.columns.country;
  const rCol = state.columns.region;
  const pCol = state.columns.province;

  filtered.slice(0, 300).forEach(r => {
    const tr = document.createElement('tr');
    state.columns.all.forEach(c => {
      const td = document.createElement('td');
      let val = r[c];
      const isGeoDim = (c === cCol || c === rCol || c === pCol || /paese|stato|country|regione|region|provincia|citta/i.test(c));

      if (val !== null && val !== undefined && String(val).trim() !== '') {
        if (c === '%' || /quota|percentuale/i.test(c)) {
          const num = typeof val === 'number' ? val : parseFloat(val);
          if (!isNaN(num)) {
            val = (num <= 1 ? (num * 100).toFixed(1) : num.toFixed(1)) + '%';
          }
        } else if (c === 'MESE' && MONTH_NAMES[val]) {
          val = `${MONTH_NAMES[val]} (${val})`;
        } else if (typeof val === 'number') {
          val = val.toLocaleString('it-IT');
        }
        td.textContent = String(val);
      } else {
        if (isGeoDim) {
          td.innerHTML = '<span class="text-muted-italic">Non indicato</span>';
        } else {
          td.textContent = '-';
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// Export Map directly into Excel
async function exportMapToExcel() {
  showLoading('Cattura mappa ad alta risoluzione e inserimento in Excel...');
  try {
    const mapEl = document.getElementById('map');
    const canvas = await html2canvas(mapEl, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 2
    });
    const imgBase64 = canvas.toDataURL('image/png');

    const currentSheet = state.currentSheet || (document.getElementById('sheetSelector') ? document.getElementById('sheetSelector').value : 'Tutti i 4 Hotel');

    const resp = await fetch('/api/export-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: imgBase64,
        sheet: currentSheet
      })
    });

    const result = await resp.json();
    hideLoading();

    if (result.success) {
      showToast(result.message || 'Mappa inserita con successo nel file Excel!');
    } else {
      alert(result.error || 'Errore durante l\'inserimento della mappa in Excel.');
    }
  } catch (err) {
    hideLoading();
    console.error('Errore export Excel:', err);
    alert('Errore durante la cattura della mappa: ' + (err.message || err));
  }
}

// Show Toast Notification
function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4500);
}

// Main Render Function
function renderAll() {
  const aggregated = getAggregatedData();
  renderMap(aggregated);
  updateSummaryPanel(aggregated);
  updateKPIs(aggregated);
  updateDataTable();

  // If channel modal is open, refresh its data in real time
  const channelModal = document.getElementById('channelModal');
  if (channelModal && !channelModal.classList.contains('hidden')) {
    renderChannelTable();
  }

  // Refresh active view
  if (state.activeView === 'view-clienti') {
    renderClientiView();
  } else if (state.activeView === 'view-canali') {
    renderCanaliPageView();
  } else if (state.activeView === 'view-database') {
    renderDatabaseView();
  }
}

// Channel / Booking Source Modal Functions
function openChannelModal() {
  const modal = document.getElementById('channelModal');
  if (modal) {
    modal.classList.remove('hidden');
    renderChannelTable();
  }
}

function closeChannelModal() {
  const modal = document.getElementById('channelModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function getChannelBadgeClass(channel) {
  const ch = String(channel || '').toUpperCase();
  if (ch.includes('PRIVAT') || ch.includes('DIRET')) return 'badge-direct';
  if (ch.includes('BOOKING')) return 'badge-booking';
  if (ch.includes('EXPEDIA')) return 'badge-expedia';
  if (ch.includes('CVC')) return 'badge-cvc';
  if (ch.includes('AIRBNB')) return 'badge-airbnb';
  if (ch.includes('AGENZ') || ch.includes('AGENCY')) return 'badge-agency';
  return 'badge-other';
}

function getChannelIcon(channel) {
  const ch = String(channel || '').toUpperCase();
  if (ch.includes('PRIVAT') || ch.includes('DIRET')) return '👤';
  if (ch.includes('BOOKING')) return '🅱️';
  if (ch.includes('EXPEDIA')) return '🟡';
  if (ch.includes('CVC')) return '✈️';
  if (ch.includes('AIRBNB')) return '🏠';
  if (ch.includes('AGENZ') || ch.includes('AGENCY')) return '🏢';
  return '🏷️';
}

function renderChannelTable() {
  const tbody = document.getElementById('channelTableBody');
  if (!tbody) return;

  const hCol = state.columns.hotel;
  const yCol = state.columns.year;
  const mCol = state.columns.month;
  const cCol = state.columns.channel || Object.keys(state.excelData[0] || {}).find(k => /canali|prenotazione|preovenienza|provenienza|channel|fonte/i.test(k));
  const gCol = state.columns.metrics.find(m => /clienti|ospiti|presenze|totale/i.test(m)) || state.columns.metrics[0] || 'CLIENTI';

  // Filter records by active hotel and active period
  let filtered = state.excelData || [];
  if (state.hotelFilter && hCol) {
    filtered = filtered.filter(r => {
      const v = String(r[hCol] || '').toLowerCase();
      return v.includes(state.hotelFilter.toLowerCase()) || state.hotelFilter.toLowerCase().includes(v);
    });
  }
  if (state.yearFilter && yCol) {
    filtered = filtered.filter(r => String(r[yCol]) === String(state.yearFilter));
  }
  if (state.monthFilter && mCol) {
    filtered = filtered.filter(r => String(r[mCol]) === String(state.monthFilter));
  }

  // Group aggregates
  let directGuests = 0;
  let unspecGuests = 0;
  const agencyTotals = {};
  let agencySubtotal = 0;

  filtered.forEach(row => {
    let rawCh = cCol ? row[cCol] : null;
    if (!rawCh) {
      for (let k of Object.keys(row)) {
        if (/canali|prenotazione|preovenienza|provenienza|channel/i.test(k) && row[k]) {
          rawCh = row[k];
          break;
        }
      }
    }

    let val = 0;
    if (gCol && row[gCol] !== undefined && row[gCol] !== null) {
      const num = parseFloat(row[gCol]);
      val = isNaN(num) ? 1 : num;
    } else {
      val = 1;
    }

    const strCh = rawCh ? String(rawCh).trim().toUpperCase() : '';

    if (!strCh || strCh === '-' || strCh === 'NULL' || strCh === 'UNDEFINED' || strCh === 'NON SPECIFICATO') {
      unspecGuests += val;
    } else if (strCh.includes('PRIVAT') || strCh.includes('DIRET') || strCh.includes('DIRECT') || strCh.includes('SITO') || strCh.includes('WALK')) {
      directGuests += val;
    } else {
      // It's an Agency / OTA (Booking, Expedia, CVC, etc.)
      agencyTotals[strCh] = (agencyTotals[strCh] || 0) + val;
      agencySubtotal += val;
    }
  });

  const directSubtotal = directGuests + unspecGuests;
  const grandTotal = directSubtotal + agencySubtotal;

  // Sorted agencies list
  const sortedAgencies = Object.entries(agencyTotals).sort((a, b) => b[1] - a[1]);

  // Update KPI cards
  const totalEl = document.getElementById('channelTotalGuests');
  const directEl = document.getElementById('channelDirectGuests');
  const otaEl = document.getElementById('channelOtaGuests');
  const footerTotal = document.getElementById('channelFooterTotalGuests');
  const subtitleEl = document.getElementById('channelModalSubtitle');

  const directPct = grandTotal > 0 ? ((directSubtotal / grandTotal) * 100).toFixed(1) : '0.0';
  const otaPct = grandTotal > 0 ? ((agencySubtotal / grandTotal) * 100).toFixed(1) : '0.0';

  if (totalEl) totalEl.textContent = formatNumber(grandTotal);
  if (directEl) directEl.textContent = `${formatNumber(directSubtotal)} (${directPct}%)`;
  if (otaEl) otaEl.textContent = `${formatNumber(agencySubtotal)} (${otaPct}%)`;
  if (footerTotal) footerTotal.textContent = formatNumber(grandTotal);

  if (subtitleEl) {
    const hotelDesc = state.hotelFilter || 'Tutti i 4 Hotel';
    const periodDesc = (state.yearFilter ? `Anno ${state.yearFilter}` : 'Tutti gli Anni') + (state.monthFilter ? ` - ${MONTH_NAMES[state.monthFilter] || state.monthFilter}` : '');
    subtitleEl.textContent = `Prospetto Canali per: ${hotelDesc} · ${periodDesc}`;
  }

  tbody.innerHTML = '';

  if (grandTotal === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">Nessun dato di canale/provenienza trovato per i filtri selezionati.</td></tr>`;
    return;
  }

  // -------------------------------------------------------------
  // 1. SEZIONE PRIVATI (PRIVATI + NON SPECIFICATO)
  // -------------------------------------------------------------
  if (directSubtotal > 0 || (directGuests === 0 && unspecGuests === 0 && sortedAgencies.length === 0)) {
    // Header Gruppo Privati
    const trGroupDirect = document.createElement('tr');
    trGroupDirect.className = 'channel-group-header group-direct';
    trGroupDirect.innerHTML = `<td colspan="3">👤 CANALE DIRETTO & PRIVATI</td>`;
    tbody.appendChild(trGroupDirect);

    // Riga 1: PRIVATI
    if (directGuests > 0 || unspecGuests === 0) {
      const pct = grandTotal > 0 ? (directGuests / grandTotal) * 100 : 0;
      const tr = document.createElement('tr');
      tr.className = 'channel-detail-row';
      tr.innerHTML = `
        <td>
          <div class="channel-name-cell">
            <span class="channel-badge badge-direct">👤 PRIVATI</span>
          </div>
        </td>
        <td style="text-align:right; font-weight:700; color:#0f172a;">
          ${formatNumber(directGuests)}
        </td>
        <td style="text-align:right;">
          <div class="channel-pct-cell">
            <div class="channel-pct-bar">
              <div class="channel-pct-fill badge-direct" style="width: ${Math.min(pct, 100)}%;"></div>
            </div>
            <span class="channel-pct-text">${pct.toFixed(1)}%</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Riga 2: NON SPECIFICATO (se presenti righe non indicate)
    if (unspecGuests > 0) {
      const pct = grandTotal > 0 ? (unspecGuests / grandTotal) * 100 : 0;
      const tr = document.createElement('tr');
      tr.className = 'channel-detail-row';
      tr.innerHTML = `
        <td>
          <div class="channel-name-cell">
            <span class="channel-badge badge-other">❓ NON SPECIFICATO</span>
          </div>
        </td>
        <td style="text-align:right; font-weight:700; color:#0f172a;">
          ${formatNumber(unspecGuests)}
        </td>
        <td style="text-align:right;">
          <div class="channel-pct-cell">
            <div class="channel-pct-bar">
              <div class="channel-pct-fill badge-other" style="width: ${Math.min(pct, 100)}%;"></div>
            </div>
            <span class="channel-pct-text">${pct.toFixed(1)}%</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Riga Subtotale: TOTALE PRIVATI
    const trSubDirect = document.createElement('tr');
    trSubDirect.className = 'channel-subtotal-row subtotal-direct';
    trSubDirect.innerHTML = `
      <td>
        <span style="font-weight:800; letter-spacing:0.3px;">📊 TOTALE PRIVATI</span>
      </td>
      <td style="text-align:right; font-weight:800; color:#14532d;">
        ${formatNumber(directSubtotal)}
      </td>
      <td style="text-align:right;">
        <div class="channel-pct-cell">
          <div class="channel-pct-bar">
            <div class="channel-pct-fill badge-direct" style="width: ${Math.min(parseFloat(directPct), 100)}%;"></div>
          </div>
          <span class="channel-pct-text" style="color:#14532d; font-weight:800;">${directPct}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(trSubDirect);
  }

  // -------------------------------------------------------------
  // 2. SEZIONE AGENZIE (Booking, Expedia, CVC, ecc.)
  // -------------------------------------------------------------
  if (sortedAgencies.length > 0) {
    // Header Gruppo Agenzie
    const trGroupOta = document.createElement('tr');
    trGroupOta.className = 'channel-group-header group-agency';
    trGroupOta.innerHTML = `<td colspan="3">🏨 INTERMEDIARI & AGENZIE (OTA / TOUR OPERATOR)</td>`;
    tbody.appendChild(trGroupOta);

    // Singole righe per ogni agenzia
    sortedAgencies.forEach(([agencyName, guests]) => {
      const pct = grandTotal > 0 ? (guests / grandTotal) * 100 : 0;
      const badgeClass = getChannelBadgeClass(agencyName);
      const icon = getChannelIcon(agencyName);

      const tr = document.createElement('tr');
      tr.className = 'channel-detail-row';
      tr.innerHTML = `
        <td>
          <div class="channel-name-cell">
            <span class="channel-badge ${badgeClass}">${icon} ${agencyName}</span>
          </div>
        </td>
        <td style="text-align:right; font-weight:700; color:#0f172a;">
          ${formatNumber(guests)}
        </td>
        <td style="text-align:right;">
          <div class="channel-pct-cell">
            <div class="channel-pct-bar">
              <div class="channel-pct-fill ${badgeClass}" style="width: ${Math.min(pct, 100)}%;"></div>
            </div>
            <span class="channel-pct-text">${pct.toFixed(1)}%</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Riga Subtotale: TOTALE AGENZIE
    const trSubOta = document.createElement('tr');
    trSubOta.className = 'channel-subtotal-row subtotal-agency';
    trSubOta.innerHTML = `
      <td>
        <span style="font-weight:800; letter-spacing:0.3px;">📊 TOTALE AGENZIE</span>
      </td>
      <td style="text-align:right; font-weight:800; color:#1e3a8a;">
        ${formatNumber(agencySubtotal)}
      </td>
      <td style="text-align:right;">
        <div class="channel-pct-cell">
          <div class="channel-pct-bar">
            <div class="channel-pct-fill badge-booking" style="width: ${Math.min(parseFloat(otaPct), 100)}%;"></div>
          </div>
          <span class="channel-pct-text" style="color:#1e3a8a; font-weight:800;">${otaPct}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(trSubOta);
  }
}

// Export Channel Table to Excel (.xlsx)
function exportChannelTableToExcel() {
  try {
    const hotelDesc = state.hotelFilter || 'Gruppo Sombra (Tutti i 4 Hotel)';
    const periodDesc = (state.yearFilter ? `Anno ${state.yearFilter}` : 'Tutti gli Anni') + (state.monthFilter ? ` - ${MONTH_NAMES[state.monthFilter] || state.monthFilter}` : '');

    const rows = [];
    rows.push(['HOTEL ANALYTICS - PROSPETTO CANALI DI PRENOTAZIONE']);
    rows.push([`Hotel: ${hotelDesc}`, `Periodo: ${periodDesc}`]);
    rows.push([`Data estrazione: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}`]);
    rows.push([]);
    rows.push(['PROVENIENZA / CANALE', 'NUMERO OSPITI', 'QUOTA %']);

    const tbody = document.getElementById('channelTableBody');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        if (tr.classList.contains('channel-group-header')) {
          rows.push([]);
          rows.push([tr.innerText.trim(), '', '']);
        } else {
          const tds = tr.querySelectorAll('td');
          if (tds.length >= 3) {
            const chName = tds[0].innerText.trim();
            const guestsText = tds[1].innerText.trim().replace(/\./g, '').replace(/,/g, '.');
            const guestsNum = parseFloat(guestsText) || 0;
            const pctText = tds[2].querySelector('.channel-pct-text') ? tds[2].querySelector('.channel-pct-text').innerText.trim() : tds[2].innerText.trim();
            const pctNum = (parseFloat(pctText.replace('%', '').replace(',', '.')) || 0) / 100;
            rows.push([chName, guestsNum, pctNum]);
          }
        }
      });
    }

    const footerGuestsText = document.getElementById('channelFooterTotalGuests') ? document.getElementById('channelFooterTotalGuests').innerText.trim().replace(/\./g, '') : '0';
    rows.push([]);
    rows.push(['TOTALE GENERALE', parseFloat(footerGuestsText) || 0, 1.0]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto column widths
    ws['!cols'] = [
      { wch: 38 },
      { wch: 18 },
      { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Canali Prenotazione');

    const cleanHotel = (state.hotelFilter || 'Tutti_Hotel').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPeriod = (state.yearFilter ? `_${state.yearFilter}` : '') + (state.monthFilter ? `_M${state.monthFilter}` : '');
    const fileName = `Canali_Prenotazione_${cleanHotel}${cleanPeriod}.xlsx`;

    XLSX.writeFile(wb, fileName);
    showToast(`File Excel '${fileName}' scaricato con successo!`);
  } catch (err) {
    console.error('Errore esportazione Excel:', err);
    alert('Errore durante la generazione del file Excel: ' + (err.message || err));
  }
}

// Export Channel Table to PDF (.pdf)
async function exportChannelTableToPdf() {
  showLoading('Generazione documento PDF in corso...');
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      throw new Error('Libreria jsPDF non disponibile.');
    }

    const modalBody = document.querySelector('#channelModal .modal-card');
    if (!modalBody) throw new Error('Elemento modale non trovato.');

    // Temporary hide modal footer buttons while rendering snapshot
    const footer = modalBody.querySelector('.modal-footer');
    const closeBtn = modalBody.querySelector('.modal-close-btn');
    if (footer) footer.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'none';

    const canvas = await html2canvas(modalBody, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    if (footer) footer.style.display = '';
    if (closeBtn) closeBtn.style.display = '';

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 24; // 12mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 12;
    if (imgHeight > pdfHeight - 24) {
      const scale = (pdfHeight - 24) / imgHeight;
      const fitWidth = imgWidth * scale;
      const fitHeight = imgHeight * scale;
      const xOffset = (pdfWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, fitWidth, fitHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 12, yOffset, imgWidth, imgHeight);
    }

    const cleanHotel = (state.hotelFilter || 'Tutti_Hotel').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPeriod = (state.yearFilter ? `_${state.yearFilter}` : '') + (state.monthFilter ? `_M${state.monthFilter}` : '');
    const fileName = `Canali_Prenotazione_${cleanHotel}${cleanPeriod}.pdf`;

    pdf.save(fileName);
    hideLoading();
    showToast(`File PDF '${fileName}' scaricato con successo!`);
  } catch (err) {
    hideLoading();
    console.error('Errore esportazione PDF:', err);
    alert('Errore durante la generazione del file PDF: ' + (err.message || err));
  }
}

// Switch View Function (Sidebar Navigation)
function switchView(viewId) {
  state.activeView = viewId;

  // 1. Update navigation active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  // 2. Update view sections
  document.querySelectorAll('.app-views-container .view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === viewId);
  });

  // 3. Update top bar titles
  const titleEl = document.getElementById('pageMainTitle');
  const subEl = document.getElementById('pageSubTitle');
  const btnExportPng = document.getElementById('btnExportPng');

  if (viewId === 'view-mappa') {
    if (titleEl) titleEl.textContent = 'Mappe Geografiche · Provenienza Clienti';
    if (subEl) subEl.textContent = 'Analisi territoriale delle presenze per Stati, Regioni e Province';
    if (btnExportPng) btnExportPng.style.display = 'inline-flex';
    if (state.map) {
      setTimeout(() => {
        state.map.invalidateSize();
        if (state.activeLevel === 'country' && !state.countryFilter) {
          state.map.setView([-15.0, -55.0], 4);
        }
      }, 150);
    }
  } else if (viewId === 'view-clienti') {
    if (titleEl) titleEl.textContent = 'Analisi Clienti Hotel · Presenze e Trend';
    if (subEl) subEl.textContent = 'Statistiche complessive presenze, ripartizione per struttura e andamento temporale';
    if (btnExportPng) btnExportPng.style.display = 'none';
    renderClientiView();
  } else if (viewId === 'view-canali') {
    if (titleEl) titleEl.textContent = 'Canali di Prenotazione & Agenzie';
    if (subEl) subEl.textContent = 'Analisi dettagliata Privati vs Agenzie OTA (Booking, Expedia, CVC) e quote di mercato';
    if (btnExportPng) btnExportPng.style.display = 'none';
    renderCanaliPageView();
  } else if (viewId === 'view-database') {
    if (titleEl) titleEl.textContent = 'Database Dati Hotel';
    if (subEl) subEl.textContent = 'Tabella completa dei record caricati dal foglio Excel attivo';
    if (btnExportPng) btnExportPng.style.display = 'none';
    renderDatabaseView();
  } else if (viewId === 'view-strumenti') {
    if (titleEl) titleEl.textContent = 'Strumenti & Personalizzazione Mappe';
    if (subEl) subEl.textContent = 'Configurazione colori, sfondi cartografici, visualizzazione confini ed etichette';
    if (btnExportPng) btnExportPng.style.display = 'none';
  } else if (viewId === 'view-passwords') {
    if (currentUserRole !== 'ADMIN') {
      switchView('view-mappa');
      return;
    }
    if (titleEl) titleEl.textContent = 'Gestione Credenziali & Password Utenti';
    if (subEl) subEl.textContent = 'Pannello di controllo riservato all\'Amministratore per assegnare, visualizzare e gestire le password degli utenti';
    if (btnExportPng) btnExportPng.style.display = 'none';
    renderUsersTable();
    renderAccessLogsTable();
    initWebhookInput();
  } else if (viewId === 'view-info') {
    if (titleEl) titleEl.textContent = 'Condivisione Web & Configurazione';
    if (subEl) subEl.textContent = 'Guida alla distribuzione in rete aziendale e hosting Cloud';
    if (btnExportPng) btnExportPng.style.display = 'none';
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('mobileSidebarOverlay');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }
}

window.toggleSidebar = function() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('mobileSidebarOverlay');
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active', sidebar.classList.contains('open'));
  }
};

// Helper: Canonicalize Channel Name (e.g. Booking -> BOOKING.COM, Expedia -> EXPEDIA)
function canonicalizeChannelName(rawCh) {
  if (!rawCh) return 'NON SPECIFICATO';
  const ch = String(rawCh).trim().toUpperCase();
  if (ch.includes('BOOKING')) return 'BOOKING.COM';
  if (ch.includes('EXPEDIA')) return 'EXPEDIA';
  if (ch.includes('CVC')) return 'CVC';
  if (ch.includes('AIRBNB')) return 'AIRBNB';
  if (ch.includes('PRIVAT') || ch.includes('DIRET') || ch.includes('DIRECT') || ch.includes('SITO') || ch.includes('WALK')) return 'PRIVATI';
  if (ch.includes('NON SPECIFICATO') || ch.includes('NON INDICATO') || ch === '-' || ch === 'NULL' || ch === 'UNDEFINED') return 'NON SPECIFICATO';
  return ch;
}

// ========================================================
// RENDER VIEW: ANALISI CLIENTI HOTEL
// ========================================================
function renderClientiView() {
  const filteredRows = getFilteredRows();
  const clientCol = state.columns.all.find(c => /clienti|ospiti|presenze|pernottamenti|vendite/i.test(c)) || state.activeMetric;
  const hCol = state.columns.hotel;
  const moCol = state.columns.month;
  const cCol = state.columns.country;
  const cityCol = state.columns.city;

  let totalGuests = 0;
  const hotelGuests = {};
  const monthGuests = {};
  const countryGuests = {};
  const cityGuests = {};

  filteredRows.forEach(r => {
    const rawVal = r[clientCol];
    let gVal = 0;
    if (typeof rawVal === 'number') gVal = rawVal;
    else if (rawVal) {
      const p = parseFloat(String(rawVal).replace(',', '.'));
      if (!isNaN(p)) gVal = p;
    }
    totalGuests += gVal;

    // By Hotel
    const h = (hCol && r[hCol]) ? String(r[hCol]).trim() : 'Altro';
    hotelGuests[h] = (hotelGuests[h] || 0) + gVal;

    // By Month
    const m = (moCol && r[moCol]) ? String(r[moCol]).trim() : 'N/D';
    monthGuests[m] = (monthGuests[m] || 0) + gVal;

    // By Country
    const c = (cCol && r[cCol]) ? String(r[cCol]).trim() : 'Non indicato';
    countryGuests[c] = (countryGuests[c] || 0) + gVal;

    // By City
    const city = (cityCol && r[cityCol]) ? String(r[cityCol]).trim() : (r[state.columns.province] || 'N/D');
    cityGuests[city] = (cityGuests[city] || 0) + gVal;
  });

  // Top hotel
  let topHotel = '-', maxHGuests = 0;
  Object.entries(hotelGuests).forEach(([h, g]) => {
    if (g > maxHGuests) { maxHGuests = g; topHotel = h; }
  });

  // Top country
  let topCountry = '-', maxCGuests = 0;
  Object.entries(countryGuests).forEach(([c, g]) => {
    if (g > maxCGuests) { maxCGuests = g; topCountry = c; }
  });
  const topCountryPct = totalGuests > 0 ? ((maxCGuests / totalGuests) * 100).toFixed(1) : '0.0';

  // Monthly avg
  const activeMonthsCount = Object.keys(monthGuests).length || 1;
  const monthlyAvg = Math.round(totalGuests / activeMonthsCount);

  // Update KPI Cards
  const kpiTot = document.getElementById('clientiKpiTotalGuests');
  if (kpiTot) kpiTot.textContent = formatNumber(totalGuests);
  
  const kpiTopH = document.getElementById('clientiKpiTopHotel');
  if (kpiTopH) kpiTopH.textContent = topHotel;
  
  const kpiTopHG = document.getElementById('clientiKpiTopHotelGuests');
  if (kpiTopHG) kpiTopHG.textContent = `${formatNumber(maxHGuests)} ospiti (${totalGuests > 0 ? ((maxHGuests / totalGuests) * 100).toFixed(1) : 0}%)`;
  
  const kpiTopC = document.getElementById('clientiKpiTopCountry');
  if (kpiTopC) kpiTopC.textContent = topCountry;
  
  const kpiTopCP = document.getElementById('clientiKpiTopCountryPct');
  if (kpiTopCP) kpiTopCP.textContent = `${topCountryPct}% del totale presenze`;
  
  const kpiAvgM = document.getElementById('clientiKpiMonthlyAvg');
  if (kpiAvgM) kpiAvgM.textContent = `${formatNumber(monthlyAvg)} / mese`;

  // Render Charts using Chart.js
  if (typeof Chart === 'undefined') return;

  // 1. Hotel Distribution Chart
  const ctxHotel = document.getElementById('chartHotelDistribution');
  if (ctxHotel) {
    if (state.charts.hotelDist) state.charts.hotelDist.destroy();
    const hLabels = Object.keys(hotelGuests);
    const hData = Object.values(hotelGuests);
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    state.charts.hotelDist = new Chart(ctxHotel, {
      type: 'bar',
      data: {
        labels: hLabels,
        datasets: [{
          label: 'Numero Ospiti',
          data: hData,
          backgroundColor: colors.slice(0, hLabels.length),
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${formatNumber(ctx.raw)} Ospiti (${totalGuests > 0 ? ((ctx.raw / totalGuests) * 100).toFixed(1) : 0}%)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => formatNumber(v) }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Monthly Trend Chart
  const ctxMonth = document.getElementById('chartMonthlyTrend');
  if (ctxMonth) {
    if (state.charts.monthlyTrend) state.charts.monthlyTrend.destroy();
    const sortedMonths = Object.keys(monthGuests).sort((a, b) => parseInt(a) - parseInt(b));
    const mLabels = sortedMonths.map(m => MONTH_NAMES[parseInt(m)] || `Mese ${m}`);
    const mData = sortedMonths.map(m => monthGuests[m]);

    state.charts.monthlyTrend = new Chart(ctxMonth, {
      type: 'line',
      data: {
        labels: mLabels,
        datasets: [{
          label: 'Presenze Mensili',
          data: mData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#2563eb',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${formatNumber(ctx.raw)} Ospiti`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => formatNumber(v) }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 3. Top Cities Chart
  const ctxCities = document.getElementById('chartTopCities');
  if (ctxCities) {
    if (state.charts.topCities) state.charts.topCities.destroy();
    const sortedCities = Object.entries(cityGuests)
      .filter(([city]) => city && city !== 'N/D' && city !== 'Non indicato')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    state.charts.topCities = new Chart(ctxCities, {
      type: 'bar',
      data: {
        labels: sortedCities.map(c => c[0]),
        datasets: [{
          axis: 'y',
          label: 'Ospiti',
          data: sortedCities.map(c => c[1]),
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${formatNumber(ctx.raw)} Ospiti (${totalGuests > 0 ? ((ctx.raw / totalGuests) * 100).toFixed(1) : 0}%)`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => formatNumber(v) }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }
}

// ========================================================
// RENDER VIEW: CANALI & AGENZIE
// ========================================================
function renderCanaliPageView() {
  const filteredRows = getFilteredRows();
  const clientCol = state.columns.all.find(c => /clienti|ospiti|presenze|pernottamenti|vendite/i.test(c)) || state.activeMetric;
  const chCol = state.columns.channel || state.columns.all.find(c => /canali|prenotazione|provenienza|fonte|channel|tipo/i.test(c));
  const hCol = state.columns.hotel;

  const directGroup = { 'PRIVATI': 0, 'NON SPECIFICATO': 0 };
  const agencyGroup = {};
  const channelByHotel = {};

  let grandTotalGuests = 0;

  filteredRows.forEach(r => {
    const rawVal = r[clientCol];
    let gVal = 0;
    if (typeof rawVal === 'number') gVal = rawVal;
    else if (rawVal) {
      const p = parseFloat(String(rawVal).replace(',', '.'));
      if (!isNaN(p)) gVal = p;
    }
    grandTotalGuests += gVal;

    let rawCh = chCol ? r[chCol] : null;
    if (!rawCh) {
      for (let k of Object.keys(r)) {
        if (/canali|prenotazione|provenienza|channel|fonte|tipo/i.test(k) && r[k]) {
          rawCh = r[k];
          break;
        }
      }
    }
    rawCh = rawCh ? String(rawCh).trim() : '';
    const h = (hCol && r[hCol]) ? String(r[hCol]).trim() : 'Hotel';

    if (!channelByHotel[h]) channelByHotel[h] = { direct: 0, ota: 0 };

    if (!rawCh || rawCh === '' || /non specificato/i.test(rawCh) || /non indicato/i.test(rawCh)) {
      directGroup['NON SPECIFICATO'] += gVal;
      channelByHotel[h].direct += gVal;
    } else if (/privat/i.test(rawCh) || /diret/i.test(rawCh)) {
      directGroup['PRIVATI'] += gVal;
      channelByHotel[h].direct += gVal;
    } else {
      const canonCh = canonicalizeChannelName(rawCh);
      agencyGroup[canonCh] = (agencyGroup[canonCh] || 0) + gVal;
      channelByHotel[h].ota += gVal;
    }
  });

  const totalDirect = directGroup['PRIVATI'] + directGroup['NON SPECIFICATO'];
  const totalAgencies = Object.values(agencyGroup).reduce((a, b) => a + b, 0);

  // Update KPIs
  const directPct = grandTotalGuests > 0 ? ((totalDirect / grandTotalGuests) * 100).toFixed(1) : '0.0';
  const otaPct = grandTotalGuests > 0 ? ((totalAgencies / grandTotalGuests) * 100).toFixed(1) : '0.0';

  let topChannelName = 'Privati', maxChGuests = totalDirect;
  Object.entries(agencyGroup).forEach(([ch, g]) => {
    if (g > maxChGuests) { maxChGuests = g; topChannelName = ch; }
  });

  const kpiDir = document.getElementById('canaliPageDirectGuests');
  if (kpiDir) kpiDir.textContent = formatNumber(totalDirect);
  const kpiDirPct = document.getElementById('canaliPageDirectPct');
  if (kpiDirPct) kpiDirPct.textContent = `${directPct}% del totale presenze`;

  const kpiOta = document.getElementById('canaliPageOtaGuests');
  if (kpiOta) kpiOta.textContent = formatNumber(totalAgencies);
  const kpiOtaPct = document.getElementById('canaliPageOtaPct');
  if (kpiOtaPct) kpiOtaPct.textContent = `${otaPct}% del totale presenze`;

  const kpiTopCh = document.getElementById('canaliPageTopChannel');
  if (kpiTopCh) kpiTopCh.textContent = topChannelName;
  const kpiTopChG = document.getElementById('canaliPageTopChannelGuests');
  if (kpiTopChG) kpiTopChG.textContent = `${formatNumber(maxChGuests)} ospiti`;

  // Render Table
  const tbody = document.getElementById('canaliPageTableBody');
  if (tbody) {
    let rowsHtml = '';
    const renderRow = (icon, name, guests, badgeClass = 'badge-direct') => {
      const pct = grandTotalGuests > 0 ? (guests / grandTotalGuests) * 100 : 0;
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.1rem;">${icon}</span>
              <strong style="color:#1e293b;">${name}</strong>
            </div>
          </td>
          <td style="text-align:right; font-weight:700; font-size:0.95rem;">${formatNumber(guests)}</td>
          <td style="text-align:right;">
            <div class="channel-pct-cell">
              <span class="channel-pct-text">${pct.toFixed(1)}%</span>
              <div class="channel-pct-bar">
                <div class="channel-pct-fill ${badgeClass}" style="width:${pct.toFixed(1)}%;"></div>
              </div>
            </div>
          </td>
        </tr>
      `;
    };

    if (directGroup['PRIVATI'] > 0) rowsHtml += renderRow('👤', 'PRIVATI (Diretto)', directGroup['PRIVATI'], 'badge-direct');
    if (directGroup['NON SPECIFICATO'] > 0) rowsHtml += renderRow('❓', 'NON SPECIFICATO', directGroup['NON SPECIFICATO'], 'badge-direct');

    rowsHtml += `
      <tr class="subtotal-row">
        <td><div style="display:flex; align-items:center; gap:8px;"><span>📊</span><span>TOTALE PRIVATI</span></div></td>
        <td style="text-align:right;">${formatNumber(totalDirect)}</td>
        <td style="text-align:right;">${directPct}%</td>
      </tr>
    `;

    const sortedAgencies = Object.entries(agencyGroup).sort((a, b) => b[1] - a[1]);
    sortedAgencies.forEach(([agencyName, guests]) => {
      rowsHtml += renderRow(getChannelIcon(agencyName), agencyName, guests, getChannelBadgeClass(agencyName));
    });

    rowsHtml += `
      <tr class="subtotal-row" style="background:#eff6ff; color:#2563eb;">
        <td><div style="display:flex; align-items:center; gap:8px;"><span>🏨</span><span>TOTALE AGENZIE (OTA)</span></div></td>
        <td style="text-align:right;">${formatNumber(totalAgencies)}</td>
        <td style="text-align:right;">${otaPct}%</td>
      </tr>
    `;

    tbody.innerHTML = rowsHtml;
    const footG = document.getElementById('canaliPageFooterTotalGuests');
    if (footG) footG.textContent = formatNumber(grandTotalGuests);
    const footP = document.getElementById('canaliPageFooterTotalPct');
    if (footP) footP.textContent = '100.0%';
  }

  // Render Charts
  if (typeof Chart === 'undefined') return;

  // 1. Channel Share Donut Chart
  const ctxShare = document.getElementById('chartChannelShare');
  if (ctxShare) {
    if (state.charts.channelShare) state.charts.channelShare.destroy();
    const shareLabels = ['Privati (Diretto)', ...Object.keys(agencyGroup)];
    const shareData = [totalDirect, ...Object.values(agencyGroup)];
    const colors = ['#10b981', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

    state.charts.channelShare = new Chart(ctxShare, {
      type: 'doughnut',
      data: {
        labels: shareLabels,
        datasets: [{
          data: shareData,
          backgroundColor: colors.slice(0, shareLabels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Outfit', size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${formatNumber(ctx.raw)} Ospiti (${grandTotalGuests > 0 ? ((ctx.raw / grandTotalGuests) * 100).toFixed(1) : 0}%)`
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 2. Channel by Hotel Stacked Bar Chart
  const ctxHotel = document.getElementById('chartChannelByHotel');
  if (ctxHotel) {
    if (state.charts.channelByHotel) state.charts.channelByHotel.destroy();
    const hotels = Object.keys(channelByHotel);
    const directVals = hotels.map(h => channelByHotel[h].direct);
    const otaVals = hotels.map(h => channelByHotel[h].ota);

    state.charts.channelByHotel = new Chart(ctxHotel, {
      type: 'bar',
      data: {
        labels: hotels,
        datasets: [
          { label: 'Privati (Diretto)', data: directVals, backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'OTA & Agenzie', data: otaVals, backgroundColor: '#2563eb', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Outfit', size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw)} Ospiti`
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => formatNumber(v) }
          }
        }
      }
    });
  }
}

// ========================================================
// RENDER VIEW: DATABASE & DATI EXCEL
// ========================================================
function getVisibleDbHeaders() {
  const allHeaders = state.columns.all || [];
  // Togli la colonna WORLD, togli la colonna %, e togli l'ultima colonna 'clienti' se duplicata/ridondante
  let filtered = allHeaders.filter(h => {
    const hNorm = String(h).trim().toLowerCase();
    if (hNorm === 'world' || hNorm === '%' || hNorm === 'percentuale') return false;
    return true;
  });

  // Se ci sono più colonne chiamate 'clienti' (o simili), teniamo la prima e rimuoviamo l'ultima duplicata
  const clientiIndexes = [];
  filtered.forEach((h, idx) => {
    if (/^(clienti|ospiti|presenze|pernottamenti)$/i.test(String(h).trim())) {
      clientiIndexes.push(idx);
    }
  });

  if (clientiIndexes.length > 1) {
    const lastIdx = clientiIndexes[clientiIndexes.length - 1];
    filtered = filtered.filter((_, idx) => idx !== lastIdx);
  }

  return filtered;
}

function renderDatabaseView() {
  const headers = getVisibleDbHeaders();
  const thead = document.getElementById('dbTableHeaderRow');
  const tbody = document.getElementById('dbTableBody');
  const countEl = document.getElementById('dbRowCount');
  const searchInput = document.getElementById('dbTableSearch');

  if (thead) {
    thead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
  }

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const rows = state.excelData.filter(r => {
    if (!query) return true;
    return Object.values(r).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(query));
  });

  if (countEl) countEl.textContent = formatNumber(rows.length);

  if (tbody) {
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${headers.length || 1}" style="text-align:center; padding:20px; color:#94a3b8;">Nessun record trovato</td></tr>`;
    } else {
      tbody.innerHTML = rows.map(r => {
        const cells = headers.map(h => {
          let val = r[h];
          if (val === null || val === undefined || String(val).trim() === '') val = '-';
          else if (/^(anno|year|mese|month)$/i.test(String(h).trim())) {
            // Non formattare anno o mese con il punto delle migliaia (es. 2026, non 2.026)
            val = String(val);
          } else if (typeof val === 'number') {
            val = formatNumber(val);
          } else if (typeof val === 'string' && /^\d+([.,]\d+)?$/.test(val.trim())) {
            val = formatNumber(val);
          }
          return `<td>${val}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }
  }
}

// Export Full Database Table to Excel
function exportDatabaseToExcel() {
  try {
    if (!state.excelData || state.excelData.length === 0) {
      alert('Nessun dato da esportare.');
      return;
    }
    const visibleHeaders = getVisibleDbHeaders();
    const exportData = state.excelData.map(row => {
      const cleanRow = {};
      visibleHeaders.forEach(h => {
        cleanRow[h] = row[h];
      });
      return cleanRow;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, state.currentSheet || 'Database');
    const fileName = `Database_Hotel_${(state.currentSheet || 'Dati')}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Database esportato in '${fileName}'!`);
  } catch (err) {
    console.error('Errore esportazione database:', err);
    alert('Errore durante l\'esportazione del database: ' + err.message);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Auth Event Listeners (Login form submit)
  setupAuthEventListeners();

  // 0. Navigation Sidebar (DASHBOARD_BRASIL Style)
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const targetView = item.dataset.view;
      if (targetView) switchView(targetView);
    });
  });

  // 1. Hotel Filter Change & Custom Dropdown Toggle
  const hotelDropdownBtn = document.getElementById('hotelDropdownBtn');
  const hotelDropdownMenu = document.getElementById('hotelDropdownMenu');
  if (hotelDropdownBtn && hotelDropdownMenu) {
    hotelDropdownBtn.addEventListener('click', e => {
      e.stopPropagation();
      hotelDropdownMenu.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#customHotelDropdown')) {
        hotelDropdownMenu.classList.remove('open');
      }
    });
  }

  const hotelEl = document.getElementById('hotelFilter');
  if (hotelEl) {
    hotelEl.addEventListener('change', e => {
      state.hotelFilter = e.target.value;
      renderAll();
    });
  }

  // 2. Level Tabs
  document.querySelectorAll('.level-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeLevel = btn.dataset.level;
      
      if (state.activeLevel === 'country') {
        // Reset to world
        state.countryFilter = '';
        state.regionFilter = '';
        const cSelect = document.getElementById('countryFilter');
        if (cSelect) cSelect.value = '';
        updateRegionFilter();
      } else if (state.activeLevel === 'region' && !state.countryFilter) {
        // If clicking Regioni without a selected country, default to first country (e.g. BRASILE)
        const cCol = state.columns.country;
        const firstCountry = cCol ? (state.excelData.find(r => r[cCol]) || {})[cCol] || 'BRASILE' : 'BRASILE';
        state.countryFilter = String(firstCountry).toUpperCase();
        const cSelect = document.getElementById('countryFilter');
        if (cSelect) cSelect.value = state.countryFilter;
        updateRegionFilter();
      } else if (state.activeLevel === 'province' && !state.countryFilter) {
        const cCol = state.columns.country;
        const firstCountry = cCol ? (state.excelData.find(r => r[cCol]) || {})[cCol] || 'BRASILE' : 'BRASILE';
        const normCountry = normalizeStr(firstCountry);
        if (normCountry.includes('ita')) {
          state.countryFilter = 'ITALIA';
        } else if (normCountry.includes('bra')) {
          state.countryFilter = 'BRASILE';
        } else {
          state.countryFilter = String(firstCountry).toUpperCase();
        }
        const cSelect = document.getElementById('countryFilter');
        if (cSelect && state.countryFilter) cSelect.value = state.countryFilter;
        updateRegionFilter();
      }

      renderAll();
    });
  });

  // 3. Country Filter (Visione 2: Seleziona Stato da Esaminare)
  const countryEl = document.getElementById('countryFilter');
  if (countryEl) {
    countryEl.addEventListener('change', e => {
      const selectedVal = e.target.value;
      state.countryFilter = selectedVal;

      if (!selectedVal) {
        // Reset to World View
        state.activeLevel = 'country';
        state.regionFilter = '';
        document.querySelectorAll('.level-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.level === 'country');
        });
      } else {
        // Switch to Region View of selected country
        state.activeLevel = 'region';
        state.regionFilter = '';
        document.querySelectorAll('.level-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.level === 'region');
        });
      }

      updateRegionFilter();
      renderAll();
    });
  }

  // 4. Reset to World Button
  const btnWorld = document.getElementById('btnBackToWorld');
  if (btnWorld) {
    btnWorld.addEventListener('click', () => {
      state.countryFilter = '';
      state.regionFilter = '';
      state.activeLevel = 'country';
      
      const cSelect = document.getElementById('countryFilter');
      if (cSelect) cSelect.value = '';
      
      document.querySelectorAll('.level-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.level === 'country');
      });

      updateRegionFilter();
      renderAll();
    });
  }

  // 5. Region Filter
  const regEl = document.getElementById('regionFilter');
  if (regEl) {
    regEl.addEventListener('change', e => {
      state.regionFilter = e.target.value;
      renderAll();
    });
  }

  // 6. Year & Month Temporal Filters (Hotel Period)
  const yearEl = document.getElementById('yearFilter');
  if (yearEl) {
    yearEl.addEventListener('change', e => {
      state.yearFilter = e.target.value;
      renderAll();
    });
  }
  const monthEl = document.getElementById('monthFilter');
  if (monthEl) {
    monthEl.addEventListener('change', e => {
      state.monthFilter = e.target.value;
      renderAll();
    });
  }

  // 7. Metric & Aggregation Select
  const metricEl = document.getElementById('metricSelect');
  if (metricEl) {
    metricEl.addEventListener('change', e => {
      state.activeMetric = e.target.value;
      renderAll();
    });
  }
  const aggEl = document.getElementById('aggSelect');
  if (aggEl) {
    aggEl.addEventListener('change', e => {
      state.activeAgg = e.target.value;
      renderAll();
    });
  }

  // 8. Palette & BaseMap
  const palEl = document.getElementById('paletteSelect');
  if (palEl) {
    palEl.addEventListener('change', e => {
      state.activePalette = e.target.value;
      renderAll();
    });
  }
  const baseEl = document.getElementById('baseMapSelect');
  if (baseEl) {
    baseEl.addEventListener('change', e => {
      state.activeBaseMap = e.target.value;
      setBaseMap(e.target.value);
    });
  }

  // 9. Checkboxes
  const chkLabels = document.getElementById('chkPermanentLabels');
  if (chkLabels) {
    chkLabels.addEventListener('change', () => {
      renderAll();
    });
  }
  const chkRegion = document.getElementById('chkRegionBorder');
  if (chkRegion) {
    chkRegion.addEventListener('change', () => {
      renderAll();
    });
  }
  const chkFlou = document.getElementById('chkSpotlightFlou');
  if (chkFlou) {
    chkFlou.addEventListener('change', () => {
      renderAll();
    });
  }

  // 10. Sheet Select
  const sheetEl = document.getElementById('sheetSelector');
  if (sheetEl) {
    sheetEl.addEventListener('change', e => {
      fetchExcelData(e.target.value);
    });
  }

  // 11. Buttons
  const btnExport = document.getElementById('btnExportExcel');
  if (btnExport) btnExport.addEventListener('click', exportMapToExcel);
  document.getElementById('btnReload').addEventListener('click', () => {
    fetchExcelData(state.currentSheet);
  });

  // Channel Modal Controls
  const btnChannel = document.getElementById('btnChannelModal');
  if (btnChannel) btnChannel.addEventListener('click', openChannelModal);
  
  const btnCloseCh = document.getElementById('btnCloseChannelModal');
  if (btnCloseCh) btnCloseCh.addEventListener('click', closeChannelModal);
  
  const btnCloseChBtn = document.getElementById('btnCloseChannelModalBtn');
  if (btnCloseChBtn) btnCloseChBtn.addEventListener('click', closeChannelModal);

  const btnExportChXlsx = document.getElementById('btnExportChannelExcel');
  if (btnExportChXlsx) btnExportChXlsx.addEventListener('click', exportChannelTableToExcel);

  const btnExportChPdf = document.getElementById('btnExportChannelPdf');
  if (btnExportChPdf) btnExportChPdf.addEventListener('click', exportChannelTableToPdf);

  // Channels Page Export Buttons
  const btnExportChPageXlsx = document.getElementById('btnExportChannelPageExcel');
  if (btnExportChPageXlsx) btnExportChPageXlsx.addEventListener('click', exportChannelTableToExcel);

  const btnExportChPagePdf = document.getElementById('btnExportChannelPagePdf');
  if (btnExportChPagePdf) btnExportChPagePdf.addEventListener('click', exportChannelTableToPdf);

  // Database Page Controls
  const btnExportDb = document.getElementById('btnExportDbExcel');
  if (btnExportDb) btnExportDb.addEventListener('click', exportDatabaseToExcel);

  const searchDb = document.getElementById('dbTableSearch');
  if (searchDb) searchDb.addEventListener('input', renderDatabaseView);

  const channelModal = document.getElementById('channelModal');
  if (channelModal) {
    channelModal.addEventListener('click', e => {
      if (e.target === channelModal) closeChannelModal();
    });
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeChannelModal();
      const drawer = document.getElementById('dataDrawer');
      if (drawer && !drawer.classList.contains('closed')) {
        drawer.classList.add('closed');
      }
    }
  });

  // 12. Drawer (if present)
  const btnToggleT = document.getElementById('btnToggleTable');
  if (btnToggleT) {
    btnToggleT.addEventListener('click', () => {
      const d = document.getElementById('dataDrawer');
      if (d) d.classList.toggle('closed');
    });
  }
  const btnCloseD = document.getElementById('btnCloseDrawer');
  if (btnCloseD) {
    btnCloseD.addEventListener('click', () => {
      const d = document.getElementById('dataDrawer');
      if (d) d.classList.add('closed');
    });
  }
  const tblFilter = document.getElementById('tableFilter');
  if (tblFilter) {
    tblFilter.addEventListener('input', () => {
      updateDataTable();
    });
  }

  // 13. Export PNG
  const btnPng = document.getElementById('btnExportPng');
  if (btnPng) {
    btnPng.addEventListener('click', () => {
      showLoading('Generazione immagine PNG ad alta risoluzione...');
      const mapSection = document.getElementById('mapSection');
      html2canvas(mapSection, { useCORS: true, allowTaint: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Mappa_Hotel_${state.activeLevel}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        hideLoading();
      }).catch(err => {
        console.error('Export failed:', err);
        hideLoading();
        alert('Errore durante l\'esportazione PNG.');
      });
    });
  }

  // 14. Drag and Drop
  window.addEventListener('dragover', e => {
    e.preventDefault();
    const dz = document.getElementById('dropZone');
    if (dz) dz.classList.remove('hidden');
  });
  const dzEl = document.getElementById('dropZone');
  if (dzEl) {
    dzEl.addEventListener('dragleave', e => {
      e.preventDefault();
      dzEl.classList.add('hidden');
    });
    dzEl.addEventListener('drop', e => {
      e.preventDefault();
      dzEl.classList.add('hidden');
      const file = e.dataTransfer.files[0];
      if (file) parseClientFile(file);
    });
  }
}

function parseClientFile(file) {
  showLoading(`Caricamento file ${file.name}...`);
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let bestRow = 0;
      jsonData.forEach((row, idx) => {
        if (row && row.some(cell => typeof cell === 'string' && /hotel|paese|stato|regione|provincia|clienti|sales|canale|provenienza/i.test(cell))) {
          bestRow = idx;
        }
      });

      const headers = jsonData[bestRow].map(h => String(h || '').trim());
      const detectedCols = {
        hotel: headers.find(h => /hotel|struttura|albergo|resort/i.test(h)) || null,
        year: headers.find(h => /anno|year/i.test(h)) || null,
        month: headers.find(h => /mese|month/i.test(h)) || null,
        country: headers.find(h => /^paese$|^country$|^nazione$/i.test(h)) || headers.find(h => /paese|country|nazione/i.test(h)) || headers.find(h => /^stato$/i.test(h)) || null,
        region: headers.find(h => /regione|region|estado/i.test(h)) || null,
        province: headers.find(h => /^provincia$|^province$/i.test(h)) || headers.find(h => /provincia|province/i.test(h) && !/citta|città/i.test(h)) || null,
        city: headers.find(h => /citta|città|city/i.test(h)) || null,
        channel: headers.find(h => /preovenienza|provenienza|canale|channel|fonte/i.test(h)) || null,
        metrics: headers.filter(h => !/hotel|struttura|albergo|resort|anno|mese|paese|stato|country|regione|region|provincia|citta|città|city|preovenienza|provenienza|canale|channel|fonte/i.test(h)),
        all: headers
      };

      const records = [];

      for (let i = bestRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        const item = {};
        let isTotalRow = false;
        headers.forEach((h, cIdx) => {
          let val = row[cIdx];
          if (val !== undefined && val !== null) {
            if (typeof val === 'string') {
              val = val.trim();
              if (/^(totale|total|somma|grand total)$/i.test(val)) {
                isTotalRow = true;
              }
            }
            item[h] = val;
          } else {
            item[h] = null;
          }
        });

        const dimCols = [detectedCols.hotel, detectedCols.country, detectedCols.region, detectedCols.province, detectedCols.city].filter(Boolean);
        const hasDim = dimCols.some(d => item[d] !== null && item[d] !== undefined && String(item[d]).trim() !== '');

        if (hasDim && !isTotalRow) {
          records.push(item);
        }
      }

      state.excelData = records;
      state.columns = detectedCols;

      // Auto-enrich geographic data from city
      enrichGeographicData(state.excelData, state.columns);

      document.getElementById('excelFileName').textContent = file.name;
      document.getElementById('excelFileMeta').textContent = `Caricato da locale | ${records.length} righe`;

      setupControls();
      renderAll();
    } catch (err) {
      alert(`Errore nella lettura del file: ${err.message}`);
    } finally {
      hideLoading();
    }
  };
  reader.readAsArrayBuffer(file);
}

// Helpers
function showLoading(msg = 'Caricamento...') {
  document.getElementById('loadingMessage').textContent = msg;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

// App Bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  initAuth();
  initMap();
  setupEventListeners();
  await loadGeoDatasets();
  await fetchExcelData();
});
