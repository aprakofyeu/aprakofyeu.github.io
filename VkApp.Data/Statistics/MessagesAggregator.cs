using System.Collections.Generic;
using VkApp.Data.Model;

namespace VkApp.Data.Statistics
{
    public interface IMessagesAggregator
    {
        IEnumerable<FrequencyAggregation> AggregateByFrequencies(IEnumerable<Message> messages);
    }

    class MessagesAggregator: IMessagesAggregator
    {
        private readonly IEnumerable<IFrequencyAggregator> _aggregators;

        public MessagesAggregator(IEnumerable<IFrequencyAggregator> aggregators)
        {
            _aggregators = aggregators;
        }

        public IEnumerable<FrequencyAggregation> AggregateByFrequencies(IEnumerable<Message> messages)
        {
            var aggregations = new List<FrequencyAggregation>();

            foreach (var aggregator in _aggregators)
            {
                aggregations.Add(aggregator.Aggregate(messages));
            }

            return aggregations;
        }
    }
}
