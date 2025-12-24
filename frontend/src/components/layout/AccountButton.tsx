"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AccountButton() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { t, locale, setLocale } = useLanguage();

  // Mock User
  const user = {
    name: "STUDIO USER",
    plan: "PREMIUM PLAN",
  };

  const toggleAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccountOpen(!isAccountOpen);
  };

  useEffect(() => {
    const closeMenu = () => setIsAccountOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[120] pointer-events-none">
      <div className="flex flex-col items-end text-center">
        <button
          onClick={toggleAccount}
          className={cn(
            "pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl shadow-slate-200/20 border border-slate-200/50",
            isAccountOpen
              ? "bg-slate-900 text-white shadow-slate-900/20 scale-105"
              : "bg-white/70 backdrop-blur-2xl text-slate-600 hover:bg-white/90 hover:scale-105"
          )}
        >
          <User size={20} />
        </button>
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "pointer-events-auto mt-4 w-48 bg-white/90 backdrop-blur-2xl rounded-[1.25rem] border border-slate-200 shadow-2xl transition-all duration-500 origin-top-right overflow-hidden",
            isAccountOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col items-center">
            <span className="text-[11px] font-black text-slate-900 tracking-tight uppercase leading-tight">
              {user.name}
            </span>
            <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
              {user.plan}
            </span>
          </div>
          <div className="p-1.5 flex flex-col">
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-900 group transition-all text-left">
              <User
                size={13}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-white tracking-tight uppercase">
                {t("common.account")}
              </span>
            </button>
            <button
              onClick={() => setLocale(locale === "en" ? "ja" : "en")}
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-900 group transition-all text-left"
            >
              <Globe
                size={13}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 group-hover:text-white tracking-tight uppercase">
                  {t("common.language")}
                </span>
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-500 bg-slate-100 group-hover:bg-slate-800 px-1.5 py-0.5 rounded-md uppercase transition-colors">
                  {locale}
                </span>
              </div>
            </button>
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-900 group transition-all text-left">
              <Settings
                size={13}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-white tracking-tight uppercase">
                {t("common.settings")}
              </span>
            </button>
            <div className="my-1 mx-2 h-px bg-slate-100" />
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-red-50 group transition-all text-left text-red-500">
              <LogOut
                size={13}
                className="text-red-400 group-hover:text-red-600 transition-colors"
              />
              <span className="text-[10px] font-bold tracking-tight uppercase">
                {t("common.logout")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
