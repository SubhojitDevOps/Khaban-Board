const SHEET_NAME = "Tasks";
const HEADERS = [
  "id",
  "title",
  "description",
  "status",
  "priority",
  "createdAt",
  "updatedAt",
  "parentId",
  "owner",
  "dueDate",
  "aiHint",
  "labels",
  "project",
  "sprint",
  "estimate",
  "blocked",
  "blockerReason",
  "createdBy",
  "updatedBy",
  "ownerEmail",
  "lastReminderAt",
  "reminderCount",
];
const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const VALID_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

function doGet(e) {
  try {
    const id = getParam(e, "id");
    if (id) {
      const task = findTaskById(id);
      return jsonResponse(task ? { ok: true, data: task } : { ok: false, error: "Task not found" }, task ? 200 : 404);
    }

    return jsonResponse({ ok: true, data: listTasks() });
  } catch (error) {
    return errorResponse(error);
  }
}

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const method = String(payload._method || getParam(e, "_method") || "POST").toUpperCase();

    if (method === "PUT") {
      return doPut(makeEventFromPayload(payload));
    }

    if (method === "DELETE") {
      return doDelete(makeEventFromPayload(payload));
    }

    return jsonResponse({ ok: true, data: createTask(payload) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

function doPut(e) {
  try {
    const payload = parsePayload(e);
    const id = payload.id || getParam(e, "id");

    if (!id) {
      return jsonResponse({ ok: false, error: "Task id is required" }, 400);
    }

    const task = updateTask(id, payload);
    return jsonResponse(task ? { ok: true, data: task } : { ok: false, error: "Task not found" }, task ? 200 : 404);
  } catch (error) {
    return errorResponse(error);
  }
}

function doDelete(e) {
  try {
    const payload = parsePayload(e);
    const id = payload.id || getParam(e, "id");

    if (!id) {
      return jsonResponse({ ok: false, error: "Task id is required" }, 400);
    }

    const deleted = deleteTask(id);
    return jsonResponse(deleted ? { ok: true, data: { id } } : { ok: false, error: "Task not found" }, deleted ? 200 : 404);
  } catch (error) {
    return errorResponse(error);
  }
}

function setupDatabase() {
  const sheet = getSheet();
  ensureHeaders(sheet);
  return jsonResponse({ ok: true, data: { sheetName: SHEET_NAME, headers: HEADERS } });
}

function listTasks() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  return values.slice(1).filter(row => row[0]).map(rowToTask);
}

function findTaskById(id) {
  return listTasks().find(task => task.id === id) || null;
}

function createTask(payload) {
  validateTaskPayload(payload, true);

  const now = new Date().toISOString();
  const task = {
    id: payload.id || Utilities.getUuid(),
    title: String(payload.title).trim(),
    description: String(payload.description || "").trim(),
    status: normalizeStatus(payload.status),
    priority: normalizePriority(payload.priority),
    createdAt: now,
    updatedAt: now,
    parentId: normalizeParentId(payload.parentId),
    owner: normalizeText(payload.owner),
    dueDate: normalizeText(payload.dueDate),
    aiHint: normalizeText(payload.aiHint),
    labels: normalizeText(payload.labels),
    project: normalizeText(payload.project),
    sprint: normalizeText(payload.sprint),
    estimate: normalizeText(payload.estimate),
    blocked: normalizeBoolean(payload.blocked),
    blockerReason: normalizeText(payload.blockerReason),
    createdBy: normalizeText(payload.createdBy),
    updatedBy: normalizeText(payload.updatedBy || payload.createdBy),
    ownerEmail: normalizeEmail(payload.ownerEmail),
    lastReminderAt: "",
    reminderCount: 0,
  };

  const sheet = getSheet();
  sheet.appendRow(taskToRow(task));
  return task;
}

function updateTask(id, payload) {
  const sheet = getSheet();
  const rowIndex = findRowIndexById(sheet, id);

  if (rowIndex === -1) {
    return null;
  }

  const existing = rowToTask(sheet.getRange(rowIndex, 1, 1, HEADERS.length).getValues()[0]);
  const updated = {
    ...existing,
    title: payload.title === undefined ? existing.title : String(payload.title).trim(),
    description: payload.description === undefined ? existing.description : String(payload.description).trim(),
    status: payload.status === undefined ? existing.status : normalizeStatus(payload.status),
    priority: payload.priority === undefined ? existing.priority : normalizePriority(payload.priority),
    parentId: payload.parentId === undefined ? existing.parentId : normalizeParentId(payload.parentId, id),
    owner: payload.owner === undefined ? existing.owner : normalizeText(payload.owner),
    dueDate: payload.dueDate === undefined ? existing.dueDate : normalizeText(payload.dueDate),
    aiHint: payload.aiHint === undefined ? existing.aiHint : normalizeText(payload.aiHint),
    labels: payload.labels === undefined ? existing.labels : normalizeText(payload.labels),
    project: payload.project === undefined ? existing.project : normalizeText(payload.project),
    sprint: payload.sprint === undefined ? existing.sprint : normalizeText(payload.sprint),
    estimate: payload.estimate === undefined ? existing.estimate : normalizeText(payload.estimate),
    blocked: payload.blocked === undefined ? existing.blocked : normalizeBoolean(payload.blocked),
    blockerReason: payload.blockerReason === undefined ? existing.blockerReason : normalizeText(payload.blockerReason),
    createdBy: existing.createdBy || normalizeText(payload.createdBy),
    updatedBy: normalizeText(payload.updatedBy || payload.owner || existing.updatedBy),
    ownerEmail: payload.ownerEmail === undefined ? existing.ownerEmail : normalizeEmail(payload.ownerEmail),
    lastReminderAt: existing.lastReminderAt || "",
    reminderCount: existing.reminderCount || 0,
    updatedAt: new Date().toISOString(),
  };

  validateTaskPayload(updated, true);
  sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([taskToRow(updated)]);
  return updated;
}

function deleteTask(id) {
  const sheet = getSheet();
  const rowIndex = findRowIndexById(sheet, id);

  if (rowIndex === -1) {
    return false;
  }

  sheet.deleteRow(rowIndex);
  return true;
}

function sendDueTaskReminders() {
  const tasks = listTasks();
  const now = new Date();
  const dueTasks = tasks.filter(task => shouldSendReminder(task, now));
  const sent = [];

  dueTasks.forEach(task => {
    const recipient = task.ownerEmail || task.createdBy;

    if (!recipient) {
      return;
    }

    MailApp.sendEmail({
      to: recipient,
      subject: `[Khaban Board] Pending task due: ${task.title}`,
      htmlBody: buildReminderEmail(task),
    });

    markReminderSent(task.id);
    sent.push({ id: task.id, title: task.title, to: recipient });
  });

  return jsonResponse({ ok: true, data: { sent, count: sent.length } });
}

function installDailyReminderTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === "sendDueTaskReminders")
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("sendDueTaskReminders")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  return jsonResponse({ ok: true, data: { trigger: "sendDueTaskReminders", frequency: "daily", hour: 9 } });
}

function shouldSendReminder(task, now) {
  if (!task || task.status === "DONE") {
    return false;
  }

  if (!task.dueDate || (!task.ownerEmail && !task.createdBy)) {
    return false;
  }

  const dueDate = parseDueDate(task.dueDate);

  if (!dueDate || dueDate > endOfDay(now)) {
    return false;
  }

  if (!task.lastReminderAt) {
    return true;
  }

  const lastReminder = new Date(task.lastReminderAt);
  return !isSameDay(lastReminder, now);
}

function markReminderSent(taskId) {
  const sheet = getSheet();
  const rowIndex = findRowIndexById(sheet, taskId);

  if (rowIndex === -1) {
    return;
  }

  const existing = rowToTask(sheet.getRange(rowIndex, 1, 1, HEADERS.length).getValues()[0]);
  const updated = {
    ...existing,
    lastReminderAt: new Date().toISOString(),
    reminderCount: Number(existing.reminderCount || 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([taskToRow(updated)]);
}

function buildReminderEmail(task) {
  const dueText = task.dueDate || "Due date not set";
  const ownerText = task.owner || "Unassigned";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>Khaban Board reminder</h2>
      <p>This task is still pending and its due date has arrived or passed.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        <tr><td><b>Task</b></td><td>${escapeHtml(task.title)}</td></tr>
        <tr><td><b>Status</b></td><td>${escapeHtml(task.status)}</td></tr>
        <tr><td><b>Priority</b></td><td>${escapeHtml(task.priority)}</td></tr>
        <tr><td><b>Owner</b></td><td>${escapeHtml(ownerText)}</td></tr>
        <tr><td><b>Due</b></td><td>${escapeHtml(dueText)}</td></tr>
      </table>
      <p>${escapeHtml(task.description || "")}</p>
    </div>
  `;
}

function getSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  const spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("No spreadsheet found. Bind this script to a Sheet or set SPREADSHEET_ID in Script Properties.");
  }

  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = range.getValues()[0];
  const matches = HEADERS.every((header, index) => existing[index] === header);

  if (!matches) {
    range.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function findRowIndexById(sheet, id) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return -1;
  }

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const index = ids.findIndex(row => row[0] === id);
  return index === -1 ? -1 : index + 2;
}

function parsePayload(e) {
  if (!e) {
    return {};
  }

  if (e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return e.parameter || {};
}

function makeEventFromPayload(payload) {
  return {
    parameter: payload,
    postData: {
      contents: JSON.stringify(payload),
    },
  };
}

function getParam(e, key) {
  return e && e.parameter ? e.parameter[key] : undefined;
}

function rowToTask(row) {
  return HEADERS.reduce((task, header, index) => {
    task[header] = row[index];
    return task;
  }, {});
}

function taskToRow(task) {
  return HEADERS.map(header => task[header] === undefined || task[header] === null ? "" : task[header]);
}

function validateTaskPayload(payload, requireTitle) {
  if (requireTitle && !String(payload.title || "").trim()) {
    throw new Error("Task title is required");
  }

  normalizeStatus(payload.status);
  normalizePriority(payload.priority);
}

function normalizeStatus(status) {
  const value = String(status || "TODO").toUpperCase();

  if (!VALID_STATUSES.includes(value)) {
    throw new Error(`Invalid status. Use one of: ${VALID_STATUSES.join(", ")}`);
  }

  return value;
}

function normalizePriority(priority) {
  const value = priority || "Medium";

  if (!VALID_PRIORITIES.includes(value)) {
    throw new Error(`Invalid priority. Use one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  return value;
}

function normalizeParentId(parentId, taskId) {
  const value = String(parentId || "").trim();

  if (taskId && value === taskId) {
    throw new Error("A task cannot be its own parent");
  }

  return value;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  const email = normalizeText(value);

  if (!email) {
    return "";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid ownerEmail");
  }

  return email;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value || "").toLowerCase() === "true";
}

function parseDueDate(value) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(body, statusCode) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ ...body, statusCode: statusCode || 200 }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

function errorResponse(error) {
  return jsonResponse({ ok: false, error: error.message || String(error) }, 500);
}
