using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using VkApp.Data.DataProviders;
using VkApp.Web.Infrastructure;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class LoginController : Controller
    {
        private readonly IUserRolesProvider _rolesProvider;

        public LoginController(IUserRolesProvider rolesProvider)
        {
            _rolesProvider = rolesProvider;
        }

        [Route("login")]
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [Route("login")]
        public ActionResult Login(LoginView model)
        {
            var role = _rolesProvider.GetRoleByPassword(model.Password);

            if (!string.IsNullOrEmpty(role))
            {
                var token = AuthToken.Create(role, model.Password);

                var cookie = new HttpCookie(AuthToken.AuthTokenKey, AuthToken.Encrypt(token))
                {
                    Expires = DateTime.Now.AddYears(1)
                };

                Response.Cookies.Add(cookie);

                return RedirectToAction("Index", "App");
            }

            ViewBag.ErrorMessage = "Неверный пароль";

            return View();
        }

        [Route("logout")]
        public ActionResult Logout()
        {
            var authCookie = Response.Cookies[AuthToken.AuthTokenKey];
            if (authCookie != null)
            {
                authCookie.Expires = DateTime.Now.AddDays(-1);
            }

            return RedirectToAction("Login");
        }
    }
}