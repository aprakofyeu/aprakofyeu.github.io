using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

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
            var savedMessages = _savedMessagesProvider
                .GetSavedMessages(userId, groupId)
                .Select(x => new { x.Message, x.Attachments })
                .ToList();

            return new JsonCamel(new { UserMessages = savedMessages });
        }

        [HttpPost]
        [Route("save")]
        public JsonResult SaveMessage(int userId, int groupId, IEnumerable<UserMessageRequest> messages)
        {
            if (messages?.Count() > 0 && messages.All(x => !string.IsNullOrEmpty(x.Message)))
            {
                var messagesToSave = MapMessages(userId, groupId, messages);
                _savedMessagesProvider.SaveMessages(messagesToSave);
                return Json(new { success = true });
            }

            return Json(new { success = false, error = "Messages should not be empty" });
        }

        [HttpPost]
        [Route("clear")]
        public JsonResult ClearSavedMessages(int userId)
        {
            _savedMessagesProvider.DeleteMessages(userId);
            return Json(new { success = true });
        }

        private IEnumerable<SavedMessage> MapMessages(int userId, int groupId, IEnumerable<UserMessageRequest> messages)
        {
            var order = 0;

            return messages.Select(x => new SavedMessage
            {
                Order = order++,
                UserId = userId,
                GroupId = groupId,
                Message = x.Message,
                Attachments = x.Attachments
            });
        }
    }
}