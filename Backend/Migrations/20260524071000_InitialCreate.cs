using System;
using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

[DbContext(typeof(BookingPlatformDbContext))]
[Migration("20260524071000_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Businesses",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "text", nullable: false),
                BusinessType = table.Column<string>(type: "text", nullable: false),
                OwnerName = table.Column<string>(type: "text", nullable: false),
                Phone = table.Column<string>(type: "text", nullable: false),
                Email = table.Column<string>(type: "text", nullable: false),
                Address = table.Column<string>(type: "text", nullable: false),
                City = table.Column<string>(type: "text", nullable: false),
                LogoUrl = table.Column<string>(type: "text", nullable: false),
                CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                OpeningTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                ClosingTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Businesses", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "text", nullable: false),
                Email = table.Column<string>(type: "text", nullable: false),
                PasswordHash = table.Column<string>(type: "text", nullable: false),
                Role = table.Column<string>(type: "text", nullable: false),
                BusinessId = table.Column<Guid>(type: "uuid", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
                table.ForeignKey(
                    name: "FK_Users_Businesses_BusinessId",
                    column: x => x.BusinessId,
                    principalTable: "Businesses",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "Offers",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                BusinessId = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "text", nullable: false),
                Description = table.Column<string>(type: "text", nullable: false),
                Category = table.Column<string>(type: "text", nullable: false),
                OriginalPrice = table.Column<decimal>(type: "numeric", nullable: false),
                OfferPrice = table.Column<decimal>(type: "numeric", nullable: false),
                DiscountPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                TotalCapacity = table.Column<int>(type: "integer", nullable: false),
                MaxBookingPerCustomer = table.Column<int>(type: "integer", nullable: false),
                TermsAndConditions = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Offers", x => x.Id);
                table.ForeignKey(
                    name: "FK_Offers_Businesses_BusinessId",
                    column: x => x.BusinessId,
                    principalTable: "Businesses",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "OfferSlots",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                SlotDate = table.Column<DateOnly>(type: "date", nullable: false),
                StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                Capacity = table.Column<int>(type: "integer", nullable: false),
                BookedCount = table.Column<int>(type: "integer", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_OfferSlots", x => x.Id);
                table.ForeignKey(
                    name: "FK_OfferSlots_Offers_OfferId",
                    column: x => x.OfferId,
                    principalTable: "Offers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Bookings",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                BookingReference = table.Column<string>(type: "text", nullable: false),
                OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                SlotId = table.Column<Guid>(type: "uuid", nullable: false),
                CustomerName = table.Column<string>(type: "text", nullable: false),
                CustomerPhone = table.Column<string>(type: "text", nullable: false),
                CustomerEmail = table.Column<string>(type: "text", nullable: false),
                PeopleCount = table.Column<int>(type: "integer", nullable: false),
                SpecialNote = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Bookings", x => x.Id);
                table.ForeignKey(
                    name: "FK_Bookings_OfferSlots_SlotId",
                    column: x => x.SlotId,
                    principalTable: "OfferSlots",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Bookings_Offers_OfferId",
                    column: x => x.OfferId,
                    principalTable: "Offers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(name: "IX_Bookings_BookingReference", table: "Bookings", column: "BookingReference", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Businesses_CreatedByUserId", table: "Businesses", column: "CreatedByUserId");
        migrationBuilder.CreateIndex(name: "IX_Bookings_OfferId", table: "Bookings", column: "OfferId");
        migrationBuilder.CreateIndex(name: "IX_Bookings_SlotId", table: "Bookings", column: "SlotId");
        migrationBuilder.CreateIndex(name: "IX_Offers_BusinessId", table: "Offers", column: "BusinessId");
        migrationBuilder.CreateIndex(name: "IX_OfferSlots_OfferId", table: "OfferSlots", column: "OfferId");
        migrationBuilder.CreateIndex(name: "IX_Users_BusinessId", table: "Users", column: "BusinessId");
        migrationBuilder.CreateIndex(name: "IX_Users_Email", table: "Users", column: "Email", unique: true);

        migrationBuilder.AddForeignKey(
            name: "FK_Businesses_Users_CreatedByUserId",
            table: "Businesses",
            column: "CreatedByUserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Bookings");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropTable(name: "OfferSlots");
        migrationBuilder.DropTable(name: "Offers");
        migrationBuilder.DropTable(name: "Businesses");
    }
}
