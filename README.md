<div align="center">

![MJW Design](https://mjwdesign.ca/wp-content/uploads/2024/01/mjw-design-logo.png)

**Built with [MJW Design](https://mjwdesign.ca) — AI-Powered Development**

---

</div>

# MJW Room Layout Risk Mapper

A structured, step-by-step room layout and risk assessment tool for escape room designers. It guides designers through project setup, zone definition, element placement, and risk identification — producing a visual canvas of the room layout with a prioritised risk map, progress tracking, and optional **PocketBase cloud saves**. Completed assessments can be exported for sharing with builders and game masters.

## Screenshots

| Layout Canvas & Risk Map | Project Setup & Zone Builder |
| :---- | :---- |
| MJW Room Layout Risk Mapper canvas interface placeholder | MJW Room Layout Risk Mapper project setup and zone builder placeholder |

## What It Does

Unlike generic floor-plan tools, this app applies escape-room-specific risk logic to your room layout, surfacing issues around player flow, prop density, zone balance, and element placement before a room is built or refurbished.

| Step | Panel | Purpose |
| :---- | :---- | :---- |
| **1** | Welcome Screen | Orientation and project creation entry point. |
| **2** | Project Setup | Name, dimensions, player count, and difficulty target. |
| **3** | Zone Builder | Define named zones within the room footprint. |
| **4** | Elements | Place props, puzzles, locks, and tech within zones. |
| **5** | Canvas Setup | Review the spatial layout and zone arrangement on the canvas. |
| **6** | Risk Map | Auto-generated risk issues ranked by severity with fix guidance. |
| **7** | Export | Download the completed layout and risk report. |

**Key interactions:**

- Follow the guided progress rail from project setup through to export.
- Define zones by name, size, and purpose to establish the room's spatial model.
- Add elements to zones and specify type, difficulty contribution, and reset complexity.
- Review the live canvas as zones and elements are configured.
- Inspect auto-generated risk issue cards covering flow, density, and balance concerns.
- Read per-issue severity ratings and recommended fixes before playtesting or building.
- Save projects to PocketBase cloud or export directly to a portable file.

## How to Use

Open the app and follow the progress rail from left to right. Start at the Welcome Screen to create a new project, then fill in room dimensions and player count in Project Setup. Use the Zone Builder to divide the room into named areas, then assign elements to each zone in the Elements step. The Canvas Setup panel gives a spatial preview of the layout. Once the layout is defined, move to the Risk Map to review automatically detected issues. Each risk issue card shows the severity, affected zone or element, and recommended corrective action. When the design is ready, use the Export panel to download the report.

The tool is optimised for desktop use where the canvas and side panels can be reviewed simultaneously. Smaller screens can access the form-based steps, but canvas review and risk map inspection work best on a wide display.

## Progress Rail

The app uses a persistent progress rail to communicate where the designer is in the workflow and allow navigation between completed steps.

| Step | Label | Notes |
| :---- | :---- | :---- |
| 1 | Welcome | Entry screen and project initialisation. |
| 2 | Project Setup | Room metadata form. |
| 3 | Zones | Zone definition and naming. |
| 4 | Elements | Element placement within zones. |
| 5 | Canvas | Spatial layout preview. |
| 6 | Risk Map | Risk engine output and issue review. |
| 7 | Export | Report download and cloud save. |

## Stack

| Layer | Technology |
| :---- | :---- |
| UI framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Risk engine | Custom `riskEngine.ts` |
| Layout logic | Custom `layout.ts` |
| Optional cloud persistence | PocketBase |
| Data client (bundled) | @supabase/supabase-js |
| Hosting | Netlify |

## Local Development

```
npm install
```

```
npm run dev
```

The app works fully with **no environment variables**. Without a PocketBase URL configured, all project data is managed in local browser state and can be exported to file. No cloud account is required to run the risk mapper locally.

## Quality Checks

```
npm run typecheck
```

```
npm run lint
```

```
npm run build
```

## Available Scripts

```
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
npm run typecheck  # TypeScript type check (no emit)
```

## Environment Variables

All environment variables are optional unless you enable the related feature. The app remains fully usable in local-only mode with no configured variables.

| Variable | Required? | Scope | Enables | Description |
| :---- | :---- | :---- | :---- | :---- |
| `VITE_POCKETBASE_URL` | Optional | Frontend/public | PocketBase sign-in and cloud project saves | Public PocketBase/PocketHost URL used for authentication and user-scoped project CRUD. Example: `https://immersive-kit.pockethost.io`. |

## Saved Projects and PocketBase Cloud Saves

The app works fully with **no environment variables**. In local-only mode, project state is held in browser memory and can be exported as a file at the Export step. Designers can complete a full layout-and-risk workflow without any cloud configuration.

Cloud saves are optional. When `VITE_POCKETBASE_URL` is configured, the app can authenticate users and persist room layout projects to a PocketBase collection. Normal user authentication runs through the public PocketBase URL; **no PocketBase superuser token is placed in frontend code**.

### Recommended `room_projects` Collection

Create a PocketBase collection named `room_projects`. The current implementation expects authenticated users to own their own records through an `owner` relation field. For the MJW canonical schema, configure the following fields.

| Field | Type | Notes |
| :---- | :---- | :---- |
| `title` | text | Display name in the saved projects list. |
| `description` | text | Optional design notes. |
| `owner` | relation to `users` | Should point to the authenticated user. |
| `project_json` | json | Full project state including zones, elements, and risk output. |
| `visibility` | select | Recommended values: `private`, `shared`, `public`. |
| `version` | number | Incremented on saves to support conflict detection. |
| `created` | system field | Managed by PocketBase. |
| `updated` | system field | Managed by PocketBase and used for conflict checks. |

Recommended collection rules should allow authenticated users to create records for themselves and only read, update, or delete their own records. A practical rule pattern is `@request.auth.id != "" && owner = @request.auth.id` for user-scoped list/view/update/delete rules. The create rule should require authentication and an owner value matching the authenticated user.

## Risk Engine

The risk analysis is performed client-side by `src/lib/riskEngine.ts`. When a designer completes the Elements step, the engine evaluates the configured zones and elements and produces a ranked list of risk issues displayed in the Risk Map panel.

Each issue card (`RiskIssueCard.tsx`) shows:

- **Severity** — critical, high, medium, or low.
- **Affected area** — the zone or element the issue relates to.
- **Description** — what the structural or design problem is.
- **Recommendation** — a concrete corrective action to resolve it before build or playtest.

Common risk categories detected include player flow bottlenecks, zone density imbalance, reset complexity spikes, isolated dead-end paths, and missing finale convergence structure.

## Netlify Deployment

The `netlify.toml` at the project root configures the Vite build and static routing. To deploy on Netlify, connect this GitHub repository and use the following production settings.

| Setting | Value |
| :---- | :---- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node/package install | Netlify default Node environment with `npm install` |

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Deploy first with no environment variables to confirm the local-only app works, then add `VITE_POCKETBASE_URL` for cloud project saves if that feature is needed.

## Accessibility and Production Readiness

The release UI includes accessible labels on the progress rail steps, zone and element form controls, risk issue cards, and export actions. The step-by-step workflow clearly communicates where a designer is and what is required to proceed. Empty states and no-configuration states are intentionally explicit so the app remains understandable before optional services are configured.

## Project Structure

```
src/
  components/
    LayoutCanvas.tsx          # Spatial room layout canvas
    ProgressRail.tsx          # Step-by-step progress indicator
    RiskIssueCard.tsx         # Individual risk issue display card
    SummaryPanel.tsx          # Project summary and stats overview
  data/
    sampleProject.ts          # Starter sample project data
  lib/
    layout.ts                 # Layout geometry and zone positioning logic
    pocketbase.ts             # Optional PocketBase client wrapper
    riskEngine.ts             # Core risk analysis and issue generation
    seedFromGenerated.ts      # Seed helpers for generated project data
  services/
    exporters.ts              # Export helpers (file download/report generation)
  steps/
    CanvasSetupPanel.tsx      # Step 5 — canvas layout preview
    ElementsStep.tsx          # Step 4 — element placement within zones
    ExportPanel.tsx           # Step 7 — export and cloud save
    ProjectSetupForm.tsx      # Step 2 — room metadata form
    RiskMapPanel.tsx          # Step 6 — risk map and issue review
    WelcomeScreen.tsx         # Step 1 — entry and project creation
    ZoneBuilder.tsx           # Step 3 — zone definition and naming
  types.ts                    # Shared project, zone, element, and risk types
  App.tsx                     # Root layout and step routing
  main.tsx                    # Entry point

public/
  screenshots/                # README screenshots
```

## Changelog

### v1.0.0 — Production Readiness Release

- Added guided seven-step workflow with persistent progress rail navigation.
- Added zone builder, element placement, and spatial layout canvas.
- Added client-side risk engine producing ranked, actionable issue cards.
- Added export panel for report download and optional PocketBase cloud saves.
- Added sample project seed data for immediate onboarding without manual setup.
- Added README, Netlify deployment configuration, environment variable documentation, and this changelog.

### Previous Build Milestones

- Implemented core risk engine covering flow, density, reset complexity, and convergence analysis.
- Built zone and element data model with TypeScript types shared across all steps.
- Integrated optional PocketBase persistence with local-only fallback.

---

Part of the **MJW Personal App Platform**.