namespace Backend.Models;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // New fields
    public string? Description { get; set; }
    public string? Category { get; set; }

    // Owner tracking (so we can say “Welcome, X” and filter later if needed)
    public int CreatedByUserId { get; set; }
}
