# Implementation Plan

This is the **frontend** plan (repo `cc-outreach-fe`). The backend is a separate repo (`cc-outreach-be`) with its own plan in `backend-implementation-plan.md`, whose phase numbers match this one. Based on `project-scope.md` and `tech-stack.md`. Each phase ends with something you can run and check. Tasks are sized to roughly one sitting or less. Tasks marked **(decision)** were answered in Phase 0.

## Phase 0: Decisions and accounts

Settle the questions that change the data model, and get access to the external services.

- [x] 0.1 **(decision)** Steps confirmed with the call removed: 5 steps (initial email, LinkedIn request, follow-up email 1, follow-up email 2, breakup email). Spacing is 3 business days. Weekends and holidays are not business days.
- [x] 0.2 **(decision)** A contact becomes `done` after a waiting period following the breakup email.
- [x] 0.3 **(decision)** The 10/day goal counts sent emails only.
- [x] 0.4 **(decision)** Overdue follow-ups stay `pending` and sort first in the queue. No roll-over logic needed.
- [x] 0.5 **(decision)** An `engaged` contact keeps the company `active`. No other contact at that company can be in a sequence.
- [x] 0.6 **(decision)** No variant tags in V1.
- [x] 0.7 **(decision)** Confirmed: LinkedIn up to 200 characters, email 20-39 words.
- [x] 0.8 **(decision)** Stack changed: PostgreSQL on Railway, email + password login with database sessions, SendGrid for email, Docker + Railway for both repos. See `tech-stack.md`.
- [ ] 0.9 Railway project with a Postgres service: create it when we reach Phase 2 (`DATABASE_URL` goes to the backend only).
- [ ] 0.10 The existing `all_contacts` table lives in Supabase. Plan a one-time copy into the new Postgres (backend Phase 2). The Supabase MCP (authorize via `/mcp`) can be used to inspect it.
- [ ] 0.11 SendGrid account, API key, and sender authentication (domain, or a single verified sender), plus the mailbox for `reply_to`. **For now:** use the test address `parredondo2724@gmail.com` as the verified single sender, the `reply_to`, and the recipient of all test sends. Switch to a real domain before contacting real people.
- [ ] 0.12 A custom domain with `app.` and `api.` subdomains, so the session cookie can be `SameSite=Lax` (see Phase 3 and 12). Without one, cookies need `SameSite=None; Secure`, which some browsers block.
- [x] 0.13 Apify token and actors: already picked, accessible through the MCP.
- [x] 0.14 Anthropic API key: done.
- Dropped: the Google Cloud project, consent screen, OAuth client, and Gmail API (0.10 in the old plan), since nothing uses Google any more.

**Settled after follow-up:**
- Holidays (non-business days, besides weekends): 2026-11-26, 2026-11-27, 2026-12-24, 2026-12-25, 2026-12-31, 2027-01-01, 2027-01-18. Keep them in a config list that is easy to extend.
- Waiting period after the breakup email: 3 business days.
- Variant tags are dropped, so the "variant" input to drafting is dropped too unless you say otherwise.

## Working across two repos

- The backend publishes an OpenAPI spec at `/openapi.json`. The frontend generates its API types from it (for example `openapi-typescript`), so the two repos share a contract and no code.
- Each phase below lists **Needs from backend**. Build the UI for a phase only after the matching backend endpoints are ready.
- Both repos build from a Dockerfile and deploy to Railway as separate services, alongside a Railway Postgres service.

## Phase 1: Project skeleton

- [x] 1.1 Init the repo with a `.gitignore` and `.env.example` (`VITE_API_URL`).
- [x] 1.2 Scaffold Vite + React + TypeScript, Tailwind, shadcn/ui init.
- [ ] 1.3 Call the backend's health endpoint for real: on the starter page, fetch `GET ${VITE_API_URL}/health` and show the result on screen ("Backend connected" with the response body, or the error message and URL it tried). This confirms the frontend reaches the running backend, including CORS and the env var. It can later become a small connection indicator in the app shell.
- [ ] 1.4 Add React Router with an app shell (nav) and placeholder routes: Today, Week, Companies, Contacts.
- [ ] 1.5 Add TanStack Query and a typed API client wrapper, with types generated from the backend's OpenAPI spec. The wrapper uses `credentials: "include"` and uses the same session cookie as the auth client (no custom CSRF header is needed with Better Auth).

**Needs from backend:** `/health` and `/openapi.json` (BE Phase 1).
**Done when:** the page shows "Backend connected" from the real `/health` response, and the shell runs locally with routing, the query client, and generated API types.

## Phase 2: Database and schema

Backend only. Nothing to build in the frontend. See `backend-implementation-plan.md`.

## Phase 3: Authentication

The backend runs Better Auth (mounted at `/api/auth/*`), and the frontend uses the Better Auth React client (`better-auth/react`). The browser just keeps the session cookie.

- [ ] 3.1 Login page with email and password, calling `authClient.signIn.email`. Show a clear error for wrong credentials and for rate limiting (`X-Retry-After`).
- [ ] 3.2 Session state from `authClient.useSession()`, with a protected-route wrapper that redirects to login.
- [ ] 3.3 Logout button calling `authClient.signOut()`.
- [ ] 3.4 Handle expired or deleted sessions with a redirect to login that remembers the page to return to. The per-request 401 hook is added with the API wrapper in 1.5.

**Needs from backend:** `/api/auth/sign-in/email`, `/api/auth/get-session`, `/api/auth/sign-out`, `requireAuth` on data routes, CORS with credentials for the frontend origin, `trustedOrigins` (BE Phase 3). The admin user comes from `npm run seed:admin` in the backend.
**Done when:** you can log in, reach a protected page, stay logged in after a refresh, log out, and the API refuses everything else.

## Phase 4: Companies and contacts CRUD

- [ ] 4.1 Companies list with status filter and search.
- [ ] 4.2 Company detail page with its contacts. (Company details done; contacts pending a backend endpoint.)
- [ ] 4.3 Forms to create and edit companies and contacts, with delete confirmation.
- [ ] 4.4 Archive action with a confirmation that explains the cascade.

**Needs from backend:** companies and contacts routes, archive cascade (BE Phase 4).
**Done when:** you can manage companies and contacts by hand, and archiving behaves as the scope describes.

## Phase 5: Enrichment

- [ ] 5.1 "Create company from LinkedIn URL", showing an "enriching" state and updating when done (poll via TanStack Query).
- [ ] 5.2 "Find contacts" action on a company, with a review list to pick which to keep.
- [ ] 5.3 Surface failed or timed-out runs with a retry button.

**Needs from backend:** enrichment routes and webhook (BE Phase 5).
**Done when:** pasting a LinkedIn URL produces an enriched company, and contacts can be pulled in and chosen.

## Phase 6: Sequence controls

The sequence logic lives in the backend. The frontend only triggers it.

- [ ] 6.1 "Start sequence" action on a contact (disabled with an explanation if the company already has an `in_sequence` contact).
- [ ] 6.2 Complete, skip, `wont_do`, "mark engaged", and "asked not to be contacted" actions on a follow-up or contact.
- [ ] 6.3 Show sequence status on the contact page: current step, next due date, and the waiting period after the breakup email.

**Needs from backend:** sequence engine and routes (BE Phase 6).
**Done when:** a sequence can be driven end to end from the UI.

## Phase 7: Message drafting

- [ ] 7.1 Settings page to edit your experience summary.
- [ ] 7.2 Job post text field on the company or contact.
- [ ] 7.3 Draft editor component: generate, edit, regenerate, with a live word and character counter showing the 20–39 word and 200 character limits. Edits are saved on the follow-up, since the draft lives in the app.

**Needs from backend:** settings, generate-draft, and save-draft routes (BE Phase 7).
**Done when:** each step type produces a reviewable draft in the editor.

## Phase 8: Sending email with SendGrid

SendGrid has no drafts, so the reviewed draft stays in the app and is sent only when you click send.

- [ ] 8.1 "Send email" button on email tasks, with a confirmation showing the recipient, subject, and body. Disable it until the draft is within the word limit.
- [ ] 8.2 After sending, show the sent state (time, recipient) and mark the task complete, which counts toward the 10/day goal.
- [ ] 8.3 "Copy message" button for LinkedIn steps.
- [ ] 8.4 Surface send failures (SendGrid rejection, unverified sender, bad address) with a retry that does not double-send. A task already sent shows as sent and cannot be sent again.

**Needs from backend:** send-email route with SendGrid, threading headers for follow-ups, and the sent-message record (BE Phase 8).
**Done when:** a reviewed email is sent from the app, follow-ups thread under the original message, and the task shows as sent.

## Phase 9: Daily task view

- [ ] 9.1 Today page showing one task at a time: contact, company, step, channel, draft editor, and action buttons.
- [ ] 9.2 Progress indicator toward the 10-email goal.
- [ ] 9.3 "Next" button that completes the task and loads the following one; skip and `wont_do` actions.
- [ ] 9.4 Empty state when everything is done, and a prompt when no enriched contacts remain.
- [ ] 9.5 Weekends: the Today view points to the Week view.

**Needs from backend:** next-task and complete-task routes (BE Phase 9).
**Done when:** a full weekday can be worked through the Today view without leaving the app, other than sending LinkedIn requests and calling.

## Phase 10: Weekly planning view

- [ ] 10.1 Week page with a column or row per day showing follow-ups and the shortfall.
- [ ] 10.2 List of companies needing a new contact, with an inline picker to select one and start the sequence.
- [ ] 10.3 Link from a shortfall to the enrichment flow.
- [ ] 10.4 Start a sequence for a chosen future date from this view.

**Needs from backend:** weekly planning routes (BE Phase 10).
**Done when:** on the weekend you can see exactly what is missing for each day next week and fix it from the page.

## Phase 11: Activity logging

- [ ] 11.1 Activity timeline on the contact and company pages. Emails sent through SendGrid appear automatically.
- [ ] 11.2 "Log inbound" and "Log outbound" actions with channel and notes. Replies arrive in your own mailbox, so inbound is logged by hand.
- [ ] 11.3 Logging an inbound reply prompts the move to `engaged`.
- [ ] 11.4 An `engaged` contact stays loggable, with the status visible.

**Needs from backend:** activity routes (BE Phase 11).
**Done when:** every interaction, automatic or manual, shows up in the history.

## Phase 12: Deploy to Railway

- [ ] 12.1 Add a multi-stage `Dockerfile` that builds the Vite app and serves `dist` with a static server (nginx or `serve -s dist`), with a fallback to `index.html` so deep links work. Check it locally with `docker build` and `docker run`.
- [ ] 12.2 Create the Railway `web` service from this repo, using the Dockerfile. Set the build-time variable `VITE_API_URL` to the API's URL (for example `https://api.example.com`).
- [ ] 12.3 Attach the custom domain (`app.` subdomain) to `web`, and make sure the backend's cookie domain and allowed origin match it.
- [ ] 12.4 Give the deployed frontend URL to the backend as its allowed CORS origin (credentials enabled).
- [ ] 12.5 Add security headers to the static server config (nginx `add_header`, or `serve.json` if using `serve`): `Content-Security-Policy: default-src 'self'; connect-src 'self' <API origin>; img-src 'self' data:; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. Check the browser console for CSP violations after deploying. Also confirm `VITE_API_URL` is `https://`.
- [ ] 12.6 Smoke test in production: log in, reload and stay logged in, create a company, draft an email, send it with SendGrid, complete a task.

**Needs from backend:** the deployed API and Postgres (BE Phase 12).
**Done when:** you can run a real day of outreach from the deployed app.

## Phase 13: Polish

- [ ] 13.1 Review loading, error, and empty states on every page.
- [ ] 13.2 Keyboard shortcuts on the Today view (next, skip, copy).
- [ ] 13.3 Mobile-friendly layout check for the Today view.
- [ ] 13.4 Write a short README: setup, environment variables, Docker and deploy steps.
- [ ] 13.5 Run a week of real outreach and list what to fix.

## Suggested order and checkpoints

- Build the backend first, phase by phase. Start each frontend phase once the matching backend endpoints are ready. Frontend Phase 1 only needs the backend's OpenAPI spec.
- Phases 0 to 4 give you a working CRM with login. This is a useful point to stop and use it.
- Phases 5 to 7 add the automation. Backend Phase 6 is the riskiest piece, so test it before building the UI on top.
- Phase 8 is the first phase that sends real email. Test it with `parredondo2724@gmail.com` before using real contacts.
- Phases 9 to 11 deliver the daily workflow in the V1 success criteria.
- Phases 12 and 13 can start earlier. Deploying after Phase 3 is cheap and catches environment problems sooner, especially cookie behavior across the `app.` and `api.` domains.
