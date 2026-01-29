"use client";

import { ShareManagementTable } from "@/components/features/share/ShareManagementTable";
import { PageContainer } from "@/components/layout/PageContainer";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function SharePage() {
  const { t } = useLanguage();

  return (
    <PageContainer
      title={t("share.title") || "Share Management"}
      subtitle={t("share.subtitle") || "Manage your public links"}
    >
      <ShareManagementTable />
    </PageContainer>
  );
}
