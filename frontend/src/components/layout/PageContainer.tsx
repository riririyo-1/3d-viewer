"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string; // Content wrapper class
}

export function PageContainer({
  title,
  subtitle,
  children,
  className,
}: PageContainerProps) {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen w-full flex flex-col pt-32 px-6 overflow-hidden bg-white">
      {/* Background Animation Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 text-sm font-medium w-fit"
          >
            <ChevronLeft size={16} />
            {t("common.studio") || "Studio"}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
        </div>

        {/* Content */}
        <div className={`flex-1 ${className || ""}`}>{children}</div>
      </div>
    </main>
  );
}
