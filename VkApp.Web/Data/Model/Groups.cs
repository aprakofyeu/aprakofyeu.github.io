using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NHibernate;
using FluentNHibernate.Mapping;

namespace VkApp.Web.Data.Model
{
    public class Groups
    {
        public virtual int VkGroupId { get; set; }
        public virtual string Name { get; set; }
    }

    public class BookMap : ClassMap<Groups>
    {
        public BookMap()
        {
            Id(x => x.VkGroupId);
            Map(x => x.Name);
        }
    }
}