"use client";

import React from "react";
import { Box, Trash2, Layers } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { useLanguage } from "@/components/providers/LanguageProvider";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Asset } from "@/lib/store";

interface AssetGridProps {
  assets: Asset[];
  loading: boolean;
  onAssetClick: (asset: Asset) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function AssetGrid({ assets, loading, onAssetClick, onDelete }: AssetGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
      {assets.map((asset) => (
        <GlowCard
          key={asset.id}
          onClick={() => onAssetClick(asset)}
          className="bg-white border border-slate-100 overflow-hidden cursor-pointer flex flex-col"
        >
          {/* Aspect Ratio 4:3 (horizontal) */}
          <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {asset.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Box
                  size={60}
                  className="text-slate-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 ease-out"
                />
              </>
            )}

            <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-white shadow-sm rounded-full text-[9px] font-black text-slate-600 uppercase tracking-widest border border-slate-50">
              {asset.type}
            </div>
          </div>
          <div className="p-8 flex justify-between items-center bg-white border-t border-slate-50">
            <div className="overflow-hidden">
              <h4 className="text-sm font-black text-slate-800 line-clamp-2 uppercase tracking-tight">
                {asset.name}
              </h4>
              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                {asset.timestamp}
              </p>
            </div>
            <button
              onClick={(e) => onDelete(asset.id, e)}
              className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </GlowCard>
      ))}
      {assets.length === 0 && !loading && (
        <div className="col-span-full h-96 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
          <Layers size={54} className="mb-6 opacity-10" />
          <p className="text-[11px] font-black uppercase tracking-[0.5em]">
            {t("collection.inventoryEmpty")}
          </p>
        </div>
      )}
    </div>
  );
}
