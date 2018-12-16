using System;
using System.Collections.Generic;
using System.Linq;
using System.Configuration;
using NHibernate;
using FluentNHibernate.Cfg;
using VkApp.Web.Data.Model;

namespace VkApp.Web.Data
{
    public class DataAccessor
    {
        private static ISessionFactory CreateSessionFactory()
        {
            var connectionString = ConfigurationManager.ConnectionStrings["VkAppDb"].ConnectionString;
            return Fluently.Configure()
                .Database(FluentNHibernate.Cfg.Db.MsSqlConfiguration.MsSql2008.ConnectionString(connectionString))
              .Mappings(m => m.FluentMappings.AddFromAssemblyOf<Groups>())
                .BuildSessionFactory();
        }

        public string GetData()
        {
            var sessionFactory = CreateSessionFactory();

            using (var session = sessionFactory.OpenSession())
            {
                using (var transaction = session.BeginTransaction())
                {
                    var groups = session.Get<Groups>(1);

                    return groups.Name;
                }
            }
        }
    }
}