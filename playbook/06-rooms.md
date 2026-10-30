# 6. Create the 3 rooms

Sarath does this in Switch Console: **Your Rooms → Create room**, once per room.
Switch creates the Mattermost channel and adds each agent as its own bot.

These instructions already include the conventions we added after the practice
run: `GH-<n>` ticket prefixes, and no "Commit message:" lines at the end of agent
messages.

## Short names (aliases)

The `!set-alias` lines give agents short names like `@triage`. On Oct 30 we never
confirmed they worked, so **always use full names** (`@claude-code.triage.sarath`)
in messages. The agents also hand off with full names. Setting the aliases does
no harm.

## Check after each room

```powershell
Select-String -Path "$env:APPDATA\switchdash\local-switch-server\native\logs\switch-core.log" `
  -Pattern 'Created room (incident-desk|pr-review|content-studio)' | ForEach-Object { ($_.Line -split '\]  ?')[-1] }
```

Each room shows `with 3 agents and 1 system clients`. Then, in the room's
channel, send:

```text
!list-agents
```

The **Switch** bot lists exactly the 3 agents in the table.

---

## 6.1 incident-desk

| Field | Value |
|---|---|
| Messaging app | **Mattermost** |
| Name | `incident-desk` |
| Description | Report a bug or outage; agents triage it, patch it and review the patch. |
| Add agents | `claude-code.triage.sarath`, `claude-code.fixer.sarath`, `claude-code.reviewer.sarath` |

**Instructions**

```text
This room handles bugs and outages in the checkout service in `demo-app/`.

Flow:
1. A human reports a problem to @triage.
2. @triage finds the root cause and hands off to @fixer.
3. @fixer patches it on a `fix/*` branch with a test and hands off to @reviewer.
4. @reviewer approves or sends it back to @fixer.
5. A human approves; @fixer opens the PR and posts the link.
6. The human posts the PR link in `pr-review`.

Conventions:
- Reports and reviews go in `reviews/`. Code changes only in `demo-app/`.
- Keep channel messages short; link to files for detail.
- Only a human can approve opening a PR. Agents wait for an explicit "yes".
- Commits use the GitHub issue as the ticket prefix, `GH-<n>: ...`. @fixer asks for it once, in the PR approval question.
- Only @fixer commits. Do not end messages with a suggested commit message.

Before doing anything, read:
- `demo-app/logs/app.log`
- `demo-app/checkout.js` and `demo-app/test/`

Agents in this room should not:
- Commit to `main`, merge, or push without human approval.
- Touch files outside `demo-app/` and `reviews/`.
```

Then, in the new `incident-desk` channel in Mattermost, send each line as its own message:

```text
!set-alias @claude-code.triage.sarath @triage
!set-alias @claude-code.fixer.sarath @fixer
!set-alias @claude-code.reviewer.sarath @reviewer
```

## 6.2 pr-review

| Field | Value |
|---|---|
| Messaging app | **Mattermost** |
| Name | `pr-review` |
| Description | Post a PR link; code, security and docs agents review it and post one verdict. |
| Add agents | `claude-code.reviewer.sarath`, `claude-code.security.sarath`, `claude-code.editor.sarath` |

**Instructions**

```text
This room reviews pull requests before a human merges them.

Flow:
1. A human posts a PR link and mentions @reviewer.
2. @reviewer reviews code and tests, then hands off to @security.
3. @security reviews security risks, then hands off to @editor.
4. @editor checks docs and changelog and posts one combined verdict.
5. A human signs off and merges.

Conventions:
- Each reviewer writes to `reviews/pr-<number>-<role>.md`; the verdict goes in `reviews/pr-<number>-verdict.md`.
- Use `gh pr view` and `gh pr diff` to read PRs.
- Only a human merges.
- Agents here do not commit. Do not end messages with a suggested commit message or ask for a ticket number.

Agents in this room should not:
- Edit code, push, approve on GitHub, or merge.
```

Then, in the new `pr-review` channel in Mattermost, send each line as its own message:

```text
!set-alias @claude-code.reviewer.sarath @reviewer
!set-alias @claude-code.security.sarath @security
!set-alias @claude-code.editor.sarath @editor
```

## 6.3 content-studio

| Field | Value |
|---|---|
| Messaging app | **Mattermost** |
| Name | `content-studio` |
| Description | Post a topic; agents research it, write it and edit it for human approval. |
| Add agents | `claude-code.researcher.sarath`, `claude-code.writer.sarath`, `claude-code.editor.sarath` |

**Instructions**

```text
This room turns a topic into a finished blog post or thread. Typical topic: the
postmortem of an incident that went through `incident-desk` and `pr-review`.

Flow:
1. A human posts a topic and format to @researcher.
2. @researcher gathers facts and hands off to @writer.
3. @writer drafts and hands off to @editor.
4. @editor polishes it or sends it back to @writer.
5. A human approves the final version.

Conventions:
- Everything for one topic lives in `content/<slug>/`: `research.md`, `draft.md`, `final.md`.
- Every fact must trace back to `research.md`.
- Postmortems are blameless.
- Agents here do not commit. Do not end messages with a suggested commit message or ask for a ticket number.

Agents in this room should not:
- Publish or post content outside this repo.
- Edit code.
```

Then, in the new `content-studio` channel in Mattermost, send each line as its own message:

```text
!set-alias @claude-code.researcher.sarath @researcher
!set-alias @claude-code.writer.sarath @writer
!set-alias @claude-code.editor.sarath @editor
```

