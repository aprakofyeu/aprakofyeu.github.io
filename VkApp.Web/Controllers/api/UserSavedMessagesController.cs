using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;

namespace VkApp.Web.Controllers.api
{
    [RoutePrefix("api/user/savedMessages")]
    public class UserSavedMessagesController : Controller
    {
        private readonly IUserSavedMessagesProvider _savedMessagesProvider;

        public UserSavedMessagesController(IUserSavedMessagesProvider savedMessagesProvider)
        {
            _savedMessagesProvider = savedMessagesProvider;
        }

        [HttpGet]
        [Route("get")]
        public JsonResult GetSavedMessage(int userId, int groupId)
        {
            var savedMessage = _savedMessagesProvider.GetSavedMessage(userId, groupId);
            return new JsonCamel(new { UserMessage = savedMessage });
        }

        [HttpPost]
        [Route("save")]
        public JsonResult SaveMessage(SavedMessage message)
        {
            if (message != null && !string.IsNullOrEmpty(message.Message))
            {
                _savedMessagesProvider.SaveMessage(message);
                return Json(new { success = true });
            }

            return Json(new { success = false, error = "Message is empty" });
        }

        [HttpPost]
        [Route("clear")]
        public JsonResult ClearSavedMessages(int userId)
        {
            _savedMessagesProvider.DeleteMessages(userId);
            return Json(new { success = true });
        }
    }
}