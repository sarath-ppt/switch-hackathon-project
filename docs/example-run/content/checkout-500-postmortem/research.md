# Research: checkout 500 incident postmortem

Format requested: blog post. Postmortems in this room are blameless.
All times are UTC. Git and file times shown locally as +0530 were converted.

## Read this first

- **This may be a demo incident.** `README.md:88` and `docs/setup.md:120` describe `demo-app/` as having "a planted bug" where checkout without a coupon returns 500. The triage report and issue #1 treat it as a live SEV2. See open question 1. Do not imply real customer impact until it is answered.
- **The incident has no confirmed start time.** The log shows errors on 2026-10-28. The triage report says the problem was reported as starting "this morning" on 2026-10-30. Nothing links the two.
- **The fix is merged, but nothing shows it deployed or working in production.**

## Key facts

### Symptom and impact
- `POST /checkout` returned 500 `{"error":"internal error"}` for some customers. (`reviews/incident-2026-10-30-triage.md`)
- Rated SEV2: customers checking out without a coupon could not complete payment. Orders with a coupon, valid or unknown, still worked. (triage report)
- In the available log, 3 of 6 checkout requests failed, all with the same stack. (`demo-app/logs/app.log`)
- No figures exist for customers affected, failed orders or lost revenue. Do not extrapolate the 3 of 6 to overall traffic: it is a sample of 6 requests in under 10 minutes.

### Root cause
- `discountRate` at `demo-app/checkout.js:13` called `coupon.trim()` without checking that a coupon was sent. (triage report)
- `server.js:31` passed `coupon` straight from the request body, so an order with no `coupon` field threw a TypeError, and the catch at `server.js:35` turned it into a 500. (triage report)
- `coupon: null` failed the same way. (triage report; commit `5e46c6a`)
- "No coupon" is inferred, because request bodies are not logged. It rests on the `undefined` in the stack and on the reproduction. (triage report)
- Reproduced with `node --test` in `demo-app/`: 3 passed, 1 failed (`total works without a coupon`), with the same TypeError at `checkout.js:13:23`. (triage report)

### Fix
- One line in `discountRate`, plus one new test for `null` (5 insertions across 2 files). (commit `5e46c6a`)

```js
if (typeof coupon !== "string") return 0;
```

- A non-string coupon now means no discount. (PR #2)
- Tests went from 3 of 5 passing before the fix to 5 of 5 after. (PR #2) The 3 of 5 count includes the new `null` test, which is why it differs from the triage report's 3 of 4.
- Re-run during this research on current `main`: 5 of 5 pass.

### Review
- Code review: no blocking issues. Called `total` directly with a 50.00 cart: missing, `null`, `0`, `123`, `{}`, `[]` and `""` all gave 50; `"  save10 "` gave 45. (`reviews/pr-2-code.md`)
- Security review: the PR adds no security issues. (`reviews/pr-2-security.md`)
- Verdict: APPROVE, with one docs follow-up. (`reviews/pr-2-verdict.md`)
- The PR has no CI checks. (verdict; `gh pr view 2` shows an empty status rollup)
- These reviews are files in the repo. GitHub shows no formal reviews on PR #2. (`gh pr view 2`)
- The server was not started in any of the three reviews, so the fix has not been exercised over HTTP. (verdict)

### Follow-ups surfaced by review (all pre-existing, not caused by the PR)
| Severity | Issue | Source |
|---|---|---|
| HIGH | Client sets its own prices, including negative ones. Only matters if the total is charged, which the repo does not show | `pr-2-security.md` |
| MEDIUM | No request body size limit. Found by reading code, not load-tested | `pr-2-security.md` |
| MEDIUM | Bad totals (non-numeric price, overflow) return 200 with `{"total":null}` | `pr-2-security.md`, `pr-2-code.md` |
| LOW | Client input can reach the logs; synchronous log write on each request | `pr-2-security.md` |
| Not rated | Malformed `items` returns 500 where 400 is right | `pr-2-code.md` |
| Not rated | No test covers `POST /checkout` over HTTP | `pr-2-code.md` |
| Docs | `README.md:88` and `docs/setup.md:120` go stale once the bug is fixed | `pr-2-verdict.md` |

As of this research, issue #1 is the only issue in the repo, so none of these has a ticket yet. (`gh issue list --state all`) These lines are still unchanged on `main`: both docs still say "planted bug". (grep of the repo)

## Timeline

| Time (UTC) | Event | Source | Confidence |
|---|---|---|---|
| 2026-10-28 09:14:02 | Service start logged | `app.log` | Log |
| 2026-10-28 09:21:33 | **First error**: 500, TypeError at `checkout.js:13:23` | `app.log` | Log |
| 2026-10-28 09:21:58 | Second 500 | `app.log` | Log |
| 2026-10-28 09:24:49 | Third 500, last log entry | `app.log` | Log |
| 2026-10-30, "this morning" | **Detection**: 500s reported. No exact time or reporter on record | triage report | Vague |
| 2026-10-30 10:19:11 | **Root cause**: triage report last saved | file modified time | Approximate |
| 2026-10-30 10:20:13 | **Fix** authored | commit `5e46c6a` author date | Git |
| 2026-10-30 10:29:13 | Issue #1 opened | GitHub | Exact |
| 2026-10-30 10:35:34 | Fix commit finalised | commit `5e46c6a` committer date | Git |
| 2026-10-30 10:35:48 | PR #2 opened | GitHub | Exact |
| 2026-10-30 10:41:36 | **Review**: code review last saved | file modified time | Approximate |
| 2026-10-30 10:42:34 | Security review last saved | file modified time | Approximate |
| 2026-10-30 10:43:37 | Verdict last saved: APPROVE | file modified time | Approximate |
| 2026-10-30 10:51:14 | **Merge**: PR #2 merged as `0fd6da9` | GitHub | Exact |
| 2026-10-30 10:51:16 | Issue #1 closed by `Fixes #1` | GitHub | Exact |

### Durations
- Issue opened to issue closed: 22m 03s.
- PR opened to merged: 15m 26s.
- Triage report saved to merge: about 32 minutes (uses a file time).
- First logged error to merge: about 2 days 1.5 hours, but only if the 2026-10-28 errors are the same incident. See open question 2.
- Time to detect and time to deploy cannot be stated.

### Oddities in the timeline
- The fix was authored about 9 minutes before the issue was opened. The issue was not the trigger for the fix.
- The log is dated 2026-10-28 but first appears in git in `91653ae` on 2026-10-29 13:19:01 UTC, the commit that set up the repo. So the errors predate the repo's only earlier commit, and the bug was present from that first commit. No commit explains an onset on 2026-10-30. (triage report; `git log`)

## Sources

Files, all in this repo:
- `reviews/incident-2026-10-30-triage.md`
- `reviews/pr-2-code.md`, `reviews/pr-2-security.md`, `reviews/pr-2-verdict.md`
- `demo-app/logs/app.log`
- `README.md:88`, `docs/setup.md:120`

Git and GitHub:
- Fix commit `5e46c6a`, branch `fix/checkout-missing-coupon`
- Merge commit `0fd6da9`
- GitHub issue #1 and PR #2 in the `sarath-ppt` repo (`gh issue view 1`, `gh pr view 2`, issue timeline API)

Not available:
- The `incident-desk` and `pr-review` room histories. This agent is not a member of either, so the original report and hand-offs were not read.
- `reviews/` files are untracked in git, so their times come from the filesystem and could change if the files are touched.

## Open questions

For the human:
1. **Real incident or demo?** The docs call this a planted bug. Should the post say it is a demo exercise? Without that, the SEV2 customer impact could read as a real outage.
2. **When did it start?** Were the 2026-10-28 errors the same incident as the 2026-10-30 reports, and is that log from the affected service? The triage report flags that it may not be.
3. **Who reported it, when and how?** Needed for time to detect. It may be in the `incident-desk` room.
4. **Was the fix deployed, and did the 500s stop?** The verdict asked for today's logs to be checked after deploying. No record of this was found. Issue #1 closed automatically on merge, before that check.
5. **Why did it surface on 2026-10-30?** The triage report found no change that explains the onset. For example, did a client stop sending the `coupon` field?
6. **Is there any impact data?** Affected customers or failed orders, if any exist.

For the writer:
- Keep to the facts above, and state gaps as gaps. Do not write "resolved in production" or "fixed in 22 minutes" without the caveat: 22 minutes is issue open to close, not outage duration.
- Blameless: describe the missing input check and the absent HTTP test, not the people involved.
