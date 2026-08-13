# Ratewise — Ontario Auto Insurance Comparison

Ratewise is a coverage-first Ontario private-passenger auto insurance comparison prototype. It collects a search profile, calls a local Python collector, and presents evidence-backed route outcomes without crossing purchase boundaries.

> **Safety notice:** The current Rates.ca adapter reads only public, published recent-quote evidence. It does not submit the entered identity, request a callback, accept declarations, bypass access controls, or express purchase intent. Public samples are not applicant-specific quotes.

## Current Features

- Five-step driver, vehicle, driving-history, coverage, and consent intake
- Responsive desktop and mobile experience
- Public sample, blocked, and unresolved route outcomes
- Coverage differences, provider identity, evidence, and confidence display
- Coverage ledger with market-completion metrics
- Live Python/Playwright Rates.ca public-evidence collector
- Replaceable frontend and Python `QuoteProvider` adapter contracts

## Prerequisites

Install the following software before running or deploying the application:

- [Node.js](https://nodejs.org/) 22.13.0 or later
- npm, which is included with Node.js
- Git, if the source will be cloned or deployed through source control

Confirm the installed versions:

```bash
node --version
npm --version
git --version
```

## 1. Install the Application

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd Auto_InsruanceI_Info_Sys
```

Install the exact dependency versions recorded in `package-lock.json`:

```bash
npm ci
```

Use `npm install` instead only when intentionally updating dependencies.

## 2. Start the Python Quote Collector

Create and activate an isolated Python environment on Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m playwright install chromium
python -m uvicorn backend.app.main:app --reload --port 8010
```

The API health endpoint is `http://localhost:8010/health`. Keep this terminal open. The Rates.ca adapter executes JavaScript with Playwright Chromium and reads public recent-quote evidence only. It does not submit an invented identity, request a callback, accept declarations, bypass access controls, or express purchase intent.

Rates.ca may block automated browsers with Cloudflare. When that happens, the API returns an evidence-backed `blocked` result; it does not attempt to evade the control or substitute fictional rates.

## 3. Run the Development Server

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. The default address is:

```text
http://localhost:3000/
```

The page refreshes automatically when source files are changed. Stop the server with `Ctrl+C`.

If port 3000 is already in use, start the site on another port:

```bash
npm run dev -- --port 3001
```

Then open `http://localhost:3001/`.

## 4. Validate the Application

Run the code-quality checks:

```bash
npm run lint
.\.venv\Scripts\python.exe -m pytest backend\tests -q
```

Create a production build:

```bash
npm run build
```

The build must finish successfully before deployment. The generated deployment files are written to `dist/` and should not be edited manually.

## 5. Run the Production Build Locally

After `npm run build` succeeds, start the production server:

```bash
npm run start
```

Open the URL printed in the terminal, normally `http://localhost:3000/`. This mode serves the compiled application and is the closest local check to the hosted deployment.

Stop the production server with `Ctrl+C`.

## 6. Deploy Privately with OpenAI Sites

This repository is configured for OpenAI Sites through `.openai/hosting.json`. The existing Sites project should be reused; do not create another project for routine updates.

The Python/Playwright collector is a separate local service and is not hosted by the current Sites deployment. A production release of the live collector requires a Python-capable server or container and an explicit `NEXT_PUBLIC_QUOTE_API_URL` pointing to that HTTPS API. Until then, use the two-process local setup above.

### Deploy from Codex

1. Open this repository as the active workspace in Codex.
2. Confirm that `npm ci`, `npm run lint`, and `npm run build` complete successfully.
3. Commit the exact source version that should be deployed.
4. Ask Codex: `Deploy this website privately with Sites.`
5. Codex will upload the committed source, package the validated build, save a new site version, and request a private deployment.
6. Wait until Codex reports that the deployment succeeded.
7. Open the production URL returned by Codex and sign in with the authorized owner account when prompted.

The current private deployment is available at:

[https://ratewise-ontario-auto.guanwwjiam.chatgpt.site](https://ratewise-ontario-auto.guanwwjiam.chatgpt.site)

### Deploy an Update

For subsequent releases:

1. Make and review the required source changes.
2. Run:

   ```bash
   npm ci
   npm run lint
   npm run build
   ```

3. Commit the validated changes:

   ```bash
   git add .
   git commit -m "Describe the deployment update"
   ```

4. Ask Codex to deploy the updated website privately with Sites.
5. Verify that Codex reports a successful deployment and returns the production URL.

Do not place hosting credentials, repository write tokens, API keys, or generated deployment archives in source control. Sites manages its hosting resources and credentials during deployment.

## Environment Variables

The current demo does not require environment variables or external API keys. When real insurance-provider adapters are added:

1. Document every required variable in `.env.example` without real secret values.
2. Keep local secrets in `.env.local`.
3. Configure hosted secrets through Sites rather than committing them to Git.
4. Never expose provider credentials in client-side code, browser logs, screenshots, or saved evidence.

## Connecting Real Quote Providers

The demo data is supplied through the `QuoteProvider` interface in `app/services/quotes.ts`. A real integration should implement the same interface and preserve the normalized `Quote` response schema.

Before enabling a real adapter:

- Verify that the route permits the proposed access method.
- Add route-level user consent and field-disclosure preview.
- Keep sensitive values in a protected server-side store.
- Stop at identity checks, declarations, CAPTCHAs, advice, payment, and purchase boundaries.
- Redact evidence before saving it.
- Keep estimates separate from exact quotes.

## Troubleshooting

### Dependencies fail to install

Confirm that Node.js 22.13.0 or later is active, remove no lockfile, and retry:

```bash
npm ci
```

### The local port is unavailable

Use another port:

```bash
npm run dev -- --port 3001
```

### A production deployment shows an older version

Confirm that the latest changes were committed before asking Codex to deploy. Sites versions are tied to a specific committed source revision.

### The hosted site requires sign-in

The deployment is intentionally private. Sign in with the account authorized as the site owner. Changing the site to shared or public access is a separate security decision and should be approved explicitly.

## Project Structure

```text
app/
  layout.tsx            Site metadata and social preview configuration
  page.tsx              Intake and quote-comparison user interface
  globals.css           Responsive visual design
  services/quotes.ts    Replaceable quote provider and demo data
public/
  og.png                Social sharing preview image
.openai/hosting.json    Sites project and resource configuration
design.md               System architecture and safety design
requirement_doc.md      Product requirements
```

## Documentation

- [Requirements](requirement_doc.md)
- [System design](design.md)
