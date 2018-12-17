using System.Collections.Generic;
using VkApp.Web.Data.Model;

namespace VkApp.Web.Models
{
    public class ApplicationsView
    {
        public IEnumerable<Application> Applications { get; set; }
    }
}