import { describe, it, expect } from "vitest";
import { locales, defaultLocale, type Locale } from "./i18n";

describe("i18n", () => {
  describe("locales", () => {
    it("enとjaのロケールが定義されている", () => {
      expect(locales).toHaveProperty("en");
      expect(locales).toHaveProperty("ja");
    });

    it("各ロケールに共通キーが含まれている", () => {
      expect(locales.en).toHaveProperty("common");
      expect(locales.ja).toHaveProperty("common");
    });

    it("各ロケールにhomeキーが含まれている", () => {
      expect(locales.en).toHaveProperty("home");
      expect(locales.ja).toHaveProperty("home");
    });

    it("各ロケールにcollectionキーが含まれている", () => {
      expect(locales.en).toHaveProperty("collection");
      expect(locales.ja).toHaveProperty("collection");
    });

    it("各ロケールにviewerキーが含まれている", () => {
      expect(locales.en).toHaveProperty("viewer");
      expect(locales.ja).toHaveProperty("viewer");
    });

    it("enとjaで同じキー構造を持つ", () => {
      const enKeys = Object.keys(locales.en).sort();
      const jaKeys = Object.keys(locales.ja).sort();
      expect(enKeys).toEqual(jaKeys);
    });

    it("common配下のキーがenとjaで一致する", () => {
      const enCommonKeys = Object.keys(locales.en.common).sort();
      const jaCommonKeys = Object.keys(locales.ja.common).sort();
      expect(enCommonKeys).toEqual(jaCommonKeys);
    });

    it("home配下のキーがenとjaで一致する", () => {
      const enHomeKeys = Object.keys(locales.en.home).sort();
      const jaHomeKeys = Object.keys(locales.ja.home).sort();
      expect(enHomeKeys).toEqual(jaHomeKeys);
    });
  });

  describe("defaultLocale", () => {
    it("デフォルトロケールはenである", () => {
      expect(defaultLocale).toBe("en");
    });

    it("デフォルトロケールがlocalesに存在する", () => {
      expect(locales).toHaveProperty(defaultLocale);
    });
  });

  describe("Locale型", () => {
    it("enが有効なLocale型である", () => {
      const locale: Locale = "en";
      expect(locale).toBe("en");
    });

    it("jaが有効なLocale型である", () => {
      const locale: Locale = "ja";
      expect(locale).toBe("ja");
    });
  });

  describe("翻訳データの整合性", () => {
    it("すべての英語翻訳が空でない文字列である", () => {
      const checkNotEmpty = (obj: Record<string, unknown>, path = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === "string") {
            expect(value.length).toBeGreaterThan(0);
          } else if (typeof value === "object" && value !== null) {
            checkNotEmpty(value as Record<string, unknown>, currentPath);
          }
        });
      };

      checkNotEmpty(locales.en as Record<string, unknown>);
    });

    it("すべての日本語翻訳が空でない文字列である", () => {
      const checkNotEmpty = (obj: Record<string, unknown>, path = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === "string") {
            expect(value.length).toBeGreaterThan(0);
          } else if (typeof value === "object" && value !== null) {
            checkNotEmpty(value as Record<string, unknown>, currentPath);
          }
        });
      };

      checkNotEmpty(locales.ja as Record<string, unknown>);
    });

    it("重要な翻訳キーが存在する", () => {
      // common
      expect(locales.en.common).toHaveProperty("manageAssets");
      expect(locales.ja.common).toHaveProperty("manageAssets");

      // home
      expect(locales.en.home).toHaveProperty("title1");
      expect(locales.en.home).toHaveProperty("title2");
      expect(locales.ja.home).toHaveProperty("title1");
      expect(locales.ja.home).toHaveProperty("title2");

      // collection
      expect(locales.en.collection).toHaveProperty("title");
      expect(locales.ja.collection).toHaveProperty("title");

      // viewer
      expect(locales.en.viewer).toHaveProperty("wireframe");
      expect(locales.ja.viewer).toHaveProperty("wireframe");
    });
  });
});
