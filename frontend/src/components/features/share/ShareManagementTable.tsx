import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useShares, ShareLink } from "@/hooks/useShare";
import { format } from "date-fns";
import { useCopyToClipboard } from "usehooks-ts";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ShareManagementTable() {
  const { shares, deleteShare, isLoading } = useShares();
  const [, copy] = useCopyToClipboard();
  const { t } = useLanguage();

  const handleCopy = (share: ShareLink) => {
    const url =
      share.shareUrl || `${window.location.origin}/shared/${share.shareId}`;
    copy(url);
    toast.success(t("share.copySuccess") || "Link copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t("share.deleteConfirm") ||
          "Are you sure you want to delete this share link?",
      )
    )
      return;
    try {
      await deleteShare(id);
      toast.success(t("share.deleteSuccess") || "Link deleted successfully");
    } catch {
      toast.error(t("share.deleteError") || "Failed to delete link");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t("share.loading") || "Loading..."}
      </div>
    );
  }

  if (!shares || shares.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t("share.noLinks") || "No share links found"}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("share.object") || "Object"}</TableHead>
            <TableHead className="w-[100px]">
              {t("share.views") || "Views"}
            </TableHead>
            <TableHead>{t("share.expires") || "Expires"}</TableHead>
            <TableHead>{t("share.link") || "Share Link"}</TableHead>
            <TableHead>{t("share.created") || "Created"}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.map((share) => (
            <TableRow key={share.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                    {share.asset?.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={share.asset.thumbnailUrl}
                        alt={share.asset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100" />
                    )}
                  </div>
                  <span className="font-medium truncate max-w-[150px]">
                    {share.asset?.name || t("share.unknown") || "Unknown"}
                  </span>
                </div>
              </TableCell>
              <TableCell>{share.viewCount}</TableCell>
              <TableCell>
                <div className="flex items-center text-xs">
                  {share.expiresAt ? (
                    <span
                      className={
                        new Date(share.expiresAt) < new Date()
                          ? "text-red-500 font-bold"
                          : ""
                      }
                    >
                      {format(new Date(share.expiresAt), "yyyy/MM/dd")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  {share.hasPassword && (
                    <Lock className="ml-2 h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground truncate max-w-[150px] font-mono">
                    {share.shareUrl || `/shared/${share.shareId}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(share)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(share.createdAt), "yyyy/MM/dd")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopy(share)}>
                      <Copy className="mr-2 h-4 w-4" /> {t("common.copy")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => handleDelete(share.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
