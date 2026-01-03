"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Maximize, Grid3X3, Rotate3d, ArrowLeft } from "lucide-react";
import { ViewerCanvas } from "@/components/three/ViewerCanvas";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Asset } from "@/lib/store";

interface ViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ViewerPage({ params }: ViewerPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { t } = useLanguage();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    wireframe: false,
    autoRotate: false,
    showGrid: false,
  });

  useEffect(() => {
    // Wait for user to be checked
    if (user === undefined) return;
    if (user === null) {
      router.push("/login");
      return;
    }

    const fetchAsset = async () => {
      try {
        setLoading(true);
        // We need to fetch asset details.
        const response = await api.get(`/assets/${id}`);
        const item = response.data;

        setAsset({
          id: item.id,
          name: item.name,
          type: item.type || "obj",
          url: `${API_URL}${item.downloadUrl}`,
          thumbnailUrl: item.thumbnailUrl,
          data: null, // remote assets don't have local data
          timestamp: new Date(item.createdAt).toLocaleDateString("en-US"),
        });
      } catch (error) {
        console.error("Failed to fetch asset", error);
        // Redirect to collection on failure or show error
        router.push("/collection");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [user, id, router]);

  if (loading || !asset) {
    return (
      <div className="fixed inset-0 z-0 bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-[4px] border-slate-100 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 bg-white animate-in fade-in duration-1000">
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => router.push("/collection")}
          className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-105 transition-all text-slate-900"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <ViewerCanvas asset={asset} settings={settings} />

      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col">
        <div className="mt-auto w-full flex justify-center mb-6">
          <footer className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, wireframe: !s.wireframe }))
              }
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                settings.wireframe
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Maximize size={14} /> {t("viewer.wireframe")}
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, showGrid: !s.showGrid }))
              }
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                settings.showGrid
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Grid3X3 size={14} /> {t("viewer.grid")}
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, autoRotate: !s.autoRotate }))
              }
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                settings.autoRotate
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Rotate3d
                size={16}
                className={settings.autoRotate ? "animate-spin-custom" : ""}
              />{" "}
              {t("viewer.spin")}
            </button>
          </footer>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin-custom {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-custom {
          animation: spin-custom 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
