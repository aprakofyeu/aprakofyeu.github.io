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
            For<IMessagesProvider>().Use<MessagesProvider>();
            For<IGroupProvider>().Use<GroupProvider>();
            For<IUserProvider>().Use<UserProvider>();
            For<IInitializationService>().Use<InitializationService>();
        }

        private void RegisterDb()
        {
            For<ISession>().HybridHttpOrThreadLocalScoped().Use(() => NHibernateContext.BeginSessionAndTransaction());
        }
    }
}