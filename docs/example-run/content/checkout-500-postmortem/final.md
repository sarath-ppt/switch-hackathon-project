# Checkout returned 500 when no coupon was sent: a postmortem of a planted bug

## Summary

This was not a real customer outage. It was a bug planted in a demo service for the Switch hackathon, and no real customers were affected.

In the demo service, `POST /checkout` returned a 500 error for orders sent without a coupon, because the discount code assumed a coupon was always present. A one-line check fixed it, and the fix was merged on 2026-10-30.

## What happened

The triage report and issue #1 treated the bug as a live SEV2, and it went through triage, a fix, review and merge.

The sequence on 2026-10-30, in UTC:

- **10:19:** triage report last saved, with the root cause (a file time, so approximate)
- **10:20:** fix authored
- **10:29:** issue #1 opened
- **10:35:** PR #2 opened
- **10:41 to 10:43:** code review, security review and verdict last saved (also file times)
- **10:51:** PR #2 merged, and issue #1 closed automatically

Issue #1 was open for 22 minutes. That measures the time from issue open to close, not the length of an outage, because there was no real outage to measure.

## Impact

There was no real customer impact. The SEV2 rating came from the triage report, which reasoned that checkout without a coupon could not complete payment, while orders with a coupon, valid or unknown, still worked.

## Root cause

`discountRate` called `coupon.trim()` without checking that a coupon had been sent. The server passed `coupon` straight from the request body, so an order with no `coupon` field threw a TypeError, and the error handler turned that into a 500 with `{"error":"internal error"}`. `coupon: null` failed the same way.

Request bodies are not logged, so "no coupon" was an inference during triage. A reproduction backed it up: running `node --test` gave the same TypeError in the failing test, `total works without a coupon`.

## Fix

PR #2 added one line to `discountRate`, plus a new test for `null`:

```js
if (typeof coupon !== "string") return 0;
```

A non-string coupon now means no discount. Tests went from 3 of 5 passing to 5 of 5.

Code review found no blocking issues. It called `total` directly with a 50.00 cart: missing, `null`, `0`, `123`, `{}`, `[]` and `""` coupons all gave 50, and `"  save10 "` gave 45. Security review found that the PR adds no security issues. The verdict was approve, with one docs follow-up.

The server was not started in any of the three reviews, so the fix has not been exercised over HTTP. The PR has no CI checks, and we found no record of the fix being deployed.

## What we learned

**Validate optional input where it is used.** The failure came from a missing check on an optional field.

**Test over HTTP.** No test covers `POST /checkout` over HTTP, so nothing exercises the path from request body to response.

**Closing an issue is not the same as confirming a fix.** Issue #1 closed automatically on merge, before the fix had been exercised over HTTP.

Review also surfaced existing issues that the PR did not cause, none of which has a ticket yet:

- **HIGH:** clients set their own prices, including negative ones. This only matters if the total is charged, which the repo does not show.
- **MEDIUM:** there is no request body size limit (found by reading code, not load-tested).
- **MEDIUM:** bad totals, such as a non-numeric price or an overflow, return 200 with `{"total":null}`.
- **LOW:** client input can reach the logs, and each request does a synchronous log write.
- **Not rated:** malformed `items` returns 500 where 400 is right.
- **Docs:** `README.md:88` and `docs/setup.md:120` still say "planted bug", which is out of date now that the bug is fixed.
