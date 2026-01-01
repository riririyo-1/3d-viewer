import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("クラス名を結合する", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("条件付きクラス名を処理する", () => {
    const result = cn("base", true && "active", false && "disabled");
    expect(result).toBe("base active");
  });

  it("重複するTailwindクラスをマージする", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("undefinedとnullを無視する", () => {
    const result = cn("base", undefined, null, "other");
    expect(result).toBe("base other");
  });

  it("配列形式のクラス名を処理する", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("オブジェクト形式のクラス名を処理する", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe("base active");
  });

  it("複雑な組み合わせを処理する", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      "btn",
      isActive && "btn-active",
      isDisabled && "btn-disabled",
      { "btn-primary": true }
    );
    expect(result).toBe("btn btn-active btn-primary");
  });

  it("空の入力で空文字列を返す", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("Tailwindの競合するクラスを正しくマージする", () => {
    const result = cn("text-sm text-red-500", "text-lg text-blue-500");
    expect(result).toBe("text-lg text-blue-500");
  });
});
