using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class Application
    {
        public virtual int VkAppId { get; set; }
        public virtual string Name { get; set; }
        public virtual int MessagesCount { get; set; }
    }

    public class ApplicationMap : ClassMap<Application>
    {
        public ApplicationMap()
        {
            Id(x => x.VkAppId).GeneratedBy.Assigned();
            Map(x => x.Name);
            Map(x => x.MessagesCount);
        }
    }
}