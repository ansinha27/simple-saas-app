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
    public PolygonsController(AppDbContext context) { _context = context; }

    // GET api/polygons
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<SitePolygon>>> Get()
    {
        return await _context.SitePolygons.AsNoTracking().ToListAsync();
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
            CreatedByUserId = int.Parse(userIdStr)
        };
        _context.SitePolygons.Add(poly);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = poly.Id }, poly);
    }
}

public class CreatePolygonDto
{
    public string Name { get; set; } = string.Empty;
    public string GeoJson { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
}
