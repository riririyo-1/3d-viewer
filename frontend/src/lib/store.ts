import { create } from "zustand";

export interface Asset {
  id: string;
  name: string;
  type: string;
  data: string | ArrayBuffer | null;
  url?: string;
  thumbnailUrl?: string; // Add thumbnailUrl locally as well
  storagePath?: string;
  timestamp: string;
}

interface AppState {
  assets: Asset[];
  recentAssets: Asset[];
  activeAsset: Asset | null;

  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  setActiveAsset: (asset: Asset | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  assets: [],
  recentAssets: [],
  activeAsset: null,

  addAsset: (asset) =>
    set((state) => {
      const newRecent = [
        asset,
        ...state.recentAssets.filter((a) => a.id !== asset.id),
      ].slice(0, 8);
      return {
        assets: [asset, ...state.assets],
        recentAssets: newRecent,
        activeAsset: asset,
      };
    }),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      recentAssets: state.recentAssets.filter((a) => a.id !== id),
      activeAsset: state.activeAsset?.id === id ? null : state.activeAsset,
    })),

  setActiveAsset: (asset) =>
    set((state) => {
      // Update recent when opening an existing asset
      if (asset) {
        const newRecent = [
          asset,
          ...state.recentAssets.filter((a) => a.id !== asset.id),
        ].slice(0, 8);
        return { activeAsset: asset, recentAssets: newRecent };
      }
      return { activeAsset: null };
    }),
}));
