-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wedding_id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "attendance" TEXT NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "meal_preference" TEXT,
    "message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rsvp_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "Wedding" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Wedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admin_id" TEXT NOT NULL,
    "theme_code" TEXT,
    "invitation_json" TEXT,
    "wedding_date" DATETIME,
    "wedding_time" TEXT,
    "location_name" TEXT,
    "location_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wedding_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Wedding" ("admin_id", "created_at", "id", "location_address", "location_name", "status", "theme_code", "wedding_date") SELECT "admin_id", "created_at", "id", "location_address", "location_name", "status", "theme_code", "wedding_date" FROM "Wedding";
DROP TABLE "Wedding";
ALTER TABLE "new_Wedding" RENAME TO "Wedding";
CREATE UNIQUE INDEX "Wedding_theme_code_key" ON "Wedding"("theme_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
