using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using StructureMap.Web.Pipeline;
using VkApp.Web.App_Start;
using VkApp.Web.Infrastructure;
using NHibernateContext = VkApp.Web.DependencyResolution.NHibernateContext;

namespace VkApp.Web
{
    public class MvcApplication : HttpApplication
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
            StructuremapConfig.StructureMapResolver.CreateNestedContainer();
        }

        protected void Application_PostAuthenticateRequest(Object sender, EventArgs e)
        {
            HttpCookie authCookie = Request.Cookies[AuthToken.AuthTokenKey];
            if (authCookie != null)
            {
                var authToken = AuthToken.Decrypt(authCookie.Value);

                var validator = StructuremapConfig.StructureMapResolver.Container.GetInstance<IAuthValidator>();

                var permissions = validator.ValidateToken(authToken);

                if (permissions!=null)
                {
                    HttpContext.Current.User = new VkAppPrincipal(authToken.Role, permissions);
                }
            }
        }

        protected void Application_EndRequest()
        {
            ShutDown();

            //Redirect to login page all not API calls
            if (Response.StatusCode == 401
                && !Request.RawUrl.Contains("/api/"))
            {
                Response.Redirect("~/login");
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            ShutDown();
        }

        private static void ShutDown()
        {
            NHibernateContext.EndTransactions();
            HttpContextLifecycle.DisposeAndClearAll();
            StructuremapConfig.StructureMapResolver.DisposeNestedContainer();
        }

        protected void Application_End()
        {
            StructuremapConfig.ShutDown();
        }
    }
}
