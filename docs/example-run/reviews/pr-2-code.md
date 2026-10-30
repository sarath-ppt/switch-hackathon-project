# PR 2 code review: GH-1 Fix checkout 500 when no coupon is sent

Reviewed commit: `5e46c6a`. Base: `main`.

**Result: no blocking issues.**

## Correctness
The fix addresses the root cause in `reviews/incident-2026-10-30-triage.md`: `discountRate` called `coupon.trim()` on a coupon that was never sent. The new guard runs before the trim and returns no discount for anything that is not a string.

Checked by calling `total` directly with a 50.00 cart:

| Coupon | Total |
|---|---|
| missing, `null`, `0`, `123`, `{}`, `[]`, `""` | 50 |
| `"  save10 "` | 45 |
| `"constructor"`, `"__proto__"`, `"toString"` | 50 |

Valid coupons still apply, and object property names do not act as coupons because codes are uppercased before the lookup.

## Tests
`node --test` from `demo-app/`: 5 of 5 pass on the PR head. The new `null` test and the existing no-coupon test both cover the bug.

Both tests call `total` directly. Nothing covers `POST /checkout` over HTTP, so the original 500 path through `server.js` has no test. This matches the existing tests and is not blocking.

## Edge cases (not blocking, not caused by this PR)
1. A malformed `items` value (missing, `null` or not an array) still throws, so the request returns 500 when it should be a 400.
2. A non-numeric price, such as `[{"price":"a","qty":1}]`, gives a `NaN` total. `server.js` then returns 200 with `{"total":null}`. This is the more serious of the two and deserves its own issue.
3. A non-string coupon such as `123` is silently treated as no coupon. That is reasonable here, but the client gets no signal that the value was ignored.

## Readability
One clear line, and the smallest safe change. No cleanup is needed.

## Still open
The PR notes that the log ends on 2026-10-28, so today's 500s are not confirmed as this error. The stack in the log matches the bug, but check today's logs after deploying.
