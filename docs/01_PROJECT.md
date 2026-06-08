# Project Memory

## Initiative Log Figma Widget

## Version 1.1

---

# 1. Purpose

This file is the active project memory and restart context for the Initiative Log Figma Widget.

It tracks:

- current project state
- canonical artifact set
- artifact authority
- current work mode
- stable decisions
- implemented capabilities
- hard-won technical constraints
- open decisions
- deferred backlog
- next recommended actions
- restart protocol
- document governance

This file is not the Product Requirements Document or the Build Specification.

Product intent belongs in `02_PRD.md`. Build mechanics belong in `03_BUILD.md`. Reusable AI collaboration protocol belongs in `00_INSTRUCTIONS.md` (the project's `CLAUDE.md`).

---

# 2. Current Project Snapshot

The project is the Initiative Log Figma Widget: a canvas-native Figma **widget** (not a plugin) that tracks UX/UI work as Campaigns → Initiatives → Tasks, with a campaign-grouped card view and a dense table view.

**Status: built, shipped, and in active iterative refinement.** The original MVP is complete; all seven planned build phases are done. The product is now treated as a **mature collaboration tool**, past MVP, and has evolved beyond the original PRD in several material ways (see §6).

It runs inside real Figma today. Recent work is UX/UI and product-depth refinement, validated through a two-loop process: a fast **VS Code preview** for structure/flow, and **Figma itself** as the arbiter of visual truth.

Current focus: upper-section redesign (two-band header) and ongoing UX polish.

---

# 3. Canonical Artifact Set

| Artifact | Status | Role |
|---|---|---|
| `00_INSTRUCTIONS.md` (`CLAUDE.md`) | Stable | Reusable AI collaboration protocol; governs authority, updates, replacement, restartability. |
| `01_PROJECT.md` | This file | Active project memory: current state, decisions, constraints, next actions, restart context. |
| `02_PRD.md` | Maintained | Product intent: purpose, users, product model, views, requirements, success criteria. |
| `03_BUILD.md` | Maintained | Build truth: implementation target, real architecture/file map, state model, validation, actions, view model, constraints, acceptance. |

Notes:

- A separate, reusable **"Figma Bridge"** project (the widget-as-bridge-to-Figma substrate) will be built later with its **own** `00`–`03` spine. It is **not** part of this repository. This project stays as the Initiative Log product.
- The original spine drafts assumed `src/` + webpack and a pre-implementation MVP; both are superseded by reality (see §5, §6).

---

# 4. Authority Model

| Topic | Primary Authority | Secondary |
|---|---|---|
| Collaboration protocol | `00_INSTRUCTIONS.md` | Direct operator instruction |
| Current state and restart context | `01_PROJECT.md` | Direct operator instruction |
| Product purpose and requirements | `02_PRD.md` | Direct operator instruction |
| Technical implementation and validation | `03_BUILD.md` | Direct operator instruction |
| Implementation code | Source files (`widget-src/*`) | `03_BUILD.md` |

If artifacts conflict: use direct operator instruction for the current task; otherwise the artifact with authority for the topic; record durable changes in the relevant artifact; ask one focused question only if the conflict materially changes direction.

---

# 5. Implementation Reality (Approved Deviations from Original Build Spec)

The original Build Specification assumed `src/` + webpack and `src/widget.tsx`. The actual, working implementation deviates as follows (all approved and stable):

- **Source lives in `widget-src/`**, bundled with **esbuild**, entry **`widget-src/code.tsx`** (a thin wiring entry; rendering split into `widget-src/components/*`).
- **esbuild target is `es2017`** — mandatory: the widget VM rejects `??` and `?.`.
- **Build via npm scripts** (`build` → `dist/code.js`; `watch`; `preview` / `preview:build` → the VS Code harness). No webpack.
- **Build environment:** `winget` is policy-blocked, so Node is a **portable install** at `%LOCALAPPDATA%\node-portable`; its `bin` must be prepended to `PATH` in each shell before npm runs.
- A **VS Code preview harness** (`preview/` + a flexbox shim emulating the widget runtime → DOM) provides the fast inner loop. It is an **approximation** (it now models `spacing="auto"` as space-between, but not `effect` shadows or Figma's exact AutoLayout sizing quirks); **Figma remains the source of truth for visual layout.**

---

# 6. Stable Capabilities and Decisions (As Built)

These describe the product as it actually exists today — several go beyond the original MVP.

## 6.1 Core model
Campaign → Initiative → Task, with a first **Unassigned** group. Figma file is the source of truth; data persists in **shared** synced state / synced maps. Initiatives **archive** (never hard-deleted); **tasks are deleted outright** (task archive was removed in schema v4).

## 6.2 Priority: P0–P3
Priorities are **P0, P1, P2, P3** (replaced the original High/Medium/Low). Migrated via **schema v2** (legacy High→P1, Medium→P2, Low→P3).

## 6.3 Initiative description (merged)
The separate **strategy** and **scope** fields were consolidated into a single **description** field. Migrated via **schema v3** (strategy + scope joined into description).

## 6.4 Task estimates
Each task has **`estimateHours`**; per-task hours **roll up** to an initiative total (and campaign-section total). Added/backfilled in **schema v2**. (Note: the old PRD listed "task estimates" under deferred — that is now implemented.)

## 6.5 Lens engine
A flexible **group-by** (campaign / priority / status / owner / none) and **sort-by** (priority / estimate / dueDate / status / title / manual) with a **direction** toggle. The card view groups and sorts through this lens, not just campaign order.

## 6.6 Bilingual + RTL
Full **Hebrew / English** support with a language toggle and correct **RTL** rendering (manual child reversal via an `order()` helper + physical `horizontalAlign*`). Strings live in `i18n.ts`. Default language is Hebrew.

## 6.7 Two-tier safety model
A **shared global lock** (default **locked** = read-only) plus a **per-record edit pencil** revealed when unlocked; create actions appear only when unlocked. Locking clears open editors, errors, and pickers.

**Critical:** per-*user* state is impossible — `figma.currentUser` **throws during render** ("Cannot use currentUser during widget rendering"). Lock, language, edit/expand state, and pickers are therefore **shared synced state**.

## 6.8 UI maturity
Grey canvas theme + card shading; **two-band header** (band 1: title/counts + global controls archive·language·lock; hairline divider; band 2: view-toggle · lens · create, distributed); **icon-only lock**; primary/secondary add buttons; **column-aligned collapsed cards** (shared `META_COLS` widths so cards line up like a table); links rendered as clickable chips.

---

# 7. Hard-Won Technical Constraints (Do Not Regress)

These were learned through real Figma failures; treat as guardrails.

1. **esbuild target `es2017`** — the VM rejects `??` / `?.` ("Unexpected token ?").
2. **Never read `figma.currentUser` during render** — it throws. All shared UI state is synced, never per-user.
3. **No `Text href`** — `set_hyperlink` throws ("Invalid hyperlink target node"). Use `onClick` + `figma.openExternal(url)`.
4. **No empty `width="fill-parent"` AutoLayout spacers** — they grow vertically / force wrap. Use a content-filled flex child or `horizontalAlignItems`.
5. **Rebuild + clean re-insert** — after code changes, rebuild **both** `dist/code.js` (Figma) and the preview bundle. In Figma, a stale instance or hot-reload over an old scene surfaces as `Scene has diverged` or a generic `An error occurred while running this widget`; the fix is **delete + re-insert** a fresh instance. Trust the *running* reality, not the source or the build log.
6. **Preview ≠ Figma** — the shim approximates AutoLayout; confirm spacing, justification (`spacing="auto"`), and elevation in Figma.

---

# 8. Current Work Mode

**Iterative refinement (post-MVP).** Not phased build anymore. Work proceeds as scoped UX/UI and product-depth iterations: a change is described, applied in `widget-src/`, built, checked in the preview for structure, then confirmed in Figma for visual truth.

The original Phase 1–7 sequence is **complete**:
Foundation → Data/View Model → Card View → Create/Edit Flows → Table View → Search/Filters → Polish/QA. (Search exists in logic/view-model; the lens engine is the primary day-to-day organizing tool.)

---

# 9. Open Decisions

1. **Locked-state lens position** — in the two-band header, when locked the create group is absent, so `spacing="auto"` pushes the lens to the reading-end edge instead of center. Pending a call on whether to pin the lens. (Raised during the two-band header work.)

2. **Per-group "+יוזמה" redundancy / ghost-card pattern** — every campaign group header carries its own add-initiative action, which reads as redundant against the central +יוזמה in the controls band. Note the two are **not** equivalent: the central button creates an **Unassigned** initiative (`createInitiative(null)`), while the per-group button **pre-assigns that campaign**. Proposal: drop the header button and, if a per-group add is kept, render it as a **ghost/placeholder card at the bottom of the group's card list** that, on click, creates a new initiative in that group and opens it inline in edit mode. Open sub-points: (a) confirm "opens on click" = create + expand into the inline editor (vs. a bare stub); (b) the ghost card only maps cleanly under **campaign** grouping — under priority/status/owner grouping it would have to pre-set the grouped dimension, or simply not appear; (c) the central +יוזמה stays as the "add (unassigned)" entry point. Raised 2026-06; not yet decided or built.

Most earlier open decisions are resolved: seed data ships gated by `SEED_ON_EMPTY`; ordering uses deterministic sort + the lens engine; tasks are deleted (task archive removed in schema v4); no separate test artifacts created.

---

# 9A. Deferred Feature Backlog

## 9A.1 Paste / attach an image to an initiative (edit mode)

Status: deferred (logged 2026-06-03). Analysis complete, not implemented.

Goal: in edit mode, let the user attach an image (e.g. a pasted screenshot or mockup) to an initiative, shown in the expanded card.

Core constraint: a canvas Figma **widget cannot read the clipboard**. A true "paste" must be brokered:

- **Approach A — true clipboard paste (recommended for screenshots).** A transient `figma.showUI(html, …)` iframe handles paste/drop/file-select, downscales via `<canvas>`, and `postMessage`s bytes (`Uint8Array`) back. The widget calls `figma.createImage(bytes)` → stores the **image hash** on the initiative → renders `<Image src={{ type: 'IMAGE', imageHash, scaleMode: 'FILL' }} />`. Relaxes the no-`showUI` guardrail, but only transiently.
- **Approach B — paste an image URL (lighter, not real paste).** Render `<Image src={url} />`; requires manifest `networkAccess.allowedDomains` (a security decision). Does not cover screenshots.

Key notes: store the small image **hash** (never base64) in synced state; add `imageHash` to the initiative with a schema migration; expanded view only (collapsed card is column-aligned); the preview shim has no `showUI`/`createImage` → render a placeholder. Verified API (2026-06): `figma.showUI`, `figma.createImage`, `figma.createImageAsync`, widget `Image.src`.

Open decisions before building: A vs B; OK to add transient `showUI`; one image vs several; initiatives only vs tasks too.

## 9A.2 Export to CSV / external format (backup)

Status: intent logged (2026-06-07). Not designed, not implemented.

Goal: let users export the widget's data (initiatives, tasks, campaigns) to a structured format (CSV or JSON) for backup or external use.

Core constraint: a Figma widget cannot write files or access the OS clipboard directly. Any export must go through a transient `showUI` iframe (same approach as the image-paste design in §9A.1):

- **Approach A — CSV via showUI.** The widget posts data to a transient `figma.showUI(html)` iframe; the iframe serializes to CSV and triggers a browser download or copies to clipboard. A separate CSV per entity type (campaigns, initiatives, tasks) or a combined multi-sheet format.
- **Approach B — JSON to clipboard.** Lighter: the iframe receives the raw JSON, calls `navigator.clipboard.writeText`, and closes. Users paste into a file manually. Simpler to build, less polished.

Open decisions before building: A vs B; which entities to include; whether archived initiatives should be included in the export; whether this also serves as an import path (out of scope for now).

Note: implementing this would be the second case of using `showUI` (after the image-paste deferred item). If both are eventually built, consider a single shared UI shell with multiple "modes."

---

# 10. Do-Not-Resurrect Guardrails

Product/scope guardrails still in force unless the operator changes scope:

- no external database, backend, or third-party integrations
- no external authentication
- no Figma Plugin `showUI` dependency (except the deferred, transient image-paste case in §9A.1 if pursued)
- no permanent delete **of initiatives** (initiatives archive only; tasks are deletable)
- no campaign-level status / due date
- no dependency management, notifications, comments, role-based permissions, or change history
- no full project-management workflow

Note: **task due dates** and **task estimates** were both originally deferred; **estimates are now implemented** (§6.4), task due dates remain out. Task **archive** was replaced by task **hard delete** (schema v4).

Artifact guardrails: keep canonical artifact names stable; don't duplicate durable PRD/Build truth here; don't treat the (separate, future) Figma Bridge spine as this project's memory.

---

# 11. Current Assumptions

1. Project name: Initiative Log Figma Widget.
2. `02_PRD.md` and `03_BUILD.md` are being brought up to date alongside this file (this revision).
3. The implementation is complete and in iterative refinement; source is `widget-src/*`, bundled with esbuild (es2017).
4. Hebrew is the default language; RTL is fully supported.
5. The product is a mature collaboration tool, past MVP framing.
6. All shared UI state is synced (per-user is impossible in widget render).

---

# 12. Risks to Watch

## 12.1 Stale bundle / scene divergence
Highest-frequency operational risk: confusing the source/build state with what Figma is actually running. Mitigation: rebuild both bundles, clean re-insert, verify the running reality (§7.5).

## 12.2 Synced-state size growth
Mitigation: per-record maps, compact records, store image hashes not bytes, archive old initiatives.

## 12.3 UI crowding
Mitigation: compact collapsed cards, detail in expanded cards, table + lens for dense review.

## 12.4 Scope creep toward a PM tool
Mitigation: enforce §10 guardrails.

## 12.5 Preview/Figma divergence
Mitigation: treat the preview as a structural inner loop only; confirm visuals in Figma.

---

# 13. Next Recommended Actions

1. Confirm the **two-band header** renders correctly after a clean re-insert in Figma.
2. Decide the **locked-state lens position** (§9), then apply if a change is wanted.
3. Continue scoped UX/UI and product-depth refinement as directed.
4. Keep `02_PRD.md` and `03_BUILD.md` consistent with any further product/build changes (cross-artifact check).

---

# 14. Restart and Resume Protocol

A future session or collaborator should resume as follows:

1. Read `00_INSTRUCTIONS.md`.
2. Read this `01_PROJECT.md`.
3. Note the current work mode is **iterative refinement**, not phased build.
4. Read relevant sections of `02_PRD.md` (product intent) and `03_BUILD.md` (real architecture + constraints §7).
5. Before changing code: set the portable-Node `PATH`, work in `widget-src/`, keep es2017, and remember per-user state is impossible.
6. After changing code: rebuild `dist/code.js` + preview bundle; verify in the preview, then in Figma via a clean re-insert.
7. Take the smallest safe next action toward the current focus (§2, §13).

If the operator says "continue," default to advancing the current UX/UI refinement focus, not to scaffolding (the widget is fully built).

---

# 15. Change Trail

## Version 1.1 — task delete reconciliation (2026-06-08)

- Reconciled the spine to a change shipped in another session: **task archive → task hard delete** (`Task.archived` removed; `archiveTask`/`unarchiveTask` → `deleteTask`; **schema v4** purges previously-archived tasks).
- Narrowed the "no permanent delete" guardrail to **initiatives** (§10); switched the task sections in `02_PRD`/`03_BUILD` from archive to delete.
- Completed two leftover `task.archived` references (`TaskRow.tsx`, `TaskTable.tsx`) that were breaking `tsc`, and rebuilt both bundles green.

## Version 1.0 — spine truth-up (2026-06)

- Rewrote project memory to reflect a **built, shipped, mature** product (was: pre-implementation, "Phase 1 next").
- Recorded the **approved implementation deviations** (`widget-src/` + esbuild + es2017; portable Node; VS Code preview harness) — §5.
- Recorded post-MVP capabilities: **P0–P3** priorities, merged **description**, task **estimateHours** rollup, **lens engine**, **bilingual He/En + RTL**, **lock + edit safety model**, two-band header / column-aligned cards — §6.
- Documented **hard-won Figma constraints** (es2017; no `currentUser` in render; no `Text href`; no empty fill-parent spacers; stale-bundle / clean re-insert; preview ≠ Figma) — §7.
- Updated schema to **v3** (v2 priority remap + estimate backfill; v3 strategy+scope→description).
- Switched work mode from phased build to **iterative refinement**; marked Phases 1–7 complete.
- Noted the future, separate **Figma Bridge** project (own spine, different repo).
- Refreshed open decisions, guardrails, assumptions, risks, next actions, and restart protocol to match reality.

## Version 0.1 Draft (historical)

- Initial pre-implementation project memory; defined the artifact set and a Phase 1–7 plan. Superseded by Version 1.0.

---

# 16. Document Governance

## 16.1 This file owns
Current project state, work mode, stable decisions and capabilities, hard-won constraints, next actions, artifact map, restart context, open decisions, deferred backlog, recent change trail.

## 16.2 This file does not own
Reusable collaboration protocol (`00`), product requirements (`02`), implementation architecture/validation detail (`03`), or source code. It summarizes; it does not duplicate them.

## 16.3 Update this file when
Work mode changes; a capability ships or is removed; a durable decision is resolved; a new constraint is learned; an open decision appears or closes; the artifact set changes.

## 16.4 Do not update this file when
The change is low-level code that doesn't affect project state; a product-scope change that belongs in `02_PRD.md`; an architecture detail that belongs in `03_BUILD.md`; protocol that belongs in `00_INSTRUCTIONS.md`.

## 16.5 Promote into this file
Durable decisions affecting current state, shipped capabilities, newly-learned constraints, restart-relevant context.

## 16.6 Prune from this file
Stale temporary notes, duplicated PRD/Build content, resolved details that no longer affect restart, superseded history (compress to outcome).

## 16.7 Conflict behavior
Authoritative for current state and restart context. Defer to `02_PRD.md` for product intent, `03_BUILD.md` for build mechanics, `00_INSTRUCTIONS.md` for protocol. Direct operator instruction overrides for the current task; record durable changes in the right artifact.

---

# 17. Final Summary

The Initiative Log Figma Widget is a **built, shipped, canvas-native** UX/UI initiative tracker (Campaign → Initiative → Task) in active refinement. It has grown past its MVP: P0–P3 priorities, a merged description, task-hour estimates rolled up to initiatives, a group/sort **lens engine**, **bilingual Hebrew/English with RTL**, and a **shared lock + per-record edit** safety model. It is implemented in `widget-src/` with **esbuild (es2017)**, persists to shared Figma state, and is iterated through a VS Code preview (structure) plus Figma (visual truth). A separate reusable **Figma Bridge** project will be spun up later with its own spine.
