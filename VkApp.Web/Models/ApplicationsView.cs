using System.Collections.Generic;
using VkApp.Data.Model;

namespace VkApp.Web.Models
{
    public class ApplicationView
    {
        public virtual int Id { get; set; }
        public virtual string Name { get; set; }
        public virtual int Count { get; set; }
    }

    public class ApplicationsView
    {
        public IEnumerable<ApplicationView> Applications { get; set; }
        public ApplicationView NewApplication { get; set; }
        public string Error { get; set; }
    }

    public static class ApplicationMapper
    {
        public static ApplicationView Map(this Application application)
        {
            return new ApplicationView
            {
                Id = application.VkAppId,
                Name = application.Name,
                Count = application.MessagesCount
            };
        }

        public static Application Map(this ApplicationView application)
        {
            return new Application
            {
                VkAppId = application.Id,
                Name = application.Name
            };
        }
    }
}