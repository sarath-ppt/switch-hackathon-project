# Incident triage: checkout 500s (2026-10-30)

## Symptom
`POST /checkout` returns 500 `{"error":"internal error"}` for some customers. Reported as starting "this morning".

## Evidence
From `demo-app/logs/app.log` (3 of 6 logged checkout requests failed, all with the same stack):

```
2026-10-28T09:21:33.014Z ERROR POST /checkout 500 TypeError: Cannot read properties of undefined (reading 'trim') | at discountRate (demo-app/checkout.js:13:23) | at total (demo-app/checkout.js:18:41) | at IncomingMessage.<anonymous> (demo-app/server.js:32:22)
2026-10-28T09:21:58.430Z ERROR POST /checkout 500 (same stack)
2026-10-28T09:24:49.761Z ERROR POST /checkout 500 (same stack)
```

Reproduced with `node --test` from `demo-app/`: 3 pass, 1 fail. `total works without a coupon` (`test/checkout.test.js:24`) fails with the same TypeError at `checkout.js:13:23`.

## Root cause
`demo-app/checkout.js:13`: `discountRate` calls `coupon.trim()` without checking that a coupon was sent. `server.js:31` passes `coupon` straight from the request body, so an order with no `coupon` field throws, and the catch at `server.js:35` turns that into a 500.

## Severity
SEV2: customers checking out without a coupon cannot complete payment. Orders with a coupon, valid or unknown, still work.

## Gaps
- The log ends on 2026-10-28 09:24 and has no entries from today, so today's 500s are not directly confirmed as this error. It may not be the log from the affected service.
- The start time is unexplained. The only commit touching `demo-app/` is the initial setup (`91653ae`), so no change explains an onset this morning.
- Request bodies are not logged. "No coupon" is inferred from the `undefined` in the stack and confirmed by the reproduction.

## Suggested fix
In `discountRate`, treat a non-string coupon as no discount before trimming:

```js
if (typeof coupon !== "string") return 0;
```

This also covers `coupon: null`, which would fail the same way. The existing failing test covers the missing case; add one for `null`.
