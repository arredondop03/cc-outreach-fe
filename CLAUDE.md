# Project Memory

## Documentation

Use Context7 MCP to fetch current documentation whenever a task involves a library, framework, SDK, API, CLI tool, or cloud service, even well-known ones. This covers API syntax, configuration, version migration, library-specific debugging, and setup instructions. Prefer it over web search and over training-data recall.

Steps:
1. Call `resolve-library-id` with the library name and what you need to look up (skip if an exact `/org/project` ID is given).
2. Pick the best match by exact name, relevance, reputation, and benchmark score. Use a version-specific ID if a version is mentioned.
3. Call `query-docs` with that ID and a specific question, one call per distinct concept.
4. Answer using the fetched docs.

Do not use Context7 for refactoring, business-logic debugging, code review, or general programming concepts.

## Code style

- Always use descriptive variable names, including in callbacks and loops (`company`, `event`, `error`, never `c`, `e`, `q`).

## Backend

Sibling repo at `../cc-outreach-be`. Auth is **Better Auth** (routes under `/api/auth/*`), used here through the Better Auth React client. Check its code and `backend-implementation-plan.md` before answering questions about API behavior, and say so if you haven't checked.

## Frontend Stack

- **Tailwind CSS v4** via `@tailwindcss/vite`. No `tailwind.config`; theme tokens live in `src/index.css` (`@theme inline`, CSS variables). Use `cn()` for class merging.
- **shadcn/ui** (`base-nova` style, built on `@base-ui/react`, lucide icons). Config in `components.json`; components live in `src/components/ui/`. Add new ones with `npx shadcn@latest add <name>` rather than hand-writing them. Import via the `@/` alias.
- **React Router v8** (data router). Routes are defined in `src/App.tsx` with `createBrowserRouter`. `/login` is public; everything else sits under `RequireAuth` (redirects to `/login` with `state.from`) and `AppShell`.
- **React Hook Form + Zod v4**. Define a `z.object` schema, pass it to `useForm` with `zodResolver`, and use `register`. Server errors go through `setError('root.server', …)`. Forms use `noValidate` so Zod owns validation. See `src/pages/LoginPage.tsx`; build form fields with shadcn `Field`, `FieldLabel`, `FieldError` and `Input`.
- **Better Auth client** (`better-auth/react`) in `src/lib/auth-client.ts`, exporting `useSession`, `signIn` and `signOut`. It uses `baseURL` from `VITE_API_URL` (backend URL, no trailing slash, set in `.env`) and `credentials: 'include'` for cookie sessions. Sign in with `signIn.email({ email, password })`, which returns `{ data, error }`.
