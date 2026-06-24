using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<ObjetosService>();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
});
builder.Services.AddCors(options =>
    options.AddPolicy("ReactApp", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:5174")
         .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();
app.UseCors("ReactApp");
app.UseSession();

const string AdminCif = "00000000";
const string AdminPassword = "999999";

app.MapPost("/api/auth/login", (LoginDto dto, HttpContext ctx) =>
{
    if (!Regex.IsMatch(dto.Cif, @"^\d{8}$"))
        return Results.BadRequest(new { error = "El CIF debe tener exactamente 8 dígitos numéricos" });
    if (!Regex.IsMatch(dto.Password, @"^\d{6}$"))
        return Results.BadRequest(new { error = "La contraseña debe tener exactamente 6 dígitos numéricos" });
    if (dto.Cif == AdminCif && dto.Password != AdminPassword)
        return Results.Json(new { error = "Contraseña de administrador incorrecta" }, statusCode: 401);

    var rol = (dto.Cif == AdminCif && dto.Password == AdminPassword) ? "Admin" : "Usuario";
    ctx.Session.SetString("Cif", dto.Cif);
    ctx.Session.SetString("Rol", rol);
    return Results.Ok(new LoginResponseDto(dto.Cif, rol));
});

app.MapPost("/api/auth/logout", (HttpContext ctx) =>
{
    ctx.Session.Clear();
    return Results.Ok(new { message = "Sesión cerrada" });
});

app.MapGet("/api/auth/me", (HttpContext ctx) =>
{
    var cif = ctx.Session.GetString("Cif");
    var rol = ctx.Session.GetString("Rol");
    return string.IsNullOrEmpty(cif)
        ? Results.Json(new { error = "Sin sesión activa" }, statusCode: 401)
        : Results.Ok(new LoginResponseDto(cif, rol!));
});

async ValueTask<object?> SessionFilter(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
{
    if (string.IsNullOrEmpty(ctx.HttpContext.Session.GetString("Cif")))
        return Results.Json(new { error = "Sesión requerida" }, statusCode: 401);
    return await next(ctx);
}

async ValueTask<object?> AdminFilter(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
{
    var session = ctx.HttpContext.Session;
    if (string.IsNullOrEmpty(session.GetString("Cif")))
        return Results.Json(new { error = "Sesión requerida" }, statusCode: 401);
    if (session.GetString("Rol") != "Admin")
        return Results.Json(new { error = "Acceso denegado" }, statusCode: 403);
    return await next(ctx);
}

var objetos = app.MapGroup("/api/objetos").AddEndpointFilter(SessionFilter);

objetos.MapGet("/", (ObjetosService svc) => Results.Ok(svc.ObtenerTodos()));

objetos.MapGet("/{id:int}", (int id, ObjetosService svc) =>
{
    var obj = svc.ObtenerPorId(id);
    return obj is null ? Results.NotFound(new { error = "Objeto no encontrado" }) : Results.Ok(obj);
});

objetos.MapPost("/", (RegistrarObjetoDto dto, ObjetosService svc) =>
{
    if (string.IsNullOrWhiteSpace(dto.Nombre))
        return Results.BadRequest(new { error = "El nombre es requerido" });
    if (string.IsNullOrWhiteSpace(dto.Lugar))
        return Results.BadRequest(new { error = "El lugar es requerido" });
    if (!DateTime.TryParseExact(dto.FechaRegistro, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha))
        return Results.BadRequest(new { error = "Formato de fecha inválido. Use dd/MM/yyyy" });
    if (fecha > DateTime.Today)
        return Results.BadRequest(new { error = "La fecha de registro no puede ser futura" });

    return Results.Ok(svc.Agregar(new ObjetoPerdido { Nombre = dto.Nombre, Descripcion = dto.Descripcion, Lugar = dto.Lugar, FechaRegistro = fecha }));
});

objetos.MapPut("/{id:int}", (int id, ModificarObjetoDto dto, ObjetosService svc, HttpContext ctx) =>
{
    if (ctx.Session.GetString("Rol") != "Admin")
        return Results.Json(new { error = "Acceso denegado" }, statusCode: 403);
    if (string.IsNullOrWhiteSpace(dto.Nombre))
        return Results.BadRequest(new { error = "El nombre es requerido" });
    return !svc.Modificar(id, dto.Nombre, dto.Descripcion, dto.Lugar)
        ? Results.NotFound(new { error = "Objeto no encontrado" })
        : Results.Ok(new { message = "Objeto actualizado" });
});

objetos.MapDelete("/{id:int}", (int id, ObjetosService svc, HttpContext ctx) =>
{
    if (ctx.Session.GetString("Rol") != "Admin")
        return Results.Json(new { error = "Acceso denegado" }, statusCode: 403);
    return !svc.Eliminar(id)
        ? Results.NotFound(new { error = "Objeto no encontrado" })
        : Results.Ok(new { message = "Objeto eliminado" });
});

objetos.MapPost("/{id:int}/entregar", (int id, MarcarEntregadoDto dto, ObjetosService svc, HttpContext ctx) =>
{
    if (ctx.Session.GetString("Rol") != "Admin")
        return Results.Json(new { error = "Acceso denegado" }, statusCode: 403);
    if (!DateTime.TryParseExact(dto.FechaEntrega, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha))
        return Results.BadRequest(new { error = "Formato de fecha inválido. Use dd/MM/yyyy" });
    var (ok, error) = svc.MarcarEntregado(id, fecha);
    return !ok ? Results.BadRequest(new { error }) : Results.Ok(new { message = "Objeto marcado como entregado" });
});

objetos.MapGet("/buscar", (string tipo, string? nombre, string? fechaDesde, string? fechaHasta, ObjetosService svc) =>
{
    if (tipo == "nombre")
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return Results.BadRequest(new { error = "Ingrese un nombre para buscar" });
        return Results.Ok(svc.BuscarPorNombre(nombre));
    }
    if (tipo is "fechaRegistro" or "fechaEntrega")
    {
        if (!DateTime.TryParseExact(fechaDesde, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var desde))
            return Results.BadRequest(new { error = "Formato de fecha inválido" });
        if (!DateTime.TryParseExact(fechaHasta, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var hasta))
            return Results.BadRequest(new { error = "Formato de fecha inválido" });
        return Results.Ok(tipo == "fechaRegistro"
            ? svc.BuscarPorFechaRegistro(desde, hasta)
            : svc.BuscarPorFechaEntrega(desde, hasta));
    }
    return Results.BadRequest(new { error = "Tipo de búsqueda inválido" });
});

var reportes = app.MapGroup("/api/reportes").AddEndpointFilter(AdminFilter);

reportes.MapGet("/general", (ObjetosService svc) =>
{
    var todos = svc.ObtenerTodos();
    var entregados = todos.Count(o => o.Estado == "Entregado");
    var porLugar = svc.ContarPorLugar();
    var lugarFrecuente = porLugar.OrderByDescending(p => p.Value).FirstOrDefault();
    return Results.Ok(new
    {
        total = todos.Count,
        entregados,
        pendientes = todos.Count - entregados,
        tasaEntrega = todos.Count > 0 ? Math.Round((double)entregados / todos.Count * 100, 1) : 0,
        lugarFrecuente = lugarFrecuente.Key ?? "N/A",
        lugarFrecuenteConteo = lugarFrecuente.Value
    });
});

reportes.MapGet("/rango", (string fechaDesde, string fechaHasta, ObjetosService svc) =>
{
    if (!DateTime.TryParseExact(fechaDesde, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var desde))
        return Results.BadRequest(new { error = "Formato de fecha inválido" });
    if (!DateTime.TryParseExact(fechaHasta, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var hasta))
        return Results.BadRequest(new { error = "Formato de fecha inválido" });
    var resultados = svc.BuscarPorFechaRegistro(desde, hasta);
    var entregados = resultados.Count(o => o.Estado == "Entregado");
    return Results.Ok(new
    {
        objetos = resultados,
        total = resultados.Count,
        entregados,
        pendientes = resultados.Count - entregados,
        tasaEntrega = resultados.Count > 0 ? Math.Round((double)entregados / resultados.Count * 100, 1) : 0
    });
});

reportes.MapGet("/estados", (ObjetosService svc) =>
{
    var todos = svc.ObtenerTodos();
    var entregados = todos.Count(o => o.Estado == "Entregado");
    var total = todos.Count;
    return Results.Ok(new
    {
        total,
        entregados,
        pendientes = total - entregados,
        porcentajeEntregados = total > 0 ? Math.Round((double)entregados / total * 100, 1) : 0,
        porcentajePendientes = total > 0 ? Math.Round((double)(total - entregados) / total * 100, 1) : 0
    });
});

reportes.MapGet("/lugar", (ObjetosService svc) =>
{
    var porLugar = svc.ContarPorLugar()
        .OrderByDescending(p => p.Value)
        .Select(p => new { lugar = p.Key, cantidad = p.Value })
        .ToList();
    return Results.Ok(new { lugares = porLugar, maximo = porLugar.Any() ? porLugar.Max(p => p.cantidad) : 1 });
});

reportes.MapGet("/tendencia", (ObjetosService svc) =>
{
    var registros = svc.RegistrosPorDia();
    var entregas = svc.EntregasPorDia();
    var fechas = registros.Keys.Union(entregas.Keys).OrderBy(f => f).ToList();
    return Results.Ok(new
    {
        datos = fechas.Select(f => new
        {
            fecha = f,
            registros = registros.GetValueOrDefault(f, 0),
            entregas = entregas.GetValueOrDefault(f, 0)
        })
    });
});

app.Run();

record LoginDto(string Cif, string Password);
record LoginResponseDto(string Cif, string Rol);
record RegistrarObjetoDto(string Nombre, string Descripcion, string Lugar, string FechaRegistro);
record ModificarObjetoDto(string Nombre, string Descripcion, string Lugar);
record MarcarEntregadoDto(string FechaEntrega);

class ObjetoPerdido
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string Estado { get; set; } = "Disponible";
}

class ObjetosService
{
    private readonly string _csv;
    private readonly List<ObjetoPerdido> _objetos = new();
    private int _nextId = 1;

    public ObjetosService(IWebHostEnvironment env)
    {
        _csv = Path.Combine(env.ContentRootPath, "objetos.csv");
        CargarDesdeCSV();
    }

    private void CargarDesdeCSV()
    {
        if (!File.Exists(_csv)) return;
        foreach (var linea in File.ReadAllLines(_csv))
        {
            if (string.IsNullOrWhiteSpace(linea)) continue;
            var c = ParsearCSV(linea);
            if (c.Length < 7) continue;
            var obj = new ObjetoPerdido
            {
                Nombre = c[0], Descripcion = c[1], Lugar = c[2],
                FechaRegistro = DateTime.Parse(c[3]),
                FechaEntrega = string.IsNullOrEmpty(c[4]) ? null : DateTime.Parse(c[4]),
                Estado = c[5],
                Id = int.Parse(c[6])
            };
            _objetos.Add(obj);
            if (obj.Id >= _nextId) _nextId = obj.Id + 1;
        }
    }

    private string[] ParsearCSV(string linea)
    {
        var campos = new List<string>();
        var campo = new StringBuilder();
        bool enComillas = false;
        for (int i = 0; i < linea.Length; i++)
        {
            char c = linea[i];
            if (c == '"')
            {
                if (enComillas && i + 1 < linea.Length && linea[i + 1] == '"') { campo.Append('"'); i++; }
                else enComillas = !enComillas;
            }
            else if (c == ',' && !enComillas) { campos.Add(campo.ToString()); campo.Clear(); }
            else campo.Append(c);
        }
        campos.Add(campo.ToString());
        return campos.ToArray();
    }

    private void GuardarCSV()
    {
        static string Esc(string s) => s.Contains(',') || s.Contains('"') || s.Contains('\n')
            ? $"\"{s.Replace("\"", "\"\"")}\"" : s;
        File.WriteAllLines(_csv, _objetos.Select(o => string.Join(",",
            Esc(o.Nombre), Esc(o.Descripcion), Esc(o.Lugar),
            o.FechaRegistro.ToString("yyyy-MM-dd"),
            o.FechaEntrega?.ToString("yyyy-MM-dd") ?? "",
            o.Estado, o.Id.ToString())));
    }

    public List<ObjetoPerdido> ObtenerTodos() => _objetos.ToList();
    public ObjetoPerdido? ObtenerPorId(int id) => _objetos.FirstOrDefault(o => o.Id == id);

    public ObjetoPerdido Agregar(ObjetoPerdido obj)
    {
        obj.Id = _nextId++;
        obj.Estado = "Disponible";
        _objetos.Add(obj);
        GuardarCSV();
        return obj;
    }

    public bool Modificar(int id, string nombre, string descripcion, string lugar)
    {
        var obj = ObtenerPorId(id);
        if (obj == null) return false;
        obj.Nombre = nombre; obj.Descripcion = descripcion; obj.Lugar = lugar;
        GuardarCSV();
        return true;
    }

    public bool Eliminar(int id)
    {
        var obj = ObtenerPorId(id);
        if (obj == null) return false;
        _objetos.Remove(obj);
        GuardarCSV();
        return true;
    }

    public (bool ok, string error) MarcarEntregado(int id, DateTime fechaEntrega)
    {
        var obj = ObtenerPorId(id);
        if (obj == null) return (false, "Objeto no encontrado");
        if (fechaEntrega < obj.FechaRegistro)
            return (false, "La fecha de entrega no puede ser anterior al registro");
        obj.FechaEntrega = fechaEntrega;
        obj.Estado = "Entregado";
        GuardarCSV();
        return (true, "");
    }

    public List<ObjetoPerdido> BuscarPorNombre(string nombre) =>
        _objetos.Where(o => o.Nombre.Contains(nombre, StringComparison.OrdinalIgnoreCase)).ToList();

    public List<ObjetoPerdido> BuscarPorFechaRegistro(DateTime desde, DateTime hasta) =>
        _objetos.Where(o => o.FechaRegistro.Date >= desde.Date && o.FechaRegistro.Date <= hasta.Date).ToList();

    public List<ObjetoPerdido> BuscarPorFechaEntrega(DateTime desde, DateTime hasta) =>
        _objetos.Where(o => o.FechaEntrega.HasValue &&
            o.FechaEntrega.Value.Date >= desde.Date && o.FechaEntrega.Value.Date <= hasta.Date).ToList();

    public Dictionary<string, int> ContarPorLugar() =>
        _objetos.GroupBy(o => o.Lugar).ToDictionary(g => g.Key, g => g.Count());

    public Dictionary<string, int> RegistrosPorDia() =>
        _objetos.GroupBy(o => o.FechaRegistro.Date)
            .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());

    public Dictionary<string, int> EntregasPorDia() =>
        _objetos.Where(o => o.FechaEntrega.HasValue)
            .GroupBy(o => o.FechaEntrega!.Value.Date)
            .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());
}
