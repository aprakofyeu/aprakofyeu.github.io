using System;
using System.Configuration;
using System.Web;
using FluentNHibernate.Cfg;
using NHibernate;
using VkApp.Data;

namespace VkApp.Web.DependencyResolution
{
    public static class NHibernateContext
    {
        private const string DataBase = "VkAppDb";

        private const string TransactionContextKey = "CurrentTransactionContext";

        private static string GetTransactionKey(string databaseKey) => $"{TransactionContextKey}_{databaseKey}";

        public static ISession BeginSessionAndTransaction()
        {
            var connectionString = ConfigurationManager.ConnectionStrings[DataBase].ConnectionString;

            var sessionFactory = Fluently.Configure()
                .Database(FluentNHibernate.Cfg.Db.MsSqlConfiguration.MsSql2008.ConnectionString(connectionString))
                .Mappings(m => m.FluentMappings.AddFromAssemblyOf<VkAppDataRegistry>())
                .BuildSessionFactory();

            var session = sessionFactory.OpenSession();

            if (HttpContext.Current != null)
            {
                var transactionKey = GetTransactionKey(DataBase);

                if (HttpContext.Current.Items.Contains(transactionKey))
                    throw new ApplicationException("There is already a transaction associated with current HttpContext.");

                HttpContext.Current.Items[transactionKey] = session.BeginTransaction();
            }

            return session;
        }

        public static void EndTransactions()
        {
            var transactionKey = GetTransactionKey(DataBase);

            if (!HasTransactionOpened(transactionKey))
                return;

            using (var tx = (ITransaction)HttpContext.Current.Items[transactionKey])
            {
                if (HttpContext.Current.Error == null)
                {
                    tx.Commit();
                }
                HttpContext.Current.Items.Remove(TransactionContextKey);
            }
        }

        private static bool HasTransactionOpened(string transactionKey)
        {
            return HttpContext.Current != null && HttpContext.Current.Items.Contains(transactionKey);
        }
    }

}