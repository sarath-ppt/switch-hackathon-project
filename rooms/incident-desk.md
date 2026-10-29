# Room: incident-desk

## Registration (Switch Console → Your Rooms → Create room)

| Field | Value |
|---|---|
| Messaging app | Mattermost |
| Name | `incident-desk` |
| Description | Report a bug or outage; agents triage it, patch it and review the patch. |
| Agents | `claude-code.triage.sarath`, `claude-code.fixer.sarath`, `claude-code.reviewer.sarath` |

After creating it, set short aliases in the channel:

```text
!set-alias @claude-code.triage.sarath @triage
!set-alias @claude-code.fixer.sarath @fixer
!set-alias @claude-code.reviewer.sarath @reviewer
```

## Instructions

Paste everything below this line into the room's **Instructions** field. Every
agent that joins the room sees it.

---

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

Before doing anything, read:
- `demo-app/logs/app.log`
- `demo-app/checkout.js` and `demo-app/test/`

Agents in this room should not:
- Commit to `main`, merge, or push without human approval.
- Touch files outside `demo-app/` and `reviews/`.
