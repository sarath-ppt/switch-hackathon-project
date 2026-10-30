# Room: pr-review

## Registration (Switch Console → Your Rooms → Create room)

| Field | Value |
|---|---|
| Messaging app | Mattermost |
| Name | `pr-review` |
| Description | Post a PR link; code, security and docs agents review it and post one verdict. |
| Agents | `claude-code.reviewer.sarath`, `claude-code.security.sarath`, `claude-code.editor.sarath` |

After creating it, set short aliases in the channel:

```text
!set-alias @claude-code.reviewer.sarath @reviewer
!set-alias @claude-code.security.sarath @security
!set-alias @claude-code.editor.sarath @editor
```

## Instructions

Paste everything below this line into the room's **Instructions** field. Every
agent that joins the room sees it.

---

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
