using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPolygonMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AreaHectares",
                table: "SitePolygons",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "AreaSqM",
                table: "SitePolygons",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PerimeterMeters",
                table: "SitePolygons",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AreaHectares",
                table: "SitePolygons");

            migrationBuilder.DropColumn(
                name: "AreaSqM",
                table: "SitePolygons");

            migrationBuilder.DropColumn(
                name: "PerimeterMeters",
                table: "SitePolygons");
        }
    }
}
