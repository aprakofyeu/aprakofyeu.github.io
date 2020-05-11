using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Infrastructure;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/groups")]
    public class GroupsApiController: Controller
    {
        private readonly IInitializationService _initializationService;
        private readonly IGroupProvider _groupProvider;
        private readonly IUserProvider _userProvider;

        public GroupsApiController(
            IInitializationService initializationService,
            IGroupProvider groupProvider,
            IUserProvider userProvider)
        {
            _initializationService = initializationService;
            _groupProvider = groupProvider;
            _userProvider = userProvider;
        }

        [HttpPost]
        [Route("add")]
        public JsonResult AddTargetGroup(GroupInfo group)
        {
            _initializationService.InitGroup(group);
            return Json(new { success = true });
        }

        [HttpGet]
        [Route("all")]
        public JsonResult LoadTargetGroups()
        {
            var groups = _groupProvider.GetAll().Select(Map).ToList();
            return new JsonCamel(groups);
        }

        [HttpGet]
        [Route("getSenderUsersByGroup")]
        public JsonResult GetSenderUsersByGroup(int groupId)
        {
            var users = _userProvider.GetUsersByGroup(groupId);
            return new JsonCamel(users.Select(x => x.VkUserId).ToList());
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