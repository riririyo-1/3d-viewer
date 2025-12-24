"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Layers, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center pt-32 px-6 overflow-hidden">
      {/* Background Animation Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-slate-200/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out text-center flex flex-col items-center">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.95]">
            {t("home.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-400">
              {t("home.title2")}
            </span>
          </h2>

          <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium opacity-80 mb-4">
            {t("home.subtitle")}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
            <Sparkles size={12} className="text-blue-400" />
            {t("home.studioPerspective")}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 ease-out pb-24">
          <Link
            href="/collection"
            className="group relative p-1 rounded-[2.8rem] bg-gradient-to-b from-white to-slate-100 shadow-2xl transition-all duration-500 hover:scale-[1.03] active:scale-95 text-center flex flex-col items-center"
          >
            <div className="bg-white rounded-[2.7rem] p-10 h-full flex flex-col items-center text-center overflow-hidden relative w-full">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-20 h-20 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white mb-8 group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-slate-900/30">
                <Layers size={36} />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight uppercase italic">
                {t("home.myCollection")}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                {t("home.personalAssetLibrary")}
              </p>
              <div className="mt-auto flex items-center gap-3 py-2 px-6 rounded-full bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em]">
                {t("home.exploreCollection")}{" "}
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </Link>

          <div className="group relative p-1 rounded-[2.8rem] bg-white shadow-sm opacity-60 grayscale transition-all duration-500 cursor-not-allowed">
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[2.7rem] p-10 h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[1.8rem] flex items-center justify-center text-slate-300 mb-8 font-bold text-3xl">
                ☁️
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight uppercase italic text-slate-400">
                {t("home.cloudNode")}
              </h3>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                {t("home.multiDeviceSync")}
              </p>
              <span className="mt-auto text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                {t("home.updatePending")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
