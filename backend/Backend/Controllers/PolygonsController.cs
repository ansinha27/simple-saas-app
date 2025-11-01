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
            CreatedByUserId = int.Parse(userIdStr),
            AreaSqM = dto.AreaSqM,
            AreaHectares = dto.AreaHectares,
            PerimeterMeters = dto.PerimeterMeters
            


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


    poly.Name = dto.Name.Trim();
    poly.Description = dto.Description;
    poly.Category = dto.Category;
    poly.AreaSqM = dto.AreaSqM;
    poly.AreaHectares = dto.AreaHectares;
    poly.PerimeterMeters = dto.PerimeterMeters;

    await _context.SaveChangesAsync();
    return Ok(poly);

    // Optional: enforce ownership if needed
    // if (poly.CreatedByUserId != int.Parse(userIdStr))
    //     return Forbid();

}

    // DELETE api/polygons/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized("Missing user id claim.");

        var poly = await _context.SitePolygons.FindAsync(id);
        if (poly == null)
            return NotFound("Parcel not found.");

        // Optional: enforce ownership if needed
        // if (poly.CreatedByUserId != int.Parse(userIdStr))
        //     return Forbid();

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

public class UpdatePolygonDto  // add new dto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }

    public double AreaSqM { get; set; }
    public double AreaHectares { get; set; }
    public double PerimeterMeters { get; set; }
}
