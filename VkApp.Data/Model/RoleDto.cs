using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class RoleDto
    {
        public virtual int Id { get; set; }
        public virtual string Name { get; set; }
        public virtual string Password { get; set; }
        public virtual string Comment { get; set; }
        public virtual bool Messages { get; set; }
        public virtual bool Invites { get; set; }
        public virtual bool Instruments { get; set; }
    }

    public class RoleDtoMap : ClassMap<RoleDto>
    {
        public RoleDtoMap()
        {
            Table("Roles");
            Not.LazyLoad();
            Id(x => x.Id);
            Map(x => x.Name, "Role");
            Map(x => x.Password);
            Map(x => x.Comment);
            Map(x => x.Messages);
            Map(x => x.Invites);
            Map(x => x.Instruments);
        }
    }
}
