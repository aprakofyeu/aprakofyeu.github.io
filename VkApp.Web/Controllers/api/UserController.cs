using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers.api
{
    [RoutePrefix("api/user")]
    public class UserController : Controller
    {
        private readonly IInitializationService _initializationService;
        private readonly IUserProvider _userProvider;

        public UserController(
            IInitializationService initializationService,
            IUserProvider userProvider)
        {
            _initializationService = initializationService;
            _userProvider = userProvider;
        }

        [HttpPost]
        [Route("init")]
        public JsonResult InitUser(InitUserRequest user)
        {
            var initializationInfo = _initializationService.InitUser(user);
            return new JsonCamel(initializationInfo);
        }

        [HttpPost]
        [Route("initConversations")]
        public JsonResult InitUserConversations(InitConversationsRequest request)
        {
            _initializationService.InitMessagesLegacy(request.SenderId, request.TargetGroupId, request.Conversations);
            return Json(new { success = true });
        }

        [HttpPost]
        [Route("update")]
        public JsonResult UpdateUserSettings(UserSettingsRequest userSettings)
        {
            var user = _userProvider.GetUser(userSettings.UserId);

            user.SaveLastMessage = userSettings.SaveLastMessage;
            user.SendInterval = userSettings.SendInterval;

            _userProvider.Save(user);

            return Json(new { success = true });
        }
    }
}