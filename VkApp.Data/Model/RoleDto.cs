using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class RoleDto
    {
        public virtual int Id { get; set; }
        public virtual string Name { get; set; }
        public virtual string Password { get; set; }
        public virtual string Comment { get; set; }
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
        }
    }
}
