using System;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/invites")]
    public class InvitesController: Controller
    {
        private readonly IInvitesProvider _invitesProvider;
        private readonly IUserProvider _user;

        public InvitesController(IInvitesProvider invitesProvider, IUserProvider user)
        {
            _invitesProvider = invitesProvider;
            _user = user;
        }

        [HttpGet]
        [Route("getInvitedUsers")]
        public JsonResult GetInvitedUsers(int userId, int groupId)
        {
            var user = _user.GetUser(userId);
            var invitesEdge = DateTime.UtcNow.AddDays(-user.InvitesInterval);
            var invites = _invitesProvider.GetInvites(userId, groupId, invitesEdge);

            var invitedUsers = invites.Select(x => x.InvitedUserId).ToList();

            return Json(invitedUsers, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("markAsInvited")]
        public JsonResult MarkAsInvited(int invitedUserId, int userId, int groupId)
        {
            _invitesProvider.MarkAsInvited(invitedUserId, userId, groupId);
            return Json(new {success = true});
        }
    }
}