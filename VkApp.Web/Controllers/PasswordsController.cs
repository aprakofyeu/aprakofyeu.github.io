using System.Web.Mvc;
using VkApp.Data;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Controllers
{
    [Authorize(Roles = Role.Admin)]
    public class PasswordsController: Controller
    {
        private readonly IUserRolesProvider _userRolesProvider;

        public PasswordsController(IUserRolesProvider userRolesProvider)
        {
            _userRolesProvider = userRolesProvider;
        }

        public ActionResult Index()
        {
            var roles = _userRolesProvider.GetUserRoles();

            return View("Index", roles);
        }

        public ActionResult Remove(int id)
        {
            _userRolesProvider.Remove(id);

            return RedirectToAction("Index");
        }

        public ActionResult Create(string password, string comment, bool allowMessages, bool allowInvites, bool allowInstruments)
        {
            if (string.IsNullOrEmpty(password))
            {
                ViewBag.AddPasswordError = "Password should not be empty";
                return Index();
            }

            _userRolesProvider.AddUserPassword(password, comment, allowMessages, allowInvites, allowInstruments);

            return RedirectToAction("Index");
        }
    }
}