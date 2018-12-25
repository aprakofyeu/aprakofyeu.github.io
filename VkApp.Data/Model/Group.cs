using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class Group
    {
        public virtual int VkGroupId { get; set; }
        public virtual string Name { get; set; }
    }

    public class CustomerNewMap : ClassMap<Group>
    {
        public CustomerNewMap()
        {
            Table("TargetGroup");
            Id(x => x.VkGroupId).GeneratedBy.Assigned();
            Map(x => x.Name);
        }
    }
}