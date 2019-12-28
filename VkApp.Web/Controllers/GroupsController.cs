using System.Linq;
using System.Web.Mvc;
using VkApp.Data;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    [Authorize(Roles = Role.Admin)]
    public class GroupsController: Controller
    {
        private readonly IGroupProvider _groupProvider;

        public GroupsController(IGroupProvider groupProvider)
        {
            _groupProvider = groupProvider;
        }

        [HttpGet]
        public ActionResult Index()
        {
            var groups = _groupProvider
                .GetAll()
                .Select(MapGroupView)
                .ToList();

            return View(groups);
        }

        private static GroupView MapGroupView(Group x)
        {
            return new GroupView{Id = x.VkGroupId, Name = x.Name};
        }

        [HttpGet]
        public ActionResult Edit(int groupId)
        {
            var groupDto = _groupProvider.GetById(groupId);
            var model = MapGroupView(groupDto);

            return View(model);
        }

        [HttpPost]
        public ActionResult Save(GroupView group)
        {
            if (string.IsNullOrEmpty(group.Name))
            {
                ViewBag.ErrorMessage = "Name is required field";
                return View("Edit", group);
            }

            var groupDto = _groupProvider.GetById(group.Id);
            groupDto.Name = group.Name;

            return RedirectToAction("Index");
        }

    }
}