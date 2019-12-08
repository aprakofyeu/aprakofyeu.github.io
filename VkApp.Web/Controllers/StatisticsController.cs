using System.Linq;
using System.Web.Mvc;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web.Controllers
{
    public class StatisticsController : Controller
    {
        private readonly IGroupProvider _groupProvider;
        private readonly IStatisticsProvider _statisticsProvider;
        private readonly IUserProvider _userProvider;


        public StatisticsController(IGroupProvider groupProvider, IStatisticsProvider statisticsProvider, IUserProvider userProvider)
        {
            _groupProvider = groupProvider;
            _statisticsProvider = statisticsProvider;
            _userProvider = userProvider;
        }

        [HttpGet]
        public ActionResult Index()
        {
            var groups = _groupProvider.GetAll();
            return View(groups);
        }

        [HttpGet]
        public ActionResult ForGroup(int groupId)
        {
            var model = new StatisticsView
            {
                Group = _groupProvider.GetById(groupId),
                UsersDict = _userProvider.GetUsersByGroup(groupId).ToDictionary(x => x.VkUserId),
                StatisticsGroups = _statisticsProvider.GetStatisticsGroupsForTargetGroup(groupId)
            };

            return View(model);
        }

        [HttpGet]
        public ActionResult Remove(int statisticsGroupId)
        {
            var groupId = _statisticsProvider.GetTargetGroupIdForStatisticsGroup(statisticsGroupId);

            _statisticsProvider.Remove(statisticsGroupId);

            return RedirectToAction("ForGroup", new { groupId });
        }

        [HttpGet]
        public ActionResult Edit(int statisticsGroupId)
        {
            var statisticsGroup = _statisticsProvider.GetStatisticsGroup(statisticsGroupId);
            var model = CreateStatisticsGroupEditModel(statisticsGroup);

            return View(model);
        }

        private StatisticsGroupEditView CreateStatisticsGroupEditModel(StatisticsGroup statisticsGroup)
        {
            var users = _userProvider.GetUsersByGroup(statisticsGroup.TargetGroupId);

            return new StatisticsGroupEditView
            {
                Group = _groupProvider.GetById(statisticsGroup.TargetGroupId),
                StatisticsGroup = statisticsGroup,
                UsersDict = users.ToDictionary(u => u.VkUserId)
            };
        }

        [HttpGet]
        public ActionResult Create(int groupId)
        {
            var statisticsGroup = new StatisticsGroup { TargetGroupId = groupId };
            var model = CreateStatisticsGroupEditModel(statisticsGroup);

            return View("Edit", model);
        }

        [HttpPost]
        public ActionResult Save(StatisticsGroup input)
        {
            if (IsValid(input, out var errorMessage))
            {
                _statisticsProvider.Save(input);
                return RedirectToAction("ForGroup", new { groupId = input.TargetGroupId });
            }

            var model = CreateStatisticsGroupEditModel(input);
            model.ErrorMessage = errorMessage;

            return View("Edit", model);
        }

        private bool IsValid(StatisticsGroup input, out string error)
        {
            if (string.IsNullOrEmpty(input.Name))
            {
                error = "Name should not be empty";
                return false;
            }

            if (input.SelectedUsers == null || !input.SelectedUsers.Any())
            {
                error = "No selected users";
                return false;
            }

            error = null;
            return true;
        }
    }
}