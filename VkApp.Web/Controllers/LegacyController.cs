using System.Web.Mvc;

namespace VkApp.Web.Controllers
{
    public class LegacyController : Controller
    {
        // GET: Legacy
        public ActionResult Index()
        {
            ViewBag.Legacy = true;

            return View();
        }
    }
}