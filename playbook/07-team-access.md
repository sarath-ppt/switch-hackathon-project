# 7. Team access: Tailscale, Mattermost, permissions

Mattermost and Switch only accept connections from Sarath's own PC (they listen on
`127.0.0.1`). Teammates reach them through **Tailscale**, a private network:
nothing is exposed to the internet.

Order matters: Tailscale → Mattermost address → Mattermost accounts → agent
permissions → test.

## 7.1 Host: confirm the personal Tailscale account

```powershell
tailscale status
tailscale status --json | ConvertFrom-Json | ForEach-Object { $_.CurrentTailnet.Name; $_.Self.DNSName }
```

**Check:** the tailnet is `sarathsaimanikanta@gmail.com`, not `pptcorporation.com`,
and the second line is this PC's address, e.g. `sarath-ppt.tail79d5c0.ts.net.`.
Write that address (without the final dot) into the table in [README.md](README.md).

## 7.2 Host: share this PC with the teammates

Use **Machines → Share**, not **Users → Invite**.

| | Users → Invite | Machines → Share ✅ |
|---|---|---|
| Teammates can reach | your whole tailnet | only this PC |
| Role to pick | Member (never Admin) | none |

1. Open https://login.tailscale.com/admin/machines.
2. Row **sarath-ppt** → **⋯** → **Share…**.
3. Enter `niranjanreddygoli1@gmail.com` and `jyothikoushik2005@gmail.com`, or
   **Copy share link** and send it privately to each of them.

Treat the share link like a password. You can revoke it on the same screen.

## 7.3 Teammates: join

Each teammate:

1. Installs Tailscale: https://tailscale.com/download.
2. Signs in to the app with **the same email** the share was sent to.
3. Opens the share link and accepts it.
4. Checks that the Tailscale app says **Connected** and lists **sarath-ppt**.

**Check (host):**

```powershell
$j = tailscale status --json | ConvertFrom-Json
$j.Peer.PSObject.Properties.Value | ForEach-Object {
  [pscustomobject]@{ Host = $_.HostName; Owner = $j.User.([string]$_.UserID).LoginName; Online = $_.Online }
}
```

Both teammates' laptops are listed as `Online`. On Oct 30 they were `Zebronics`
(Niranjan) and `PPT` (Koushik).

## 7.4 Host: put Mattermost on the tailnet

```powershell
tailscale serve --bg --http=80 http://127.0.0.1:63064
tailscale serve status
```

Plain HTTP is fine: Tailscale encrypts all traffic, and only the tailnet can
reach it. (HTTPS would need certificates enabled in the Tailscale admin.) The
setting survives reboots. To undo it: `tailscale serve --http=80 off`.

Teammates open **http://sarath-ppt.tail79d5c0.ts.net** (your address from 7.1).
Opening the raw IP gives 404, because `serve` matches the name.

## 7.5 Host: allow that address in Mattermost (CORS)

Without this, the page loads but live updates are blocked with
`URL Blocked because of CORS`, so messages don't appear until refresh.

```powershell
$mm = 'switchdash-local-mattermost-mattermost-1'
docker exec $mm /mattermost/bin/mmctl --local config set ServiceSettings.AllowCorsFrom "http://sarath-ppt.tail79d5c0.ts.net"
docker exec $mm /mattermost/bin/mmctl --local config get ServiceSettings.AllowCorsFrom
```

Do not change the Site URL (`http://localhost:63064`). The Switch bridge uses it.

**Check (Git Bash):** the live connection is accepted from the tailnet address
(`101`) and still refused from other sites (`403`):

```bash
T=http://sarath-ppt.tail79d5c0.ts.net
W='-H Connection:Upgrade -H Upgrade:websocket -H Sec-WebSocket-Version:13 -H Sec-WebSocket-Key:dGhlIHNhbXBsZSBub25jZQ=='
curl -s -o /dev/null -w "tailnet: %{http_code}\n" --max-time 3 $W -H "Origin: $T" $T/api/v4/websocket
curl -s -o /dev/null -w "other:   %{http_code}\n" --max-time 3 $W -H "Origin: http://evil.example" $T/api/v4/websocket
```

If Switch Console ever rebuilds Mattermost, this setting may reset. Run it again
if teammates' chats stop updating live.

## 7.6 Host: create the teammates' Mattermost accounts

If Mattermost kept its data from the practice run, `niranjan` and `koushik`
already exist. Then the create command says so, and the team and channel
commands are still needed for the new channels.

```powershell
$mm  = 'switchdash-local-mattermost-mattermost-1'
$out = "$env:USERPROFILE\Desktop\mattermost-teammates.txt"
$chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
$people = @(
  @{ u = 'niranjan'; e = 'niranjanreddygoli1@gmail.com'; f = 'Niranjan'; l = 'Reddy Goli' },
  @{ u = 'koushik';  e = 'jyothikoushik2005@gmail.com';  f = 'Koushik';  l = 'Simhadri' }
)
$lines = @()
foreach ($p in $people) {
  $pw = -join (1..14 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] }) + '#9'
  docker exec $mm /mattermost/bin/mmctl --local user create --username $p.u --email $p.e `
    --password $pw --firstname $p.f --lastname $p.l --email-verified
  docker exec $mm /mattermost/bin/mmctl --local team users add switch $p.u
  foreach ($c in 'incident-desk', 'pr-review', 'content-studio', 'town-square') {
    docker exec $mm /mattermost/bin/mmctl --local channel users add "switch:$c" $p.u
    "$($p.u) -> $c : exit $LASTEXITCODE"
  }
  $lines += "$($p.f): username $($p.u), temporary password $pw"
}
Set-Content $out $lines -Encoding utf8
"Passwords saved to $out"
```

`mmctl` prints nothing when a user is added to a channel. Exit code `0` means it
worked; a wrong username gives exit `1`.

If an account already existed, its password did not change. Reset it if needed:
`docker exec $mm /mattermost/bin/mmctl --local user change-password niranjan --password "<new>"`.

Send each teammate **only their own line**, privately. They sign in at
http://sarath-ppt.tail79d5c0.ts.net and change the password: **profile picture →
Profile → Security → Password**. Then delete the file:

```powershell
Remove-Item "$env:USERPROFILE\Desktop\mattermost-teammates.txt"
```

## 7.7 Host: let the agents accept teammates' messages

New agents only accept their owner and the owner's agents. Without this step,
agents reply *"I only take instructions from my owner, and this chat account isn't
linked to a Switch user yet"*.

For **each of the 7 agents**: Your Agents → open the agent → **Who can talk to your
agent** → **Custom rules**. Keep Rule 1 and **Add rule** for Rule 2:

| | Rooms | Room groups | Users | Agents | Switch itself |
|---|---|---|---|---|---|
| Rule 1 (keep) | any | any | Me (the agent's owner) | My agents (anyone I own) | ☐ |
| Rule 2 (add) | any | any | **Niranjan, Koushik** | **none** | ☐ |

- Leave **Switch itself** unchecked. It lets the platform message the agent on its
  own account, which we don't use.
- Don't leave Rule 2's **Agents** on "any": that would let anyone's agents in.
- A message is accepted when **either** rule allows it.

On Oct 30, triage once ended up with only Rule 2, so Sarath was locked out of his
own agent. Always check both rules are there.

**Check:**

```powershell
$latest = @{}
Select-String -Path "$env:APPDATA\switchdash\local-switch-server\native\logs\switch-core.log" `
  -Pattern 'Updated addressing policy for agent (\S+) \((\d+) rules?\)' | ForEach-Object {
    $m = $_.Matches[0]; $latest[$m.Groups[1].Value] = "$($m.Groups[2].Value) rule(s)  at $($_.Line.Substring(11,8))" }
$latest.GetEnumerator() | Sort-Object Name | Format-Table -AutoSize
```

All 7 agents show **2 rule(s)**. `0 rule(s)` means fully open (anyone); fix that
immediately.

## 7.8 Test access

Each person sends a hello to a different agent, mentioning it by full name:

| Who | Room | Message |
|---|---|---|
| Sarath | incident-desk | `@claude-code.triage.sarath hello, can you hear me?` |
| Niranjan | pr-review | `@claude-code.reviewer.sarath hello, can you hear me?` |
| Koushik | content-studio | `@claude-code.editor.sarath hello, can you hear me?` |

**Check:** each agent replies within about 10 seconds with "Yes, I can hear you".

Then clear the hello conversations from the agents' memory, so the demo starts
clean. In each room, send `!reset` for its agents, one message each:

```text
!reset @claude-code.triage.sarath
!reset @claude-code.fixer.sarath
!reset @claude-code.reviewer.sarath
!reset @claude-code.security.sarath
!reset @claude-code.editor.sarath
!reset @claude-code.researcher.sarath
!reset @claude-code.writer.sarath
```

Send each line in a room where that agent is a member.
