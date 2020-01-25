using System;
using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class Invite
    {
        public virtual int UserId { get; set; }
        public virtual int GroupId { get; set; }
        public virtual int InvitedUserId { get; set; }
        public virtual DateTime Timestamp { get; set; }

        public override bool Equals(object obj)
        {
            return Equals(obj as Invite);
        }

        public virtual bool Equals(Invite other)
        {
            return other != null
                   && other.UserId == UserId
                   && other.GroupId == GroupId
                   && other.InvitedUserId == InvitedUserId;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return UserId ^ 7 +
                       GroupId ^ 7 + 
                       InvitedUserId ^ 7;
            }
        }
    }

    public class InviteMap : ClassMap<Invite>
    {
        public InviteMap()
        {
            Table("Invites");

            CompositeId()
                .KeyProperty(x => x.UserId)
                .KeyProperty(x => x.GroupId)
                .KeyProperty(x => x.InvitedUserId);

            Map(x => x.Timestamp);
        }
    }
}
