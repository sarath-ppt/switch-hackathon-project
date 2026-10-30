# Tools

Scripts and MCP servers the agents call. Give each tool a short section here:
what it does, how to run it, and which agent uses it.

## reset-demo.js

Puts the demo back in its starting state after a run has fixed the bug.

```bash
node tools/reset-demo.js
```

- Restores the coupon bug in `demo-app/` from the `demo-start` tag
- Rewrites `demo-app/logs/app.log` with errors from this morning
- Clears `reviews/` and `content/`

Used by: the human running the demo, not the agents. Commit and push the result
so new PRs target the buggy code.
