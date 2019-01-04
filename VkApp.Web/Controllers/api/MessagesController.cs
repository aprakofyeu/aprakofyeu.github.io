using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers.api
{
    [RoutePrefix("api/messages")]
    public class MessagesController : Controller
    {
        private readonly IMessagesProvider _messagesProvider;
        private readonly IApplicationsProvider _applicationsProvider;
        private readonly IUserProvider _userProvider;

        public MessagesController(
            IMessagesProvider messagesProvider,
            IApplicationsProvider applicationsProvider,
            IUserProvider userProvider)
        {
            _messagesProvider = messagesProvider;
            _applicationsProvider = applicationsProvider;
            _userProvider = userProvider;
        }

        [HttpPost]
        [Route("add")]
        public JsonResult AddMessage(SentMessageRequest request)
        {
            _applicationsProvider.IncreaseApplicationCount(request.ApplicationId);

            var messageAdded = _messagesProvider.AddMessage(request.SenderUserId, request.TargetGroupId, request.TargetUserId);

            return messageAdded
                ? Json(new { success = true })
                : Json(new { success = false, error = "Message already sent by other user" });
        }

        [HttpGet]
        [Route("haveMessages")]
        public JsonResult HaveMessagesByGroup(int targetGroupId, int targetUserId)
        {
            var haveMessages = _messagesProvider.HaveUserMessagesByGroup(targetGroupId, targetUserId);
            return Json(haveMessages, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("usersWithoutMessages")]
        public JsonResult GetUsersWithoutMessagesByGroup(int targetGroupId, IEnumerable<int> userIds)
        {
            var resultUserIds = _messagesProvider.GetUsersWithoutMessagesByGroup(targetGroupId, userIds);
            return Json(resultUserIds);
        }

        [HttpGet]
        [Route("getAll")]
        public JsonResult GetAllMessagesByGroup(int targetGroupId)
        {
            var messages = _messagesProvider.GetAllMessagesByGroup(targetGroupId);
            var users = _userProvider.GetUsersByGroup(targetGroupId);

            return new JsonCamel(new
            {
                messages = messages
                    .GroupBy(x => x.VkSenderId)
                    .ToDictionary(x => x.Key, x => x.Select(y => y.VkTargetUserId)),

                users = users.Select(x => new { Id = x.VkUserId, x.FirstName, x.LastName })
            });
        }
    }
}