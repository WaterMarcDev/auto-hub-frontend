import { useState, useEffect } from "react";
import api, { entryFeeAPI } from "../utils/api";
import { cacheManager } from "../utils/cacheManager";

/**
 * Hook to retrieve and cache static master reference data
 * (Makes, Models, Elements, Entry Fee) in memory for 0ms renders.
 */
export function useMasterData(type) {
  const [data, setData] = useState(() => cacheManager.get(`master:${type}`) || null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    let mounted = true;

    const loadData = async (force = false) => {
      const cached = cacheManager.get(`master:${type}`);
      if (cached && !force) {
        if (mounted) {
          setData(cached);
          setLoading(false);
        }
        return;
      }

      try {
        if (!cached) setLoading(true);
        let res;
        switch (type) {
          case "entryFee":
            res = await entryFeeAPI.get();
            break;
          case "makes":
            res = await api.get("/make?limit=500");
            break;
          case "elements":
            res = await api.get("/element?limit=500");
            break;
          default:
            res = await api.get(`/${type}`);
        }

        const payload = res.data?.data || res.data || res;
        cacheManager.set(`master:${type}`, payload, 1800); // 30 minutes in memory
        if (mounted) {
          setData(payload);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load master data for ${type}:`, err);
        if (mounted) setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time invalidations from backend Socket.io
    const unsubscribe = cacheManager.subscribe(`master:${type}`, () => {
      loadData(true);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [type]);

  return { data, loading };
}

export default useMasterData;
