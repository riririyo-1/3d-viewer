import useSWR from "swr";
import { api } from "../lib/api";

export interface ShareLink {
  id: string;
  shareId: string;
  userId: string;
  assetId: string;
  hasPassword: boolean;
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  createdAt: string;
  shareUrl?: string;
  // Included relations from usage
  asset?: {
    name: string;
    thumbnailUrl: string | null;
    type: string;
    size: number;
    updatedAt: string;
  };
}

export interface CreateShareDto {
  assetId: string;
  password?: string;
  expiresAt?: string;
  maxViews?: number;
}

export interface UpdateShareDto {
  password?: string;
  expiresAt?: string;
  maxViews?: number;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useShares() {
  const { data, error, isLoading, mutate } = useSWR<ShareLink[]>(
    "/shares",
    fetcher,
  );

  const createShare = async (dto: CreateShareDto) => {
    const res = await api.post<ShareLink>("/shares", dto);
    await mutate();
    return res.data;
  };

  const updateShare = async (id: string, dto: UpdateShareDto) => {
    const res = await api.patch<ShareLink>(`/shares/${id}`, dto);
    await mutate();
    return res.data;
  };

  const deleteShare = async (id: string) => {
    await api.delete(`/shares/${id}`);
    await mutate();
  };

  return {
    shares: data,
    isLoading,
    isError: error,
    createShare,
    updateShare,
    deleteShare,
    mutate,
  };
}
