using System.Collections.Generic;
using System.Linq;

namespace VkApp.Data.Model
{
    public class StatisticsGroup
    {
        public StatisticsGroup()
        {
            SelectedUsers = Enumerable.Empty<int>();
        }

        public int? Id { get; set; }
        public int TargetGroupId { get; set; }
        public string Name { get; set; }
        public IEnumerable<int> SelectedUsers { get; set; }
    }
}
