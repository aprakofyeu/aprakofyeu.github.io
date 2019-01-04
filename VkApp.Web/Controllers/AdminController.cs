using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class AdminController : Controller
    {
        private readonly IApplicationsProvider _applicationsProvider;

        public AdminController(IApplicationsProvider applicationsProvider)
        {
            _applicationsProvider = applicationsProvider;
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Applications()
        {
            return View(new ApplicationsView { Applications = GetAllApplications() });
        }

        private IEnumerable<ApplicationView> GetAllApplications()
        {
            return _applicationsProvider.GetAllApplications()
                .Select(x => x.Map());
        }

        public ActionResult RemoveApplication(string id)
        {
            if (!int.TryParse(id, out var applicationId))
                throw new ArgumentException();

            _applicationsProvider.Remove(applicationId);
            return RedirectToAction("Applications");
        }

        public ActionResult AddApplication(ApplicationsView model)
        {
            string error;

            error = model.NewApplication == null || model.NewApplication.Id <= 0
                ? "Application Id is invalid"
                : _applicationsProvider.Add(model.NewApplication.Map());

            if (string.IsNullOrEmpty(error))
                return RedirectToAction("Applications");

            model.Applications = GetAllApplications();
            model.Error = error;

            return View("Applications", model);

        }
    }
}