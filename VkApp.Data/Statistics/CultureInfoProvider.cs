using System.Globalization;

namespace VkApp.Data.Statistics
{
    public interface ICultureInfoProvider
    {
        CultureInfo Russian { get; }
        CultureInfo Invariant { get; }
    }

    class CultureInfoProvider: ICultureInfoProvider
    {
        public CultureInfoProvider()
        {
            Russian = new CultureInfo("ru-RU");
        }

        public CultureInfo Russian { get; }

        public CultureInfo Invariant => CultureInfo.InvariantCulture;
    }
}
