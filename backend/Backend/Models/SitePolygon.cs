namespace Backend.Models;

public class SitePolygon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Store the polygon as GeoJSON (Polygon)
    public string GeoJson { get; set; } = string.Empty;

    public int CreatedByUserId { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}
