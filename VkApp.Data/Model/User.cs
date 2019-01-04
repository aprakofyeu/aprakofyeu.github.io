using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class User
    {
        public virtual int VkUserId { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual int SendInterval { get; set; }
        public virtual bool SaveLastMessage { get; set; }
    }

    public class UserMap : ClassMap<User>
    {
        public UserMap()
        {
            Table("[User]");

            Id(x => x.VkUserId);
            Map(x => x.FirstName);
            Map(x => x.LastName);
            Map(x => x.SendInterval);
            Map(x => x.SaveLastMessage);
        }
    }
}