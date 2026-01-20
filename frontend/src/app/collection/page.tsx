"use client";

import React, { useState } from "react";
import { TabGroup, TabPanel, TabPanels } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useAssets } from "@/hooks/useAssets";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { AssetGrid } from "@/components/collection/AssetGrid";
import { AssetTable } from "@/components/collection/AssetTable";
import { LoadingOverlay } from "@/components/collection/LoadingOverlay";

export default function CollectionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Use the custom hook for asset management
  const { assets, loading, refresh } = useAssets();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      alert("Please login to upload assets.");
      router.push("/login");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/assets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh list using the hook's refresh function
      await refresh();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await api.delete(`/assets/${id}`);
      await refresh();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAssetClick = (asset: any) => {
    if (!asset.id) return;
    router.push(`/viewer/${asset.id}`);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 relative z-10 animate-in fade-in duration-700">
      <TabGroup>
        <CollectionHeader onFileUpload={handleFileUpload} />

        <TabPanels>
          <TabPanel unmount={false}>
            <AssetGrid
              assets={assets}
              loading={loading}
              onAssetClick={handleAssetClick}
              onDelete={handleDelete}
            />
          </TabPanel>
          <TabPanel unmount={false}>
            <AssetTable
              assets={assets}
              onAssetClick={handleAssetClick}
              onDelete={handleDelete}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <LoadingOverlay
        isVisible={loading || uploading}
        message={uploading ? "Uploading & Converting..." : t("collection.processing")}
      />
    </main>
  );
}
