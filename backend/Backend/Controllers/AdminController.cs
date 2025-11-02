using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // ✅ Only allow admins
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ Get all users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Role
            })
            .ToListAsync();

        return Ok(users);
    }

    // ✅ Create new user
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("Username already exists.");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Username, user.Role });
    }

    // ✅ Update user (username, password, role — all optional)
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("User not found.");

        if (!string.IsNullOrWhiteSpace(dto.Username))
            user.Username = dto.Username;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        if (!string.IsNullOrWhiteSpace(dto.Role))
            user.Role = dto.Role;

        await _context.SaveChangesAsync();
        return Ok(new { user.Id, user.Username, user.Role });
    }

    // ✅ Delete user + their data
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Prevent deleting your own account
        if (id == currentUserId)
            return BadRequest("Admins cannot delete themselves.");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("User not found.");

        // ✅ Delete all user's locations & polygons
        var userLocations = _context.Locations.Where(l => l.CreatedByUserId == id);
        var userPolygons = _context.SitePolygons.Where(p => p.CreatedByUserId == id);

        _context.Locations.RemoveRange(userLocations);
        _context.SitePolygons.RemoveRange(userPolygons);
        _context.Users.Remove(user);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ✅ Change role only (optional - still supported)
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
    {
        if (dto.Role != "User" && dto.Role != "Admin")
            return BadRequest("Invalid role. Must be 'User' or 'Admin'.");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.Role = dto.Role;
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Username, user.Role });
    }
}

public class CreateUserDto
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "User";
}

public class UpdateUserDto
{
    public string? Username { get; set; }
    public string? Password { get; set; } // optional
    public string? Role { get; set; }     // optional
}

public class UpdateRoleDto
{
    public string Role { get; set; } = "User";
}
