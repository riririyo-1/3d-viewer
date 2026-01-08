"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, User, CreditCard, HardDrive, Globe } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Tab = "account" | "language";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Mock data for display
  const plan = user ? "Pro Plan" : "Free Plan";
  const storageUsed = "1.2 GB";
  const storageLimit = "5.0 GB";
  const storagePercent = 24;

  return (
    <main className="relative min-h-screen w-full flex flex-col pt-24 md:pt-32 px-4 md:px-6 overflow-hidden bg-slate-50">
      {/* Background Animation Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 pb-20">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-sm font-medium"
          >
            <ChevronLeft size={16} />
            {t("common.studio") || "Studio"}
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">
            {t("settings.title") || "Settings"}
          </h1>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("account")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "account"
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50"
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
              )}
            >
              <User size={18} />
              {t("settings.account") || "Account"}
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "language"
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50"
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
              )}
            >
              <Globe size={18} />
              {t("settings.language") || "Language"}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-xl border border-white/50 min-h-[500px]">
          {activeTab === "account" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-slate-400" />
                {t("settings.accountProfile") || "Account & Profile"}
              </h2>

              <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
                    {user?.email ? user.email[0].toUpperCase() : "G"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {user?.email || "Guest User"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      ID: {user?.id || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                    <CreditCard size={14} /> Plan
                  </h3>
                  <div className="bg-white border-2 border-slate-100 rounded-xl p-5 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group">
                    <div>
                      <p className="font-bold text-slate-900">{plan}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Free tier with basic features
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
                      Current
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                    <HardDrive size={14} /> Storage
                  </h3>
                  <div className="bg-white border-2 border-slate-100 rounded-xl p-6">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-2xl font-black text-slate-900">
                        {storageUsed}
                      </p>
                      <p className="text-xs font-bold text-slate-400 mb-1">
                        of {storageLimit}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full"
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-slate-400" />
                {t("settings.language") || "Language"}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setLocale("en")}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all",
                    locale === "en"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div className="text-left">
                      <p
                        className={cn(
                          "font-bold",
                          locale === "en" ? "text-blue-700" : "text-slate-900"
                        )}
                      >
                        English
                      </p>
                      <p className="text-xs text-slate-500">United States</p>
                    </div>
                  </div>
                  {locale === "en" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>

                <button
                  onClick={() => setLocale("ja")}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all",
                    locale === "ja"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇯🇵</span>
                    <div className="text-left">
                      <p
                        className={cn(
                          "font-bold",
                          locale === "ja" ? "text-blue-700" : "text-slate-900"
                        )}
                      >
                        日本語
                      </p>
                      <p className="text-xs text-slate-500">Japanese</p>
                    </div>
                  </div>
                  {locale === "ja" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
