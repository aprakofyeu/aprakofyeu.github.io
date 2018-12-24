using System.Web;
using System.Web.Optimization;

namespace VkApp.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/jquery/jquery-{version}.js",
                "~/jquery/jquery-ui.min.js",
                "~/jquery/jquery.tmpl.js",
                "~/jquery/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/app").IncludeDirectory(
                      "~/app/", "*.js", true));

            bundles.Add(new StyleBundle("~/Content/bootstrap").Include(
                      "~/Content/bootstrap.css"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/jquery-ui.css",
                      "~/Content/styles.css"));
        }
    }
}
