// Tiny checkout API used as the "production" service in the demo.
// Run: node server.js  ->  POST http://localhost:3000/checkout

const http = require("http");
const fs = require("fs");
const path = require("path");
const { total } = require("./checkout");

const LOG_FILE = path.join(__dirname, "logs", "app.log");

function log(level, message) {
  const line = `${new Date().toISOString()} ${level} ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  process.stdout.write(line);
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/checkout") {
    return send(res, 404, { error: "not found" });
  }

  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    try {
      const { items, coupon } = JSON.parse(raw);
      const amount = total(items, coupon);
      log("INFO", `POST /checkout 200 total=${amount}`);
      send(res, 200, { total: amount });
    } catch (err) {
      log("ERROR", `POST /checkout 500 ${err.stack.replace(/\n\s*/g, " | ")}`);
      send(res, 500, { error: "internal error" });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => log("INFO", `checkout service listening on ${port}`));
