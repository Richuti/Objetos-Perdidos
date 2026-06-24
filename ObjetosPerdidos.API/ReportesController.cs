using Microsoft.AspNetCore.Mvc;

namespace ObjetosPerdidos.API;

[ApiController]
[Route("api/[controller]")]
[RequiereAdmin]
public class ReportesController : ControllerBase
{
    private readonly ObjetosService _service;

    public ReportesController(ObjetosService service)
    {
        _service = service;
    }

    [HttpGet("general")]
    public IActionResult General()
    {
        var todos = _service.ObtenerTodos();
        var entregados = todos.Count(o => o.Estado == "Entregado");
        var pendientes = todos.Count(o => o.Estado == "Disponible");
        var porLugar = _service.ContarPorLugar();
        var lugarFrecuente = porLugar.OrderByDescending(p => p.Value).FirstOrDefault();

        return Ok(new
        {
            total = todos.Count,
            entregados,
            pendientes,
            tasaEntrega = todos.Count > 0 ? Math.Round((double)entregados / todos.Count * 100, 1) : 0,
            lugarFrecuente = lugarFrecuente.Key ?? "N/A",
            lugarFrecuenteConteo = lugarFrecuente.Value
        });
    }

    [HttpGet("rango")]
    public IActionResult PorRango([FromQuery] string fechaDesde, [FromQuery] string fechaHasta)
    {
        if (!DateTime.TryParseExact(fechaDesde, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var desde))
            return BadRequest(new { error = "Formato de fecha inválido" });
        if (!DateTime.TryParseExact(fechaHasta, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var hasta))
            return BadRequest(new { error = "Formato de fecha inválido" });

        var resultados = _service.BuscarPorFechaRegistro(desde, hasta);
        var entregados = resultados.Count(o => o.Estado == "Entregado");
        var pendientes = resultados.Count(o => o.Estado == "Disponible");

        return Ok(new
        {
            objetos = resultados,
            total = resultados.Count,
            entregados,
            pendientes,
            tasaEntrega = resultados.Count > 0 ? Math.Round((double)entregados / resultados.Count * 100, 1) : 0
        });
    }

    [HttpGet("estados")]
    public IActionResult Estados()
    {
        var todos = _service.ObtenerTodos();
        var entregados = todos.Count(o => o.Estado == "Entregado");
        var pendientes = todos.Count(o => o.Estado == "Disponible");
        var total = todos.Count;

        return Ok(new
        {
            total,
            entregados,
            pendientes,
            porcentajeEntregados = total > 0 ? Math.Round((double)entregados / total * 100, 1) : 0,
            porcentajePendientes = total > 0 ? Math.Round((double)pendientes / total * 100, 1) : 0
        });
    }

    [HttpGet("lugar")]
    public IActionResult PorLugar()
    {
        var porLugar = _service.ContarPorLugar()
            .OrderByDescending(p => p.Value)
            .Select(p => new { lugar = p.Key, cantidad = p.Value })
            .ToList();

        return Ok(new { lugares = porLugar, maximo = porLugar.Any() ? porLugar.Max(p => p.cantidad) : 1 });
    }

    [HttpGet("tendencia")]
    public IActionResult Tendencia()
    {
        var registros = _service.RegistrosPorDia();
        var entregas = _service.EntregasPorDia();
        var fechas = registros.Keys.Union(entregas.Keys).OrderBy(f => f).ToList();

        return Ok(new
        {
            datos = fechas.Select(f => new
            {
                fecha = f,
                registros = registros.GetValueOrDefault(f, 0),
                entregas = entregas.GetValueOrDefault(f, 0)
            })
        });
    }
}
