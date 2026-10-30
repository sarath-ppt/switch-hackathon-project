# 1. Install software

Run the commands in **Windows PowerShell**. After installing, close and reopen
PowerShell so new commands are found.

## 1.1 Host PC (Sarath)

| Tool | Install | Check |
|---|---|---|
| Git | `winget install --id Git.Git` | `git --version` |
| Docker Desktop | `winget install --id Docker.DockerDesktop`, then start it and wait for "Engine running" | `docker info` |
| Node.js 22 or newer | `winget install --id OpenJS.NodeJS.LTS` | `node --version` |
| GitHub CLI | `winget install --id GitHub.cli` | `gh --version` |
| Claude Code (native build) | `irm https://claude.ai/install.ps1 \| iex` | `claude --version` and `where.exe claude` |
| Tailscale | `winget install --id Tailscale.Tailscale` | `tailscale version` |
| Switch Console | see 1.2 | app opens |

### Claude Code must be the native build

Switch Console starts agents with the `claude` program. On Oct 30 it could not
use the npm version (`claude.cmd`) and showed *"Claude Code is not installed or
its selected executable cannot be found"*.

**Check:** `where.exe claude` prints
`C:\Users\Sarath\.local\bin\claude.exe`. If it prints an npm path instead, run
`claude install`, then check again.

### Docker Desktop

- Accept the WSL 2 setup if it asks, and restart Windows if it asks.
- Signing in to Docker is not needed.

## 1.2 Switch Console

1. Download the latest Windows installer with the GitHub CLI:

   ```powershell
   $dir = "$env:USERPROFILE\Downloads\switch-console-installer"
   New-Item -ItemType Directory -Force $dir | Out-Null
   gh release download --repo sandbox-quantum/switch --pattern 'switch-console-x64.exe' --dir $dir --clobber
   ```

   Or download `switch-console-x64.exe` from
   https://github.com/sandbox-quantum/switch/releases/latest.

2. Check it is signed by SandboxAQ, the company that makes Switch:

   ```powershell
   Get-AuthenticodeSignature "$env:USERPROFILE\Downloads\switch-console-installer\switch-console-x64.exe" |
     Select-Object Status, @{n='Signer';e={$_.SignerCertificate.Subject}}
   ```

   **Check:** `Status` is `Valid` and `Signer` starts with `CN=SandboxAQ`.

3. Double-click the installer and finish it.

If Switch Console is already installed from the practice run, open it and let it
update itself instead.

## 1.3 Teammates (Niranjan, Koushik)

| Tool | Install | Needed for |
|---|---|---|
| Tailscale | https://tailscale.com/download | Reaching Mattermost on Sarath's PC |
| A browser | Chrome or Edge | Mattermost |
| Git + GitHub CLI (optional) | same commands as above | Only if they push code or open PRs |

Teammates do **not** need Docker, Switch Console or Claude Code. Everything runs
on Sarath's PC.
