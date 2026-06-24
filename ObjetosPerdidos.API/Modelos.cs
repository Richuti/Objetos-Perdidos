namespace ObjetosPerdidos.API;

public class ObjetoPerdido
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string Estado { get; set; } = "Disponible";
}

public record LoginDto(string Cif, string Password);
public record LoginResponseDto(string Cif, string Rol);
public record RegistrarObjetoDto(string Nombre, string Descripcion, string Lugar, string FechaRegistro);
public record ModificarObjetoDto(string Nombre, string Descripcion, string Lugar);
public record MarcarEntregadoDto(string FechaEntrega);
public record RangoFechasDto(string FechaDesde, string FechaHasta);
