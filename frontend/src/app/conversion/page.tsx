"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  FileType,
  Check,
  X,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react"; // Import Loader2
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ConversionPage() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen w-full flex flex-col pt-32 px-6 overflow-hidden bg-white">
      {/* Background Animation Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={16} />
            {t("common.studio") || "Studio"}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            {t("conversion.title") || "Conversion"}
          </h1>
          <p className="text-slate-500 font-medium">
            {t("conversion.subtitle") || "Format Transformation Pipeline"}
          </p>
        </div>

        {/* Conversion Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
          <ConversionPanel
            title={t("conversion.objToGlb") || "OBJ → GLB"}
            targetFormat="glb"
            t={t}
          />
          <ConversionPanel
            title={t("conversion.objToGltf") || "OBJ → GLTF"}
            targetFormat="gltf"
            t={t}
          />
        </div>
      </div>
    </main>
  );
}

function ConversionPanel({
  title,
  targetFormat,
  t,
}: {
  title: string;
  targetFormat: "glb" | "gltf";
  t: (key: string) => string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "converting" | "success" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith(".obj")) {
        setFile(selectedFile);
        setStatus("idle");
        setDownloadUrl(null);
        setErrorMessage(null);
      } else {
        alert(t("conversion.supportedFormat") || "Supported format: .obj");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.name.toLowerCase().endsWith(".obj")) {
        setFile(selectedFile);
        setStatus("idle");
        setDownloadUrl(null);
        setErrorMessage(null);
      } else {
        alert(t("conversion.supportedFormat") || "Supported format: .obj");
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus("converting");
    setErrorMessage(null);

    try {
      // 1. Upload and Start Conversion
      const { uploadAndConvert, checkConversionStatus } = await import(
        "@/lib/api"
      );
      const initialResponse = await uploadAndConvert(file, targetFormat);

      const jobId = initialResponse.conversionJobId;

      // 2. Poll for Status
      const pollInterval = 2000;
      const maxAttempts = 30; // 60 seconds timeout
      let attempts = 0;

      const checkStatus = async () => {
        try {
          const statusResponse = await checkConversionStatus(jobId);

          if (
            statusResponse.status === "completed" &&
            statusResponse.downloadUrl
          ) {
            setStatus("success");
            // API returns relative URL likely, keep it as is if it works with <a href> or prepend API_URL if needed
            // For now assume it's a full URL or relative to domain
            // If it is from MinIO (signed url) it is full.
            setDownloadUrl(statusResponse.downloadUrl);
          } else if (statusResponse.status === "failed") {
            setStatus("error");
            setErrorMessage("Conversion process failed on server.");
          } else {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkStatus, pollInterval);
            } else {
              setStatus("error");
              setErrorMessage("Conversion timed out.");
            }
          }
        } catch {
          setStatus("error");
          setErrorMessage("Failed to check status.");
        }
      };

      // Start polling
      setTimeout(checkStatus, pollInterval);
    } catch (err: unknown) {
      console.error("Conversion error:", err);
      setStatus("error");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to start conversion."
      );
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-slate-100 shadow-xl p-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
          <FileType size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>

      <div className="flex-1 flex flex-col">
        {!file ? (
          <div
            className="flex-1 min-h-[200px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer group"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
            onClick={() =>
              document.getElementById(`file-upload-${targetFormat}`)?.click()
            }
          >
            <input
              type="file"
              id={`file-upload-${targetFormat}`}
              className="hidden"
              accept=".obj"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload size={28} />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1 group-hover:text-blue-500 transition-colors">
              {t("conversion.selectFile") || "Select File"}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {t("conversion.dragDrop") || "Drag & Drop or Click to Upload"}
            </p>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4">
              {t("conversion.supportedFormat") || "Supported format: .obj"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 flex items-start gap-4 reltive group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                <FileType size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate pr-2">
                    {file.name}
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    disabled={status === "converting"}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {status === "idle" && (
              <button
                onClick={handleConvert}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
              >
                {t("conversion.convert") || "Convert"}
              </button>
            )}

            {status === "converting" && (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <Loader2
                  size={32}
                  className="text-blue-500 animate-spin mb-4"
                />
                <p className="text-sm font-bold text-slate-500 animate-pulse">
                  {t("conversion.converting") || "Converting..."}
                </p>
              </div>
            )}

            {status === "success" && downloadUrl && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm font-bold">
                  <Check size={18} />
                  {t("conversion.success") || "Conversion Successful"}
                </div>
                <button
                  onClick={async () => {
                    try {
                      const { api } = await import("@/lib/api");
                      const response = await api.get<Blob>(downloadUrl, {
                        responseType: "blob",
                      });
                      const blob = response.data;
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute(
                        "download",
                        targetFormat === "glb"
                          ? `converted.glb`
                          : `converted.gltf`
                      );
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download failed", error);
                      alert("Failed to download file");
                    }
                  }}
                  className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {t("conversion.download") || "Download"}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Convert Another File
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm font-bold">
                  <AlertCircle size={18} />
                  {t("conversion.error") || "Conversion Failed"}
                </div>
                <p className="text-xs text-red-500 px-2">{errorMessage}</p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
