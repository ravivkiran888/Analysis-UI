export const sortData = (data, column, direction) => {

  return [...data].sort((a, b) => {

    const valA = a[column] ?? 0;
    const valB = b[column] ?? 0;

    if (valA === valB) return 0;

    if (direction === "asc") {
      return valA > valB ? 1 : -1;
    }

    return valA < valB ? 1 : -1;

  });

};


export const toggleSort = (direction) => {
  return direction === "asc" ? "desc" : "asc";
};
