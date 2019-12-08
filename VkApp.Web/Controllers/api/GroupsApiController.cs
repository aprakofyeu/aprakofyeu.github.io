using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers.api
{
    [RoutePrefix("api/groups")]
    public class GroupsApiController: Controller
    {
        private readonly IInitializationService _initializationService;
        private readonly IGroupProvider _groupProvider;

        public GroupsApiController(
            IInitializationService initializationService,
            IGroupProvider groupProvider)
        {
            _initializationService = initializationService;
            _groupProvider = groupProvider;
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