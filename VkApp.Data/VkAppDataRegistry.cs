using NHibernate;
using StructureMap;
using StructureMap.Web;
using VkApp.Data.DataProviders;
using VkApp.Web.DependencyResolution;

namespace VkApp.Data
{
    public class VkAppDataRegistry : Registry
    {
        public VkAppDataRegistry()
        {
            RegisterDb();

            For<IApplicationsProvider>().Use<ApplicationsProvider>();
            For<IMessagesProvider>().Use<MessagesProvider>();
            For<IGroupProvider>().Use<GroupProvider>();
            For<IUserProvider>().Use<UserProvider>();
        }

        private void RegisterDb()
        {
            For<ISession>().HybridHttpOrThreadLocalScoped().Use(() => NHibernateContext.BeginSessionAndTransaction());
        }
    }
}
