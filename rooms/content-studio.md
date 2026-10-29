# Room: content-studio

## Registration (Switch Console → Your Rooms → Create room)

| Field | Value |
|---|---|
| Messaging app | Mattermost |
| Name | `content-studio` |
| Description | Post a topic; agents research it, write it and edit it for human approval. |
| Agents | `claude-code.researcher.sarath`, `claude-code.writer.sarath`, `claude-code.editor.sarath` |

After creating it, set short aliases in the channel:

```text
!set-alias @claude-code.researcher.sarath @researcher
!set-alias @claude-code.writer.sarath @writer
!set-alias @claude-code.editor.sarath @editor
```

## Instructions

Paste everything below this line into the room's **Instructions** field. Every
agent that joins the room sees it.

---

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

Agents in this room should not:
- Publish or post content outside this repo.
- Edit code.
