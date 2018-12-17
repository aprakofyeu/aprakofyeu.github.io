using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VkApp.Web.Data;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class AdminController: Controller
    {
        private IApplicationsProvider _applicationsProvider;

        public AdminController(IApplicationsProvider applicationsProvider)
        {
            _applicationsProvider = applicationsProvider;
        }

        public ActionResult Applications()
        {
            var applications = _applicationsProvider.GetAllApplications();
            return View(new ApplicationsView{Applications = applications});
        }
    }
}