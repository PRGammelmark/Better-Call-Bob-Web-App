Date.prototype.stdTimezoneOffset = function () {
    const jan = new Date(this.getFullYear(), 0, 1);
    const jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.isDstObserved = function () {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

export const justerForDST = (fraISO, tilISO) => {
  let start = new Date(fraISO);
  let end = new Date(tilISO);

  const dstOffset = start.isDstObserved() ? 0 : 60;
  start = new Date(start.getTime() + dstOffset * 60 * 1000);
  end = new Date(end.getTime() + dstOffset * 60 * 1000);

  return { start, end };
};