using StructureMap;
using VkApp.Data;
using VkApp.Data.DataProviders;
using VkApp.Web.Infrastructure;

namespace VkApp.Web.DependencyResolution
{
    public class VkAppRegistry : Registry
    {
        public VkAppRegistry()
        {
            IncludeRegistry(new VkAppDataRegistry());

            For<IInitializationService>().Use<InitializationService>();
            For<IAuthValidator>().Use<AuthValidator>();
        }
    }
}