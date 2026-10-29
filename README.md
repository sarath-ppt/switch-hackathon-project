# OpsRelay

> From "checkout is broken" to a merged fix and a published postmortem: seven AI
> agents and the humans who approve their work, all in Mattermost.

Built for the **Flip the Switch Hackathon** (WeMakeDevs × DevTools Academy × Switch).
Track: Best Business Workflow

## Demo

TODO: [▶ Watch the demo](<video link>)

![Mattermost room](docs/screenshots/mattermost-room.png)

## The problem

When production breaks, a small team juggles three jobs at once: finding and
fixing the bug, getting the fix properly reviewed, and writing up what happened.
The review gets rushed and the postmortem never gets written. OpsRelay hands
each job to a team of agents and keeps people in charge of every decision that
matters.

## How it works

Three Switch rooms, each a Mattermost channel. Each one's output feeds the next.

**1. `#incident-desk`: bug → patch**

1. A person posts `@triage checkout returns 500 for some customers`.
2. `@triage` reads the logs and code, finds the root cause and hands off to `@fixer`.
3. `@fixer` patches it on a branch with a test and hands off to `@reviewer`.
4. `@reviewer` approves or sends it back.
5. The person says "yes"; `@fixer` opens a PR and posts the link.

**2. `#pr-review`: PR → verdict**

1. The person posts `@reviewer <PR link>`.
2. `@reviewer` checks code and tests, `@security` checks risks, and `@editor` checks docs.
3. `@editor` posts one combined verdict; the person signs off and merges.

**3. `#content-studio`: incident → postmortem**

1. The person posts `@researcher postmortem for the checkout incident, blog post`.
2. `@researcher` builds a timeline from the reports, git history and logs.
3. `@writer` drafts it and `@editor` polishes it.
4. The person approves the final post.

![Architecture](docs/architecture.png)

```
 #incident-desk          #pr-review              #content-studio
 triage → fixer →  PR →  reviewer → security →   researcher → writer →
 reviewer                editor (verdict)        editor (final)
      │                        │                       │
      └──── human approves ────┴──── human merges ─────┴── human approves

 Mattermost  ◄──►  Switch server (switch-core)  ◄──►  Switch Console
                   rooms, routing, permissions        runs the Claude Code agents
```

## Why Switch is central

- Each Mattermost channel **is** a Switch room: people and agents share one
  conversation and one context.
- Each of the seven agents has its own Mattermost bot account, created by Switch.
- Agents hand work to each other by mentioning one another in the room.
- `@reviewer` and `@editor` sit in two rooms each and play a different role in
  each one, as set by that room's instructions.
- Switch decides who may instruct which agent; only the owner can approve a PR
  or a merge.
- Without Switch, this would be seven separate terminal sessions with a person
  copying and pasting between them.

## Tech stack

- [Switch](https://github.com/sandbox-quantum/switch): agent orchestration
- Mattermost: team chat (runs locally next to Switch)
- Claude Code: provider for all seven agents
- GitHub CLI (`gh`): agents open and read PRs
- Node.js: the demo checkout service (`demo-app/`)

## Repository layout

| Path | What it holds |
|---|---|
| `agents/` | One folder per agent; `AGENT.md` is pasted into Switch Console's **Agent instructions** |
| `rooms/` | One file per room; its Instructions section is pasted into the room's **Instructions** field |
| `demo-app/` | Small checkout service with a planted bug, its logs and tests |
| `reviews/` | Triage reports, PR reviews and verdicts written by agents |
| `content/` | Research, drafts and final posts written by agents |
| `tools/` | Scripts / MCP servers the agents call |
| `docs/setup.md` | Full setup to reproduce the demo |

## Setup

See **[docs/setup.md](docs/setup.md)**. In short:

1. Run a Switch server with Mattermost.
2. Install Switch Console and connect it to the server.
3. Register the seven agents in `agents/`.
4. Create the three rooms in `rooms/`.
5. In `#incident-desk`, try: `@triage checkout returns 500 for some customers`.

## Team

- TODO: name, role

## License

TODO: choose a license (e.g. MIT) and add a `LICENSE` file.
