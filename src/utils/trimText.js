// Returns a copy of `value` with every text trimmed, at any depth of plain
// objects and arrays, so a box holding only spaces is sent as "" (never saved
// as spaces). Other values (numbers, dates, dayjs, File, Blob) are kept as is.
export const trimTextDeep = (value) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(trimTextDeep);
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimTextDeep(v)]));
  }
  return value;
};

export default trimTextDeep;
