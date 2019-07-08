using System.Collections.Generic;
using System.Linq;
using VkApp.Data.Model;

namespace VkApp.Data.Statistics
{
    interface IFrequencyAggregator
    {
        FrequencyAggregation Aggregate(IEnumerable<Message> messages);
    }

    abstract class FrequencyAggregatorBase: IFrequencyAggregator
    {
        protected abstract string Frequency { get; }

        protected abstract IEnumerable<DateRange> GetDateRanges();

        public FrequencyAggregation Aggregate(IEnumerable<Message> messages)
        {
            var dateRanges = GetDateRanges();

            return new FrequencyAggregation
            {
                Frequency = Frequency,
                Info = GetAggregationsInfo(dateRanges),
                Items = messages
                    .GroupBy(x => x.VkSenderId)
                    .ToDictionary(x => x.Key, x => AggregateByDateRanges(x, dateRanges))
            };
        }

        private IEnumerable<AggregationPoint> GetAggregationsInfo(IEnumerable<DateRange> dateRanges)
        {
            return dateRanges
                .Select(x => new AggregationPoint { Key = x.Key, DisplayName = x.DisplayName })
                .ToList();
        }

        private IEnumerable<AggregationItem> AggregateByDateRanges(IEnumerable<Message> messages, IEnumerable<DateRange> dateRanges)
        {
            return dateRanges.Select(dateRange => new AggregationItem
                {
                    Key = dateRange.Key,
                    UserIds = messages
                        .Where(x => x.SentDate >= dateRange.BeginDate && x.SentDate <= dateRange.EndDate)
                        .Select(x => x.VkTargetUserId)
                })
                .ToList();
        }
    }
}
