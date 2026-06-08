> **Note:** This file is the project's `00_INSTRUCTIONS` artifact, serving as `CLAUDE.md`.
> The other spine artifacts live in `docs/`:
> - `docs/01_PROJECT.md` — active project memory and restart context
> - `docs/02_PRD.md` — product intent
> - `docs/03_BUILD.md` — build and implementation truth
>
> Implementation note: the widget uses esbuild with all source split inside `widget-src/`
> (entry: `widget-src/code.tsx`), an approved deviation from the `src/` + webpack file map
> in `03_BUILD.md` §5. See the project memory for details.

---

# Instructions for AI Collaboration and Artifact Management
## AI-Assisted Artifact Operating System
## Version 1.2

---

# 1. Purpose

This file defines the reusable protocol for working with an AI on structured project artifacts.

It is project-agnostic. It exists to keep artifacts organized, roles clear, updates easy to apply, and future sessions restartable without relying on chat history.

This file governs how work is requested, reviewed, updated, packaged, and resumed. It does not define a specific product, domain, or implementation.

---

# 2. Recommended File Name

`00_INSTRUCTIONS.md`

Use this as the first file in the artifact package or paste it into a project-level instruction field. If both exist, keep one canonical version and avoid drift.

---

# 3. Standard Artifact Set

Default package:

1. `00_INSTRUCTIONS.md` — reusable collaboration protocol
2. `01_PROJECT.md` — active project memory and restart context
3. `02_PRD.md` — stable product intent
4. `03_BUILD.md` — stable build and implementation truth

Optional artifacts may be added only when complexity justifies them, such as `04_EXECUTION.md`, `04_DECISIONS.md`, `05_TEST_CASES.md`, or `07_CHANGELOG.md`.

---

# 4. Separation of Concerns

Use each file for its own job:

- `00_INSTRUCTIONS.md` = how the operator and AI collaborate
- `01_PROJECT.md` = current state, recent decisions, next actions
- `02_PRD.md` = what the product or system should do and why
- `03_BUILD.md` = how the product or system is structured, built, validated, or maintained

Do not let one artifact silently take over another artifact's authority. If content lands in the wrong file, move it or mark it as temporary.

---

# 5. Core Collaboration Principles

The AI should:

1. prefer clarity over cleverness
2. return full updated files by default, not patch fragments
3. avoid inventing unsupported requirements
4. state assumptions when ambiguity exists
5. separate reusable guidance from project-specific guidance
6. minimize operator copy-paste labor
7. keep artifacts canonical and reusable
8. align before large implementation output when ambiguity could waste time
9. optimize for usable output, not just technically correct output
10. keep current-state notes separate from durable truth
11. promote stable decisions into the right durable artifact
12. prune stale detail that no longer helps future work

---

# 6. Authority Model

Reading order is not the same as authority order.

## 6.1 Reading order

1. `00_INSTRUCTIONS.md`
2. `01_PROJECT.md`
3. `02_PRD.md`
4. `03_BUILD.md`

## 6.2 Authority by topic

Reusable collaboration protocol:
1. direct operator instruction
2. `00_INSTRUCTIONS.md`
3. `01_PROJECT.md`

Current project state:
1. direct operator instruction
2. `01_PROJECT.md`
3. `02_PRD.md`
4. `03_BUILD.md`

Product intent:
1. direct operator instruction
2. `02_PRD.md`
3. `01_PROJECT.md`
4. `03_BUILD.md`

Build structure, implementation behavior, or validation:
1. direct operator instruction
2. `03_BUILD.md`
3. `02_PRD.md`
4. `01_PROJECT.md`

## 6.3 Conflict behavior

If artifacts conflict, use the one with authority for that topic.
If a direct operator instruction changes durable truth, update the relevant artifact.
If authority is unclear and the choice would materially change the result, ask one small clarifying question.

---

# 7. Artifact Governance

Each artifact should have one canonical current version.

Rules:
- keep numbering stable in intended reading order
- do not casually rename files
- if a file is renamed, replaced, merged, split, or retired, explain the change and update references
- keep a lightweight change trail in `01_PROJECT.md` unless a separate changelog is justified

At minimum, meaningful changes should record:
- date or session marker
- artifact changed
- change summary
- reason
- version, if used

---

# 8. Local Document Governance Requirement

Every artifact should include a `Document Governance` section that states:

1. what the file owns
2. what it does not own
3. when to update it
4. when not to update it
5. what should be promoted into it
6. what should be pruned from it
7. conflict behavior

Keep local governance specific to the file. Do not duplicate the full global model everywhere.

---

# 9. Standard Working Modes

## 9.1 Full Generation Mode

Use when the target artifact and scope are clear.
The AI should generate the requested output in one pass, return complete file contents, state assumptions, and flag related files that may need updates.

## 9.2 Alignment First Mode

Use when the wrong output would waste time, tokens, or implementation effort.

Typical triggers:
- unclear target file
- multiple plausible files
- mixed project, product, and build scope
- unclear output shape
- large code generation likely

In this mode, the AI should identify the likely target, state the expected output shape, and confirm before generating large output.

## 9.3 Clarifying question rule

Do not over-ask. Make the smallest reasonable assumption and proceed unless the ambiguity would materially change the result.

---

# 10. Standard Update Workflow

When asked to create or revise an artifact, the AI should:

1. identify the target artifact and request type
2. make progress before asking questions
3. align before expensive implementation output when needed
4. state the update shape:
   - net-new artifact
   - full replacement
   - partial section replacement
   - diff proposal only
   - review only
5. return the result in copy-pastable form
6. include:
   - recommended file name
   - replacement status
   - key changes made
   - assumptions introduced
   - related artifacts that may also need updates

Default behavior: return the full revised artifact.

---

# 11. Revision Response Contract

Unless asked otherwise, artifact revision responses should include:

1. short explanation of what changed
2. recommended file name
3. replacement status
4. full copy-pastable content or exact bounded replacement
5. optional notes on related files to update

This reduces manual merge work and ambiguity.

---

# 12. Replacement Rules

## 12.1 Full replacement is the default

When revising an artifact or implementation file, return the entire updated file unless the operator explicitly asks for a narrower edit.

Assume full-file output for requests like:
- rewrite
- replace
- regenerate
- update

## 12.2 Partial replacement is the exception

Use partial replacement only when:
- the target section is narrow
- the boundaries are unambiguous
- the change does not require coordinated edits across many sections
- the operator explicitly asked for a partial edit, diff, or section rewrite

If returning less than a full file, label it exactly as:

`partial section replacement`

For partial replacements, include:
- file name
- update shape
- whether the file already exists
- exact heading to find
- exact start boundary
- exact stop boundary
- unique locator text if needed

If merge risk is meaningful, return a full-file replacement instead.

---

# 13. Implementation Output Rule

When the operator requests implementation output, default to complete file contents for the intended file or files.

The AI should:
- return full files, not patch snippets
- preserve imports, helpers, types, and required structure
- identify each file being returned
- avoid line-number insertion guidance unless explicitly requested
- call out assumptions and dependencies

If the implementation target is ambiguous and the output would be large, use Alignment First Mode.

---

# 14. Copy-Paste Safety Rule

When returning a full artifact or bounded replacement:

- wrap it in one fenced block when formatting requires it
- use an outer fence longer than any fence inside the content
- preserve raw markdown exactly
- avoid splitting one artifact across multiple fenced blocks unless explicitly requested

Preferred presentation:
1. identify the file name
2. identify whether it is new or a replacement
3. provide the full content in one block

---

# 15. Cross-Artifact Consistency Rule

When one artifact changes, check whether others are now stale.

Common follow-on cases:
- numbering changes
- artifact role changes
- project phase changes
- product scope changes
- build mechanics changes
- collaboration protocol changes
- retirement of legacy artifacts

Do not assume consistency silently. Flag likely downstream updates.

---

# 16. Promotion and Pruning Lifecycle

New ideas and unresolved notes often begin in `01_PROJECT.md`.
Promote them when they become durable truth:

- reusable protocol — `00_INSTRUCTIONS.md`
- current state — `01_PROJECT.md`
- product intent — `02_PRD.md`
- build mechanics — `03_BUILD.md`

After promotion:
- remove duplicate detail from `01_PROJECT.md`
- compress history if only the outcome matters
- keep only notes that improve future decisions

Pruning rule: if a future session would not make a worse decision without the note, remove or compress it.

---

# 17. Assumptions and Ambiguity Handling

If ambiguity exists, the AI should:
- choose the smallest reasonable assumption
- keep structure flexible where possible
- document assumptions clearly
- avoid blocking progress unnecessarily

If ambiguity affects which file should be updated or generated, align before producing large output.

---

# 18. Versioning Guidance

Use simple versioning where helpful:

- `0.x` for early drafts
- `1.0` for first stable version
- minor version for clarifications or non-structural edits
- major version for significant restructuring

If formal versioning is unnecessary, a dated change trail is acceptable.

---

# 19. Restart and Resume Protocol

A future AI session or human collaborator should be able to resume using the artifacts alone.

Default resume sequence:
1. read `00_INSTRUCTIONS.md`
2. read `01_PROJECT.md`
3. identify current phase and active work
4. inspect relevant `02_PRD.md` sections
5. inspect relevant `03_BUILD.md` sections
6. review open decisions and pending promotions
7. take the smallest safe next action

The package is not restart-safe if current phase, next action, authority, or active decisions exist only in chat.

---

# 20. Optional Execution Artifact Policy

A separate `04_EXECUTION.md` is optional, not default.

Create it only when:
- implementation instructions are too large for `03_BUILD.md`
- a builder needs a consolidated command artifact
- sequencing is strict
- generation must follow a fixed file map
- repeatable execution needs a compact instruction surface

If used, it defers to:
- `00_INSTRUCTIONS.md` for protocol
- `01_PROJECT.md` for current state
- `02_PRD.md` for product intent
- `03_BUILD.md` for build truth

---

# 21. Document Governance

## 21.1 This file owns

This file owns reusable collaboration protocol for AI-assisted artifact work, including:
- artifact roles
- authority model
- update workflow
- revision response rules
- replacement rules
- implementation output rules
- copy-paste safety
- cross-artifact consistency
- promotion and pruning
- versioning
- restart protocol
- optional execution artifact policy

## 21.2 This file does not own

This file does not own:
- current project state
- active work in progress
- product-specific requirements
- build-specific mechanics
- unresolved project decisions
- long project history

Those belong in:
- `01_PROJECT.md`
- `02_PRD.md`
- `03_BUILD.md`

## 21.3 Update this file when

Update it when reusable collaboration protocol changes.

## 21.4 Do not update this file when

Do not update it for project-only state, scope, or build changes.

## 21.5 Promote into this file when

Promote rules that become reusable across projects.

## 21.6 Prune this file when

Prune project-specific content, obsolete structures, duplicated rules, and build-specific detail.

## 21.7 Conflict behavior

For collaboration protocol, this file outranks the other artifacts.
It defers to direct operator instruction for current task direction and to the appropriate artifact for state, product, or build truth.

---

# 22. Acceptance Criteria

This file is acceptable when it:
- remains project-agnostic
- defines the standard artifact model
- separates protocol from project content
- explains authority and reading order
- defines full replacement behavior
- defines safe partial replacement behavior
- defines implementation output behavior
- includes copy-paste safety
- includes cross-artifact consistency checks
- includes promotion and pruning expectations
- includes restart protocol
- includes local governance rules
- avoids obsolete default structures

---

# 23. Final Summary

This file defines the reusable operating protocol for AI-assisted artifact work.

The standard artifact model is:
1. `00_INSTRUCTIONS.md`
2. `01_PROJECT.md`
3. `02_PRD.md`
4. `03_BUILD.md`

Keep this file generic.
Keep project memory in `01_PROJECT.md`.
Keep product intent in `02_PRD.md`.
Keep build truth in `03_BUILD.md`.
