# 0. Before Nov 4

Do these on any day before the hackathon. None of them builds the project, so
they are allowed before the start.

## 0.1 Keep the host PC awake

Sarath's PC runs Switch, Mattermost and all 7 agents. If it sleeps, the agents
stop and teammates lose Mattermost.

1. Windows **Settings → System → Power → Screen, sleep and hibernate timeouts**.
2. Set **When plugged in, put my device to sleep after** to **Never**.
3. Keep the laptop plugged in during the event.

## 0.2 Make VS Code ask before pushing

On Oct 30 VS Code pushed commits on its own, because `git.confirmSync` was
`false`. Turn the prompt back on:

1. VS Code: **File → Preferences → Settings**, search `confirmSync`.
2. Tick **Git: Confirm Sync**.

**Check:** `%APPDATA%\Code\User\settings.json` contains `"git.confirmSync": true`
(or no `confirmSync` line at all).

## 0.3 Stop the old from-source Switch stack

An older Switch, built from source in `C:\Projects\Switch Project`, runs its own
Mattermost on port 8065. It is easy to confuse with the real one.

```powershell
cd "C:\Projects\Switch Project"
docker compose down
```

**Check:** `docker ps` no longer lists `switchproject-*` containers.

## 0.4 Remove the practice agents and rooms from Switch

The new build must start from an empty Switch.

1. Switch Console → **Your Rooms** → open each of `incident-desk`, `pr-review`,
   `content-studio` → delete it (look in its **⋯** menu or settings).
2. Switch Console → **Your Agents** → delete the 7 `claude-code.*.sarath` agents.
   Keep `switch-buddy-admin`; Switch created it.
3. In Mattermost, the old channels may stay. Archive them as `admin` if they are
   still listed: open the channel → channel name menu → **Archive Channel**.

If Switch refuses to reuse a deleted agent's name on Nov 4, add a suffix, for
example `claude-code.triage.sarath2`, and use the same suffix everywhere.

## 0.5 Decide what happens to the practice repo

`sarath-ppt/switch-hackathon-project` is public and dated Oct 29–30. It must not
be the submission. Either:

- make it private: GitHub → repo **Settings → General → Danger Zone → Change
  visibility**, or
- leave it, and only ever link the new Nov 4 repo.

Keep a local copy either way: step 3 copies starter files from it.

## 0.6 Check Claude usage limits

All 7 agents run Claude Code on Sarath's Claude account. A full run uses a lot of
requests. Check that the plan (Pro or Max) has headroom on Nov 4, and avoid other
heavy Claude Code use that day.

## 0.7 Join the hackathon channels

- Register for **Flip the Switch** on https://www.wemakedevs.org/hackathons/switch
  (all three of us).
- Join the WeMakeDevs **Discord**. Questions during the event go there.
