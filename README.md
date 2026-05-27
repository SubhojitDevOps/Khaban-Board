# Khaban Board

Khaban Board is a lightweight Jira-style project management app for small teams, startups, and freelancers. It includes a Kanban board, task CRUD, Google Sheets persistence through Apps Script, React DnD drag and drop, and Gemini-powered sprint suggestions.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create `.env.local` for local development:

```bash
GEMINI_API_KEY=your_google_ai_studio_api_key
NEXT_PUBLIC_KHABAN_API_URL=https://script.google.com/macros/s/AKfycbyIpZMeCpJOXR9oo1k-kdVCCN920-Rf_DM4_T_T-ctO7ljeeLEzTk-E8lgK-MhFOCmM/exec
```

For Vercel, add the same variables in:

```text
Project Settings > Environment Variables
```

`GEMINI_API_KEY` must be server-only. Do not prefix it with `NEXT_PUBLIC_`.

## Gemini AI Assistance

The dashboard has an `Ask Gemini` button. It sends the current task list to this server route:

```text
/api/ai/suggestions
```

That route calls Gemini with `GEMINI_API_KEY` and returns sprint focus, risks, and next actions.

## Deploy on Vercel

Use:

```text
Framework: Next.js
Root Directory: ./
Production Branch: main
```
