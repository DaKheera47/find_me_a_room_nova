# Repository Guidelines

## Project Structure & Module Organization
- `app/` uses the Next.js App Router; feature routes such as `find-free-room` and `timetable-converter` group page-level layouts and server components.
- `components/` holds reusable UI primitives, while `lib/` centralizes API calls, font loaders, and helpers; reach for these folders before introducing new utilities.
- Zustand state lives in `store/`, shared schemas in `types/`, and configuration (navigation, metadata) in `config/`.
- `public/` stores static assets, `styles/` contains Tailwind layers; avoid editing the generated `out/` directory.

## Build, Test, and Development Commands
- `pnpm install` ensures dependencies match the checked-in `pnpm-lock.yaml` (Node 18+ recommended).
- `pnpm dev` launches the dev server on http://localhost:4321 as defined in the scripts.
- `pnpm build` compiles the production bundle; pair with `pnpm preview` (or `pnpm start`) to verify the build output.
- `pnpm lint` runs ESLint with Next rules and Tailwind plugins; `pnpm lint:fix` auto-resolves common issues.
- `pnpm typecheck` runs `tsc --noEmit` so regressions in shared types are caught before review.
- `pnpm format:write` applies Prettier, import sorting, and Tailwind class normalization across the repo.

## Coding Style & Naming Conventions
- Prettier enforces 2-space indentation, double quotes, no semicolons, LF endings, and sorted imports (see `prettier.config.js`).
- Favor PascalCase for components, camelCase for hooks and helpers, and `use*-` prefixes for client hooks.
- Tailwind utility classes should follow the plugin-managed order; extract repeated patterns into `styles/` or component variants to keep JSX concise.

## Testing Guidelines
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` before opening a PR; these are the current regression guardrails.
- Exercise new features in the dev server and capture screenshots/GIFs covering responsive states. When adding API interactions, stub mock data in `lib/` or story-like fixtures under `components/` for deterministic checks.

## Commit & Pull Request Guidelines
- Follow the short, imperative commit style used in history (e.g., `set reminder before events`, `remove debug`). Keep subjects under ~60 characters.
- PR descriptions should call out the affected routes, any new environment expectations, and manual QA performed (include URLs or commands).
- Link related backend changes when the interface evolves so reviewers can validate end-to-end flows.

## Environment & Integration Notes
- Set `NEXT_PUBLIC_BACKEND_BASE_URL` in `.env.local` to point at the Express API (match `/get-all-room-info`, `/find-rooms-by-duration`, etc.). Never commit the file.
- Coordinate UI data contracts with the backend `types/` mirrors; update Zod schemas in `types/` alongside any API shape changes.
