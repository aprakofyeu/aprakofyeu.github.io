using NHibernate;
using StructureMap;
using StructureMap.Web;
using VkApp.Web.Data;

namespace VkApp.Web.DependencyResolution
{
    public class VkAppRegistry : Registry
    {
        public VkAppRegistry()
        {
            RegisterDb();

            For<IApplicationsProvider>().Use<ApplicationsProvider>();
        }

        private void RegisterDb()
        {
            For<ISession>().HybridHttpOrThreadLocalScoped().Use(NHibernateContext.BeginSessionAndTransaction());
        }
    }
}