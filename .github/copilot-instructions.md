# Copilot instructions

## Build and test

- `npm start` starts the Angular development server at `http://localhost:4200/`.
- `npm run build` runs the production build. `npm run watch` rebuilds with the development configuration.
- `npm test` runs the Vitest unit tests. Use `npm test -- --watch=false` for a one-time run.
- Run one test file with `npm test -- --include=app/app.spec.ts --watch=false`. To filter to one test by name, add `--filter="should create the app"`.

## Architecture

- This is an Angular standalone-component application with server-side rendering and client hydration. Browser/server bootstrapping is in `src/main.ts`, `src/main.server.ts`, and `src/server.ts`; shared providers and hydration are configured in `src/app/app.config.ts`.
- `src/app/app.routes.ts` defines the page routes. Clinical records and health profiles use parent components with nested list/insert/update routes; other features live in their own component directories.
- Feature components own UI behavior and keep their TypeScript, HTML template, and CSS together. API access is separated into injectable services under `src/app/services`; those services use `HttpClient` and typed domain DTOs under `src/app/model`.
- `src/app/app.config.ts` registers the functional auth interceptor globally. Login state is managed by `Loginservice`; browser storage access is guarded for SSR in `src/app/services/loginservice.ts`.
- API base URLs are configured in `src/environments/`. Check the environment import used by neighboring services when adding or changing API calls.

## Conventions

- Components are standalone: declare template dependencies in each component's `imports` array rather than adding them to an NgModule. Angular Material modules are imported where their controls are used.
- Form screens use Reactive Forms (`FormBuilder`, validators, and `ReactiveFormsModule`). Templates use Angular's built-in `@if` and `@for` control flow.
- User-facing copy and date formatting are Spanish; the application registers the Spanish locale globally in `src/app/app.config.ts`.
- Keep feature-specific markup and styles in the component's colocated `.html` and `.css` files. Shared Material theme and global styles are in `src/material-theme.scss` and `src/styles.css`.
- Formatting is configured in `.prettierrc`: single quotes and a 100-character print width; HTML uses Prettier's Angular parser.
