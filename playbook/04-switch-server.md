# 4. Switch server and Mattermost

Sarath does this on Nov 4. Docker Desktop must be running first.

## 4.1 Start the server

If Switch Console still shows **Local Switch server** from the practice run (and
step 0.4 removed the old agents and rooms), skip to 4.2.

Otherwise, open Switch Console and go through onboarding:

1. **How do you want to run Switch?** → **On this computer** → **Continue**.
   (Switch Cloud is "coming soon". The choice is hard to change later.)
2. **Set up a server on this computer** → turn **Share anonymous usage data**
   off (optional, changes nothing) → **Start**.
3. Wait. The first run downloads PostgreSQL and the Mattermost Docker image, which
   takes a few minutes.

## 4.2 Find this install's ports

Switch Console picks its own ports. They are **not** the 8000 / 8065 in the
Switch docs. Read them:

```powershell
Get-Content "$env:APPDATA\switchdash\local-switch-server\ports.json"
```

Example from the practice run:

```json
{ "gateway": 63062, "api": 63063, "mattermost": 63064, "postgres": 63065 }
```

Write `api` and `mattermost` into the table in [README.md](README.md). The rest
of this playbook uses **63063** and **63064**; replace them if yours differ.

## 4.3 Check that everything is healthy

```powershell
$p = Get-Content "$env:APPDATA\switchdash\local-switch-server\ports.json" | ConvertFrom-Json
(Invoke-WebRequest "http://127.0.0.1:$($p.api)/health/ready" -UseBasicParsing).Content
(Invoke-WebRequest "http://127.0.0.1:$($p.mattermost)/api/v4/system/ping" -UseBasicParsing).StatusCode
docker ps --format '{{.Names}}  {{.Status}}'
```

**Check:**

- Health shows `"status":"ready"` and every check `"healthy":true`.
- Mattermost ping returns `200`.
- `switchdash-local-mattermost-mattermost-1` is `Up ... (healthy)`.

A one-off `Invalid or expired session` or `Bridge ... crashed` error in the log
right after start is normal: the bridge restarts itself within about 10 seconds.
See [troubleshooting](troubleshooting.md) if health is not `ready`.

## 4.4 Sign in to Mattermost

1. Switch Console → **Home** → **Messaging apps** → **Mattermost** row →
   **Sign-in details…**. It shows the username and password.
2. Open **http://localhost:63064** (your Mattermost port) and sign in.

Do not create a new Mattermost account for yourself. Only the account Switch
created is linked to Switch.

## 4.5 Link your Mattermost account to Switch

Switch Console → **Home → Messaging apps → Mattermost → Link** → search your
Mattermost user → **This is me**.

Without this, agents set to "Me and my agents" treat you as a stranger and refuse.

**Check:** in Mattermost, open the **Welcome** channel and send:

```text
!help
```

The **Switch** bot replies with a list of commands.

## Useful paths

| What | Where |
|---|---|
| Ports | `%APPDATA%\switchdash\local-switch-server\ports.json` |
| Server log | `%APPDATA%\switchdash\local-switch-server\native\logs\switch-core.log` |
| Agents' default folders (not used) | `%USERPROFILE%\.switch\agents\` |

Show the last server log lines:

```powershell
Get-Content "$env:APPDATA\switchdash\local-switch-server\native\logs\switch-core.log" -Tail 30
```
