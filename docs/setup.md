# Setup

How to reproduce this project locally with Switch and Mattermost. Nothing
needs to be publicly reachable, and no cloud admin account is needed.

## 1. Prerequisites

| Tool | Check |
|---|---|
| Git | `git --version` |
| Docker Desktop (running) | `docker info` |
| uv | `uv --version` |
| just | `just --version` (install: `uv tool install rust-just`) |
| Node.js 22+ | `node --version` |
| Claude Code (provider for all agents) | `claude --version` |
| GitHub CLI, signed in (agents open and read PRs) | `gh auth status` |
| Switch Console | [Windows installer](https://github.com/sandbox-quantum/switch/releases/latest/download/switch-console-x64.exe) · [all releases](https://github.com/sandbox-quantum/switch/releases/latest) |

## 2. Run a Switch server with Mattermost

Choose **one** option.

### Option A: let Switch Console run it (simplest)

In Switch Console: **Add a server → Run a server on this computer**, and keep
**Also run Mattermost** on (needs Docker running). Switch Console sets up the
server and Mattermost, connects them, and signs you in.

To get the Mattermost login, go to the server's **Home → Messaging apps**,
open the Mattermost row, and choose **Sign-in details…**.

### Option B: run Switch from source

```bash
git clone https://github.com/sandbox-quantum/switch.git
cd switch

# Windows only: keep LF line endings, or switch-core fails to start
git config core.autocrlf false
git config core.eol lf
git rm -r --cached -q . && git reset -q --hard HEAD

just init-env           # writes .env with random secrets
uv sync --project core  # Python dependencies
just up                 # Postgres + Mattermost in Docker
just migrate            # database tables
just run                # switch-core on http://localhost:8000
```

In a second terminal, run the dashboard (optional):

```bash
cd gateway && npm ci && npm run dev   # http://localhost:5173
```

The stack's `setup` container registers Mattermost with Switch on its own
once switch-core is up. Its log ends with `Setup complete!`.

| What | Where | Login (values in the Switch `.env`) |
|---|---|---|
| Switch API | http://localhost:8000 | |
| Switch dashboard | http://localhost:5173 | `GATEWAY_ADMIN_EMAIL` / `GATEWAY_ADMIN_PASSWORD` |
| Mattermost | http://localhost:8065 | `MATTERMOST_USER` / `MATTERMOST_USER_PASSWORD` (admin: `MATTERMOST_ADMIN_USER` / `MATTERMOST_ADMIN_PASSWORD`) |

Health check: `curl http://127.0.0.1:8000/health/ready` should report
`"status":"ready"`.

In Switch Console, choose **Add a server → Connect to an existing server** with
Gateway URL `http://localhost:5173` and API URL `http://localhost:8000`.

## 3. Link your Mattermost account

In Switch Console: server **Home → Messaging apps → Mattermost → Link**. Search
for your Mattermost user and select **This is me**.

Without this, an agent set to answer **Only me** treats you as a stranger and
refuses.

## 4. Register the agents

There are seven agents: `triage`, `fixer`, `reviewer`, `security`,
`researcher`, `writer`, `editor`. For each folder in `agents/`: Switch
Console → **Your Agents → +**.

| Field | Value |
|---|---|
| Run location | This computer |
| Agent provider | As listed in the agent's `AGENT.md` |
| Directory | The working directory listed in the agent's `AGENT.md` |
| Name | As listed in the agent's `AGENT.md` (lowercase, `provider.job.owner`) |
| Description | As listed in the agent's `AGENT.md` |
| Agent instructions | The **Instructions** section of the agent's `AGENT.md` |
| Who can talk to your agent | **Only me and my agents** (agents hand work to each other), or **Anyone** for a team demo |

## 5. Create the rooms

Create three rooms, one per file in `rooms/`: `incident-desk`, `pr-review`,
`content-studio`. For each: Switch Console → **Your Rooms → Create room**:

- **Messaging app:** Mattermost
- **Name / Description:** as in the room's file
- **Add an agent:** the agents listed in the room's file
- **Instructions:** paste the **Instructions** section of the room's file

Then run the `!set-alias` commands from the room's file in its channel so the
agents can mention each other as `@triage`, `@fixer` and so on.

Switch creates the Mattermost channel. Each agent appears in it as its own bot
account. To add an agent later, type this in the channel (it must be the first
thing in the message):

```text
!invite-agent @agent-name
```

## 6. Try it

Open Mattermost and run the three workflows in order. With Switch Console's
built-in server, Mattermost runs on its own port (see `ports.json` in
`%APPDATA%\switchdash\local-switch-server\`, e.g. http://localhost:63064), not 8065.

Agents only see messages that mention them, including replies in a thread.
Full names (`@claude-code.fixer.sarath`) always work; the short aliases work
once `!set-alias` has been run in the room.

**Prepare:** once the bug has been fixed on `main`, put it back first (see
[Reset the demo](#reset-the-demo)). Open a GitHub issue for the bug so the
fix has a ticket, e.g. `gh issue create --title "Checkout returns 500 when no coupon is sent"`.

**`incident-desk`**: checkout without a coupon returns 500. Send:

```text
@claude-code.triage.sarath checkout returns 500 for some customers since this morning
```

Expect triage → fixer → reviewer. When fixer asks to open a PR, reply in its thread:

```text
@claude-code.fixer.sarath yes, ticket GH-<issue>. Put "Fixes #<issue>" in the PR description.
```

**`pr-review`**: paste the PR link fixer posted:

```text
@claude-code.reviewer.sarath please review <PR link>
```

Expect reviewer → security → editor and a combined verdict. Sign off in editor's
thread, then merge the PR on GitHub yourself; agents never merge.

**`content-studio`**:

```text
@claude-code.researcher.sarath write a postmortem for the checkout 500 incident (issue #<issue>, PR #<pr>) as a blog post
```

Expect researcher → writer → editor, then approve `content/<slug>/final.md`.

The output of a full run is in [`docs/example-run/`](example-run/).

### Reset the demo

Fixing the bug removes it from `main`. To run the demo again:

```bash
node tools/reset-demo.js
git commit -am "<ticket>: Reset demo" && git push
```

The script restores the bug from the `demo-start` tag, writes a log with errors
from this morning, and clears `reviews/` and `content/`. Push it so new PRs
target the buggy code.

The agents should reply in their channels. Keep Switch Console open: it starts an
agent session whenever an agent is addressed and none is running.

## Useful room commands

| Command | Does |
|---|---|
| `!help` | List every command |
| `!list-agents` | Agents in this room |
| `!agents-status` | Presence and capabilities |
| `!invite-agent @agent-name` | Add a registered agent |
| `!set-alias @long.agent.name @short` | Short handle in this room |
| `!reset @agent-name` | Reset an agent's session |
| `!interrupt @agent-name` | Stop the agent's current turn |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Agent says it only takes instructions from its owner | Link your Mattermost account (step 3) |
| Agent says no session is connected | Open Switch Console; it starts sessions on demand |
| Agent never replies | Check the `@name` is exact; `!list-agents` shows who is in the room |
| `switch-core` fails with `SKILL.md needs frontmatter` (Windows) | Fix line endings (step 2, Option B) |
| `switch-core` fails with `ConnectionRefusedError` | Docker containers stopped: `just up`, then `just run` |
