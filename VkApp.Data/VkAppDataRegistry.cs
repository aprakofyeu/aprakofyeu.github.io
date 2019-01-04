﻿using System;
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

            For<Random>().Use<Random>().Singleton();

            For<IApplicationsProvider>().Use<ApplicationsProvider>();
            For<IMessagesProvider>().Use<MessagesProvider>();
            For<IGroupProvider>().Use<GroupProvider>();
            For<IUserProvider>().Use<UserProvider>();
            For<IUserSavedMessagesProvider>().Use<UserSavedMessagesProvider>();
        }

        private void RegisterDb()
        {
            For<ISession>().HybridHttpOrThreadLocalScoped().Use(() => NHibernateContext.BeginSessionAndTransaction());
        }
    }
}
