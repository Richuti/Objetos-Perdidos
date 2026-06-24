using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace ObjetosPerdidos.API;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string AdminCif = "00000000";
    private const string AdminPassword = "999999";

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (!Regex.IsMatch(dto.Cif, @"^\d{8}$"))
            return BadRequest(new { error = "El CIF debe tener exactamente 8 dígitos numéricos" });

        if (!Regex.IsMatch(dto.Password, @"^\d{6}$"))
            return BadRequest(new { error = "La contraseña debe tener exactamente 6 dígitos numéricos" });

        if (dto.Cif == AdminCif && dto.Password != AdminPassword)
            return Unauthorized(new { error = "Contraseña de administrador incorrecta" });

        var rol = (dto.Cif == AdminCif && dto.Password == AdminPassword) ? "Admin" : "Usuario";

        HttpContext.Session.SetString("Cif", dto.Cif);
        HttpContext.Session.SetString("Rol", rol);

        return Ok(new LoginResponseDto(dto.Cif, rol));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return Ok(new { message = "Sesión cerrada" });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var cif = HttpContext.Session.GetString("Cif");
        var rol = HttpContext.Session.GetString("Rol");
        if (string.IsNullOrEmpty(cif))
            return Unauthorized(new { error = "Sin sesión activa" });
        return Ok(new LoginResponseDto(cif, rol!));
    }
}
