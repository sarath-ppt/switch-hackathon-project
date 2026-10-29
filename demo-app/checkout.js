// Pricing logic for the demo checkout service.

const COUPONS = {
  SAVE10: 0.1,
  HALFOFF: 0.5,
};

function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function discountRate(coupon) {
  const code = coupon.trim().toUpperCase();
  return COUPONS[code] || 0;
}

function total(items, coupon) {
  const amount = subtotal(items) * (1 - discountRate(coupon));
  return Math.round(amount * 100) / 100;
}

module.exports = { subtotal, discountRate, total };
