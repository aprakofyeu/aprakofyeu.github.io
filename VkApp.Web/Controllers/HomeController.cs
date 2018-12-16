using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VkApp.Web.Data;

namespace VkApp.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.TestData = new DataAccessor().GetData();
            return View();
        }
    }
}