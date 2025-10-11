Ainnect React Coding Styles (Professional)
General

Use TypeScript in all files (.tsx for components, .ts for utils, hooks, store).

Always enable strict mode.

Use PascalCase for components and camelCase for variables, functions, hooks.

Use absolute imports with tsconfig.json (@/components, @/features, etc.).

Keep files small, focused, and export only one main component/hook per file.

Components

Functional components only.

Define props using TypeScript interfaces.

No inline styles; use Tailwind utility classes.

Keep JSX structure shallow by extracting reusable subcomponents.

Use descriptive names (FeedPostCard, not Card1).

Avoid unnecessary wrappers (<div> spam). Prefer semantic HTML.

All components must be pure where possible.

Hooks

Custom hooks must start with use.

Keep logic isolated (e.g., useAuth, useInfiniteFeed).

Always return the minimal API needed.

Follow the Rules of Hooks.

State Management

Local UI state: useState.

Complex local state: useReducer.

Server state: React Query.

Context only for global values (auth, theme, locale).

Normalize state shape when possible.

Data Fetching

Use React Query with proper query keys.

Always define loading, error, and empty states.

Use optimistic updates for interactive actions.

TailwindCSS

Use utility classes only.

Keep class order consistent (layout → spacing → typography → colors → states).

Define shared styles in tailwind.config.js instead of repeating.

Build reusable UI primitives (Button, Input, Card) styled with Tailwind.

Error Handling

Wrap main app with an Error Boundary.

Show graceful fallback UI instead of raw error.

Handle async errors with try/catch or onError in React Query.

Forms

Use React Hook Form with schema validation (Yup/Zod).

Always make inputs controlled.

Include loading and error states on submit.

Routing

Use React Router v6.

Define routes by feature.

Use lazy loading for large page components.

Performance

Use React.memo for pure components.

Use useCallback and useMemo only for expensive computations or prop stability.

Virtualize large lists (react-window).

Use Suspense for code splitting.

Testing

Use Jest + React Testing Library.

Test component behavior, not internals.

Mock network calls with MSW.

Git & CI/CD

Clean commit history with conventional commits (feat:, fix:, chore:).

Run ESLint + Prettier before pushing.

Ensure tests pass in CI pipeline.
API Code Generation From JSON Spec (localhost:8080)
Requirements

Source of truth is a JSON file you provide.

The generator reads the JSON and emits:

Typed endpoint functions (Axios)

React Query hooks for queries and mutations

Zod schemas if schemas are provided

Output is deterministic and idempotent.

No comments inside generated code.

Base URL from env: REACT_APP_API_BASE_URL=http://localhost:8080.

Service : Each Collection in each file.