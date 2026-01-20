"use client";

import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
}

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[500] flex items-center justify-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
        <div className="w-14 h-14 border-[6px] border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">
          {message}
        </p>
      </div>
    </div>
  );
}
