# 8. Run the demo workflow

The full run takes about 30 minutes: bug report → fix → PR → three reviews →
merge → postmortem. Do one practice run first, then a recorded run (step 9).

Each person has a part, so the video shows a team working with agents:

| Part | Person |
|---|---|
| Reports the bug, starts the postmortem | Koushik |
| Files the GitHub issue, posts the PR for review | Niranjan |
| Approves the PR, merges, approves the post | Sarath |

## 8.1 Before you start

- Sarath's PC: Docker Desktop, **Switch Console** and Tailscale are running. Switch
  Console starts an agent session whenever an agent is addressed.
- Repo on `main`, up to date, with the bug present:

  ```bash
  cd /c/Projects/opsrelay
  git checkout main && git pull
  (cd demo-app && node --test 2>&1 | grep -E '^# (pass|fail)')
  ```

  Expected: `# pass 3`, `# fail 1`. If all 5 pass, the bug was already fixed:
  see [8.9 Run it again](#89-run-it-again).
- The log has errors from **this morning**. If its dates are old, run
  `node tools/reset-demo.js` (8.9) first.
- Agents were reset after the access test (step 7.8).

Rules for every message:

- Start with the agent's **full name**: `@claude-code.<role>.sarath`.
- Replying in a thread also needs the mention. A plain "yes" reaches nobody.

## 8.2 incident-desk: report the bug (Koushik)

```text
@claude-code.triage.sarath checkout returns 500 for some customers since this morning
```

Expect within about 2 minutes:

1. triage: root cause at `demo-app/checkout.js:13` (`coupon.trim()` with no
   coupon), SEV2, report in `reviews/incident-<date>-triage.md`, hands off to fixer.
2. fixer: branch `fix/...`, one-line guard plus a `null` test, 5 of 5 tests pass,
   hands off to reviewer.
3. reviewer: **APPROVED**.
4. fixer asks: **"Approve to open a PR? (yes/no)"**, plus the ticket number.

## 8.3 File the GitHub issue (Niranjan)

While the agents work, create the issue for the bug. Use triage's findings:

```bash
gh issue create --repo sarath-ppt/opsrelay \
  --title "Checkout returns 500 when no coupon is sent" \
  --body "POST /checkout returns 500 for orders without a coupon. Root cause: discountRate in demo-app/checkout.js:13 calls coupon.trim() without checking that a coupon was sent. Found by the triage agent in incident-desk."
```

Note its number (#2 if the tracking issue is #1). Below it's written `<issue>`.

## 8.4 Approve the PR (Sarath)

Reply **in fixer's thread**:

```text
@claude-code.fixer.sarath yes, ticket GH-<issue>. Put "Fixes #<issue>" in the PR description.
```

fixer pushes the branch, opens the PR and posts its link.

**Check:**

```bash
gh pr list --repo sarath-ppt/opsrelay
gh pr view <pr> --repo sarath-ppt/opsrelay --json title,baseRefName,closingIssuesReferences \
  --jq '{title, base: .baseRefName, closes: [.closingIssuesReferences[].number]}'
```

The PR targets `main`, the title starts with `GH-<issue>`, and `closes` lists the
issue.

## 8.5 pr-review: three reviews (Niranjan)

```text
@claude-code.reviewer.sarath please review <PR link>
```

Expect within about 3 minutes: reviewer → security → editor. Each writes
`reviews/pr-<pr>-code.md`, `-security.md` and `-verdict.md`. editor posts
**APPROVE** and asks **"Merge PR <pr>? (yes/no)"**.

## 8.6 Sign off and merge (Sarath)

Reply in editor's thread:

```text
@claude-code.editor.sarath yes, approved. I'm merging PR <pr> now.
```

Agents never merge. Merge it yourself:

```bash
cd /c/Projects/opsrelay
gh pr merge <pr> --merge --delete-branch
```

This also switches the local repo back to `main` with the fix.

**Check:**

```bash
gh pr view <pr> --json state --jq .state      # MERGED
gh issue view <issue> --json state --jq .state  # CLOSED
git branch --show-current                       # main
```

## 8.7 content-studio: postmortem (Koushik, then Sarath)

Koushik:

```text
@claude-code.researcher.sarath write a postmortem for the checkout 500 incident (issue #<issue>, PR #<pr>) as a blog post. This was a planted bug in a demo service for the Switch hackathon, not a real customer outage; say so in the opening.
```

Saying "planted bug" up front avoids the question researcher asked on Oct 30.

Expect researcher → writer → editor, and editor asks to approve
`content/<slug>/final.md`. Read it, then Sarath replies in editor's thread:

```text
@claude-code.editor.sarath yes, approved.
```

## 8.8 Keep the output

The agents' files are not committed. Save them on `sarath-dev` and merge through
a PR:

```bash
cd /c/Projects/opsrelay
git checkout sarath-dev && git merge --ff-only main
git add reviews content
git commit -m "GH-1: Add agent output from the demo run"
git push
gh pr create --base main --head sarath-dev --fill
```

## 8.9 Run it again

After a merge, the bug is gone from `main`. To repeat the demo (for example, for a
cleaner recording):

```bash
cd /c/Projects/opsrelay
git checkout main && git pull
node tools/reset-demo.js
git commit -am "GH-1: Reset demo" && git push
```

The script restores the bug from the `demo-start` tag, writes a log with errors
from this morning, and clears `reviews/` and `content/`. Move any output you want
to keep (8.8) before running it. Then `!reset` all 7 agents (step 7.8) so they
don't remember the earlier run, and start again from 8.2 with a new issue.

## Screenshots to take during the run

Save them in `docs/screenshots/` for the README:

| File | What |
|---|---|
| `incident-desk.png` | triage → fixer → reviewer thread, with fixer's approval question |
| `pr-review.png` | the three reviews and editor's verdict |
| `content-studio.png` | the postmortem hand-offs and editor's approval question |
| `github-pr.png` | the merged PR with "Fixes #<issue>" and the closed issue |
| `switch-console.png` | Your Agents list with all 7 agents |
| `agent-rules.png` | one agent's two custom rules |
