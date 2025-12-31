import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore, type Asset } from "./store";

// テスト用のモックアセット作成関数
const createMockAsset = (id: string, name: string): Asset => ({
  id,
  name,
  type: "glb",
  data: "mock-data",
  timestamp: "2024-01-01",
});


describe("useAppStore", () => {
  // 各テスト前にストアをリセット
  beforeEach(() => {
    useAppStore.setState({
      assets: [],
      recentAssets: [],
      activeAsset: null,
    });
  });

  describe("addAsset", () => {
    it("新規アセットを追加する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);

      const state = useAppStore.getState();
      expect(state.assets).toHaveLength(1);
      expect(state.assets[0]).toEqual(asset);
    });

    it("アセットを配列の先頭に追加する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);

      const state = useAppStore.getState();
      expect(state.assets[0]).toEqual(asset2);
      expect(state.assets[1]).toEqual(asset1);
    });

    it("activeAssetを新規アセットに設定する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);

      const state = useAppStore.getState();
      expect(state.activeAsset).toEqual(asset);
    });

    it("recentAssetsを更新する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);

      const state = useAppStore.getState();
      expect(state.recentAssets).toHaveLength(1);
      expect(state.recentAssets[0]).toEqual(asset);
    });

    it("recentAssetsは最大8件まで保持する", () => {
      for (let i = 1; i <= 10; i++) {
        const asset = createMockAsset(`${i}`, `model${i}.glb`);
        useAppStore.getState().addAsset(asset);
      }

      const state = useAppStore.getState();
      expect(state.recentAssets).toHaveLength(8);
      expect(state.recentAssets[0].id).toBe("10");
      expect(state.recentAssets[7].id).toBe("3");
    });

    it("recentAssetsで重複を排除する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().addAsset(asset1);

      const state = useAppStore.getState();
      expect(state.recentAssets).toHaveLength(2);
      expect(state.recentAssets[0]).toEqual(asset1);
      expect(state.recentAssets[1]).toEqual(asset2);
    });
  });

  describe("removeAsset", () => {
    it("指定IDのアセットを削除する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().removeAsset("1");

      const state = useAppStore.getState();
      expect(state.assets).toHaveLength(1);
      expect(state.assets[0].id).toBe("2");
    });

    it("recentAssetsからも削除する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);
      useAppStore.getState().removeAsset("1");

      const state = useAppStore.getState();
      expect(state.recentAssets).toHaveLength(0);
    });

    it("activeAssetが削除対象の場合nullに設定する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);
      useAppStore.getState().removeAsset("1");

      const state = useAppStore.getState();
      expect(state.activeAsset).toBeNull();
    });

    it("activeAssetが削除対象でない場合は保持する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().setActiveAsset(asset1);
      useAppStore.getState().removeAsset("2");

      const state = useAppStore.getState();
      expect(state.activeAsset).toEqual(asset1);
    });

    it("存在しないIDを削除しても何も起こらない", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);
      useAppStore.getState().removeAsset("999");

      const state = useAppStore.getState();
      expect(state.assets).toHaveLength(1);
    });
  });

  describe("setActiveAsset", () => {
    it("activeAssetを設定する", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);
      useAppStore.getState().setActiveAsset(asset);

      const state = useAppStore.getState();
      expect(state.activeAsset).toEqual(asset);
    });

    it("nullを設定してactiveAssetをクリアする", () => {
      const asset = createMockAsset("1", "model1.glb");
      useAppStore.getState().addAsset(asset);
      useAppStore.getState().setActiveAsset(null);

      const state = useAppStore.getState();
      expect(state.activeAsset).toBeNull();
    });

    it("既存アセットを設定した場合recentAssetsを更新する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().setActiveAsset(asset1);

      const state = useAppStore.getState();
      expect(state.recentAssets[0]).toEqual(asset1);
      expect(state.recentAssets[1]).toEqual(asset2);
    });

    it("recentAssetsで重複を排除する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().setActiveAsset(asset1);
      useAppStore.getState().setActiveAsset(asset2);
      useAppStore.getState().setActiveAsset(asset1);

      const state = useAppStore.getState();
      expect(state.recentAssets).toHaveLength(2);
      const ids = state.recentAssets.map((a) => a.id);
      expect(ids).toEqual(["1", "2"]);
    });
  });

  describe("初期状態", () => {
    it("空の配列とnullで初期化される", () => {
      const state = useAppStore.getState();
      expect(state.assets).toEqual([]);
      expect(state.recentAssets).toEqual([]);
      expect(state.activeAsset).toBeNull();
    });
  });

  describe("統合シナリオ", () => {
    it("複数アセットの追加と削除が正しく動作する", () => {
      const asset1 = createMockAsset("1", "model1.glb");
      const asset2 = createMockAsset("2", "model2.glb");
      const asset3 = createMockAsset("3", "model3.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().addAsset(asset3);

      let state = useAppStore.getState();
      expect(state.assets).toHaveLength(3);
      expect(state.activeAsset).toEqual(asset3);

      useAppStore.getState().removeAsset("2");

      state = useAppStore.getState();
      expect(state.assets).toHaveLength(2);
      expect(state.assets.find((a) => a.id === "2")).toBeUndefined();
    });

    it("ユーザーフローをシミュレートする", () => {
      // 1. 3つのアセットをアップロード
      const asset1 = createMockAsset("1", "cube.glb");
      const asset2 = createMockAsset("2", "sphere.obj");
      const asset3 = createMockAsset("3", "cylinder.glb");

      useAppStore.getState().addAsset(asset1);
      useAppStore.getState().addAsset(asset2);
      useAppStore.getState().addAsset(asset3);

      // 2. asset1を開く
      useAppStore.getState().setActiveAsset(asset1);
      let state = useAppStore.getState();
      expect(state.activeAsset).toEqual(asset1);

      // 3. asset2を開く
      useAppStore.getState().setActiveAsset(asset2);
      state = useAppStore.getState();
      expect(state.activeAsset).toEqual(asset2);
      expect(state.recentAssets[0]).toEqual(asset2);
      expect(state.recentAssets[1]).toEqual(asset1);

      // 4. asset1を削除
      useAppStore.getState().removeAsset("1");
      state = useAppStore.getState();
      expect(state.assets).toHaveLength(2);
      expect(state.recentAssets.find((a) => a.id === "1")).toBeUndefined();

      // 5. activeAssetをクリア
      useAppStore.getState().setActiveAsset(null);
      state = useAppStore.getState();
      expect(state.activeAsset).toBeNull();
    });
  });
});
