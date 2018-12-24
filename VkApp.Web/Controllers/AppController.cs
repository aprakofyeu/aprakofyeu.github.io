using System.Web.Mvc;
using VkApp.Web.Data;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class AppController : Controller
    {
        private IApplicationsProvider _applicationsProvider;

        public AppController(IApplicationsProvider applicationsProvider)
        {
            _applicationsProvider = applicationsProvider;
        }

        // GET: Legacy
        public ActionResult Index()
        {
            var model = new AppView{ ApplicationId = _applicationsProvider.GetNextApplicationId()};
            return View(model);
        }
    }
}