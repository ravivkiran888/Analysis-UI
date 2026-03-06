export function sortData(data, { key, direction }) {
  if (!key) return data;

  return [...data].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Try numeric comparison first
    const aNum = Number(aVal);
    const bNum = Number(bVal);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Fallback to string compare
    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}