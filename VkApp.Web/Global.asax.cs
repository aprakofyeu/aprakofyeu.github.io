using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Microsoft.Practices.ServiceLocation;
using NHibernate;
using VkApp.Web.App_Start;

namespace VkApp.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            ConfigureMvc();
            StructuremapConfig.Initialize();
        }

        private static void ConfigureMvc()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var transaction = ServiceLocator.Current.GetInstance<ISession>().BeginTransaction();
            HttpContext.Current.Items["NHibernateTransaction"] = transaction;
        }

        protected void Application_EndRequest(object sender, EventArgs e)
        {
            var transaction = (ITransaction) HttpContext.Current.Items["NHibernateTransaction"];
            transaction?.Commit();
        }
    }
}
