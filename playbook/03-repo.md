# 3. New GitHub repo (Nov 4)

Sarath does this on Nov 4, after 12:01 AM IST. Use **Git Bash** for the
commands in this file (Start menu → Git Bash).

The new repo is called `opsrelay` here. If you pick another name, replace it
everywhere below.

## 3.1 Create the repo and a tracking issue

```bash
gh repo create sarath-ppt/opsrelay --public \
  --description "OpsRelay: incident desk, PR review squad and content studio as AI agent rooms on Switch + Mattermost"

gh issue create --repo sarath-ppt/opsrelay \
  --title "Build OpsRelay for Flip the Switch" \
  --body "Tracking issue for the hackathon build: Switch setup, 7 agents, 3 rooms, demo, video and README."
```

The issue becomes **#1**. Setup commits use the ticket prefix `GH-1:`.

**Check:** https://github.com/sarath-ppt/opsrelay exists and has issue #1.

## 3.2 Copy the starter files from the practice repo

Existing agents and libraries are allowed, so we reuse the agent and room
instruction files and the demo app. The Switch setup and the workflow run are
done fresh in steps 4–8.

```bash
OLD=/c/Projects/switch-hackathon-project
NEW=/c/Projects/opsrelay

mkdir -p "$NEW" && cd "$NEW"
git init -b main

# Agents, rooms, tools, docs and config from the practice repo's main branch
git -C "$OLD" archive main agents rooms tools docs/setup.md docs/screenshots \
  reviews/.gitkeep content/.gitkeep .gitignore .env.example README.md | tar -x

# The demo app WITH the coupon bug, from the demo-start tag
git -C "$OLD" archive demo-start demo-app | tar -x
```

Do **not** copy `docs/example-run/` or `playbook/`. They belong to the practice
run.

**Check:** the bug is there: one test fails.

```bash
cd demo-app && node --test 2>&1 | grep -E '^# (pass|fail)'; cd ..
```

Expected: `# pass 3` and `# fail 1`.

## 3.3 Fix references to the practice run

Open these in VS Code and edit by hand:

| File | Change |
|---|---|
| `README.md` | Delete the `docs/example-run/` row in **Repository layout**. Leave the TODOs (demo video, team, license) for step 9. |
| `docs/setup.md` | Delete the line `The output of a full run is in [docs/example-run/](example-run/).` |

Point the agent files at the new folder (they still say
`C:\Projects\switch-hackathon-project`):

```bash
sed -i 's/switch-hackathon-project/opsrelay/g' agents/*/AGENT.md
grep -h "Directory" agents/*/AGENT.md
```

**Check:** all 7 lines show `C:\Projects\opsrelay`.

## 3.4 Personal git identity, first commit, tag

```bash
git config user.name "sarath-ppt"
git config user.email "224564348+sarath-ppt@users.noreply.github.com"

git add -A
git commit -m "GH-1: Set up OpsRelay agents, rooms and demo app

- Add 7 Claude Code agent definitions and 3 room instructions
- Add demo-app checkout service with the planted coupon bug
- Add reset-demo tool and setup guide"

# Bookmark the buggy starting point; tools/reset-demo.js needs this tag
git tag -a demo-start -m "Demo starting point: checkout coupon bug planted"

git remote add origin https://github.com/sarath-ppt/opsrelay.git
git push -u origin main
git push origin demo-start
```

The `noreply` email hides the personal address on GitHub and still links commits
to `sarath-ppt`.

**Check:**

```bash
git log --format='%h %an <%ae> %ad' -1
git ls-remote --tags origin
```

The commit shows the noreply email and a Nov date, and `refs/tags/demo-start`
is listed.

## 3.5 Personal working branch

```bash
git checkout -b sarath-dev
git push -u origin sarath-dev
git checkout main
```

Agents work on `main` and `fix/*` branches. `sarath-dev` is for our own changes
(README, docs) and goes to `main` through a PR.

## 3.6 Invite teammates

```bash
for u in Niranjan70957 koushik192211914; do
  gh api -X PUT repos/sarath-ppt/opsrelay/collaborators/$u -f permission=push \
    --jq '"\(.invitee.login): invited (\(.permissions))"'
done
```

Teammates accept at https://github.com/sarath-ppt/opsrelay/invitations.

**Check:**

```bash
gh api repos/sarath-ppt/opsrelay/collaborators --jq '.[].login'
```

After they accept, all three usernames are listed.
