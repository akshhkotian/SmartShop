/**
 * Format amounts into Indian Rupees (INR) with proper Indian numbering system (Lakhs / Crores)
 * e.g. 1499 -> "₹1,499"
 * e.g. 189900 -> "₹1,89,900"
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0
  });
}

export default formatINR;
