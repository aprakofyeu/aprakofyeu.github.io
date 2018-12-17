using System.Diagnostics;
using CommonServiceLocator.StructureMapAdapter.Unofficial;
using Microsoft.Practices.ServiceLocation;
using StructureMap;
using VkApp.Web.DependencyResolution;
using Resolver = System.Web.Mvc.DependencyResolver;

namespace VkApp.Web.App_Start
{
    public static class StructuremapConfig
    {
        public static StructureMapDependencyResolver StructureMapResolver { get; set; }

        private static IContainer RootContainer { get; set; }

        public static void Initialize()
        {
            RootContainer = new Container(new VkAppRegistry());
            StructureMapResolver = new StructureMapDependencyResolver(RootContainer);
            Resolver.SetResolver(StructureMapResolver);
            ServiceLocator.SetLocatorProvider(CreateServiceLocator);
        }

        private static IServiceLocator CreateServiceLocator()
        {
            return new StructureMapServiceLocator(RootContainer);
        }

        public static void ShutDown()
        {
            StructureMapResolver.Dispose();
            RootContainer.Dispose();
        }
    }
}