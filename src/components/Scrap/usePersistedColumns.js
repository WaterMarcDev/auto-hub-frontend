// Column chooser state that survives a page refresh.
//
// Stores the HIDDEN column keys in localStorage under `storageKey`, so columns
// added to a table later still show by default. Storage errors (private mode,
// blocked site data, bad JSON) fall back to "all columns visible".
import { useEffect, useState } from "react";

const readHidden = (storageKey) => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const usePersistedColumns = (storageKey, allKeys) => {
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const hidden = new Set(readHidden(storageKey));
    return allKeys.filter((k) => !hidden.has(k));
  });

  const allKeysSig = allKeys.join("|");
  useEffect(() => {
    try {
      const hidden = allKeysSig.split("|").filter((k) => k && !visibleColumns.includes(k));
      window.localStorage.setItem(storageKey, JSON.stringify(hidden));
    } catch {
      // storage unavailable: the choice just isn't remembered
    }
  }, [storageKey, allKeysSig, visibleColumns]);

  return [visibleColumns, setVisibleColumns];
};

export default usePersistedColumns;
