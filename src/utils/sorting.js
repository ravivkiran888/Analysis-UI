export const sortData = (data, column, direction) => {
  return [...data].sort((a, b) => {
    if (direction === "asc") {
      return a[column] - b[column];
    }
    return b[column] - a[column];
  });
};

export const toggleSort = (direction) => {
  return direction === "asc" ? "desc" : "asc";
};
