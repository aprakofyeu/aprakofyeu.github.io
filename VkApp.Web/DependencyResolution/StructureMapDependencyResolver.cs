using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Practices.ServiceLocation;
using StructureMap;

namespace VkApp.Web.DependencyResolution
{
    public class StructureMapDependencyResolver : ServiceLocatorImplBase
    {
        private const string StructuremapNestedContainerKey = "Structuremap.Nested.Container";
        public IContainer Container { get; set; }

        private HttpContextBase HttpContext
        {
            get
            {
                var ctx = Container.TryGetInstance<HttpContextBase>();
                return ctx ?? new HttpContextWrapper(System.Web.HttpContext.Current);
            }
        }

        public IContainer CurrentNestedContainer
        {
            get => (IContainer)HttpContext.Items[StructuremapNestedContainerKey];
            set => HttpContext.Items[StructuremapNestedContainerKey] = value;
        }

        public StructureMapDependencyResolver(IContainer container)
        {
            Container = container;
        }

        protected override IEnumerable<object> DoGetAllInstances(Type serviceType)
        {
            return (CurrentNestedContainer ?? Container).GetAllInstances(serviceType).Cast<object>();
        }

        protected override object DoGetInstance(Type serviceType, string key)
        {
            var container = (CurrentNestedContainer ?? Container);

            if (string.IsNullOrEmpty(key))
            {
                return serviceType.IsAbstract || serviceType.IsInterface
                           ? container.TryGetInstance(serviceType)
                           : container.GetInstance(serviceType);
            }

            return container.GetInstance(serviceType, key);
        }

        public void Dispose()
        {
            if (CurrentNestedContainer != null)
            {
                CurrentNestedContainer.Dispose();
            }

            Container.Dispose();
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return DoGetAllInstances(serviceType);
        }

        public void DisposeNestedContainer()
        {
            if (CurrentNestedContainer != null)
            {
                CurrentNestedContainer.Dispose();
            }

        }

        public void CreateNestedContainer(Action<ConfigurationExpression> configuration = null)
        {
            if (CurrentNestedContainer == null)
            {
                CurrentNestedContainer = Container.GetNestedContainer();

                if (configuration != null)
                {
                    CurrentNestedContainer.Configure(configuration);
                }
            }
        }
    }
}