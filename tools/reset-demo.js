// Puts the demo back in its starting state so the three rooms can run again.
// Run from the repo root: node tools/reset-demo.js
//
// - Restores the planted coupon bug in demo-app/ from the `demo-start` tag
// - Rewrites demo-app/logs/app.log with errors from this morning
// - Clears agent output in reviews/ and content/

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TAG = "demo-start";
const BUG_FILES = ["demo-app/checkout.js", "demo-app/test/checkout.test.js"];

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function restoreBug() {
  for (const file of BUG_FILES) {
    fs.writeFileSync(path.join(ROOT, file), git("show", `${TAG}:${file}`));
  }
}

function writeLog() {
  const day = new Date().toISOString().slice(0, 10);
  const stack =
    "TypeError: Cannot read properties of undefined (reading 'trim') | " +
    "at discountRate (demo-app/checkout.js:13:23) | " +
    "at total (demo-app/checkout.js:18:41) | " +
    "at IncomingMessage.<anonymous> (demo-app/server.js:32:22)";
  const lines = [
    ["03:44:02.118", "INFO checkout service listening on 3000"],
    ["03:45:41.502", "INFO POST /checkout 200 total=45"],
    ["03:46:07.889", "INFO POST /checkout 200 total=25"],
    ["03:51:33.014", `ERROR POST /checkout 500 ${stack}`],
    ["03:51:58.430", `ERROR POST /checkout 500 ${stack}`],
    ["03:52:15.007", "INFO POST /checkout 200 total=90"],
    ["03:54:49.761", `ERROR POST /checkout 500 ${stack}`],
  ];
  const log = lines.map(([time, msg]) => `${day}T${time}Z ${msg}`).join("\n") + "\n";
  fs.writeFileSync(path.join(ROOT, "demo-app/logs/app.log"), log);
}

function clearOutput(dir) {
  const full = path.join(ROOT, dir);
  for (const entry of fs.readdirSync(full)) {
    if (entry !== ".gitkeep") fs.rmSync(path.join(full, entry), { recursive: true, force: true });
  }
}

try {
  git("rev-parse", "--verify", "--quiet", `${TAG}^{commit}`);
} catch {
  console.error(`Tag "${TAG}" not found. Run: git fetch --tags`);
  process.exit(1);
}

restoreBug();
writeLog();
clearOutput("reviews");
clearOutput("content");

console.log("Demo reset: coupon bug restored, log refreshed, reviews/ and content/ cleared.");
console.log("Next: commit and push to main so PRs target the buggy code, e.g.");
console.log('  git commit -am "<ticket>: Reset demo" && git push');
