/**
 * 121 Notebook: backend Google Sheet + Google Calendar.
 * Pasang di Google Sheet kosong: Extensions > Apps Script > tempel file ini.
 * Langkah lengkap ada di README.md.
 */

// Ganti dengan kata sandi bebas. Isi sama persis di Pengaturan app.
const TOKEN = 'GANTI-DENGAN-KATA-SANDI-ANDA';

const TABLES = {
  Sessions: ['id', 'pid', 'name', 'date', 'chapter', 'klas', 'depth', 'bisnis', 'bread', 'cheese', 'meat',
             'trigger', 'sphere', 'klien', 'good', 'bad', 'notes', 'next', 'updated', 'deleted', 'wa', 'rin', 'rout', 'bname'],
  Referrals: ['id', 'pid', 'name', 'date', 'dir', 'desc', 'status', 'value', 'updated', 'deleted'],
  Schedule: ['id', 'pid', 'name', 'start', 'dur', 'place', 'agenda', 'status', 'cal', 'eventId', 'updated', 'deleted']
};

/** Jalankan sekali dari editor untuk memberi izin Sheet dan Calendar. */
function setup() {
  Object.keys(TABLES).forEach(sheetFor);
  CalendarApp.getDefaultCalendar().getName();
}

function sheetFor(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const cols = TABLES[name];
  if (sh.getLastRow() > 0 && sh.getLastColumn() < cols.length) {
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold'); // tambah kolom baru
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // teks polos agar tanggal dan jam tidak diubah Sheets jadi objek Date
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
  }
  return sh;
}

function readAll(name) {
  const sh = sheetFor(name);
  const cols = TABLES[name];
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, cols.length).getValues().map(function (v) {
    const o = {};
    cols.forEach(function (c, i) { o[c] = String(v[i] == null ? '' : v[i]); });
    return o;
  });
}

function upsert(name, row) {
  const sh = sheetFor(name);
  const cols = TABLES[name];
  if (name === 'Schedule') row = syncCalendar(row);
  const vals = cols.map(function (c) { return row[c] == null ? '' : String(row[c]); });
  const last = sh.getLastRow();
  let at = 0;
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(row.id)) { at = i + 2; break; }
  }
  if (at) sh.getRange(at, 1, 1, cols.length).setValues([vals]);
  else sh.getRange(last + 1, 1, 1, cols.length).setValues([vals]);
  return row;
}

function syncCalendar(r) {
  const cal = CalendarApp.getDefaultCalendar();
  let ev = null;
  if (r.eventId) { try { ev = cal.getEventById(r.eventId); } catch (e) { ev = null; } }
  const want = r.cal === '1' && r.status === 'planned' && r.deleted !== '1';
  if (!want) {
    if (ev) { try { ev.deleteEvent(); } catch (e) {} }
    r.eventId = '';
    return r;
  }
  const p = r.start.split('T'), d = p[0].split('-'), t = p[1].split(':');
  const start = new Date(+d[0], +d[1] - 1, +d[2], +t[0], +t[1]);
  const end = new Date(start.getTime() + (+r.dur || 60) * 60000);
  const desc = (r.agenda ? 'Agenda / next step:\n' + r.agenda + '\n\n' : '') + 'Dibuat dari 121 Notebook';
  if (ev) {
    ev.setTitle('121 · ' + r.name).setTime(start, end).setLocation(r.place || '').setDescription(desc);
  } else {
    ev = cal.createEvent('121 · ' + r.name, start, end, { location: r.place || '', description: desc });
    ev.addPopupReminder(60);
    r.eventId = ev.getId();
  }
  return r;
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if ((e.parameter.token || '') !== TOKEN) return out({ ok: false, error: 'token' });
  return out({ ok: true, sessions: readAll('Sessions'), schedule: readAll('Schedule'), referrals: readAll('Referrals') });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return out({ ok: false, error: 'token' });
    if (body.action === 'ping') return out({ ok: true });
    if (body.action === 'upsert' && TABLES[body.table]) {
      return out({ ok: true, row: upsert(body.table, body.row) });
    }
    return out({ ok: false, error: 'action' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
