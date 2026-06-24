using Microsoft.AspNetCore.Mvc;

namespace ObjetosPerdidos.API;

[ApiController]
[Route("api/[controller]")]
[RequiereSession]
public class ObjetosController : ControllerBase
{
    private readonly ObjetosService _service;

    public ObjetosController(ObjetosService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_service.ObtenerTodos());

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var obj = _service.ObtenerPorId(id);
        if (obj == null) return NotFound(new { error = "Objeto no encontrado" });
        return Ok(obj);
    }

    [HttpPost]
    public IActionResult Create([FromBody] RegistrarObjetoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            return BadRequest(new { error = "El nombre es requerido" });
        if (string.IsNullOrWhiteSpace(dto.Lugar))
            return BadRequest(new { error = "El lugar es requerido" });
        if (!DateTime.TryParseExact(dto.FechaRegistro, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var fecha))
            return BadRequest(new { error = "Formato de fecha inválido. Use dd/MM/yyyy" });
        if (fecha > DateTime.Today)
            return BadRequest(new { error = "La fecha de registro no puede ser futura" });

        var nuevo = new ObjetoPerdido
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Lugar = dto.Lugar,
            FechaRegistro = fecha
        };
        return Ok(_service.Agregar(nuevo));
    }

    [HttpPut("{id:int}")]
    [RequiereAdmin]
    public IActionResult Update(int id, [FromBody] ModificarObjetoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            return BadRequest(new { error = "El nombre es requerido" });
        if (!_service.Modificar(id, dto.Nombre, dto.Descripcion, dto.Lugar))
            return NotFound(new { error = "Objeto no encontrado" });
        return Ok(new { message = "Objeto actualizado" });
    }

    [HttpDelete("{id:int}")]
    [RequiereAdmin]
    public IActionResult Delete(int id)
    {
        if (!_service.Eliminar(id))
            return NotFound(new { error = "Objeto no encontrado" });
        return Ok(new { message = "Objeto eliminado" });
    }

    [HttpPost("{id:int}/entregar")]
    [RequiereAdmin]
    public IActionResult MarcarEntregado(int id, [FromBody] MarcarEntregadoDto dto)
    {
        if (!DateTime.TryParseExact(dto.FechaEntrega, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var fecha))
            return BadRequest(new { error = "Formato de fecha inválido. Use dd/MM/yyyy" });

        var (ok, error) = _service.MarcarEntregado(id, fecha);
        if (!ok) return BadRequest(new { error });
        return Ok(new { message = "Objeto marcado como entregado" });
    }

    [HttpGet("buscar")]
    public IActionResult Buscar([FromQuery] string tipo, [FromQuery] string? nombre,
        [FromQuery] string? fechaDesde, [FromQuery] string? fechaHasta)
    {
        if (tipo == "nombre")
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return BadRequest(new { error = "Ingrese un nombre para buscar" });
            return Ok(_service.BuscarPorNombre(nombre));
        }

        if (tipo == "fechaRegistro" || tipo == "fechaEntrega")
        {
            if (!DateTime.TryParseExact(fechaDesde, "dd/MM/yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var desde))
                return BadRequest(new { error = "Formato de fecha inválido" });
            if (!DateTime.TryParseExact(fechaHasta, "dd/MM/yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var hasta))
                return BadRequest(new { error = "Formato de fecha inválido" });

            var resultados = tipo == "fechaRegistro"
                ? _service.BuscarPorFechaRegistro(desde, hasta)
                : _service.BuscarPorFechaEntrega(desde, hasta);
            return Ok(resultados);
        }

        return BadRequest(new { error = "Tipo de búsqueda inválido" });
    }
}
