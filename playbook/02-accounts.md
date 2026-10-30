# 2. Accounts and sign-ups

Use **personal** accounts everywhere. On Oct 30, Tailscale was first signed in
with the work account `devrel@pptcorporation.com`, which put the PC on the
company network. That had to be undone.

## 2.1 Everyone

| Account | Why | Notes |
|---|---|---|
| GitHub | Repo access | Accept Sarath's collaborator invite (step 3) |
| Tailscale | Private network to Sarath's PC | Sign in with a personal Google, GitHub or Microsoft account |
| WeMakeDevs + Discord | Hackathon registration and help | https://www.wemakedevs.org/hackathons/switch |

## 2.2 Host only (Sarath)

### GitHub CLI login

```powershell
gh auth login
```

Choose **GitHub.com → HTTPS → Login with a web browser**.

**Check:** `gh auth status` shows `Logged in to github.com account sarath-ppt`.

Also run this once, so plain `git push` uses the same login and stops printing
`'credential-manager-core' is not a git command`:

```powershell
gh auth setup-git
```

### Claude Code login

```powershell
claude
```

Inside Claude Code, type `/login`, sign in with the Claude account that has the
Pro or Max plan, then `/exit`.

**Check:** running `claude` again opens without asking to log in.

### Tailscale sign-in

1. Open Tailscale from the Start menu and click **Log in**.
2. Sign in with **sarathsaimanikanta@gmail.com**, not a work account.
3. If it asks *"What's your primary reason for using Tailscale?"*, pick
   **Application testing**. It is only a survey.
4. If it asks about plans, choose **Personal / Free**.

**Check:**

```powershell
tailscale status
```

The first line shows this PC and `sarathsaimanikanta@`. If it shows another
account, log out from the Tailscale tray icon and sign in again.

### Git identity for the new repo

The practice commits used the work email `sarathbolisetty@processpoint.ai`.
For the hackathon repo, set a personal email in step 3, **inside the repo** (not
globally).

## 2.3 No sign-up needed

- **Mattermost:** Switch Console creates Sarath's account; Sarath creates the
  teammates' accounts in step 7.
- **Docker:** signing in is optional.
