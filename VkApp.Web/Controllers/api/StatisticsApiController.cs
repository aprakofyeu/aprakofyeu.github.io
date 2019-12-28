using System.Web.Mvc;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Controllers.api
{
    [Authorize]
    [RoutePrefix("api/statistics")]
    public class StatisticsApiController:Controller
    {
        private readonly IStatisticsProvider _statisticsProvider;

        public StatisticsApiController(IStatisticsProvider statisticsProvider)
        {
            _statisticsProvider = statisticsProvider;
        }

        [HttpGet]
        [Route("groups")]
        public JsonResult GetAllMessagesByGroup(int targetGroupId)
        {
            var statisticsGroups = _statisticsProvider.GetStatisticsGroupsForTargetGroup(targetGroupId);
            return new JsonCamel(statisticsGroups);
        }
    }
}