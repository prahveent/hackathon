using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonApi.Migrations
{
    /// <inheritdoc />
    public partial class FixStaticSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "$2a$11$8YVVdQjdoJm5vJ2a.XvXJeKLg1nJ6h4o8c3Q9mKLx7z2pFvQ6yG8O", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 30, 13, 36, 46, 761, DateTimeKind.Utc).AddTicks(6666), "$2a$11$6LBcwOoLISLY2KHqLU05A.97GqG00zbncclVl/Fn3qGdsYi9Uw/C2", new DateTime(2025, 5, 30, 13, 36, 46, 761, DateTimeKind.Utc).AddTicks(6820) });
        }
    }
}
