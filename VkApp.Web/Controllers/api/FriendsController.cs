using System;
using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/friends")]
    public class FriendsController:Controller
    {
        private readonly IFriendRequestsProvider _requestsProvider;
        private readonly IUserProvider _user;
        private readonly IMessagesProvider _messagesProvider;

        public FriendsController(IFriendRequestsProvider requestsProvider, IUserProvider user, IMessagesProvider messagesProvider)
        {
            _requestsProvider = requestsProvider;
            _user = user;
            _messagesProvider = messagesProvider;
        }

        [HttpPost]
        [Route("markAsFriendRequested")]
        public JsonResult MarkAsInvited(int friendRequestedUserId, int userId)
        {
            _requestsProvider.MarkAsRequested(friendRequestedUserId, userId);
            return Json(new { success = true });
        }

        [HttpPost]
        [Route("getFriendRequests")]
        public JsonResult GetFriendRequests(int userId, int groupId)
        {
            var user = _user.GetUser(userId);
            var requestsEdge = DateTime.UtcNow.AddDays(-user.FriendRequestsInterval);

            var users =  _user.GetUsersByGroup(groupId);
            var userIds = users
                .Select(x=>x.VkUserId)
                .Concat(new[] {userId})
                .Distinct()
                .ToList();

            var requests = _requestsProvider.GetFriendRequests(userIds, requestsEdge);

            return Json(requests.Select(x => x.RequestedUserId).ToList());
        }
    }
}