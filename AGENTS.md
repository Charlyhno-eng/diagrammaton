# Diagrammaton contributor instructions

## Product purpose

Diagrammaton is an HTML-first editor for rich software-architecture and technical-explainer diagrams. Users compose semantic DOM components—platforms, boundaries, services, data stores, actors, metrics, actions, and branded technologies—while SVG is reserved for crisp connectors. The primary deliverable is a visually polished, editable diagram that can be exported as one self-contained HTML file.

The default experience must remain dark. A user-selected background theme must be preserved when switching templates. Templates should provide structured starting points instead of behaving like a free-form drawing canvas.

## Implementation principles

- Keep the diagram data model typed and serializable.
- Prefer reusable semantic components and template data over one-off markup.
- Keep technology SVGs local through the `simple-icons` package so exported HTML has no remote asset dependency.
- Preserve bilingual English/French labels for user-facing additions.
- Do not remove or overwrite user-created reference images in `models_diagrams/`.
- Use `apply_patch` for hand-written source changes and preserve unrelated worktree changes.

## Required validation loop

Work is not complete while tests or the production build fail. After every material change:

1. Run the focused unit test while implementing, then `npm run test:unit` for the complete domain/export suite.
2. Run `npm run test:e2e` for real-browser behavior and visual regressions. Inspect new or intentionally changed screenshots before accepting them; use traces and failure screenshots to diagnose regressions.
3. Run `npm run lint` for static TypeScript and React checks.
4. Run `npm run build` to validate TypeScript and the production bundle.
5. Run `git diff --check` to catch malformed patches.
6. When any check fails, inspect the concrete failure, modify the implementation or an incorrect test, and restart the validation sequence. Never waive a failure, silently remove coverage, or report completion while a known failure remains.

`npm test` is the mandatory full gate: it runs both the unit and Playwright suites. Snapshot updates are only valid when the visual change is requested and the resulting PNG has been reviewed.

## Agent execution contract

For implementation work, operate as a closed feedback loop: inspect the relevant product references and existing code, implement the smallest coherent change, validate domain invariants, validate browser interactions and rendering, build the production artifact, and review the final diff. Treat failures as new input to the loop and keep coding until the complete gate passes. A task is “done” only when the behavior is present and independently exercised by the available automated checks.

Add or update tests whenever behavior, templates, exports, catalog data, or theme rules change. Tests belong in `tests/` and should validate observable product invariants rather than implementation trivia.
