using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PolygonsController : ControllerBase
{
    private readonly AppDbContext _context;
    public PolygonsController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/polygons
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<SitePolygon>>> Get()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized("Missing user id claim.");

        int userId = int.Parse(userIdStr);

        return await _context.SitePolygons
            .Where(p => p.CreatedByUserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    // POST api/polygons
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<SitePolygon>> Post([FromBody] CreatePolygonDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized("Missing user id claim.");

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.GeoJson))
            return BadRequest("Name and GeoJson are required.");

        var poly = new SitePolygon
        {
            Name = dto.Name.Trim(),
            GeoJson = dto.GeoJson,
            Description = dto.Description,
            Category = dto.Category,
            AreaSqM = dto.AreaSqM,
            AreaHectares = dto.AreaHectares,
            PerimeterMeters = dto.PerimeterMeters,
            CreatedByUserId = int.Parse(userIdStr)
        };

        _context.SitePolygons.Add(poly);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = poly.Id }, poly);
    }

    // PUT api/polygons/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<SitePolygon>> Put(int id, [FromBody] UpdatePolygonDto dto)
    {
        var poly = await _context.SitePolygons.FindAsync(id);
        if (poly == null)
            return NotFound("Parcel not found.");

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = int.Parse(userIdStr);

        if (poly.CreatedByUserId != userId)
            return Forbid("You do not own this parcel.");

        poly.Name = dto.Name.Trim();
        poly.Description = dto.Description;
        poly.Category = dto.Category;
        poly.AreaSqM = dto.AreaSqM;
        poly.AreaHectares = dto.AreaHectares;
        poly.PerimeterMeters = dto.PerimeterMeters;

        await _context.SaveChangesAsync();
        return Ok(poly);
    }

    // DELETE api/polygons/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var poly = await _context.SitePolygons.FindAsync(id);
        if (poly == null)
            return NotFound("Parcel not found.");

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = int.Parse(userIdStr);

        if (poly.CreatedByUserId != userId)
            return Forbid("You do not own this parcel.");

        _context.SitePolygons.Remove(poly);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreatePolygonDto
{
    public string Name { get; set; } = string.Empty;
    public string GeoJson { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }

    public double AreaSqM { get; set; }
    public double AreaHectares { get; set; }
    public double PerimeterMeters { get; set; }
}

public class UpdatePolygonDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }

    public double AreaSqM { get; set; }
    public double AreaHectares { get; set; }
    public double PerimeterMeters { get; set; }
}
