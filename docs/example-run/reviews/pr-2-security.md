# PR 2 security review: GH-1 Fix checkout 500 when no coupon is sent

Reviewed commit: `5e46c6a`. Base: `main`.

**Result: this PR adds no security issues.** The change is safe to merge from a security standpoint. The code around it has existing issues, listed below, that should be tracked separately.

## Findings in this PR
None.

- `demo-app/checkout.js:13`: the guard only narrows the input that reaches `.trim()`. It also removes one way for a client to trigger a 500.
- `demo-app/test/checkout.test.js:28-30`: test only, with no secrets or sensitive data.
- No new dependencies. The PR changes no manifest, and `demo-app` has no `package.json`.
- No secrets in the diff.
- Coupon lookup at `demo-app/checkout.js:15` is not open to property-name tricks: codes are uppercased first, and `"__proto__"` gives a total of 50, the same as no coupon.
- The client-facing error at `demo-app/server.js:37` is a generic message and leaks no internals.

## Existing issues (not caused by this PR)

### HIGH: the client sets its own prices
`demo-app/server.js:31` passes `items` from the request body to `total`, and `demo-app/checkout.js:9` prices them with the client's `price` and `qty`. Nothing checks them against a server-side catalogue or requires positive values.

Checked by calling `total` directly: `[{"price":0.01,"qty":1}]` gives `0.01`, and `[{"price":50,"qty":-1}]` gives `-50`. If this total is ever charged, a client chooses what it pays. Whether this is exploitable depends on how the total is used, which is not visible in this repo.

### MEDIUM: no limit on request body size
`demo-app/server.js:28` appends every chunk to `raw` with no size cap or timeout, so one unauthenticated client can send a large body and exhaust the process's memory. Found by reading the code, not load-tested.

### MEDIUM: bad totals are returned as success
`demo-app/checkout.js:9` does not check that values are finite numbers, and `demo-app/server.js:34` sends the result as a 200. `[{"price":1e308,"qty":1e308}]` gives `Infinity`, which JSON turns into `{"total":null}`. The non-numeric price case in the code review behaves the same way. A caller that does not check for null could treat this as a successful order.

### LOW: client input can reach the logs
`demo-app/server.js:36` logs `err.stack`, and on Node 22 a JSON parse error quotes a short piece of the request body. The replace only handles `\n`, so a raw `\r` survives into the log line, as seen in a direct `JSON.parse` test. The quoted text is short, so the room to forge a log entry is small.

### LOW: synchronous log write on every request
`demo-app/server.js:13` uses `fs.appendFileSync`, which blocks the event loop on each request. Under heavy traffic, or a slow disk, this makes it easier to slow the service down.

## Not tested
The server was not started, because that would write to `demo-app/logs/app.log`. The `total` and `JSON.parse` results above come from calling them directly on Node 22.20.0.
