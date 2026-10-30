# Nov 4 playbook: rebuild OpsRelay during the hackathon

The Flip the Switch rules say the Switch setup and the agents' workflow must be
built during the hackathon (Nov 4, 12:01 AM IST to Nov 7, 11:59 PM IST). We
practised the whole thing on Oct 29–30. This playbook repeats it from scratch,
step by step, with every fix we needed the first time.

Follow the files in order. Each step ends with a **Check** so you know it worked
before moving on.

| # | File | Who | Time |
|---|---|---|---|
| 0 | [Before Nov 4](00-before-nov-4.md) | Sarath | 20 min, any day before |
| 1 | [Install software](01-install-software.md) | Everyone | 30 min |
| 2 | [Accounts and sign-ups](02-accounts.md) | Everyone | 15 min |
| 3 | [New GitHub repo](03-repo.md) | Sarath | 20 min |
| 4 | [Switch server and Mattermost](04-switch-server.md) | Sarath | 20 min |
| 5 | [Register the 7 agents](05-agents.md) | Sarath | 30 min |
| 6 | [Create the 3 rooms](06-rooms.md) | Sarath | 15 min |
| 7 | [Team access: Tailscale, Mattermost, permissions](07-team-access.md) | Sarath + teammates | 30 min |
| 8 | [Run the demo workflow](08-demo-run.md) | Everyone | 45 min |
| 9 | [Video, README and submission](09-submission.md) | Everyone | rest of the event |
| — | [Troubleshooting](troubleshooting.md) | — | when something breaks |

## The team

| Person | GitHub | Tailscale / email | Mattermost |
|---|---|---|---|
| Sarath Bolisetty (host: runs Switch on his PC) | `sarath-ppt` | sarathsaimanikanta@gmail.com | `sarath-ppt` |
| Niranjan Reddy Goli | `Niranjan70957` | niranjanreddygoli1@gmail.com | `niranjan` |
| Koushik Simhadri | `koushik192211914` | jyothikoushik2005@gmail.com | `koushik` |

## Nov 4 timeline

| Time (IST) | What |
|---|---|
| 12:01 AM or morning | Steps 3–6 (Sarath): new repo, Switch, agents, rooms |
| Same morning | Step 7: teammates join through Tailscale |
| Before noon | Step 8: first full run, take screenshots |
| Nov 5–6 | Polish: README, video, blog, social posts (step 9) |
| **Nov 7, before 11:59 PM** | **Submit.** Aim for Nov 7 afternoon, not the last hour. |

## Rules to remember

- Switch has to be central to the project.
- Team of up to 4. We are 3.
- AI tools are allowed if we understand and can explain what we submit.
- Work done before Nov 4 is practice. Do not submit the old repo
  `sarath-ppt/switch-hackathon-project`; it has Oct commit dates.

## Values that are different on every install

Some values come from the machine and will be different on Nov 4. Each step
shows where to find them. Fill this table in as you go:

| Value | Where it comes from | Oct practice value | Nov 4 value |
|---|---|---|---|
| Switch API port | `ports.json` (step 4) | 63063 | |
| Mattermost port | `ports.json` (step 4) | 63064 | |
| Tailscale address of Sarath's PC | `tailscale status` (step 7) | `sarath-ppt.tail79d5c0.ts.net` | |
| New repo name | step 3 | — | |
| GitHub issue number for the bug | step 8 | #1 | |
| PR number of the fix | step 8 | #2 | |
