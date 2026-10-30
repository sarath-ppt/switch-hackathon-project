# PR 2 verdict: GH-1 Fix checkout 500 when no coupon is sent

Reviewed commit: `5e46c6a`. Base: `main`.

**Verdict: APPROVE.** The fix is correct and adds no security issues. One docs follow-up should be picked up after merge, and the existing issues below need their own tickets.

GitHub reports the PR as mergeable. It has no CI checks. `node --test` from `demo-app/` passes 5 of 5 on this commit.

## Top findings

### Code review: no blocking issues
- The one-line guard fixes the root cause and is the smallest safe change.
- Nothing tests `POST /checkout` over HTTP, so the original 500 path through `server.js` has no test. Not blocking.
- A malformed `items` value still returns 500 where a 400 would be right. Existing, not caused by this PR.

### Security review: no findings in this PR
Existing issues to track separately:
- HIGH: the client sets its own prices, including negative ones (`demo-app/checkout.js:9`, `demo-app/server.js:31`). This only matters if the total is charged, which this repo does not show.
- MEDIUM: no request body size limit (`demo-app/server.js:28`). Found by reading the code, not load-tested.
- MEDIUM: bad totals, such as a non-numeric price, return 200 with `{"total":null}` (`demo-app/server.js:34`). The code review flagged this too.
- LOW: client input can reach the logs (`demo-app/server.js:36`), and each request does a synchronous log write (`demo-app/server.js:13`).

### Docs review: one follow-up, not blocking
- **Stale after merge:** `README.md:88` and `docs/setup.md:120` say the demo app has a planted bug where checkout without a coupon returns 500. Once this merges, that is no longer true on `main`, so the `incident-desk` step in `docs/setup.md` will not reproduce the bug. Either reword both lines or tell readers how to bring the bug back for a demo.
- **Code comments:** still accurate. The guard needs no comment, and the file and test headers are unchanged and correct.
- **Changelog:** the repo has none, so nothing needs updating.
- **API docs:** none exist, so the new handling of non-string coupons has nothing to contradict.

## Still open after merge
- Check today's logs after deploying. The available log ends on 2026-10-28, so today's 500s are not directly confirmed as this bug.
- Merging closes issue #1 through `Fixes #1`, before that log check happens. Reopen it if the 500s continue.

## Not checked
The server was not started in any of the three reviews, so the fix has not been exercised over HTTP.
