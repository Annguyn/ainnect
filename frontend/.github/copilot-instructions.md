ReactJS Development Instructions (Ainnect Social Network – CRA + TailwindCSS)
Project Context

Framework: React 19+ with TypeScript.

Build Tool: Create React App (CRA) using react-scripts (Webpack + Babel under the hood).

Styling: TailwindCSS as the default styling solution.

Pattern: Functional components with hooks (no class components).

Architecture: Feature/domain-driven organization to support scalability of a social network.

Focus: User roles, feeds, messaging, notifications, and AI-powered recommendations.

Quality: Follow React’s official style guide, modern patterns, and best practices.

Development Standards
Architecture

Use functional components with hooks as the primary design.

Favor composition over inheritance.

Organize code by feature/domain (e.g., features/feed, features/chat, features/profile).

Separate container components (data-fetching, stateful logic) from presentational components (UI only).

Use custom hooks for reusable logic.

Ensure a clear top-down data flow with props and context.

TypeScript Integration

Define interfaces for props, state, and contexts.

Enable strict mode in tsconfig.json.

Use React built-in types (React.FC, React.ComponentProps, React.ChangeEventHandler, etc.).

Define union types for variants (e.g., type ButtonVariant = "primary" | "secondary").

Use generics where appropriate (<T>, Record<K,V>).

Component Design

Apply Single Responsibility Principle.

Small, focused, testable components.

Use composition patterns (children, compound components, render props).

Consistent naming (PascalCase for components, camelCase for functions).

Validate props with TypeScript.

State Management

Use useState for local state.

Use useReducer for complex logic (e.g., form handling, feed actions).

Use useContext for auth/session sharing.

For large-scale state (e.g., global user sessions, notifications) → consider Redux Toolkit or Zustand.

Use React Query for server state (feed, chat messages, AI recommendations).

Hooks and Effects

Always provide dependency arrays in useEffect.

Use cleanup functions to prevent leaks (unsubscribe, cancel fetch).

Use useMemo / useCallback for performance-critical code.

Follow the Rules of Hooks.

Use useRef for DOM refs and non-reactive state.

Create custom hooks for reusable logic (useAuth, useInfiniteFeed, etc.).

Styling (TailwindCSS)

Use TailwindCSS as the only styling approach.

Apply utility-first classes for layout, spacing, colors, typography.

Configure tailwind.config.js with Ainnect design tokens (brand colors, typography, breakpoints).

Implement responsive (mobile-first) UI using Tailwind’s responsive utilities.

Use dark mode via Tailwind configuration (class strategy).

For reusable patterns, create UI wrappers (e.g., <Button />, <Card />) that apply Tailwind classes internally.

Ensure accessibility with semantic HTML + ARIA attributes.

Performance Optimization

Use React.memo where appropriate.

Apply code splitting with React.lazy + Suspense.

Optimize bundle with tree shaking and dynamic imports (CRA supports this via Webpack).

Implement virtualized lists (e.g., react-window, react-virtualized) for feeds.

Profile using React DevTools.

Data Fetching

Use React Query or SWR for async data.

Handle loading, error, and success states.

Use optimistic updates for feed interactions (like, comment, follow).

Ensure proper caching of server state.

Handle offline mode gracefully.

Error Handling

Implement Error Boundaries for component-level errors.

Use fallback UIs for critical failures.

Log errors to monitoring tools (Sentry, LogRocket).

Provide user-friendly error messages.

Forms and Validation

Use controlled components for inputs.

Use React Hook Form for complex forms (login, profile edit, post creation).

Implement validation (Yup/Zod schemas).

Ensure accessibility (labels, ARIA attributes).

Support debounced validation and async checks (e.g., username availability).

Routing

Use React Router v6.

Implement nested routes (e.g., /profile/:id/posts).

Protect routes with authentication checks.

Use lazy loading for route-based code splitting.

Manage navigation state (active links, breadcrumbs).

Testing

React Testing Library for unit and integration tests.

Jest as test runner.

Test behavior, not implementation details.

Mock API calls with MSW (Mock Service Worker).

Ensure accessibility with automated tests (jest-axe).

Security

Sanitize user input to prevent XSS.

Validate server responses.

Use HTTPS for API calls.

Implement proper auth & authorization (JWT, OAuth).

Never store sensitive data in localStorage (use httpOnly cookies).

Use CSP headers.

Accessibility

Semantic HTML for structure.

ARIA attributes where necessary.

Keyboard navigation for all interactive elements.

Proper color contrast ratios.

Provide alt text for images.

Test with screen readers.

Implementation Process

Set up CRA with TypeScript + TailwindCSS (npx create-react-app ainnect-frontend --template typescript).

Configure Tailwind (postcss.config.js, tailwind.config.js).

Plan component architecture by feature/domain.

Define TypeScript types/interfaces.

Implement core components (with Tailwind).

Add state management and data fetching (React Query).

Set up routing (React Router v6).

Implement forms with React Hook Form.

Add error handling and loading states.

Write tests.

Optimize performance.

Ensure accessibility compliance.

Document with JSDoc and maintain clean git history.

Additional Guidelines

Follow React conventions: PascalCase for components, camelCase for variables/functions.

Use ESLint + Prettier for code formatting.

Keep dependencies updated.

Use Git with meaningful commit messages.

Apply environment configs for dev/staging/prod.

Debug with React Developer Tools and Redux DevTools (if Redux used).