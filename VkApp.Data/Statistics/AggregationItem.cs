using System.Collections.Generic;

namespace VkApp.Data.Statistics
{
    public class FrequencyAggregation
    {
        public string Frequency { get; set; }
        public IEnumerable<AggregationPoint> Info { get; set; }
        public IDictionary<int, IEnumerable<AggregationItem>> Items { get; set; }
    }

    public class AggregationPoint
    {
        public string Key { get; set; }
        public string DisplayName { get; set; }
    }

    public class AggregationItem
    {
        public string Key { get; set; }
        public IEnumerable<int> UserIds { get; set; }
    }
}
