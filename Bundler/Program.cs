using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;

namespace Bundler
{
    class Program
    {
        static void Main(string[] args)
        {
            var rootPath = args[0];
            var bundlePath = args[1];
            var htmlFile = args[2];

            //var rootPath = "./app";
            //var bundlePath = "./dist";

            var bundleUrl = BundleAllJsFiles(rootPath, bundlePath);
            UpdateBundleUrl(bundleUrl, htmlFile);
        }

        static void UpdateBundleUrl(string bundleUrl, string indexPath)
        {
            var html = File.ReadAllText(indexPath);

            html=Regex.Replace(html,
                "<!--bundle-->.*<!--bundle-->",
                $"<!--bundle--><script src='{bundleUrl}' type='text/javascript'></script><!--bundle-->");

            File.WriteAllText(indexPath, html);
        }
        static string BundleAllJsFiles(string rootPath, string bundlePath)
        {
            var bundleUrl = $"{bundlePath}/bundle.{Guid.NewGuid().ToString()}.js";

            var bundle = new StringBuilder();
            foreach(var file in Directory.GetFiles(rootPath, "*.js", SearchOption.AllDirectories))
            {
                bundle.AppendLine(File.ReadAllText(file));
            }

            //create if not exists
            if (!Directory.Exists(bundlePath))  
                Directory.CreateDirectory(bundlePath);

            //clear dir
            var di = new DirectoryInfo(bundlePath);
            foreach (FileInfo file in di.GetFiles())
            {
                file.Delete();
            }

            File.WriteAllText(bundleUrl, bundle.ToString());

            return bundleUrl;
        }
    }
}
