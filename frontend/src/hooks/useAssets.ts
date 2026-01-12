import React, { useState, useCallback, useEffect } from "react";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface Asset {
  id: string;
  name: string;
  type: string;
  data: string | ArrayBuffer | null;
  url: string;
  thumbnailUrl: string | null;
  storagePath?: string;
  timestamp: string;
}

interface AssetResponse {
  id: string;
  name: string;
  type: string;
  downloadUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  storagePath: string;
}

export function useAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to track stability and mounting to avoid race conditions
  const mountedRef = React.useRef(false);

  // Define fetchAssets as a stable function that doesn't change on every render
  // but can access latest user via closure if needed, or we pass it.
  // Actually, standard useCallback is fine if we manage the loop correctly.
  const fetchAssets = useCallback(
    async (isBackground = false) => {
      if (!user) return;

      if (!isBackground) {
        setLoading(true);
      }

      try {
        const response = await api.get<AssetResponse[]>("/assets");
        // Check if still mounted before setting state
        if (mountedRef.current) {
          const mappedAssets = response.data.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.type || "obj",
            data: null,
            url: `${API_URL}${item.downloadUrl}`,
            thumbnailUrl: item.thumbnailUrl,
            timestamp: new Date(item.createdAt).toLocaleDateString("en-US"),
            storagePath: item.storagePath,
          }));
          setAssets(mappedAssets);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch assets", err);
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch assets")
          );
        }
      } finally {
        if (!isBackground && mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    mountedRef.current = true;

    if (user) {
      // Initial load (foreground)
      fetchAssets(false);
    } else {
      setAssets([]);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [user, fetchAssets]);

  return {
    assets,
    loading,
    error,
    refresh: () => fetchAssets(false),
  };
}
