"use client";

import React, { useState, useEffect } from "react";
import { Plus, Box, Trash2, Layers } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CollectionPage() {
  const router = useRouter();
  const { assets, removeAsset, setActiveAsset, addAsset } = useAppStore();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  interface LibraryModel {
    id: string;
    name: string;
    category: string;
    url: string;
    thumbnailUrl: string | null;
  }

  const [libraryModels, setLibraryModels] = useState<LibraryModel[]>([]);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => setLibraryModels(data))
      .catch((err) => console.error("Failed to load library", err));
  }, []);

  const handleLoadLibraryModel = async (model: LibraryModel) => {
    setLoading(true);
    // For URL based assets, we just pass the URL.
    // However, if we want to "import" it into the local store as a distinct asset:
    const newAsset = {
      id: crypto.randomUUID(),
      name: model.name,
      type: model.category, // 'obj' or 'glb'
      data: "", // No data body needed for URL loading
      url: model.url,
      timestamp: new Date().toLocaleDateString("en-US"),
    };
    addAsset(newAsset);
    setActiveAsset(newAsset);
    setLoading(false);
    router.push("/viewer");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    const ext = file.name.toLowerCase().split(".").pop() || "";

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        setLoading(false);
        return;
      }

      const newAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type: ext,
        data: result,
        timestamp: new Date().toLocaleDateString("en-US"),
      };

      addAsset(newAsset);
      setActiveAsset(newAsset);
      setLoading(false);
      router.push("/viewer");
    };

    if (ext === "glb" || ext === "gltf") reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 pt-24 pb-24 relative z-10 animate-in fade-in duration-700">
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

        <label className="relative z-50 cursor-pointer bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-slate-900/40 active:scale-95 whitespace-nowrap uppercase">
          <Plus size={18} />
          {t("collection.newImport")}
          <input
            type="file"
            className="hidden"
            accept=".obj,.glb,.gltf"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* PUBLIC LIBRARY SECTION */}
      {libraryModels.length > 0 && (
        <div className="mb-20">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">
            Available Models
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {libraryModels.map((model) => (
              <div
                key={model.id}
                onClick={() => handleLoadLibraryModel(model)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {model.thumbnailUrl ? (
                    <img
                      src={model.thumbnailUrl}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <Box size={40} className="text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase truncate">
                    {model.name}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                    {model.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => {
              setActiveAsset(asset);
              router.push("/viewer");
            }}
            className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col"
          >
            <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Box
                size={60}
                className="text-slate-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 ease-out"
              />
              <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-white shadow-sm rounded-full text-[9px] font-black text-slate-600 uppercase tracking-widest border border-slate-50">
                {asset.type}
              </div>
            </div>
            <div className="p-8 flex justify-between items-center bg-white border-t border-slate-50">
              <div className="overflow-hidden">
                <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">
                  {asset.name}
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                  {asset.timestamp}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(asset.id);
                }}
                className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full h-96 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
            <Layers size={54} className="mb-6 opacity-10" />
            <p className="text-[11px] font-black uppercase tracking-[0.5em]">
              {t("collection.inventoryEmpty")}
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[500] flex items-center justify-center">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-[6px] border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">
              {t("collection.processing")}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
