using System;
using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class FriendRequest
    {
        public virtual int UserId { get; set; }
        public virtual int RequestedUserId { get; set; }
        public virtual DateTime Timestamp { get; set; }

        public override bool Equals(object obj)
        {
            return Equals(obj as FriendRequest);
        }

        public virtual bool Equals(FriendRequest other)
        {
            return other != null
                   && other.UserId == UserId
                   && other.RequestedUserId == RequestedUserId;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return UserId ^ 7 +
                       RequestedUserId ^ 7;
            }
        }

    }

    public class FriendRequestMap : ClassMap<FriendRequest>
    {
        public FriendRequestMap()
        {
            Table("FriendRequests");

            CompositeId()
                .KeyProperty(x => x.UserId)
                .KeyProperty(x => x.RequestedUserId);

            Map(x => x.Timestamp);
        }
    }
}
