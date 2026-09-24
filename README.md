# Profitability Calculator

A tool that helps startup founders model their unit economics, calculate their break-even
point, and generate clear, trustworthy financial projections they can show investors.

Built with Spec-Driven Development (SDD), scaffolded from
[GitHub Spec Kit](https://github.com/github/spec-kit).

## Running the app

This is a client-only app (React + TypeScript + Vite) — no backend, no database, no accounts
(see `specs/001-break-even-calculator/plan.md` for why). Requires Node.js 20 LTS.

```bash
npm install       # install dependencies
npm run dev        # start the dev server
npm run build       # type-check and build a static production bundle to dist/
npm run preview      # serve the production build locally
```

## Testing

```bash
npm run test        # Vitest — calculation engine and component unit tests
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright — critical end-to-end user journeys
```

Every financial formula is unit-tested against a hand-calculated reference case documented in
`specs/001-break-even-calculator/quickstart.md` (constitution Principle X) — start there if a
calculation looks wrong.

## Linting and formatting

```bash
npm run lint        # ESLint
npm run format       # Prettier check
```

## Constitution

The governing constitution for all work in this repo lives at
[`.specify/memory/constitution.md`](.specify/memory/constitution.md). It defines the
non-negotiable principles for this product — privacy/security by design, research-before-
implementation, spec-driven development, TDD, testing strategy, **financial calculation
correctness and investor trust**, architecture, data, UX, GTM, MVP discipline, AI-assisted
development rules, human decision gates, dependency discipline, observability, release
discipline, and post-launch learning — plus a Universal Project Workflow, a governing priority
order for resolving conflicts, and amendment/compliance rules.

Update it only through the `/speckit-constitution` command (or `speckit.constitution` on
GitHub Copilot) — never by hand-editing around it — so version bumps and the amendment
procedure stay honest.

## Coding agent commands

This repo is set up for two agent integrations:

- **Claude Code** — skills under [`.claude/skills/`](.claude/skills)
- **GitHub Copilot** — skills under [`.github/skills/`](.github/skills)

Both expose the same Spec Kit workflow:

| Command | Purpose |
| --- | --- |
| `/speckit-constitution` | Create or amend the project constitution |
| `/speckit-specify` | Create a baseline feature specification |
| `/speckit-clarify` *(optional)* | De-risk ambiguous areas before planning |
| `/speckit-plan` | Create a technical implementation plan |
| `/speckit-tasks` | Generate actionable, traceable tasks |
| `/speckit-checklist` *(optional)* | Generate quality checklists |
| `/speckit-analyze` *(optional)* | Cross-artifact consistency report |
| `/speckit-implement` | Execute the implementation (TDD) |
| `/speckit-converge` | Assess the codebase and append remaining work as tasks |
| `/speckit-taskstoissues` | Turn tasks into GitHub issues |

## Layout

- `.specify/memory/constitution.md` — the constitution (source of truth)
- `.specify/templates/` — spec, plan, tasks, checklist, constitution templates
- `.specify/scripts/bash/` — shared automation the commands call into
- `.claude/skills/`, `.github/skills/` — per-agent command definitions

## Starting a new feature

1. Run `/speckit-specify` to describe the problem and create a spec (e.g. "break-even
   calculator", "CAC/LTV panel", "investor summary export").
2. Run `/speckit-clarify` if requirements are ambiguous.
3. Run `/speckit-plan` to produce a technical plan consistent with the constitution.
4. Run `/speckit-tasks` to break the plan into traceable tasks.
5. Run `/speckit-implement` to build it test-first.
