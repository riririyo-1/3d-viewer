import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Share2,
  Copy,
  Trash2,
  Calendar,
  Lock,
  QrCode,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useShares } from "@/hooks/useShare";
import { addDays, format } from "date-fns";
import { useCopyToClipboard } from "usehooks-ts";

interface SharePopoverProps {
  assetId: string;
  assetName: string;
  trigger?: React.ReactNode;
}

export function SharePopover({
  assetId,
  assetName,
  trigger,
}: SharePopoverProps) {
  const { shares, createShare, deleteShare, isLoading } = useShares();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [, copy] = useCopyToClipboard();

  // Find existing share for this asset
  // Assuming 1 share per asset for simplicity in this UI version,
  // or taking the latest one.
  const existingShare = shares?.find((s) => s.assetId === assetId);

  // Form states
  const [expireOption, setExpireOption] = useState("none"); // none, 7, 30
  const [password, setPassword] = useState("");

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      let expiresAt: string | undefined;

      if (expireOption === "7") {
        expiresAt = addDays(new Date(), 7).toISOString();
      } else if (expireOption === "30") {
        expiresAt = addDays(new Date(), 30).toISOString();
      }

      await createShare({
        assetId,
        password: password || undefined,
        expiresAt,
      });
      toast.success("共有リンクを作成しました");
    } catch (e) {
      toast.error("共有リンクの作成に失敗しました");
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!existingShare) return;
    if (!confirm("共有リンクを削除しますか？この操作は取り消せません。"))
      return;

    try {
      await deleteShare(existingShare.id);
      toast.success("共有リンクを削除しました");
      setIsOpen(false);
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleCopy = () => {
    if (!existingShare?.shareUrl && !existingShare?.shareId) return;
    // Construct URL if not provided by API
    const url =
      existingShare.shareUrl ||
      `${window.location.origin}/shared/${existingShare.shareId}`;
    copy(url);
    toast.success("リンクをコピーしました");
  };

  // Construct URL for display
  const shareUrl =
    existingShare?.shareUrl ||
    (existingShare
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${existingShare.shareId}`
      : "");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-medium text-sm">共有設定</h4>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {assetName}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : existingShare ? (
            // State B: Shared
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  共有リンク
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="h-8 text-xs font-mono bg-muted/50"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showQr ? (
                <div className="flex flex-col items-center gap-2 p-2 bg-white rounded-md">
                  <QRCode value={shareUrl} size={128} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs w-full text-black hover:bg-gray-100"
                    onClick={() => setShowQr(false)}
                  >
                    <X className="h-3 w-3 mr-1" /> 閉じる
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => setShowQr(true)}
                >
                  <QrCode className="h-3 w-3 mr-2" /> QRコードを表示
                </Button>
              )}

              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> 有効期限
                  </span>
                  <span>
                    {existingShare.expiresAt
                      ? format(new Date(existingShare.expiresAt), "yyyy/MM/dd")
                      : "無期限"}
                  </span>
                </div>
                {existingShare.hasPassword && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> パスワード
                    </span>
                    <span>設定あり</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">閲覧回数</span>
                  <span>{existingShare.viewCount}回</span>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8 text-xs mt-2"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3 mr-2" /> 共有を解除
              </Button>
            </div>
          ) : (
            // State A: Create
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expire" className="text-xs">
                  有効期限
                </Label>
                <Select value={expireOption} onValueChange={setExpireOption}>
                  <SelectTrigger id="expire" className="h-8 text-xs">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">無期限</SelectItem>
                    <SelectItem value="7">7日間</SelectItem>
                    <SelectItem value="30">30日間</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs">
                  パスワード（任意）
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="h-8 text-xs"
                  placeholder="未設定なら誰でも閲覧可能"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-8 text-xs"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                共有リンクを生成
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
