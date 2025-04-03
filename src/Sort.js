// src/utils/sort.js

export const sortData = (data, sortConfig, customValueFn = null) => {
  if (!sortConfig.key) return data;

  return [...data].sort((a, b) => {
    let aValue = customValueFn ? customValueFn(a, sortConfig.key) : a[sortConfig.key];
    let bValue = customValueFn ? customValueFn(b, sortConfig.key) : b[sortConfig.key];

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });
};

export const toggleSortDirection = (prevConfig, key) => {
  if (prevConfig.key === key) {
    return {
      key,
      direction: prevConfig.direction === "ascending" ? "descending" : "ascending",
    };
  }
  return { key, direction: "ascending" };
};

export const renderSortArrow = (sortConfig, key) => {
  if (sortConfig.key !== key) return "";
  return sortConfig.direction === "ascending" ? " 🔼" : " 🔽";
};
