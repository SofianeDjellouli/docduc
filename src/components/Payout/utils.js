export const days = Array.from(new Array(31), (x, i) => i + 1);
export const months = Array.from(new Array(12), (x, i) => i + 1);
export const years = Array.from(new Array(110), (x, i) => i + 1900);

const zeroify = a => (a < 0 ? 0 : a);

const fractionDigits = { maximumFractionDigits: 2, minimumFractionDigits: 2 };

const toDollarsCurrency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  ...fractionDigits
}).format;

const toDollars = new Intl.NumberFormat("en-US", fractionDigits).format;

export const setAmount = isTotal => a =>
  a || a === 0
    ? isTotal
      ? "$ -"
      : zeroify(a) === 0
      ? "$00.00"
      : toDollarsCurrency(zeroify(a))
    : "";

export const handleZeroBalance = a =>
  a || a === 0 ? (zeroify(a) === 0 ? "00.00" : toDollars(zeroify(a))) : "";
