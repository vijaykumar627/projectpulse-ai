# ProjectPulse AI — Project Control Tower

A polished, responsive React dashboard for PMO / AI Operations portfolio tracking. Built with Vite, React, Recharts and Lucide icons; no backend, SQL, APIs or secret keys are required.

## Features
- Executive overview with project progress, portfolio health, budget utilization and recent activity
- Project creation/editing with input validation
- Explainable rule-based risk flags based on due dates, completion, reported status, budget usage and priority
- Search and filter projects by derived status and risk
- Task tracker with status updates and overdue checks
- Weekly portfolio report preview and downloadable `.txt` report
- CSV export for projects/tasks and CSV project import
- Browser-local persistence using `localStorage`
- Responsive mobile layout and accessible labels for key controls
- Demo data restore button

## Important data notes
- The bundled projects are fictional demo data.
- Currency in the demo is USD; change the `money()` helper and labels if your portfolio uses another currency.
- Risk labels are deterministic decision-support rules, not machine-learning predictions. Review source data and recommendations before acting.
- Data is stored only in the current browser. Clearing browser data removes it. There is no login, shared database, or multi-user sync.

## Run locally
Requires a recent Node.js LTS version.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build check
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Create a GitHub repository and upload these project files.
2. In Vercel, select **Add New → Project** and import the repository.
3. Framework preset: **Vite** (usually detected automatically).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy. No environment variables are required.

The included `vercel.json` configures the Vite build and output directory.

## CSV import format
The importer expects a header row containing at least `name`, `owner`, and `due`. Optional columns:
`id, team, start, status, progress, budget, spent, priority, notes, dependencies`

Example:
```csv
name,owner,team,start,due,status,progress,budget,spent,priority,notes,dependencies
Operations Metrics Pack,Sara Patel,Operations,2026-10-02,2026-10-27,Blocked,35,10000,6100,High,Reconcile source data,Validated metrics
```

## Portfolio talking points
- Problem: project status and blockers are fragmented.
- Approach: centralize project and task data; apply visible risk rules; generate a repeatable weekly report.
- Evidence: show input rows, calculated risk reasons, next-step recommendations, exports and validation cases.
- Limitations: fictional sample data, browser-local persistence, deterministic risk rules and no live integrations.
