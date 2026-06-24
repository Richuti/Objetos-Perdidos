namespace ObjetosPerdidos.API;

public class ObjetosService
{
    private readonly string _csv;
    private List<ObjetoPerdido> _objetos = new();
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
        var campo = new System.Text.StringBuilder();
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
        string Esc(string s) => s.Contains(',') || s.Contains('"') || s.Contains('\n')
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
