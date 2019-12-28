using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Statistics;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/messages")]
    public class MessagesController : Controller
    {
        private readonly IMessagesProvider _messagesProvider;
        private readonly IUserProvider _userProvider;
        private readonly IMessagesAggregator _messagesAggregator;

        public MessagesController(
            IMessagesProvider messagesProvider,
            IUserProvider userProvider,
            IMessagesAggregator messagesAggregator)
        {
            _messagesProvider = messagesProvider;
            _userProvider = userProvider;
            _messagesAggregator = messagesAggregator;
        }

        [HttpPost]
        [Route("add")]
        public JsonResult AddMessage(SentMessageRequest request)
        {
            var messageAdded = _messagesProvider.AddMessage(request.SenderUserId, request.TargetGroupId, request.TargetUserId);

            return messageAdded
                ? Json(new { success = true })
                : Json(new { success = false, error = "Message already sent by other user" });
        }

        [HttpGet]
        [Route("haveMessages")]
        public JsonResult HaveMessagesByGroup(int targetGroupId, int senderUserId, int targetUserId)
        {
            var haveMessages = _messagesProvider.HaveUserMessagesByGroupOrSender(targetGroupId, senderUserId, targetUserId);
            return Json(haveMessages, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("usersWithoutMessages")]
        public JsonResult GetUsersWithoutMessagesByGroup(int targetGroupId, int senderUserId, IEnumerable<int> userIds)
        {
            var resultUserIds = _messagesProvider.GetUsersWithoutMessagesByGroupOrSender(targetGroupId, senderUserId, userIds);
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

                aggregations = _messagesAggregator.AggregateByFrequencies(messages),

                users = users.Select(x => new { Id = x.VkUserId, x.FirstName, x.LastName }),
            });
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("undoMessage")]
        public ViewResult UndoMessage(int targetGroupId, int targetUserId)
        {
            _messagesProvider.UndoMessage(targetGroupId, targetUserId);

            ViewBag.UserLink = $"http://vk.com/id{targetUserId}";
            return View("UndoMessage");
        }
    }
}