# 9. Video, README and submission

**Deadline: Nov 7, 11:59 PM IST.** Aim to submit on Nov 7 afternoon.

## How we are judged

| Criterion | What the judges look for | How we show it |
|---|---|---|
| Use of Switch | Switch is central | 3 rooms, 7 agents, hand-offs between agents, per-agent permission rules, humans approving every important step |
| Technical execution | It can be reproduced | `docs/setup.md`, `tools/reset-demo.js`, a clean run from a fresh clone |
| Creativity and impact | Useful and original | Bug → fix → reviewed PR → postmortem with no human writing code |
| Presentation | Demo video and README | Short, clear video; README with screenshots and diagram |

Our track: **Best Business Workflow** ($2,000).

## 9.1 Demo video (2–3 minutes)

Record with OBS or the Windows Snipping Tool (screen recording). Arrange
Mattermost and the GitHub PR side by side.

| Time | Show | Say |
|---|---|---|
| 0:00–0:15 | Title card | "When production breaks, small teams juggle fixing, reviewing and writing it up. OpsRelay hands that to seven agents, with people approving every step." |
| 0:15–0:30 | Mattermost with the 3 rooms, Switch Console agent list | "Each room is a Switch room. Each agent is its own Mattermost bot." |
| 0:30–1:10 | incident-desk: Koushik reports, triage → fixer → reviewer | Root cause found, tested fix, review, the approval question |
| 1:10–1:20 | Sarath replies "yes"; PR appears on GitHub | "Nothing ships without a human yes." |
| 1:20–1:50 | pr-review: reviewer → security → editor, verdict | Three reviews, one verdict |
| 1:50–2:05 | Merge on GitHub, issue closes | |
| 2:05–2:30 | content-studio: postmortem written and approved | |
| 2:30–2:50 | Agent permission rules, Tailscale teammates | "Switch decides who may instruct which agent." |
| 2:50–3:00 | Repo link | |

Speed up waiting parts (2× or cuts). Upload to YouTube (unlisted) or Loom and put
the link in the README.

## 9.2 README checklist

Work on `sarath-dev`, then PR to `main`.

- [ ] One-line pitch at the top (already in the README).
- [ ] Demo video link (replace `TODO: [▶ Watch the demo](<video link>)`).
- [ ] Screenshots from step 8 in `docs/screenshots/`, shown in **How it works**.
- [ ] `docs/architecture.png`: a diagram of the 3 rooms, Switch server, Switch
      Console and humans.
- [ ] A results table: time from report to merged fix, tests before/after,
      review findings, with links to the issue, PR and postmortem.
- [ ] **Why Switch is central**: rooms, bots, hand-offs, permission rules,
      approvals (already in the README; add screenshots).
- [ ] **Team** section: names, roles, GitHub links.
- [ ] **License**: add an MIT `LICENSE` file and update the README line.
- [ ] Check every link from a private browser window.

## 9.3 Side prizes (enter all of them)

| Prize | What to do | Who |
|---|---|---|
| Best Blog (AirPods) | Publish a post on how we built OpsRelay (dev.to, Hashnode or Medium); link the repo and video | |
| #HowISwitch posts (Logitech keyboards, top 5) | Each of us posts on X / LinkedIn with **#HowISwitch**, a screenshot or clip, and the repo link | everyone |
| Best Core Contribution ($100 per accepted PR, top 20) | Pick an issue labelled `hackathon` in https://github.com/sandbox-quantum/switch, get assigned first (comment and tag the maintainer), read `CONTRIBUTING.md`, sign the CLA, PR with `Closes #<n>` | |

Things we hit that may be worth an issue or PR to Switch:

- Switch Console couldn't use an npm-installed Claude Code (`claude.cmd`); only
  the native `claude.exe` worked.
- Using Mattermost from another address (Tailscale) needs `AllowCorsFrom`; this
  isn't documented.

## 9.4 Submit

- [ ] Repo `sarath-ppt/opsrelay` is **public**, and `main` has everything.
- [ ] README has the video link.
- [ ] Submit through the form on https://www.wemakedevs.org/hackathons/switch
      before **Nov 7, 11:59 PM IST**.
- [ ] Blog and social post links submitted for the side prizes.
