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
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized("Missing user id claim.");

        int userId = int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

    if (role == "Admin")
        return await _context.Locations.AsNoTracking().ToListAsync();

        return await _context.Locations
            .Where(l => l.CreatedByUserId == userId)
            .AsNoTracking()
            .ToListAsync();
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

        return CreatedAtAction(nameof(GetLocations), new { id = location.Id }, location);
    }

    // PUT: /api/locations/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, Location updated)
    {
        var existing = await _context.Locations.FindAsync(id);
        if (existing == null) 
            return NotFound();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = int.Parse(userIdStr);

        var role = User.FindFirstValue(ClaimTypes.Role);

// Allow admins to edit any location
if (role != "Admin" && existing.CreatedByUserId != userId)
    return Forbid("You do not own this location.");


        existing.Name = updated.Name;
        existing.Category = updated.Category;
        existing.Description = updated.Description;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: /api/locations/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.Locations.FindAsync(id);
        if (existing == null) 
            return NotFound();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = int.Parse(userIdStr);

        var role = User.FindFirstValue(ClaimTypes.Role);

// Allow admins to edit any location
if (role != "Admin" && existing.CreatedByUserId != userId)
    return Forbid("You do not own this location.");


        _context.Locations.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
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
