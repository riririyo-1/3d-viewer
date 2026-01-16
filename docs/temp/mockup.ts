import React, { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Upload,
  Box,
  Trash2,
  Maximize,
  Activity,
  Info,
  Rotate3d,
  Layers,
  Grid3X3,
  ChevronRight,
  Plus,
  Clock,
  ExternalLink,
  User,
  Settings,
  Globe,
  LogOut,
  FileCode,
  FolderOpen,
  Sparkles,
} from "lucide-react";

/**
 * 3D STUDIO APP - Pro Edition
 * Refined minimalist UI with English localization and adjusted footer transparency.
 */
export default function App() {
  const [view, setView] = useState("home");
  const [assets, setAssets] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [activeAsset, setActiveAsset] = useState(null);
  const [loading, setLoading] = useState(false);

  // メニューのインタラクション状態
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // ダミーユーザーデータ
  const user = {
    name: "STUDIO USER",
    plan: "PREMIUM PLAN",
  };

  // 最近開いたアセットをリストに追加
  const addToRecent = useCallback((asset) => {
    setRecentAssets((prev) => {
      const filtered = prev.filter((a) => a.id !== asset.id);
      return [asset, ...filtered].slice(0, 8);
    });
  }, []);

  // メニューのトグル管理（他を閉じる排他制御）
  const toggleCollection = (e) => {
    e.stopPropagation();
    setIsCollectionOpen(!isCollectionOpen);
    setIsRecentOpen(false);
    setIsAccountOpen(false);
  };

  const toggleRecent = (e) => {
    e.stopPropagation();
    setIsRecentOpen(!isRecentOpen);
    setIsCollectionOpen(false);
    setIsAccountOpen(false);
  };

  const toggleAccount = (e) => {
    e.stopPropagation();
    setIsAccountOpen(!isAccountOpen);
    setIsRecentOpen(false);
    setIsCollectionOpen(false);
  };

  // メニュー外をクリックした時に閉じる
  useEffect(() => {
    const closeMenus = () => {
      setIsCollectionOpen(false);
      setIsRecentOpen(false);
      setIsAccountOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  // ローカルファイルの選択と読み込み処理
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const ext = file.name.toLowerCase().split(".").pop();

    setLoading(true);
    reader.onload = (event) => {
      const newAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type: ext,
        data: event.target.result,
        timestamp: new Date().toLocaleDateString("en-US"),
      };
      setAssets((prev) => [newAsset, ...prev]);
      addToRecent(newAsset);
      setLoading(false);
      setActiveAsset(newAsset);
      setView("viewer");
      e.target.value = null;
      setIsCollectionOpen(false);
    };

    if (ext === "glb" || ext === "gltf") reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  // --- 共通ナビゲーションUI ---
  const MainHeader = () => (
    <div className="fixed top-0 left-0 w-full flex justify-center py-6 px-6 pointer-events-none z-[100]">
      <header className="pointer-events-auto bg-white/70 backdrop-blur-2xl px-5 py-2 rounded-full border border-slate-200/50 shadow-xl shadow-slate-200/20 flex items-center gap-5 transition-all duration-300">
        <div className="relative">
          <button
            onClick={toggleCollection}
            className={`p-2 rounded-full transition-all ${
              isCollectionOpen || view === "collection"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Layers size={18} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200 shadow-2xl transition-all duration-500 origin-top overflow-hidden ${
              isCollectionOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Manage Assets
              </span>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <button
                onClick={() => {
                  setView("collection");
                  setIsCollectionOpen(false);
                }}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <FolderOpen size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-white uppercase tracking-tight">
                  Open Collection
                </span>
              </button>
              <label className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Plus size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-white uppercase tracking-tight">
                  Import Asset
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".obj,.glb,.gltf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setView("home");
          }}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity px-2"
        >
          <Box
            className="text-slate-900"
            size={18}
            fill="currentColor"
            fillOpacity={0.1}
          />
          <h1 className="text-xs font-black tracking-widest text-slate-800 uppercase">
            Studio<span className="font-light">View</span>
          </h1>
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <div className="relative">
          <button
            onClick={toggleRecent}
            className={`p-2 rounded-full transition-all ${
              isRecentOpen
                ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Clock size={18} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200 shadow-2xl transition-all duration-500 origin-top overflow-hidden ${
              isRecentOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Recently Opened
              </span>
            </div>
            <div className="p-2 max-h-[320px] overflow-y-auto">
              {recentAssets.length === 0 ? (
                <div className="py-8 text-center text-slate-300 text-[10px] font-medium tracking-tight uppercase tracking-widest">
                  No history
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {recentAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setActiveAsset(asset);
                        setView("viewer");
                        setIsRecentOpen(false);
                      }}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-all text-left"
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );

  const AccountButton = () => (
    <div className="fixed top-6 right-6 z-[120] pointer-events-none">
      <div className="flex flex-col items-end text-center">
        <button
          onClick={toggleAccount}
          className={`pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl shadow-slate-200/20 border border-slate-200/50 ${
            isAccountOpen
              ? "bg-slate-900 text-white shadow-slate-900/20 scale-105"
              : "bg-white/70 backdrop-blur-2xl text-slate-600 hover:bg-white/90 hover:scale-105"
          }`}
        >
          <User size={20} />
        </button>
        <div
          onClick={(e) => e.stopPropagation()}
          className={`pointer-events-auto mt-4 w-48 bg-white/90 backdrop-blur-2xl rounded-[1.25rem] border border-slate-200 shadow-2xl transition-all duration-500 origin-top-right overflow-hidden ${
            isAccountOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
          }`}
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
                Account
              </span>
            </button>
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-900 group transition-all text-left">
              <Globe
                size={13}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-white tracking-tight uppercase">
                Language
              </span>
            </button>
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-900 group transition-all text-left">
              <Settings
                size={13}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-white tracking-tight uppercase">
                Settings
              </span>
            </button>
            <div className="my-1 mx-2 h-px bg-slate-100" />
            <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-red-50 group transition-all text-left text-red-500">
              <LogOut
                size={13}
                className="text-red-400 group-hover:text-red-600 transition-colors"
              />
              <span className="text-[10px] font-bold tracking-tight uppercase">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-900 overflow-x-hidden relative">
      <MainHeader />
      <AccountButton />
      <div className="relative z-0">
        {view === "home" && <HomeScreen setView={setView} />}
        {view === "collection" && (
          <CollectionScreen
            assets={assets}
            setView={setView}
            setActiveAsset={setActiveAsset}
            handleFileUpload={handleFileUpload}
            removeAsset={(id, e) => {
              e.stopPropagation();
              setAssets((p) => p.filter((a) => a.id !== id));
              setRecentAssets((p) => p.filter((a) => a.id !== id));
              if (activeAsset?.id === id) setActiveAsset(null);
            }}
            loading={loading}
          />
        )}
        {view === "viewer" && activeAsset && (
          <ViewerScreen asset={activeAsset} />
        )}
      </div>
    </div>
  );
}

// --- HomeScreen コンポーネント ---
function HomeScreen({ setView }) {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center pt-32 px-6 overflow-hidden">
      {/* 背景アニメーションBlob */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-slate-200/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out text-center flex flex-col items-center">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.95]">
            Visionary
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-400">
              Geometry.
            </span>
          </h2>

          <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium opacity-80 mb-4">
            Logic to Aesthetics. A minimalist space bringing new life{" "}
            <br className="hidden md:block" />
            and profound serenity to your 3D assets.
          </p>

          {/* 移動と余白調整をした Studio Perspective ラベル */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
            <Sparkles size={12} className="text-blue-400" />
            Studio Perspective
          </div>
        </div>

        {/* フィーチャーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 ease-out pb-24">
          <button
            onClick={() => setView("collection")}
            className="group relative p-1 rounded-[2.8rem] bg-gradient-to-b from-white to-slate-100 shadow-2xl transition-all duration-500 hover:scale-[1.03] active:scale-95 text-center flex flex-col items-center"
          >
            <div className="bg-white rounded-[2.7rem] p-10 h-full flex flex-col items-center text-center overflow-hidden relative w-full">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-20 h-20 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white mb-8 group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-slate-900/30">
                <Layers size={36} />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight uppercase italic">
                My Collection
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                Personal Asset Library
              </p>
              <div className="mt-auto flex items-center gap-3 py-2 px-6 rounded-full bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em]">
                Explore Collection{" "}
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </button>

          <div className="group relative p-1 rounded-[2.8rem] bg-white shadow-sm opacity-60 grayscale transition-all duration-500 cursor-not-allowed">
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[2.7rem] p-10 h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[1.8rem] flex items-center justify-center text-slate-300 mb-8 font-bold text-3xl">
                ☁️
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight uppercase italic text-slate-400">
                Cloud Node
              </h3>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                Multi-Device Sync
              </p>
              <span className="mt-auto text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                Update Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite alternate ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </main>
  );
}

// --- CollectionScreen コンポーネント ---
function CollectionScreen({
  assets,
  setView,
  setActiveAsset,
  handleFileUpload,
  removeAsset,
  loading,
}) {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-24 pb-24 relative z-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 pt-4">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
            Collections
          </h2>
          <div className="h-1 w-12 bg-slate-900 mt-4 rounded-full" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-6">
            Digital Geometry Archives
          </p>
        </div>

        <label className="relative z-50 cursor-pointer bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-slate-900/40 active:scale-95 whitespace-nowrap uppercase">
          <Plus size={18} />
          New Import
          <input
            type="file"
            className="hidden"
            accept=".obj,.glb,.gltf"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => {
              setActiveAsset(asset);
              setView("viewer");
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
                onClick={(e) => removeAsset(asset.id, e)}
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
              Inventory Empty
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[500] flex items-center justify-center">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-[6px] border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">
              Processing...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

// --- ViewerScreen コンポーネント ---
function ViewerScreen({ asset }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const currentObjectRef = useRef(null);
  const pedestalRef = useRef(null);
  const gridRef = useRef(null);

  const [settings, setSettings] = useState({
    wireframe: false,
    autoRotate: false,
    showGrid: false,
  });

  const createGradientTexture = () => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#f3f4f6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = createGradientTexture();
    scene.fog = new THREE.Fog("#f3f4f6", 15, 60);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4.4, 3.5, 4.4);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.1, 64),
      new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        roughness: 0.8,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      })
    );
    pedestal.position.y = -0.05;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    pedestalRef.current = pedestal;
    const gridHelper = new THREE.GridHelper(100, 100, 0xd1d5db, 0xe5e7eb);
    gridHelper.position.y = -0.11;
    gridHelper.visible = settings.showGrid;
    scene.add(gridHelper);
    gridRef.current = gridHelper;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;
    const animate = () => {
      requestAnimationFrame(animate);
      if (pedestalRef.current && cameraRef.current)
        pedestalRef.current.material.opacity =
          cameraRef.current.position.y < -0.1 ? 0.15 : 0.9;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const loader = asset.type === "obj" ? new OBJLoader() : new GLTFLoader();
    const handleModel = (obj) => {
      const target = asset.type === "obj" ? obj : obj.scene;
      const box = new THREE.Box3().setFromObject(target);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2.8 / (Math.max(size.x, size.y, size.z) || 1);
      target.scale.set(scale, scale, scale);
      target.position.sub(center.multiplyScalar(scale));
      target.position.y += (size.y * scale) / 2;
      target.traverse((c) => {
        if (c.isMesh) {
          if (asset.type === "obj")
            c.material = new THREE.MeshStandardMaterial({
              color: 0x444444,
              roughness: 0.5,
              metalness: 0.1,
            });
          c.castShadow = true;
          c.receiveShadow = true;
          c.material.wireframe = settings.wireframe;
        }
      });
      scene.add(target);
      currentObjectRef.current = target;
    };
    if (asset.type === "obj") handleModel(loader.parse(asset.data));
    else loader.parse(asset.data, "", handleModel);
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement)
        mountRef.current.removeChild(renderer.domElement);
    };
  }, [asset]);

  useEffect(() => {
    if (controlsRef.current)
      controlsRef.current.autoRotate = settings.autoRotate;
    if (gridRef.current) gridRef.current.visible = settings.showGrid;
    if (currentObjectRef.current) {
      currentObjectRef.current.traverse((c) => {
        if (c.isMesh) c.material.wireframe = settings.wireframe;
      });
    }
  }, [settings]);

  return (
    <div className="fixed inset-0 z-0 bg-white animate-in fade-in duration-1000">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col">
        <div className="mt-auto w-full flex justify-center mb-6">
          {/* ボトムメニュー背景: bg-slate-900/90 */}
          <footer className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, wireframe: !s.wireframe }))
              }
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                settings.wireframe
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Maximize size={14} /> WIREFRAME
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, showGrid: !s.showGrid }))
              }
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                settings.showGrid
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Grid3X3 size={14} /> GRID
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, autoRotate: !s.autoRotate }))
              }
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                settings.autoRotate
                  ? "bg-white text-slate-900 shadow-xl"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Rotate3d
                size={16}
                className={settings.autoRotate ? "animate-spin-custom" : ""}
              />{" "}
              SPIN
            </button>
          </footer>
        </div>
      </div>
      <style>{` @keyframes spin-custom { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-custom { animation: spin-custom 20s linear infinite; } `}</style>
    </div>
  );
}
