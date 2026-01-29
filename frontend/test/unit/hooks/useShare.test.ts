import { renderHook } from "@testing-library/react";
import { useShares } from "../../../src/hooks/useShare";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";

// Mock the api module
vi.mock("../../../src/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import useSWR from "swr";

// Mocking useSWR to avoid cache issues and network calls
vi.mock("swr", () => ({
  default: vi.fn(),
}));

describe("useShares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return shares data", async () => {
    const mockData = [{ id: "1", shareId: "test-share" }];
    (useSWR as unknown as Mock).mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useShares());

    expect(result.current.shares).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle loading state", () => {
    (useSWR as unknown as Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useShares());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.shares).toBeUndefined();
  });
});
