using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Helpers;

public static class SchemaBootstrapper
{
    public static async Task EnsureOwnershipSchemaAsync(BookingPlatformDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync("""
            ALTER TABLE "Users"
            ADD COLUMN IF NOT EXISTS "BusinessId" uuid NULL;
            """);

        await db.Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_Users_BusinessId"
            ON "Users" ("BusinessId");
            """);

        await db.Database.ExecuteSqlRawAsync("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_Users_Businesses_BusinessId'
                ) THEN
                    ALTER TABLE "Users"
                    ADD CONSTRAINT "FK_Users_Businesses_BusinessId"
                    FOREIGN KEY ("BusinessId")
                    REFERENCES "Businesses" ("Id")
                    ON DELETE SET NULL;
                END IF;
            END $$;
            """);

        await db.Database.ExecuteSqlRawAsync("""
            ALTER TABLE "Businesses"
            ADD COLUMN IF NOT EXISTS "CreatedByUserId" uuid NULL;
            """);

        await db.Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_Businesses_CreatedByUserId"
            ON "Businesses" ("CreatedByUserId");
            """);

        await db.Database.ExecuteSqlRawAsync("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_Businesses_Users_CreatedByUserId'
                ) THEN
                    ALTER TABLE "Businesses"
                    ADD CONSTRAINT "FK_Businesses_Users_CreatedByUserId"
                    FOREIGN KEY ("CreatedByUserId")
                    REFERENCES "Users" ("Id")
                    ON DELETE SET NULL;
                END IF;
            END $$;
            """);
    }
}
