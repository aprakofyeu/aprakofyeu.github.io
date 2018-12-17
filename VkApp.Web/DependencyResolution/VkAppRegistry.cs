using StructureMap;
using VkApp.Web.Data;

namespace VkApp.Web.DependencyResolution
{
    public class VkAppRegistry : Registry
    {
        public VkAppRegistry()
        {
            For<IDataAccessor>().Use<DataAccessor>();
        }
    }
}