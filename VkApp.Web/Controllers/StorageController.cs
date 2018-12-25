using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.App_Start;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class StorageController : Controller
    {
        private readonly IMessagesProvider _messagesProvider;
        private readonly IInitializationService _initializationService;
        private readonly IGroupProvider _groupProvider;
        private readonly IApplicationsProvider _applicationsProvider;

        public StorageController(
            IMessagesProvider messagesProvider,
            IInitializationService initializationService,
            IGroupProvider groupProvider,
            IApplicationsProvider applicationsProvider)
        {
            _messagesProvider = messagesProvider;
            _initializationService = initializationService;
            _groupProvider = groupProvider;
            _applicationsProvider = applicationsProvider;
        }

        [HttpPost]
        public JsonResult AddMessage(SentMessageRequest request)
        {
            _applicationsProvider.IncreaseApplicationCount(request.ApplicationId);

            var messageAdded = _messagesProvider.AddMessage(request.SenderUserId, request.TargetGroupId, request.TargetUserId);

            return messageAdded 
                ? Json(new { success = true }) 
                : Json(new { success = false, error="Message already sent by other user" });
        }

        [HttpPost]
        public JsonResult InitUserConversations(InitConversationsRequest request)
        {
            _initializationService.InitMessagesLegacy(request.User, request.Group, request.Conversations);
            return Json(new { success = true });
        }

        [HttpPost]
        public JsonResult AddTargetGroup(GroupInfo group)
        {
            _initializationService.InitGroup(group);
            return Json(new { success = true });
        }

        [HttpPost]
        public JsonResult InitUser(UserInfo user)
        {
            var initializationInfo = _initializationService.InitUser(user);
            return new JsonCamel(initializationInfo);
        }

        [HttpGet]
        public JsonResult LoadTargetGroups()
        {
            var groups = _groupProvider.GetAll().Select(Map).ToList();
            return new JsonCamel(groups);
        }

        [HttpGet]
        public JsonResult HaveMessagesByGroup(int targetGroupId, int targetUserId)
        {
            var haveMessages = _messagesProvider.HaveUserMessagesByGroup(targetGroupId, targetUserId);
            return Json(haveMessages, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetUsersWithoutMessagesByGroup(int targetGroupId, IEnumerable<int> userIds)
        {
            var resultUserIds = _messagesProvider.GetUsersWithoutMessagesByGroup(targetGroupId, userIds);
            return Json(resultUserIds);
        }

        private static GroupInfo Map(Group group)
        {
            return new GroupInfo
            {
                Id = group.VkGroupId,
                Name = group.Name
            };
        }
    }
}