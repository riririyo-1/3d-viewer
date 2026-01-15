"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Box, Clock, FolderOpen, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function MainHeader() {
  const router = useRouter();
  const { t } = useLanguage();
  const { recentAssets, setActiveAsset, addAsset } = useAppStore();

  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenus = () => {
      setIsCollectionOpen(false);
      setIsRecentOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const toggleCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollectionOpen(!isCollectionOpen);
    setIsRecentOpen(false);
  };

  const toggleRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecentOpen(!isRecentOpen);
    setIsCollectionOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const ext = file.name.toLowerCase().split(".").pop() || "";

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      const newAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type: ext,
        data: result,
        timestamp: new Date().toLocaleDateString("en-US"),
      };

      addAsset(newAsset);
      setActiveAsset(newAsset);
      setIsCollectionOpen(false);
      router.push("/viewer");

      // Reset input
      e.target.value = "";
    };

    if (ext === "glb" || ext === "gltf") reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  return (
    <div className="fixed top-0 left-0 w-full flex justify-center py-4 px-4 md:py-6 md:px-6 pointer-events-none z-[100]">
      <header className="pointer-events-auto bg-white/70 backdrop-blur-2xl px-3 py-2 md:px-5 rounded-full border border-slate-200/50 shadow-xl shadow-slate-200/20 flex items-center gap-2 md:gap-5 transition-all duration-300">
        {/* Collection Menu */}
        <div className="relative">
          <button
            onClick={toggleCollection}
            className={cn(
              "p-2 rounded-full transition-all",
              isCollectionOpen
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Layers size={18} />
          </button>

          <AnimatePresence>
            {isCollectionOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200 shadow-2xl origin-top overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {t("common.manageAssets")}
                  </span>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href="/collection"
                    onClick={() => setIsCollectionOpen(false)}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <FolderOpen size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-white uppercase tracking-tight">
                      {t("common.openCollection")}
                    </span>
                  </Link>

                  <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <Plus size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-white uppercase tracking-tight">
                      {t("common.importAsset")}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".obj,.glb,.gltf"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo / Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity px-2"
        >
          <Box
            className="text-slate-900"
            size={18}
            fill="currentColor"
            fillOpacity={0.1}
          />
          <h1 className="text-xs font-black tracking-widest text-slate-800 uppercase">
            {t("common.studio")}
            <span className="font-light">{t("common.view")}</span>
          </h1>
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        {/* Recent Menu */}
        <div className="relative">
          <button
            onClick={toggleRecent}
            className={cn(
              "p-2 rounded-full transition-all",
              isRecentOpen
                ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Clock size={18} />
          </button>

          <AnimatePresence>
            {isRecentOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200 shadow-2xl origin-top overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {t("common.recentlyOpened")}
                  </span>
                </div>
                <div className="p-2 max-h-[320px] overflow-y-auto">
                  {recentAssets.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-[10px] font-medium tracking-tight uppercase tracking-widest">
                      {t("common.noHistory")}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {recentAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => {
                            setActiveAsset(asset);
                            router.push("/viewer");
                            setIsRecentOpen(false);
                          }}
                          className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                            <Box size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-700 group-hover:text-white truncate uppercase">
                              {asset.name}
                            </div>
                            <div className="text-[9px] text-slate-400 group-hover:text-slate-500 truncate capitalize font-bold">
                              {asset.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </div>
  );
}
