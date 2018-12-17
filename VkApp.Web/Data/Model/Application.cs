using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FluentNHibernate.Mapping;

namespace VkApp.Web.Data.Model
{
    public class Application
    {
        public virtual int VkAppId { get; set; }
        public virtual string Name { get; set; }
    }

    public class ApplicationMap : ClassMap<Application>
    {
        public ApplicationMap()
        {
            Id(x => x.VkAppId);
            Map(x => x.Name);
        }
    }
}