using System;
using System.Collections.Generic;

namespace VkApp.Data.Statistics
{
    class DateRange
    {
        public string Key { get; set; }
        public string DisplayName { get; set; }
        public DateTime BeginDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    class DailyAggregator: FrequencyAggregatorBase
    {
        private readonly ICultureInfoProvider _cultureInfoProvider;

        public DailyAggregator(ICultureInfoProvider cultureInfoProvider)
        {
            _cultureInfoProvider = cultureInfoProvider;
        }

        protected override string Frequency => "Daily";

        protected override IEnumerable<DateRange> GetDateRanges()
        {
            var date = DateTime.UtcNow;

            var dateRanges = new List<DateRange>();
            for (var i = 0; i < 10; i++)
            {
                dateRanges.Add(new DateRange
                {
                    BeginDate = new DateTime(date.Year, date.Month, date.Day),
                    EndDate = new DateTime(date.Year, date.Month, date.Day).AddDays(1).AddSeconds(-1),
                    Key = date.ToString("dd/MM/yyyy", _cultureInfoProvider.Invariant),
                    DisplayName = date.ToString("dd MMMM", _cultureInfoProvider.Russian)
                });

                date = date.AddDays(-1);
            }

            dateRanges.Reverse();

            return dateRanges;
        }


    }
}
