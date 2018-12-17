using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NHibernate;
using FluentNHibernate.Mapping;

namespace VkApp.Web.Data.Model
{
    public class Group
    {
        public virtual int VkGroupId { get; set; }
        public virtual string Name { get; set; }
        public virtual string Url { get; set; }
        public virtual Application App { get; set; }
    }

    public class BookMap : ClassMap<Group>
    {
        public BookMap()
        {
            Id(x => x.VkGroupId);
            Map(x => x.Name);
            Map(x => x.Url);
            References(x => x.App).Column("ApplicationId");

        }
    }
}