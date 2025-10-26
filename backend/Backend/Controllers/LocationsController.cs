using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public LocationsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/locations
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
    {
        // For now, return all. Later we can filter by user or add layers/filters.
        return await _context.Locations.AsNoTracking().ToListAsync();
    }

    // POST: /api/locations
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Location>> CreateLocation([FromBody] CreateLocationDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized("Missing user id claim.");

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        var location = new Location
        {
            Name = dto.Name,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Description = dto.Description,
            Category = dto.Category,
            CreatedByUserId = int.Parse(userIdStr)
        };

        _context.Locations.Add(location);
        await _context.SaveChangesAsync();

        // Return created resource
        return CreatedAtAction(nameof(GetLocations), new { id = location.Id }, location);
    }
}

public class CreateLocationDto
{
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}
