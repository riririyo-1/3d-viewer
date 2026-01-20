"use client";

import React from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Tab, TabList } from "@headlessui/react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface CollectionHeaderProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CollectionHeader({ onFileUpload }: CollectionHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 pt-4">
      <div>
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
          {t("collection.title")}
        </h2>
        <div className="h-1 w-12 bg-slate-900 mt-4 rounded-full" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-6">
          {t("collection.subtitle")}
        </p>
      </div>

      <div className="flex gap-4">
        <TabList className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
          <Tab
            className={({ selected }) =>
              `p-3 rounded-full transition-all duration-300 outline-none ${
                selected
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <LayoutGrid size={20} />
          </Tab>
          <Tab
            className={({ selected }) =>
              `p-3 rounded-full transition-all duration-300 outline-none ${
                selected
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <List size={20} />
          </Tab>
        </TabList>

        <label className="relative z-50 cursor-pointer bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-slate-900/40 active:scale-95 whitespace-nowrap uppercase">
          <Plus size={18} />
          {t("collection.newImport")}
          <input
            type="file"
            className="hidden"
            accept=".obj,.glb,.gltf"
            onChange={onFileUpload}
          />
        </label>
      </div>
    </div>
  );
}
