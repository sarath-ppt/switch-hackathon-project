# Troubleshooting

Every problem below happened during the Oct 29–30 practice run.

## Switch and Mattermost

| Symptom | Cause | Fix |
|---|---|---|
| Nothing answers on `localhost:8000` / `8065` | Switch Console uses its own ports | Read `%APPDATA%\switchdash\local-switch-server\ports.json` (step 4.2) |
| Two Mattermosts (8065 and 63064) | The old from-source stack is still running | `docker compose down` in `C:\Projects\Switch Project` (step 0.3) |
| Log: `Mattermost post /users/search failed: Invalid or expired session` | Mattermost was still starting | Ignore if it happens once at startup |
| Log: `Bridge ... crashed` with `RemoteDisconnected` | Switch Console restarted and the bridge lost Mattermost | It restarts itself within about 10 seconds; check health is `ready` |
| Log: `... is a member of no room` | Startup ordering | Ignore if rooms are created a few seconds later |
| Mattermost asks for a login | — | Switch Console → Home → Messaging apps → Mattermost → **Sign-in details…** Don't create a new account |

## Agents

| Symptom | Cause | Fix |
|---|---|---|
| Add agent does nothing; no `Registered agent` in the log | Form not submitted | Fill Name and Description, scroll down, click **Add agent** |
| "Claude Code is not installed or its selected executable cannot be found" | Model list can't be read | Install the native build (`claude install`) and restart Switch Console. If the tile says **Ready**, the warning is harmless |
| Agent can't see `demo-app/` | Directory left on the default | Agent settings → **Directory** → `C:\Projects\opsrelay` |
| `Enabled 'can manage agents'` in the log | Toggle switched on | Turn **Can manage agents** off and save |
| Agent doesn't reply to a "yes" | Message didn't mention it | Start with `@claude-code.<role>.sarath`, even in a thread |
| "I only take instructions from my owner, and this chat account isn't linked to a Switch user" | Sender isn't allowed | Step 7.7: Rule 2 for teammates. For Sarath: link the account (step 4.5) and check Rule 1 exists |
| "No session is connected" | Switch Console closed | Open Switch Console; it starts sessions on demand |
| Agents keep asking for a ticket number or print "Commit message:" | Old room instructions, or your global `CLAUDE.md` | Use the room instructions from step 6, then `!reset` the agents |
| After a reset, an agent states something outdated (e.g. "PR still open") | It rebuilds context from the room history | It usually corrects itself. For a clean demo, use fresh threads |
| Agents warn that the log has no errors from "this morning" | Log dates are old | `node tools/reset-demo.js` before the run |

## Tailscale and teammates

| Symptom | Cause | Fix |
|---|---|---|
| Tailnet shows `pptcorporation.com` | Signed in with the work account | Tray icon → **Log out**, sign in with the personal account |
| Teammate doesn't appear in `tailscale status` | App not installed, not signed in, or a different email | Same email for the share link and the app; app shows **Connected** |
| `http://<IP>/` gives 404 | `tailscale serve` matches the name | Use `http://sarath-ppt.<tailnet>.ts.net` |
| Page loads but messages don't update; `URL Blocked because of CORS` | Mattermost only trusts `localhost:63064` | Step 7.5 (`AllowCorsFrom`) |
| Teammate's message reaches nobody | Not a member of the channel | Step 7.6 channel commands |

## Git and GitHub

| Symptom | Cause | Fix |
|---|---|---|
| `'credential-manager-core' is not a git command` | Old git credential setting | `gh auth setup-git` (the push still works) |
| Commits pushed without asking | VS Code `git.confirmSync` is false | Step 0.2 |
| `Tag "demo-start" not found` from `reset-demo.js` | Tag not pushed or not fetched | `git push origin demo-start`, or `git fetch --tags` |
| Commits show the work email | Global git email | Set `user.email` inside the repo (step 3.4) |

## Useful commands

```powershell
# Switch health (replace the port with yours)
(Invoke-WebRequest http://127.0.0.1:63063/health/ready -UseBasicParsing).Content

# Last 30 server log lines
Get-Content "$env:APPDATA\switchdash\local-switch-server\native\logs\switch-core.log" -Tail 30

# Errors only
Select-String -Path "$env:APPDATA\switchdash\local-switch-server\native\logs\switch-core.log" -Pattern 'ERROR' |
  Select-Object -Last 10

# Containers
docker ps --format '{{.Names}}  {{.Status}}  {{.Ports}}'
```

In Mattermost: `!help`, `!list-agents`, `!agents-status`, `!reset @agent`,
`!interrupt @agent`.
