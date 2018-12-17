using System.Configuration;
using FluentNHibernate.Cfg;
using NHibernate;
using StructureMap;
using VkApp.Web.Data;
using VkApp.Web.Data.Model;

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
            var connectionString = ConfigurationManager.ConnectionStrings["VkAppDb"].ConnectionString;
            var sessionFactory = Fluently.Configure()
                .Database(FluentNHibernate.Cfg.Db.MsSqlConfiguration.MsSql2008.ConnectionString(connectionString))
                .Mappings(m => m.FluentMappings.AddFromAssemblyOf<VkAppRegistry>())
                .BuildSessionFactory();

            For<ISession>().Use(sessionFactory.OpenSession());
        }
    }
}