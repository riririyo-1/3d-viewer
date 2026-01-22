"use client";

import React, { useState, useEffect, use } from "react";
import { ViewerCanvas } from "@/components/three/ViewerCanvas";
import { api } from "@/lib/api";
import { Asset } from "@/lib/store";
import { Loader2, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SharedViewerPageProps {
  params: Promise<{
    shareId: string;
  }>;
}

interface ShareInfo {
  id: string;
  shareId: string;
  hasPassword: boolean;
  asset: {
    id: string;
    name: string;
    type: string;
    thumbnailUrl: string | null;
    createdAt: string;
  };
}

export default function SharedViewerPage({ params }: SharedViewerPageProps) {
  const { shareId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Viewer state
  const [assetValues, setAssetValues] = useState<Asset | null>(null);
  const [settings] = useState({
    wireframe: false,
    autoRotate: true, // Auto rotate by default for shared view
    showGrid: false,
  });

  useEffect(() => {
    const fetchShareInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get<ShareInfo>(`/shared/${shareId}`);
        setShareInfo(res.data);

        // If no password, we can try to load the asset immediately
        if (!res.data.hasPassword) {
          loadAsset(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch share info", error);
        toast.error("共有リンクが見つからないか、期限切れです");
        // Optionally redirect or show error state
      } finally {
        setLoading(false);
      }
    };

    fetchShareInfo();
  }, [shareId]);

  const loadAsset = async (info: ShareInfo, pwd?: string) => {
    try {
      const res = await api.post<{ url: string }>(
        `/shared/${info.shareId}/download`,
        {
          password: pwd,
        },
      );

      const signedUrl = res.data.url;
      setIsVerified(true);

      setAssetValues({
        id: info.asset.id,
        name: info.asset.name,
        type: info.asset.type,
        url: signedUrl,
        thumbnailUrl: info.asset.thumbnailUrl,
        data: null,
        timestamp: new Date(info.asset.createdAt).toLocaleDateString("en-US"),
      });
    } catch {
      if (pwd) {
        toast.error("パスワードが間違っています");
      } else {
        toast.error("アセットの読み込みに失敗しました");
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareInfo) return;

    setVerifying(true);
    await loadAsset(shareInfo, password);
    setVerifying(false);
  };

  const handleDownload = () => {
    if (!user) {
      // Redirect to login, retain return url logic if wanted, or just simple login
      // Maybe toast explanation
      toast.info("ダウンロードするにはログインが必要です");
      router.push("/login");
      return;
    }

    if (assetValues?.url) {
      window.open(assetValues.url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-0 bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!shareInfo) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardHeader>
            <CardTitle className="text-xl">共有リンクが無効です</CardTitle>
            <CardDescription>
              リンクが削除されたか、有効期限が切れている可能性があります。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Password Wall
  if (shareInfo.hasPassword && !isVerified) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" /> 限定公開
            </CardTitle>
            <CardDescription className="text-center">
              このアセットを閲覧するにはパスワードが必要です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力..."
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifying || !password}
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                閲覧する
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Viewer
  return (
    <div className="fixed inset-0 z-0 bg-white animate-in fade-in duration-1000">
      {/* Removed overlapping title header as per user request */}

      {assetValues && (
        <ViewerCanvas asset={assetValues} settings={settings} isPublic={true} />
      )}

      {/* Footer Controls */}
      <div className="absolute bottom-6 right-6 z-50 flex gap-4 pointer-events-auto">
        <Button
          onClick={handleDownload}
          size="icon"
          className="w-12 h-12 rounded-full shadow-xl bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 transition-all"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>

      {/* Minimal Footer Info (Optional) */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-2 pointer-events-none">
        <div className="bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            {shareInfo.asset.name}
          </span>
        </div>
      </div>
    </div>
  );
}
