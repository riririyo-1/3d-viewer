import { renderHook, waitFor } from "@testing-library/react";
import { useShares } from "../../../src/hooks/useShare";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as api from "../../../src/lib/api";

// Mock the api module
vi.mock("../../../src/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useSWR
// simpler to mock fetcher or just mock the hook logic if we want to test SWR integration.
// But useShares uses useSWR.
// A better approach for hook testing with SWR is wrapping with SWRConfig or mocking fetcher.
// Here we assume api.get is called by the fetcher.
// Wait, useShare uses `useSWR` which calls `fetcher`. `fetcher` calls `api.get`.
// We can mock `useSWR` from `swr` to return data directly to test the hook's return values formatting if any.
// Or we mock `api.get` and use real `useSWR`. real `useSWR` needs a provider or cache reset.
// Let's try mocking `api.get` and see if `useSWR` works in test env.

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
    (useSWR as any).mockReturnValue({
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
    (useSWR as any).mockReturnValue({
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
