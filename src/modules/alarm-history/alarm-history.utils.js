const numSort = (a, b) => {
  if (a > b) {
    return [b, a];
  }
  return [a, b];
};
export default {
  numSort
};
