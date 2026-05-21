ALTER TABLE "collections" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "collections_user_id_sort_order_idx" ON "collections"("user_id", "sort_order");
