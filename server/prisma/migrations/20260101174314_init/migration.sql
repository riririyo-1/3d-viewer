-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "plan" VARCHAR(20) NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'ja',
    "storage_used" BIGINT NOT NULL DEFAULT 0,
    "storage_limit" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "size" BIGINT NOT NULL,
    "storage_path" VARCHAR(512) NOT NULL,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "last_opened_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recent_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_models" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(10) NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "original_type" VARCHAR(10) NOT NULL,
    "converted_name" VARCHAR(255) NOT NULL,
    "converted_type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "storage_path" VARCHAR(512),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "conversion_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_storage_path_key" ON "assets"("storage_path");

-- CreateIndex
CREATE INDEX "idx_assets_user_id" ON "assets"("user_id");

-- CreateIndex
CREATE INDEX "idx_assets_type" ON "assets"("type");

-- CreateIndex
CREATE INDEX "idx_assets_created_at" ON "assets"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_recent_history_user_id" ON "recent_history"("user_id");

-- CreateIndex
CREATE INDEX "idx_recent_history_last_opened" ON "recent_history"("last_opened_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "recent_history_user_id_asset_id_key" ON "recent_history"("user_id", "asset_id");

-- CreateIndex
CREATE INDEX "idx_library_category" ON "library_models"("category");

-- CreateIndex
CREATE INDEX "idx_library_created_at" ON "library_models"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_conversion_user_id" ON "conversion_jobs"("user_id");

-- CreateIndex
CREATE INDEX "idx_conversion_status" ON "conversion_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_conversion_created_at" ON "conversion_jobs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_history" ADD CONSTRAINT "recent_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_history" ADD CONSTRAINT "recent_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_jobs" ADD CONSTRAINT "conversion_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
