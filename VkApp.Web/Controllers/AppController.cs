using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class AppController : Controller
    {
        private readonly IApplicationsProvider _applicationsProvider;

        public AppController(IApplicationsProvider applicationsProvider)
        {
            _applicationsProvider = applicationsProvider;
        }

        // GET: Legacy
        public ActionResult Index()
        {
            var applicationId = _applicationsProvider.GetNextApplicationId();
            var model = new AppView
            {
                ApplicationId = applicationId,
                AuthenticationUrl = $"https://oauth.vk.com/authorize?client_id={applicationId}&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=friends,messages,wall&response_type=token&v=5.87"
            };
            return View(model);
        }
    }
}