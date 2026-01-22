-- CreateTable
CREATE TABLE "share_links" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "share_id" VARCHAR(12) NOT NULL,
    "password" VARCHAR(255),
    "expires_at" TIMESTAMP(3),
    "max_views" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_links_share_id_key" ON "share_links"("share_id");

-- CreateIndex
CREATE INDEX "idx_share_links_user_id" ON "share_links"("user_id");

-- CreateIndex
CREATE INDEX "idx_share_links_share_id" ON "share_links"("share_id");

-- CreateIndex
CREATE INDEX "idx_share_links_expires_at" ON "share_links"("expires_at");

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
