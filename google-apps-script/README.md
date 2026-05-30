# Khaban Board Google Apps Script Backend

This folder contains a Google Apps Script JSON API backed by Google Sheets.

## Database

Sheet name: `Tasks`

Columns:

```text
id, title, description, status, priority, createdAt, updatedAt, parentId, owner, dueDate, aiHint, labels, project, sprint, estimate, blocked, blockerReason, createdBy, updatedBy, ownerEmail, lastReminderAt, reminderCount
```

Roles sheet name: `Roles`

```text
id, name, email, role, passwordHash, passwordSalt, sessionToken, sessionExpiresAt, createdAt, updatedAt, active
```

Allowed roles:

```text
Admin, Manager, Member, Viewer
```

Allowed statuses:

```text
TODO, IN_PROGRESS, DONE
```

Allowed priorities:

```text
Low, Medium, High, Urgent
```

## Deploy

1. Create a Google Sheet.
2. Open `Extensions > Apps Script`.
3. Add `Code.js` from this folder.
4. Add the settings from `appsscript.json` to the Apps Script manifest.
5. Run `setupDatabase` once from the Apps Script editor.
6. Add Script Properties for the first administrator:

```text
INITIAL_ADMIN_NAME=Your Name
INITIAL_ADMIN_EMAIL=you@example.com
INITIAL_ADMIN_PASSWORD=replace-with-a-strong-password
```

7. Run `createInitialAdmin` once from the Apps Script editor.
8. Deploy as `Web app`.
9. Set web app access to `Anyone`. Application-level authentication is enforced with password hashes and session tokens.

When upgrading an older Khaban Board deployment, recreate the `Roles` sheet before running `setupDatabase`. Existing accounts used the earlier demo schema and cannot be migrated because they did not have passwords.

If this script is not bound to the Sheet, set Script Property:

```text
SPREADSHEET_ID=<your-google-sheet-id>
```

## API

Apps Script web apps directly support `GET` and `POST`. The code includes `doPut` and `doDelete`, but for web-app calls use `_method` override through `POST`.

### Sign up user

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"signup","name":"Subho","email":"subho@example.com","password":"replace-with-strong-password"}'
```

### Login user

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"subho@example.com","password":"replace-with-strong-password"}'
```

### Update role

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"update-role","sessionToken":"ADMIN_SESSION_TOKEN","email":"subho@example.com","role":"Manager"}'
```

### List roles

```bash
curl "YOUR_WEB_APP_URL?resource=roles&sessionToken=ADMIN_SESSION_TOKEN"
```

### List tasks

```bash
curl "YOUR_WEB_APP_URL?sessionToken=SESSION_TOKEN"
```

### Get one task

```bash
curl "YOUR_WEB_APP_URL?id=TASK_ID&sessionToken=SESSION_TOKEN"
```

### Create task

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","title":"Build API","description":"Create Sheets backend","status":"TODO","priority":"High","owner":"Subho","ownerEmail":"subho@example.com","dueDate":"2026-06-01","labels":"api,backend","project":"Khaban Board","sprint":"Sprint 1","estimate":"3 pts","blocked":false}'
```

To create a child ticket, include `parentId`:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","title":"Child task","description":"Nested work item","status":"TODO","priority":"Medium","parentId":"PARENT_TASK_ID","owner":"Subho"}'
```

### Update task

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","_method":"PUT","id":"TASK_ID","status":"DONE","priority":"Medium"}'
```

### Delete task

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","_method":"DELETE","id":"TASK_ID"}'
```

## Email Due Date Reminders

The backend can email task owners when a task is pending and the due date has arrived or passed.

Required fields:

```text
status != DONE
dueDate = YYYY-MM-DD
ownerEmail = recipient email
```

Fallback recipient:

```text
createdBy
```

Manual test from Apps Script editor:

```text
sendDueTaskReminders
```

Install daily trigger:

```text
installDailyReminderTrigger
```

This creates a daily trigger at 9 AM in the script timezone. The script sends at most one reminder per task per day using:

```text
lastReminderAt
reminderCount
```

## Response Shape

Success:

```json
{
  "ok": true,
  "data": {},
  "statusCode": 200
}
```

Error:

```json
{
  "ok": false,
  "error": "Task not found",
  "statusCode": 404
}
```
