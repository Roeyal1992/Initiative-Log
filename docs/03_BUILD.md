# Build Specification
## Initiative Log Figma Widget
## Version 1.1 — reflects the implementation as built

---

# 1. Purpose

This document is the technical truth for the Initiative Log Figma Widget: how it is actually structured, built, and constrained. It translates `02_PRD.md` into the real implementation.

It defines the implementation target, the **actual** file/module map, the state model, data entities, validation, the view model and lens, UI component responsibilities, the bilingual/RTL approach, the safety model, schema migrations, the preview harness, hard-won platform constraints, and acceptance.

This version supersedes the original 0.1 draft, which assumed `src/` + webpack and a pre-implementation MVP. Product strategy/scope lives in `02_PRD.md`; current state and restart context live in `01_PROJECT.md`.

---

# 2. Implementation Target

- A canvas-native **Figma Widget** (`figma.widget`), **not** a plugin (`showUI`).
- **TypeScript**, JSX-style widget rendering (factory `figma.widget.h`, fragment `figma.widget.Fragment`).
- Bundled with **esbuild**, target **`es2017`** (mandatory — see §17.1).
- **Shared** Figma widget state for persistence and collaboration (per-user state is impossible — §17.2).

Not a plugin UI window, web app, iframe-first app, backend/database app, or Sheets/Apps-Script tool.

---

# 3. Build Toolchain & Environment

- **Source:** `widget-src/`. **Entry:** `widget-src/code.tsx` (thin wiring; rendering split into `widget-src/components/*`).
- **Bundle:** `npm run build` → esbuild → `dist/code.js` (`--target=es2017`). `npm run watch` for rebuild-on-change.
- **Type check:** `npm run tsc` (`tsc --noEmit -p widget-src`). **Lint:** `npm run lint` (eslint; `preview/` is ignored).
- **Preview harness:** `npm run preview` / `preview:build` — esbuild bundles `preview/main.ts` → `preview/dist/preview.js`, served via `--servedir=preview --serve=8008`. See §16.
- **Node:** `winget` is policy-blocked; Node is a **portable install** at `%LOCALAPPDATA%\node-portable`. Prepend its `bin` to `PATH` in every shell before running npm.
- **Config files:** `manifest.json`, `package.json`, `widget-src/tsconfig.json` (JSX factory + es2017), `eslint.config.js`.

After any source change: rebuild **`dist/code.js`** for Figma **and** the preview bundle; verify in the preview (structure) then Figma (visual truth). See §17.5.

---

# 4. Key Build Decisions

1. **Widget, not plugin** — the tracker lives on the canvas as an ongoing object.
2. **esbuild + es2017 + `widget-src/`** — an approved deviation from the original `src/`+webpack plan; the widget VM requires es2017 (no `??`/`?.`).
3. **Synced maps for records** — campaigns, initiatives, tasks are ID-addressable synced maps; reduces whole-collection overwrite risk under collaboration.
4. **Shared synced state for UI state** — view/table mode, search, filters, expanded IDs, schema version, **plus** lock, language, editing IDs, open picker, and lens (group/sort/direction). All **shared** (§17.2).
5. **Archive (initiatives) / delete (tasks).** Initiatives archive (never hard-deleted); tasks are hard-deleted (task archive removed in v4).
6. **Deterministic ordering + lens** — stored order → creation order → title, overridable by the sort key.
7. **Centralized schema migrations** — one place in `code.tsx`; render paths stay defensive meanwhile.

---

# 5. Actual File Map

## 5.1 Root
- `manifest.json`, `package.json`, `eslint.config.js`
- `dist/code.js` (build output loaded by Figma)

## 5.2 `widget-src/` (logic)
- `code.tsx` — entry/wiring: state, first-run seeding, schema migrations, view-model derivation, the edit controller, lock/lang toggles, `widget.register`
- `types.ts` — entities, enums, view-model types, `EditApi`, update inputs, `ValidationResult`, `FilterOption`, `errorKey`
- `constants.ts` — `SCHEMA_VERSION`, controlled enums, `STORAGE_KEYS`, color tokens, `PRIORITY_COLORS`/`STATUS_COLORS`/`TASK_STATUS_COLORS`, `META_COLS`, `LAYOUT`, `UNASSIGNED_ID`, limits
- `i18n.ts` — bilingual `Strings`, `getStrings`, `dirForLang`, the RTL `order()` helper, `formatProgress`, the `Ui` bundle
- `state.ts` — `useInitiativeLogState` (synced maps + shared synced state), `genId`, `nowIso`
- `defaults.ts` — `SEED_ON_EMPTY`, `buildSeedData`, entity defaults
- `viewModel.ts` — `buildViewModel` (sections, cards, table rows, counts, filter options, diagnostics, lens application)
- `validation.ts` — campaign/initiative/task payload validation → field-level errors
- `actions.ts` — `createActions` (create/update/archive mutations; validate before write)
- `searchFilter.ts` — search normalization + filter predicates
- `sort.ts` — `normalizePriority`, `priorityIndex`, `statusIndex`, `sort*`, `nextSortOrder`
- `formatters.ts` — `formatDueDate`, `formatEmpty`, `formatLink`, `linkHref`
- `tsconfig.json`

## 5.3 `widget-src/components/`
- `App.tsx` — two-band header composition + body + diagnostics
- `Header.tsx` — title + counts
- `Toolbar.tsx` — exports `GlobalControls` (archive/lang/lock) and `ViewToggle` (cards/table + table sub-mode); internal `Tab`
- `LensBar.tsx` — group-by / sort-by / direction cyclers
- `CardView.tsx`, `CampaignSection.tsx`, `InitiativeCard.tsx`, `InitiativeExpandedContent.tsx`, `TaskList.tsx`, `TaskRow.tsx`
- `TableView.tsx`, `InitiativeTable.tsx`, `TaskTable.tsx`
- `EmptyState.tsx`
- `FieldControls.tsx` — `TextField`, `Chip`, `Chips`, `Select`, `Hours`, `LinkChip`, `LabeledField`, `ActionButton`, `IconButton`
- `Badge.tsx`, `StatusBadge.tsx`, `PriorityBadge.tsx`

## 5.4 `preview/` (VS Code harness — not shipped to Figma)
- `figma-shim.ts` (emulates the widget runtime → DOM), `main.ts` (mount + fit-to-width), `index.html`, `dist/preview.js`

Business logic must not collapse into `code.tsx`; it stays in the logic modules above.

---

# 6. Module Responsibilities (Highlights)

- **`code.tsx`** — wiring only: build `ui` (strings + direction), run seeding and migrations in `useEffect`, derive the view model, assemble the `EditApi` controller, handle lock/lang/expand toggles, render `<App/>`, `widget.register`.
- **`state.ts`** — owns all synced storage keys; exposes typed getters/setters and the three record maps. No `figma.currentUser` (§17.2).
- **`viewModel.ts`** — pure derivation: apply archived visibility, search, filters; build lensed sections (group + sort + direction); compute task progress and **estimate roll-ups**; produce table rows, counts, filter options, and diagnostics. UI renders from this, never from raw maps.
- **`actions.ts` + `validation.ts`** — every mutation validates first; invalid writes are rejected with field-level errors and input preserved.
- **`sort.ts`** — `normalizePriority` defensively maps legacy/unknown priorities onto P0–P3 (default P2) so render never indexes a color map with a bad key.
- **`i18n.ts`** — localized strings + the `order()` helper that reverses child arrays for RTL; `Ui = { t, dir, lang }` threaded through components.

---

# 7. Data Model

Stable, type-prefixed IDs (`camp_`/`init_`/`task_`), generated by action logic, immutable after creation.

## 7.1 Campaign
`id`, `title` (non-empty), `sortOrder`, `createdAt`, `updatedAt`. No status/priority/owner/due/description/tasks/notes.

## 7.2 Initiative
`id`, `campaignId` (string | null = Unassigned), `title` (non-empty), `owner`, `status` (`InitiativeStatus`), `priority` (`Priority` P0–P3), `dueDate` (string | null), **`description`** (string — replaces `strategy` + `scope`), `figmaLink`, `notes`, `sortOrder`, `archived` (boolean), `createdAt`, `updatedAt`.

## 7.3 Task
`id`, `initiativeId`, `title` (non-empty), `assignee`, `status` (`TaskStatus`), **`estimateHours`** (number ≥ 0; 0 if unset), `notes`, `sortOrder`, `createdAt`, `updatedAt`. No due date and no `archived` flag — tasks are deleted, not archived.

---

# 8. Enums & Controlled Values

- **InitiativeStatus:** Backlog, Planned, In Progress, Blocked, In Review, Done. (`archived` is a boolean flag, not a status.)
- **TaskStatus:** To Do, In Progress, Blocked, Done.
- **Priority:** **P0, P1, P2, P3** (P0 critical → P3 low; distinct colors in `PRIORITY_COLORS`).
- **ViewMode:** Cards, Table. **TableMode:** Initiatives, Tasks.
- **GroupBy:** campaign, priority, status, owner, none. **SortKey:** priority, estimate, dueDate, status, title, manual. **SortDir:** asc, desc.

---

# 9. State Design

## 9.1 Record collections (synced maps)
`campaigns`, `initiatives`, `tasks` — keyed by ID.

## 9.2 Shared UI state (synced)
`viewMode`, `tableMode`, `searchQuery`, `filters`, `expandedIds`, `schemaVersion`, `seeded`, `errors`, **`locked`**, **`lang`**, **`editingIds`**, **`openPicker`**, **`groupBy`**, **`sortKey`**, **`sortDir`**. Keys are defined once in `STORAGE_KEYS` (unique, stable).

**All state is shared** — there is no per-user state (§17.2). `locked` defaults to **true** (read-only). `lang` defaults to Hebrew.

## 9.3 Filter state
campaign · initiative status · task status (task table) · owner · assignee (task table) · priority · `showArchived`. Filters combine with AND.

## 9.4 Expanded / editing
`expandedIds` track open cards (collapsed by default). `editingIds` track which records are in inline-edit mode (only meaningful when unlocked). `openPicker` tracks the single open Select picker (campaign/status). Locking clears `editingIds`, `errors`, and `openPicker`.

---

# 10. Derived View Model & Lens

The view model applies, in order: archived visibility → search → filters → **lens** (group + sort + direction) → derivation of sections, cards, table rows, counts, filter options, and diagnostics.

- **Grouping** (`GroupBy`): `campaign` builds campaign sections (Unassigned first) with editable titles; `priority`/`status`/`owner` build read-only group headers; `none` is a flat list.
- **Sorting** (`SortKey` + `SortDir`): orders initiatives within each group; `manual`/default falls back to stored `sortOrder` → `createdAt` → `title`.
- **Estimate roll-up:** an initiative's estimate = sum of its tasks' `estimateHours`; group headers show the group's initiative count and **total hours**.
- **Task progress:** total = the initiative's tasks; done = tasks with status Done; `—` when no tasks.
- **Diagnostics:** recoverable data issues (e.g. initiative referencing a missing campaign → routed to Unassigned with a warning) surface without crashing.

Table rows: initiative mode (Campaign, Initiative, Owner, Status, Priority, Due, Progress, **Estimate**, Link); task mode (Campaign, Initiative, Task, Assignee, Task status, **Estimate**, Initiative status, Initiative due, Notes). Column widths are shared via `META_COLS` so collapsed cards align like the table.

---

# 11. Validation

Validate before every write (`actions.ts` → `validation.ts`):

- **Campaign:** non-empty trimmed title (≤ `MAX_TITLE_LENGTH`); numeric `sortOrder`; ID exists for update; ID immutable.
- **Initiative:** non-empty title; allowed status & priority; `campaignId` is null or an existing campaign; due date blank or accepted string; link blank or text/URL; boolean `archived`; ID rules.
- **Task:** non-empty title; existing `initiativeId`; allowed status; `estimateHours` numeric ≥ 0; no due date; ID rules.
- **References:** missing campaign → Unassigned + diagnostic; missing initiative → orphan task hidden + diagnostic; malformed data never crashes.

Errors are keyed `errorKey(recordId, field)` and surfaced near the field; invalid writes are rejected and input preserved.

---

# 12. Actions

`createActions(state)` exposes: create/update campaign; create/update/archive/unarchive initiative; create/update/**delete** task. Each validates, generates IDs and `sortOrder`, stamps `createdAt`/`updatedAt`, and writes to the relevant map. Defaults: initiative status Backlog, priority P2, `campaignId` null, `archived` false; task status To Do, `estimateHours` 0. The `code.tsx` `EditApi` wraps these with error bookkeeping, picker handling, and edit/expand toggles.

---

# 13. Search, Filter, Sort

- **Search** (`searchFilter.ts`): lowercase, trimmed, case-insensitive. Fields: campaign title; initiative title/owner/status/priority/**description**/notes; task title/assignee/notes. Works in both views; combines with filters; drives a no-results empty state.
- **Filters:** AND-combined (§9.3).
- **Sort/group:** the lens (§10); deterministic fallback in `sort.ts`.

---

# 14. UI Architecture

## 14.1 App — two-band header
`App.tsx` composes: **Band 1** (`order([Header(fill), GlobalControls])`) — title/counts at reading-start, archive·language·lock at reading-end; a **hairline divider**; **Band 2** — `ViewToggle`, `LensBar`, and (when unlocked) the create group, distributed with `spacing="auto"`; then the body (`CardView`/`TableView`) and any diagnostics.

## 14.2 Controls
- `GlobalControls` — archive toggle, language toggle, **icon-only lock** (primary fill when locked).
- `ViewToggle` — Cards/Table, plus Initiatives/Tasks sub-tabs in table view.
- `LensBar` — group-by / sort-by / direction cyclers.

## 14.3 Card view
`CardView` → `CampaignSection` (group header: title, count, total hours; edit pencil + add action when unlocked) → `InitiativeCard`. Collapsed card: title (flex) + fixed `META_COLS` metadata slots (owner/status/priority/due/progress/estimate) so columns align; edit pencil when unlocked. Expanded card (`InitiativeExpandedContent`): **read mode** shows description, campaign, Figma link, notes (only what the collapsed row doesn't), plus `TaskList`; **edit mode** (unlocked) is a 2-column inline editor (title, description, priority chips, campaign/status `Select` pickers, owner/due, link, notes, archive).

## 14.4 Table view
`InitiativeTable` / `TaskTable` — header and cell widths reconciled; estimate via the `Hours` component (initiative) / text (task); Figma link cell is clickable.

## 14.5 Field controls
`FieldControls.tsx`: `TextField` (commit on blur/enter; single/multiline), `Chip`/`Chips` (single-select, RTL-ordered), `Select` (tap-to-expand picker for campaign/status), `Hours` (number + unit ordered by direction), `LinkChip` (clickable, opens external), `LabeledField`, `ActionButton` (primary/neutral/danger), `IconButton`.

---

# 15. Bilingual & RTL Implementation

- `i18n.ts` holds all strings for `he` and `en`; `getStrings(lang)`; `dirForLang` → `'rtl'|'ltr'`; the `Ui = { t, dir, lang }` bundle threads through every component.
- **RTL is achieved structurally**, not with bidi string tricks: the `order(children, dir)` helper reverses child arrays for RTL, combined with physical `horizontalAlignText` / `horizontalAlignItems` (`'start'`/`'end'` chosen by direction). Example: `Hours` orders `[number, unit]` so the unit sits reading-start of the number in Hebrew.
- Default language is Hebrew; the language toggle is a shared `GlobalControls` action.

---

# 16. Preview Harness (VS Code)

`preview/figma-shim.ts` emulates the widget runtime (AutoLayout/Text/Input, `useSyncedState`/`useSyncedMap`, `h`/`Fragment`) onto the DOM with flexbox; `main.ts` mounts the same `code.tsx` tree and fits to width. Served at `localhost:8008`.

It is an **approximation for the inner loop** (structure, flow, interaction, logic). It models `spacing="auto"` as space-between, but does **not** reproduce `effect` shadows or Figma's exact AutoLayout sizing quirks, and has no `figma.currentUser`/`showUI`/`createImage`. **Figma is the source of truth for visual layout** — always confirm spacing and elevation there.

---

# 17. Hard-Won Platform Constraints (Do Not Regress)

## 17.1 esbuild target es2017
The widget VM rejects `??` and `?.` ("Unexpected token ?"). Build target must stay `es2017`.

## 17.2 No `figma.currentUser` during render
It throws ("Cannot use currentUser during widget rendering" / "Cannot create two CppVm objects"). The widget renders to a shared scene node, so **per-user state is impossible** — lock, language, editing, and pickers are all shared synced state.

## 17.3 No `Text href`
`set_hyperlink` throws ("Invalid hyperlink target node"). Links use `onClick` + `figma.openExternal(url)` (`LinkChip`, table link cell).

## 17.4 No empty `fill-parent` spacers
Empty `width="fill-parent"` AutoLayouts grow vertically / force wrap. Use a content-filled flex child or `horizontalAlignItems`; use `spacing="auto"` to distribute groups.

## 17.5 Rebuild + clean re-insert; trust the running reality
A stale instance or hot-reload over an old scene surfaces as `Scene has diverged` or a generic `An error occurred while running this widget`. Fix: rebuild `dist/code.js`, then **delete + re-insert** a fresh widget instance. The preview server can also serve a stale in-memory bundle — verify what is actually running, not the source or build log.

## 17.6 Defensive rendering across migrations
Render paths must tolerate pre-migration data (e.g. `normalizePriority` maps legacy priorities; missing `description`/`estimateHours` degrade gracefully) because render happens before the migration `useEffect`.

---

# 18. Schema & Migrations

`SCHEMA_VERSION = 4`, stored in shared state; migrations run once in a `code.tsx` `useEffect` (guarded by `schemaVersion >= SCHEMA_VERSION`), never scattered across components:

- **v2:** legacy priorities High/Medium/Low → P0–P3; backfill task `estimateHours` (default 0).
- **v3:** consolidate initiative `strategy` + `scope` → a single `description`.
- **v4:** remove `Task.archived`; the migration **purges** previously-archived tasks (task archive replaced by hard delete).

Migrations mutate the synced maps and then bump `schemaVersion`. Future migrations follow the same centralized pattern.

---

# 19. Collaboration & Concurrency

Multiple users share one tracker in the Figma file. Per-record synced maps minimize overwrite. Conflict model: **last-writer-wins** at the record level; no edit locking per user, permissions, change history, or merge UI. The global lock is a shared safety toggle, not a concurrency-control mechanism.

---

# 20. Visual Design Rules

`COLORS`/`LAYOUT`/`META_COLS` tokens in `constants.ts`. Grey canvas, white cards with subtle stroke/shading; fixed widget width; the two-band header (§14.1); badges for status/priority; color never the sole signal (labels always present); compact collapsed cards with column-aligned metadata; denser table. P0 reads as critical (red) → P3 muted; Blocked uses a warning color; archived items get muted treatment when shown.

---

# 21. Empty & Diagnostic States

Readable empty states for: no initiatives; empty campaign/group; no tasks in an expanded initiative; no search/filter results (with a clear way to clear). Diagnostics surface recoverable data issues (missing campaign/initiative references, invalid enums) concisely without crashing.

---

# 22. Error Handling

Validation errors render near the field; failed writes never corrupt state (record not written, input preserved). Recoverable data errors isolate the bad record (orphan task hidden + diagnostic; missing campaign → Unassigned + diagnostic; legacy priority normalized). The widget avoids losing existing data on render faults.

---

# 23. Performance

Designed for moderate scale (≈ 20 campaigns / 100 initiatives / 500 tasks): responsive search/filter, snappy expand/collapse, readable tables, view-model derivation kept reasonable. Larger scale could later warrant archiving discipline or view simplification.

---

# 24. Acceptance Gate (Met)

- **Architecture:** canvas-native Figma widget; esbuild/es2017; `widget-src/` module separation; no business logic in `code.tsx`; logic split across validation/actions/search-filter/sort/view-model.
- **Data:** stable IDs; required fields incl. initiative `description` and task `estimateHours`; controlled P0–P3 + status enums; no task due date; initiative archive hides by default (initiatives are never hard-deleted); tasks are deletable; persists in the Figma file.
- **Views:** lensed card view (Unassigned first under campaign grouping); collapsible, column-aligned cards; expanded read/edit; initiative + task tables with estimate columns; readable empty states.
- **Interaction & safety:** locked-by-default; unlock → per-record edit + create; create/edit campaigns/initiatives/tasks; archive; search; filter; switch views/modes; expand/collapse; lens group/sort/direction.
- **i18n:** Hebrew/English with correct RTL; Hebrew default.
- **Constraints:** §17 honored (es2017, no `currentUser` in render, no `Text href`, no empty fill-parent spacers).

---

# 25. Build History

Phases 1–7 (Foundation → Data/View Model → Card View → Create/Edit → Table View → Search/Filters → Polish/QA) are **complete**. Post-MVP work added P0–P3, the merged description, task estimates + roll-up, the lens engine, bilingual/RTL, the lock+edit safety model, the VS Code preview harness, and the two-band header. Current mode is iterative refinement (`01_PROJECT.md`).

---

# 26. Changelog

## Version 1.1 — task delete (2026-06-08)
- **Task archive → hard delete** (schema **v4**): removed `Task.archived`; a `deleteTask` action replaces archive/unarchive; the migration purges previously-archived tasks.
- Updated §4.5, §7.3, §10, §12, §18, §24 accordingly; completed two leftover `task.archived` refs (`TaskRow.tsx`, `TaskTable.tsx`) that were failing `tsc`, and rebuilt both bundles green.

## Version 1.0 — implementation truth-up (2026-06)
- Replaced the `src/`+webpack/pre-implementation draft with the **real** `widget-src/` + **esbuild/es2017** architecture, file map, and module list.
- Documented schema **v3** + the v2/v3 migrations.
- Recorded P0–P3, initiative `description`, task `estimateHours` roll-up, the **lens** engine, **bilingual/RTL** approach, and the **shared lock + per-record edit** safety model.
- Added the **VS Code preview harness** section and the **hard-won platform constraints** (es2017, no `currentUser` in render, no `Text href`, no empty fill-parent spacers, rebuild/clean-reinsert, defensive rendering).
- Added the portable-Node build-environment note; refreshed acceptance to "met".

## Version 0.1 Draft (historical)
- Initial build spec assuming `src/`+webpack and a Phase 1–7 plan. Superseded by Version 1.0.

---

# 27. Final Summary

The Initiative Log Figma Widget is a canvas-native widget built in **`widget-src/`** with **esbuild (es2017)** and shipped via **`dist/code.js`**. It persists Campaigns/Initiatives/Tasks in **shared synced maps**, derives a **lensed** view model (group/sort/direction with estimate roll-ups), and renders a two-band header over a card or table view. It is **bilingual (He/En, RTL)** via the `order()` helper, **locked-by-default** with a per-record edit model, and validated before every write. It honors the platform constraints in §17 — the rules that keep it from crashing in the real Figma runtime — and uses a VS Code preview as a structural inner loop with Figma as the visual source of truth.
