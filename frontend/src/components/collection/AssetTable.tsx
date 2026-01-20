"use client";

import React from "react";
import { Box, Trash2, Layers } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

import { Asset } from "@/lib/store";

interface AssetTableProps {
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function AssetTable({ assets, onAssetClick, onDelete }: AssetTableProps) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-slate-200">
          <tr>
            <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">
              Asset
            </th>
            <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">
              Type
            </th>
            <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400">
              Date
            </th>
            <th className="p-4 text-[10px] font-black tracking-widest uppercase text-slate-400 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assets.map((asset) => (
            <tr
              key={asset.id}
              onClick={() => onAssetClick(asset)}
              className="group hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td className="p-4">
                <div className="flex items-center gap-4">
                  {/* Reduced thumbnail size in table for compact row */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                    {asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box size={14} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {asset.name}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {asset.type}
                </span>
              </td>
              <td className="p-4">
                <span className="text-xs font-medium text-slate-400">
                  {asset.timestamp}
                </span>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={(e) => onDelete(asset.id, e)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan={4} className="p-12 text-center text-slate-300">
                <Layers size={40} className="mx-auto mb-4 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {t("collection.inventoryEmpty")}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
