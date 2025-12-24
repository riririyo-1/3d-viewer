"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Maximize, Grid3X3, Rotate3d, Layers } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ViewerCanvas } from "@/components/three/ViewerCanvas";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export default function ViewerPage() {
  const router = useRouter();
  const { activeAsset } = useAppStore();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    wireframe: false,
    autoRotate: false,
    showGrid: false,
  });

  useEffect(() => {
    if (!activeAsset) {
      router.push("/collection");
    }
  }, [activeAsset, router]);

  if (!activeAsset) return null;

  return (
    <div className="fixed inset-0 z-0 bg-white animate-in fade-in duration-1000">
      <ViewerCanvas asset={activeAsset} settings={settings} />

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
