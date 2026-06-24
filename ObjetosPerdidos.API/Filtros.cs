using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ObjetosPerdidos.API;

public class RequiereSessionAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (string.IsNullOrEmpty(context.HttpContext.Session.GetString("Cif")))
            context.Result = new UnauthorizedObjectResult(new { error = "Sesión requerida" });
    }
}

public class RequiereAdminAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var session = context.HttpContext.Session;
        if (string.IsNullOrEmpty(session.GetString("Cif")))
        {
            context.Result = new UnauthorizedObjectResult(new { error = "Sesión requerida" });
            return;
        }
        if (session.GetString("Rol") != "Admin")
            context.Result = new ObjectResult(new { error = "Acceso denegado" }) { StatusCode = 403 };
    }
}
