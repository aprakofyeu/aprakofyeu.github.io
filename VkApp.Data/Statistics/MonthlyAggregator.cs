using System;
using System.Collections.Generic;

namespace VkApp.Data.Statistics
{
    class MonthlyAggregator : FrequencyAggregatorBase
    {
        private readonly ICultureInfoProvider _cultureInfoProvider;

        protected override string Frequency => "Monthly";

        public MonthlyAggregator(ICultureInfoProvider cultureInfoProvider)
        {
            _cultureInfoProvider = cultureInfoProvider;
        }

        protected override IEnumerable<DateRange> GetDateRanges()
        {
            var date = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

            var dateRanges = new List<DateRange>();
            for (var i = 0; i < 10; i++)
            {
                dateRanges.Add(new DateRange
                {
                    BeginDate = new DateTime(date.Year, date.Month, date.Day),
                    EndDate = new DateTime(date.Year, date.Month, date.Day).AddMonths(1).AddSeconds(-1),
                    Key = date.ToString("dd/MM/yyyy", _cultureInfoProvider.Invariant),
                    DisplayName = date.ToString("MMMM", _cultureInfoProvider.Russian)
                });

                date = date.AddMonths(-1);
            }

            dateRanges.Reverse();

            return dateRanges;
        }
    }
}
