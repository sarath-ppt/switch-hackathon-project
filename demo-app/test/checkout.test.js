// Run: node --test (from demo-app/)

const test = require("node:test");
const assert = require("node:assert");
const { subtotal, total } = require("../checkout");

const cart = [
  { price: 20, qty: 2 },
  { price: 10, qty: 1 },
];

test("subtotal adds price * qty", () => {
  assert.strictEqual(subtotal(cart), 50);
});

test("total applies a valid coupon", () => {
  assert.strictEqual(total(cart, "save10"), 45);
});

test("total ignores an unknown coupon", () => {
  assert.strictEqual(total(cart, "BOGUS"), 50);
});

test("total works without a coupon", () => {
  assert.strictEqual(total(cart), 50);
});
