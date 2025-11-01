public class SitePolygon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public string GeoJson { get; set; } = string.Empty;

    public double AreaSqM { get; set; }       // New
    public double AreaHectares { get; set; }  // New
    public double PerimeterMeters { get; set; } // New

    public int CreatedByUserId { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}
