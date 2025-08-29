/**
 * Apps Script skeleton for recommended-content-list
 * - doPost(e): handles create/update/delete actions
 * - doGet(e): handles read operations (list, filter by tag, get by id)
 *
 * Deployment note: set the script's project properties or replace the
 * SHEET_ID placeholder with your Google Sheet ID before deploying.
 */

var SHEET_ID = 'REPLACE_WITH_SHEET_ID'; // set in Properties or replace here
var SHEET_NAME = 'Sheet1';

// Configure emails
var TEACHER_EMAIL = 'teacher@school.edu';
// Add any additional poster accounts here (e.g. your personal account)
var ALLOWED_POSTERS = [TEACHER_EMAIL, 'you.personal@example.com'];

function _getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

function doPost(e) {
  // Basic dispatcher: supports action=create|update|delete (default create)
  var params = e.parameter || {};
  var action = params.action || 'create';

  // Authentication: preferred deployment is "Execute as: User accessing the web app"
  // and access limited to your domain. Use Session.getActiveUser().getEmail() to verify.
  var sender = Session.getActiveUser && Session.getActiveUser().getEmail ? Session.getActiveUser().getEmail() : 'unknown';
  // Allow teacher plus any additional poster accounts defined in ALLOWED_POSTERS
  if (ALLOWED_POSTERS.indexOf(sender) === -1) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Forbidden' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'create') {
    return _createItem(params, e.postData && e.postData.contents);
  } else if (action === 'update') {
    return _updateItem(params);
  } else if (action === 'delete') {
    return _deleteItem(params);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var params = e.parameter || {};
  var sheet = _getSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var rows = values.map(function(r, i) {
    var obj = {};
    headers.forEach(function(h, idx) { obj[h] = r[idx]; });
    obj._row = i + 2; // sheet row index
    return obj;
  });

  // Mask senderEmail for non-teacher viewers so students see posts attributed to the teacher.
  // If the requester is the teacher (or an allowed admin), they will see the real sender.
  var requester = Session.getActiveUser && Session.getActiveUser().getEmail ? Session.getActiveUser().getEmail() : '';
  var shouldMask = (requester !== TEACHER_EMAIL);
  if (shouldMask) {
    rows = rows.map(function(r){
      // keep a realSender field for audit, but present senderEmail as teacher's email
      if (r.senderEmail) r.realSenderEmail = r.senderEmail;
      r.senderEmail = TEACHER_EMAIL;
      return r;
    });
  }

  // Filtering
  if (params.id) {
    var found = rows.filter(function(r) { return r.id === params.id; });
    return ContentService.createTextOutput(JSON.stringify(found[0] || null)).setMimeType(ContentService.MimeType.JSON);
  }
  if (params.tag) {
    var tag = params.tag.toLowerCase();
    rows = rows.filter(function(r) { return (r.tags || '').toLowerCase().split(',').map(function(t){return t.trim();}).indexOf(tag) !== -1; });
  }
  if (params.status) {
    rows = rows.filter(function(r) { return (r.status || '') === params.status; });
  }
  var limit = params.limit ? parseInt(params.limit, 10) : 100;
  rows = rows.slice(0, limit);
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}

function _createItem(params, raw) {
  var sheet = _getSheet();
  var id = Utilities.getUuid();
  var ts = new Date().toISOString();
  var title = params.title || '';
  var text = params.text || '';
  var url = params.url || '';
  var thread = params.thread || '';
  var tags = _extractTags(text);
  var sender = Session.getActiveUser && Session.getActiveUser().getEmail ? Session.getActiveUser().getEmail() : '';
  var status = 'published';

  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  var row = [];
  headers.forEach(function(h){
    switch(h) {
      case 'id': row.push(id); break;
      case 'timestamp': row.push(ts); break;
      case 'title': row.push(title); break;
      case 'text': row.push(text); break;
      case 'url': row.push(url); break;
      case 'tags': row.push(tags); break;
      case 'thread': row.push(thread); break;
      case 'senderEmail': row.push(sender); break;
      case 'status': row.push(status); break;
      case 'rawPayload': row.push(raw || ''); break;
      default: row.push(''); break;
    }
  });
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, id: id })).setMimeType(ContentService.MimeType.JSON);
}

function _updateItem(params) {
  var sheet = _getSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows.shift();
  var id = params.id;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][headers.indexOf('id')] === id) {
      // update requested fields
      var updates = ['title','text','url','tags','thread','status'];
      updates.forEach(function(k){
        if (params[k] !== undefined) {
          sheet.getRange(i+2, headers.indexOf(k)+1).setValue(params[k]);
        }
      });
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
}

function _deleteItem(params) {
  // soft delete by default
  if (!params.id) return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Missing id' })).setMimeType(ContentService.MimeType.JSON);
  params.status = 'deleted';
  return _updateItem(params);
}

function _extractTags(text) {
  var m = text.match(/#(\w[\w-]*)/g);
  if (!m) return '';
  var out = m.map(function(t){ return t.replace('#','').toLowerCase(); });
  // unique
  var uniq = out.filter(function(v,i){ return out.indexOf(v) === i; });
  return uniq.join(',');
}
