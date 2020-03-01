using System;
using System.Collections.Generic;

namespace VkApp.Data.Statistics
{
    class QuarterlyAggregator : FrequencyAggregatorBase
    {
        private readonly ICultureInfoProvider _cultureInfoProvider;

        public QuarterlyAggregator(ICultureInfoProvider cultureInfoProvider)
        {
            _cultureInfoProvider = cultureInfoProvider;
        }

        protected override string Frequency => "Quarterly";

        protected override IEnumerable<DateRange> GetDateRanges()
        {
            var date = GetStartQuarter(DateTime.UtcNow);

            var dateRanges = new List<DateRange>();
            for (var i = 0; i < 10; i++)
            {
                dateRanges.Add(new DateRange
                {
                    BeginDate = new DateTime(date.Year, date.Month, date.Day),
                    EndDate = new DateTime(date.Year, date.Month, date.Day).AddMonths(3).AddSeconds(-1),
                    Key = date.ToString("dd/MM/yyyy", _cultureInfoProvider.Invariant),
                    DisplayName = $"{date.Year}-Q{date.Month / 3 + 1}"
                });

                date = date.AddMonths(-3);
            }

            dateRanges.Reverse();

            return dateRanges;
        }

        public static DateTime GetStartQuarter(DateTime date)
        {
            if (date.Month >= 1 && date.Month <= 3)
                return new DateTime(date.Year, 1, 1);
            if (date.Month >= 4 && date.Month <= 6)
                return new DateTime(date.Year, 4, 1);
            if (date.Month >= 7 && date.Month <= 9)
                return new DateTime(date.Year, 7, 1);
            return new DateTime(date.Year, 10, 1);
        }
    }
}
