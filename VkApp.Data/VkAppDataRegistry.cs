﻿using System;
using NHibernate;
using StructureMap;
using StructureMap.Web;
using VkApp.Data.DataProviders;
using VkApp.Data.Statistics;
using VkApp.Web.DependencyResolution;

namespace VkApp.Data
{
    public class VkAppDataRegistry : Registry
    {
        public VkAppDataRegistry()
        {
            RegisterDb();

            For<ICultureInfoProvider>().Use<CultureInfoProvider>();

            For<Random>().Use<Random>().Singleton();

            For<IApplicationsProvider>().Use<ApplicationsProvider>();
            For<IMessagesProvider>().Use<MessagesProvider>();
            For<IGroupProvider>().Use<GroupProvider>();
            For<IUserProvider>().Use<UserProvider>();
            For<IUserSavedMessagesProvider>().Use<UserSavedMessagesProvider>();

            For<IMessagesAggregator>().Use<MessagesAggregator>();
            For<IFrequencyAggregator>().Use<DailyAggregator>();
            For<IFrequencyAggregator>().Use<MonthlyAggregator>();
        }

        private void RegisterDb()
        {
            For<ISession>().HybridHttpOrThreadLocalScoped().Use(() => NHibernateContext.BeginSessionAndTransaction());
        }
    }
}
