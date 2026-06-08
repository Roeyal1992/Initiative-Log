# Product Requirements Document
## Initiative Log Figma Widget
## Version 1.1 — reflects the product as built

---

# 1. Purpose

This document defines the product intent for the Initiative Log Figma Widget.

The Initiative Log Figma Widget is an ongoing UX/UI initiative tracker embedded directly in Figma. It helps product and design partners track initiatives close to the design work itself, organize related initiatives into campaigns, break each initiative into actionable tasks, and review the whole picture through flexible groupings.

This version describes the product **as built and shipped**. It is past its original MVP and is treated as a mature collaboration tool. It is product-focused; technical implementation lives in `03_BUILD.md`.

**Evolution since the 0.2 MVP draft** (full summary in §30):
- Priorities are **P0–P3** (was High/Medium/Low).
- Initiative **strategy + scope merged into a single description**.
- Tasks gained an **hour estimate** that rolls up to the initiative.
- A **group/sort lens** organizes the card view (not just campaign grouping).
- The UI is **bilingual Hebrew/English with full RTL**; Hebrew is the default.
- Editing is governed by a **shared lock + per-record edit** safety model.

---

# 2. Product Summary

The Initiative Log Figma Widget is a lightweight, canvas-native tracker for UX/UI initiatives managed inside Figma.

It supports a three-level work structure:

1. **Campaign** — groups related initiatives.
2. **Initiative** — the primary unit of tracking: description, owner, status, priority, due date, Figma link, notes, and tasks.
3. **Task** — a smaller actionable item with assignee, status, and an hour estimate.

The primary experience is a **collapsible card list**, grouped and sorted through a lens (by campaign, priority, status, owner, or ungrouped). Each initiative is a card that expands to show detail and its tasks.

A secondary **table view** (initiative mode and task mode) provides dense review for daily/weekly sessions.

Data is stored in **shared Figma widget state** — no external system, spreadsheet, database, or integration. The widget is **bilingual (Hebrew/English, RTL-aware)** and defaults to a **locked, read-only** state for safety.

---

# 3. Product Thesis

UX/UI teams work in Figma as their primary operating space, but initiative tracking usually happens elsewhere or in unstructured canvas artifacts.

The widget gives product and design partners a structured, lightweight way to track UX/UI initiatives directly where design work happens. It should be stronger than sticky notes or manual tables, but lighter than a full project-management platform.

It succeeds when a UX/UI team can use Figma as a practical daily/weekly initiative-tracking workspace without duplicating every detail into a separate tool.

---

# 4. Problem Statement

Ongoing initiative tracking inside Figma is usually fragmented:

- initiatives live in documents or PM tools disconnected from design context
- design-side work scatters across frames, sticky notes, comments, and informal tables
- product managers need visibility without forcing designers into a heavy tracker
- description, owner, due date, priority, and status are inconsistently captured
- tasks under an initiative get buried
- related initiatives are not clearly grouped
- daily/weekly review means scanning across files and tools

The widget addresses this with a structured, persistent, canvas-native tracker.

---

# 5. Target Users

## 5.1 Primary

**UX/UI Designer** — uses Figma as the main workspace; needs to track active/upcoming initiatives close to relevant files and frames; capture the description, break work into tasks, track progress, link to Figma artifacts, communicate to product partners.

**Product Manager** — needs visibility into UX/UI initiatives without a heavyweight process; see what exists, ownership, due dates, status, what's blocked or in progress, and how design execution connects to product goals.

## 5.2 Secondary

**Design Lead / UX Manager** — a structured view across a product area or campaign: workload, campaign-level progress, blocked or stale initiatives, planning prep.

**Cross-Functional Stakeholder** — a simple readout of status without access to a separate PM system; scan status, find the Figma link, identify owners.

---

# 6. User Needs

1. **Track UX/UI initiatives where design work happens** — so status and design context stay connected.
2. **Group related initiatives** — under campaigns (and, via the lens, by priority/status/owner) so workstreams are easy to scan.
3. **Keep standalone initiatives visible** — initiatives without a campaign appear under **Unassigned**.
4. **Expand an initiative for detail** — scan quickly, drill in when needed.
5. **Break initiatives into tasks** — translate the description into actionable items, each with an hour estimate.
6. **See effort at a glance** — per-task estimates roll up so an initiative (and a group) shows its total hours.
7. **Review all work in a dense table** — initiative and task modes for daily/weekly syncs.
8. **Reorganize on demand** — group and sort the card view through a lens without restructuring data.
9. **Link initiatives to Figma artifacts** — jump from the tracker to the relevant file/frame/prototype.
10. **Track ownership, status, priority, due date** — for practical ongoing review.
11. **Work in Hebrew or English** — bilingual, RTL-aware, with a language toggle.
12. **Edit safely** — a default lock prevents accidental edits in a shared file; unlock to edit, with per-record edit affordances.
13. **Keep tracking lightweight** — simple enough for daily/weekly use; not another heavy PM tool.

---

# 7. Product Principles

1. **Figma-native** — feels like part of the workspace, not an enterprise app bolted onto the canvas.
2. **Ongoing, not one-time** — built for daily/weekly tracking.
3. **Structured but lightweight** — enough structure to be trackable without PM complexity.
4. **Campaigns organize; the lens re-organizes** — campaigns group related initiatives; the lens lets users regroup/sort by other dimensions on demand. Campaigns stay simple objects.
5. **Initiatives carry a description** — an initiative is not just a task list; its description says why the work exists and what is in/out of scope. (Earlier "strategy" and "scope" fields were merged into this single description.)
6. **Tasks support execution and effort** — tasks break initiatives down and carry an hour estimate; they are not a full issue tracker.
7. **Dense review matters** — cards for context, table for concentrated review.
8. **Safe by default** — a shared lock protects a collaborative tracker from accidental edits.
9. **Bilingual and RTL-correct** — Hebrew and English are first-class.
10. **Avoid PM-tool creep** — not a replacement for Jira, Azure DevOps, Asana, Monday, Linear, or Notion.

---

# 8. Product Model

## 8.1 Hierarchy

- Campaign
  - Initiative
    - Task

## 8.2 Campaign

A simple grouping separator for related initiatives (product themes, UX workstreams, roadmap pushes, release efforts, discovery tracks). Campaigns do **not** have their own status, due date, owner, description, or task list. An always-present **Unassigned** group holds initiatives with no campaign.

## 8.3 Initiative

The primary unit of tracking. An initiative defines:

- a **description** (why the work exists; what is in/out of scope)
- owner
- status
- **priority (P0–P3)**
- due date
- relevant Figma link
- notes
- associated tasks (and their rolled-up hour total)

Each initiative is a collapsible card in the card view.

## 8.4 Task

A smaller actionable item within exactly one initiative. A task has a title, assignee, status, an **hour estimate**, and notes. Tasks are structured but lightweight, and have **no due date** (initiative due date provides timing context).

---

# 9. Resolved Product Decisions

## 9.1 Priority scale
Priorities are **P0 (critical) → P3 (low)**, replacing the original High/Medium/Low. Rationale: P-scale is sharper and more standard for UX/UI triage. Legacy values were migrated (High→P1, Medium→P2, Low→P3).

## 9.2 Description (merged)
A single **description** replaces separate strategy and scope fields. Rationale: in practice they blurred together; one field is simpler to write and read. Legacy strategy+scope were merged into description.

## 9.3 Task estimates (now included)
Tasks carry an **hour estimate** that rolls up to the initiative and the group total. Rationale: lightweight effort visibility was repeatedly useful and does not turn the tracker into time-tracking. (This was previously deferred; it is now shipped. Live time-*tracking* remains out of scope.)

## 9.4 Task due dates (excluded)
Tasks have no due date; the initiative due date is the timing field. Task-level dates would push toward a full PM tool.

## 9.5 Archive (initiatives) vs delete (tasks)
**Initiatives** archive — hidden by default, recoverable, retaining their tasks and metadata; permanent **deletion of an initiative is excluded**, because the shared, ongoing tracker makes destructive loss risky. **Tasks** are lightweight and are **deleted outright** (task archive was removed in schema v4, which purges any previously-archived tasks). The default lock guards against accidental deletion.

## 9.6 Ordering and the lens
The card view is organized by a **lens**: a group-by dimension and a sort-by key with a direction. Default grouping is by campaign. Within a group, ordering is deterministic (stored order, then creation order, then title) unless a sort key overrides it.

## 9.7 Safety model
The widget is **locked (read-only) by default**. A global lock toggle unlocks editing; while unlocked, each record exposes an edit affordance and create actions appear. This state is **shared** across collaborators (per-user state is not possible in a canvas widget).

## 9.8 Bilingual + RTL
Hebrew and English are both supported with a toggle and correct RTL layout. Hebrew is the default.

---

# 10. Current Scope

## 10.1 Included

1. campaign-grouped card display with an **Unassigned** group
2. **lens**: group by campaign / priority / status / owner / none; sort by priority / estimate / due date / status / title / manual; direction toggle
3. create and edit campaigns (title)
4. create and edit initiatives
5. initiative expand/collapse
6. create and edit tasks within initiatives
7. initiative status; task status
8. **initiative priority (P0–P3)**
9. initiative owner; task assignee
10. **initiative description**
11. **per-task hour estimate**, rolled up to the initiative and group
12. initiative Figma link (clickable)
13. initiative due date
14. initiative and task notes
15. task progress indicator (done / total)
16. campaign-grouped (lensed) card view
17. dense table view — initiative mode and task mode
18. filtering and search across key fields
19. readable empty states
20. archive behavior for initiatives; delete for tasks
21. **shared lock (read-only default) + per-record edit** safety model
22. **bilingual Hebrew/English with RTL**
23. persistent data within the Figma file

## 10.2 Shape
An ongoing UX/UI initiative tracker — not a general-purpose PM platform. It makes normal daily/weekly maintenance possible without a separate Figma table.

## 10.3 Daily / weekly use
Reviewing active initiatives; updating statuses; checking task progress and effort; spotting blocked work; confirming owners/assignees; reviewing due dates; regrouping by priority/owner; linking back to Figma; searching and filtering; preparing product/design syncs.

---

# 11. Deferred Scope

Intentionally not built (may be revisited only if they serve the core use case without PM-tool creep):

- task due dates
- task-level live time tracking (note: a static hour **estimate** is included)
- permanent delete **of initiatives** (tasks are deletable)
- external integrations / sync (Jira, Azure DevOps, Asana, Linear, Notion, Sheets, Airtable)
- notifications, comments, approvals
- role-based permissions, edit locking per user, change history, audit log
- dependency mapping, automated reminders, calendar integration
- advanced reporting/dashboards, workload/capacity planning, campaign-level metrics
- multiple trackers in one widget instance
- advanced search syntax, custom field builder, user-directory lookup
- **paste/attach an image to an initiative** — analyzed, deferred (see `01_PROJECT.md` §9A.1)

---

# 12. Non-Goals

Not intended to be: Jira-in-Figma, a roadmap/portfolio/release-management tool, a dependency or resource/capacity planner, a team-performance tracker, a workflow approval engine, a notification center, or a backend-backed enterprise app. The product preserves a narrow focus: helping UX/UI teams track initiatives and tasks inside Figma.

---

# 13. Core Views

## 13.1 Card View (default)

Initiatives shown as collapsible cards, grouped and sorted by the **lens**. Default grouping is by campaign with **Unassigned** first. Each group header shows its initiative count and **rolled-up hour total**.

A collapsed card is column-aligned (like a table row): title, owner, status, priority, due date, task progress, and estimate line up across cards. An expanded card shows:

- description
- campaign
- Figma link (clickable)
- notes
- tasks (with per-task estimate)

When unlocked, the expanded card becomes an inline editor (and a per-record edit pencil appears on the collapsed row / campaign header).

## 13.2 Table View

Dense review with two modes: **Initiatives** and **Tasks**. Optimized for daily/weekly review, finding blocked work, and scanning ownership/effort across the whole tracker.

## 13.3 Initiative Table Columns
Campaign · Initiative · Owner · Status · Priority · Due date · Task progress · **Estimate** · Figma link.

## 13.4 Task Table Columns
Campaign · Initiative · Task · Assignee · Task status · **Estimate** · Initiative status · Initiative due date · Notes preview. (Task due date is intentionally excluded.)

---

# 14. The Lens (Grouping & Sorting)

The card view is organized through a lens with three controls:

- **Group by:** `campaign` (default) · `priority` · `status` · `owner` · `none` (flat list).
- **Sort by:** `priority` · `estimate` · `dueDate` · `status` · `title` · `manual` (stored order).
- **Direction:** ascending / descending.

Grouping changes the section headers (e.g. a "P0" section, or an owner section); sorting orders initiatives within each group. The lens reorganizes the **view** only — it never changes the underlying data or campaign assignments. Group headers display the group's initiative count and total estimated hours.

---

# 15. Campaign Requirements

- Display campaigns as title separators; show their initiatives; remain readable when empty.
- Always include an **Unassigned** section first; it is not deletable; initiatives without a campaign appear there.
- Create a campaign (title required); edit a campaign title (preserving its initiatives).
- Campaigns stay simple — no owner, due date, status, priority, description, task list, or notes.

---

# 16. Initiative Requirements

## 16.1 Creation
Title required. Other fields (campaign, owner, status, priority, due date, Figma link, description, notes) can be filled at creation or later. Create actions appear only when the widget is unlocked.

## 16.2 Editing
Editable when unlocked, via the expanded-card inline editor: title, campaign, owner, status, priority, due date, Figma link, description, notes.

## 16.3 Collapsed card
Shows title, owner, status, priority, due date, task progress, and estimate — column-aligned across cards.

## 16.4 Expanded card
Read mode shows what the collapsed row does not (description, campaign, Figma link, notes) plus the task list. Edit mode (unlocked) exposes the full inline editor and archive action.

## 16.5 Status
Controlled set: Backlog, Planned, In Progress, Blocked, In Review, Done. (Archived is represented by the `archived` flag, not a status.)

## 16.6 Priority
Controlled set: **P0, P1, P2, P3** (P0 = critical, P3 = low), with distinct color treatment.

## 16.7 Due date
Optional; visible on the collapsed card and initiative table; shown as initiative due date in the task table. No complex calendar behavior.

## 16.8 Figma link
Optional; stored as text/URL; rendered as a **clickable chip** that opens via Figma's external-open (lightweight validation).

## 16.9 Task progress and estimate
Progress (done/total) and the **rolled-up hour estimate** are derived from the initiative's tasks.

## 16.10 Archive
Archive an initiative to hide it from the default active view; it remains visible when archived visibility is enabled and retains its tasks, campaign, and metadata. No permanent delete.

---

# 17. Task Requirements

## 17.1 Creation
Title required; assignee, status, **estimate**, and notes optional. Created within an initiative.

## 17.2 Editing
Editable when unlocked: title, assignee, status, **estimate hours**, notes.

## 17.3 Status
Controlled set: To Do, In Progress, Blocked, Done — simpler than initiative status.

## 17.4 Estimate
Each task has an **hour estimate** (a non-negative number). Estimates roll up to the initiative total and the group total. This is a static estimate, not live time tracking.

## 17.5 Assignee
Plain text; no integration with Figma users or external directories.

## 17.6 Notes
Short, practical notes; not a long-form documentation field.

## 17.7 No due date
Tasks have no due date; timing context comes from the parent initiative.

## 17.8 Ordering & delete
Deterministic ordering (stored order, then creation order). Tasks are **deleted** outright from the inline task editor (when unlocked) — task archive was removed in schema v4. Deletion is immediate; the default lock is the safeguard against accidents.

---

# 18. Filtering, Sorting, and Search

- **Filters** (combine with AND): campaign, initiative status, task status (task table), owner, assignee (task table), priority, archived visibility.
- **Sorting / grouping** in the card view is driven by the **lens** (§14). The table view presents columns for dense scanning.
- **Search** is case-insensitive and checks campaign title; initiative title, owner, status, priority, **description**, notes; task title, assignee, notes. It works in both views, combines with filters, and shows a clear no-results state with a way to clear.

---

# 19. Bilingual & RTL

- The UI is fully **Hebrew and English** with a language toggle; **Hebrew is the default**.
- All labels, controls, and empty/error states are localized.
- **RTL is correct**: reading order, alignment, and control ordering flip with the language (e.g. the hour unit sits to the reading-start side of the number). Layout is composed so direction changes do not break alignment.

---

# 20. Safety Model (Lock & Edit)

- The widget is **locked (read-only) by default** to protect a shared tracker.
- A **global lock toggle** (icon-only) switches the whole widget between read-only and editable.
- While **unlocked**: each initiative/campaign exposes a **per-record edit** affordance, and **create** actions appear.
- **Locking** clears any open editors, validation errors, and open pickers.
- This lock/edit/expand state is **shared** across everyone viewing the file — a canvas widget cannot hold per-user state. Last-writer-wins; no per-user permissions or edit locking.

---

# 21. Persistence, Collaboration & Source of Truth

- The **Figma file is the source of truth**; data lives in the widget's **shared, persistent** state. No external database, spreadsheet, server, or auth.
- Multiple users see the same tracker; updates persist across sessions.
- Conflict model: **last-writer-wins** at the record level; no comments, permissions, or change history in scope.

---

# 22. UX Expectations

Compact, readable, easy to scan; clear collapsed cards (column-aligned); practical expanded/edit mode; dense, readable table; canvas-appropriate; resilient to moderate numbers of initiatives and tasks; not visually overwhelming. Card view prioritizes hierarchy and context; table view prioritizes density and review speed; the lens lets users reframe the same data quickly.

---

# 23. Data Fields

## 23.1 Campaign
| Field | Required | Description |
|---|---:|---|
| id | Yes | Stable internal identifier |
| title | Yes | Campaign display name |
| sortOrder | Yes | Display ordering value |
| createdAt / updatedAt | Yes | Metadata |

## 23.2 Initiative
| Field | Required | Description |
|---|---:|---|
| id | Yes | Stable internal identifier |
| campaignId | Optional | Parent campaign; null = Unassigned |
| title | Yes | Initiative name |
| owner | Optional | Person accountable |
| status | Yes | Initiative progress state |
| priority | Yes | **P0 / P1 / P2 / P3** |
| dueDate | Optional | Initiative-level target date |
| **description** | Optional | Why the initiative exists; in/out of scope (replaces strategy + scope) |
| figmaLink | Optional | Link to a Figma artifact (clickable) |
| notes | Optional | Supporting context |
| sortOrder | Yes | Display ordering value |
| archived | Yes | Hidden by default when true |
| createdAt / updatedAt | Yes | Metadata |

## 23.3 Task
| Field | Required | Description |
|---|---:|---|
| id | Yes | Stable internal identifier |
| initiativeId | Yes | Parent initiative |
| title | Yes | Task name |
| assignee | Optional | Person responsible |
| status | Yes | Task progress state |
| **estimateHours** | Yes | Non-negative hour estimate (rolls up); 0 if unset |
| notes | Optional | Supporting context |
| sortOrder | Yes | Display ordering value |
| createdAt / updatedAt | Yes | Metadata |

---

# 24. Functional Requirements (Summary)

- **Campaigns:** render Unassigned first; render campaign groups; create/edit campaigns; assign and move initiatives; show empty sections; deterministic ordering.
- **Initiatives:** create/edit; cards with expand/collapse; show status, priority, owner, due date, progress, estimate; description/link/notes in expanded view; archive + hide-by-default with archived-visibility reveal.
- **Tasks:** create/edit (title, assignee, status, estimate, notes); show in expanded cards and task table; compute progress and roll up estimates; deterministic ordering; delete.
- **Views & lens:** card and table views; initiative/task table modes; group-by/sort-by/direction lens for the card view.
- **Filter/search:** filters as in §18; case-insensitive search across key fields; combine; no-results state.
- **Safety & i18n:** lock/unlock with per-record edit; bilingual He/En with RTL.
- **Validation:** prevent/clearly handle missing titles, invalid status/priority, broken references, empty campaign titles, and accidental destructive actions.

---

# 25. Acceptance Criteria

The product is acceptable (and currently satisfies these) when:

- **Structure:** campaigns, initiatives, tasks; Unassigned first; initiatives can be campaign-less; tasks belong to initiatives; campaigns stay simple separators.
- **Card view:** lensed grouping/sorting; expand/collapse; column-aligned collapsed cards showing key scan fields + estimate; expanded cards show description/campaign/link/notes + tasks; archived hidden by default.
- **Table view:** initiative and task modes; columns per §13; estimate column present; task table shows initiative due date (no task due date); filters and search work.
- **Editing & safety:** locked by default; unlock reveals per-record edit + create; create/edit campaigns, initiatives, tasks; required fields validated; controlled status/priority; edits persist; initiative archive works; tasks delete; no permanent deletion of initiatives.
- **Lens & effort:** group/sort/direction reorganize the view; per-task estimates roll up to initiative and group totals.
- **Search/filter:** case-insensitive search across key fields incl. description; combines with filters; clear no-results states.
- **i18n:** Hebrew and English with correct RTL; Hebrew default.
- **Scope:** no external integrations or backend; not a full PM platform; focused on UX/UI initiative tracking.

---

# 26. Risks

- **UI crowding** — mitigate with compact collapsed cards, detail in expanded cards, table + lens for dense review.
- **PM-tool creep** — preserve non-goals; keep campaigns and tasks lightweight; estimate stays a static number, not tracking.
- **Data growth** — filters, search, lens, archive, grouping keep it usable at moderate scale.
- **Shared editing ambiguity** — lock-by-default plus last-writer-wins keeps interactions simple; concurrent editing is not deeply managed.
- **Figma widget constraints** — shared-only state, inline editing patterns, and canvas layout limits shape the UX (detailed in `03_BUILD.md`).

---

# 27. Success Metrics

The product is successful if: the team uses it in daily/weekly review; the PM understands active initiatives without a separate status summary; initiatives are consistently grouped (campaign or Unassigned); cards capture description, owner, status, priority, due date, and Figma link; tasks break initiatives into actionable work with sensible estimates; the lens and table speed up review; search/filters help focus; archived initiatives stay out of the active view; and the team doesn't maintain a parallel tracker.

---

# 28. Future Enhancements

Image attach/paste to an initiative (analyzed — see `01_PROJECT.md` §9A.1); task due dates; permanent delete with confirmation; drag-and-drop reordering; advanced filters; campaign descriptions / progress summaries; archived-item management view; export (CSV / markdown); import from pasted table; stale-initiative indicators; Figma frame picker; user picker; comments; change history; external PM sync. Each must be weighed against the core purpose: lightweight UX/UI initiative tracking inside Figma.

---

# 29. Document Governance

## 29.1 Owns
Product purpose, thesis, users, user needs, product model, current scope, non-goals, core views, the lens, requirements, data fields, success criteria, product-level decisions, bilingual/safety product behavior.

## 29.2 Does not own
Implementation architecture, Figma widget API details, persistence/state mechanics, component structure, validation code, exact styling/layout tokens, file/module map, schema-migration code, build/test process — those belong in `03_BUILD.md`.

## 29.3 Update when
Product scope, users, or boundaries change; major features are added/removed; product decisions are revised; success criteria change.

## 29.4 Do not update when
Implementation-only refactors, low-level component decisions, technical file organization, or bug fixes that don't change product behavior.

---

# 30. Changelog

## Version 1.1 — task delete (2026-06-08)
- Task **archive → hard delete**: `Task.archived` removed; a `deleteTask` action replaces archive/unarchive; **schema v4** purges any previously-archived tasks.
- Narrowed the "permanent delete" exclusion to **initiatives** (§9.5, §11); switched §17.8 and the task data-field table to delete.

## Version 1.0 — product as built (2026-06)
- Updated from MVP draft to describe the shipped product (past MVP, mature tool).
- Priority **High/Medium/Low → P0–P3**.
- **Strategy + scope merged into description.**
- Added **per-task hour estimate** with roll-up; removed estimates from deferred.
- Added the **group/sort lens** (§14) as the card-view organizer.
- Added **bilingual Hebrew/English + RTL** (§19).
- Added the **shared lock + per-record edit safety model** (§20); clarified that widget state is shared, not per-user.
- Added estimate columns to both tables; refreshed data-field tables, requirements, acceptance, risks, and metrics to match reality.

## Version 0.2 Draft (historical)
- Resolved early product decisions; excluded task due dates; included initiative archive and search; clarified task table columns and deterministic ordering. Superseded by Version 1.0.

## Version 0.1 Draft (historical)
- Initial PRD; campaign/initiative/task hierarchy; card and table views; MVP fields and non-goals. Superseded.

---

# 31. Final Summary

The Initiative Log Figma Widget is a shipped, canvas-native UX/UI initiative tracker organizing work into Campaigns → Initiatives → Tasks. The default experience is a **lensed**, collapsible card view; the secondary experience is a dense initiative/task table. It captures owner, status, **P0–P3 priority**, due date, **description**, Figma link, notes, task progress, and **task hour estimates** that roll up to initiatives and groups. It is **bilingual (Hebrew/English, RTL)**, **locked-by-default** with a per-record edit model, and persists to shared Figma state. It stays lightweight and Figma-native, and is not a full project-management platform.
