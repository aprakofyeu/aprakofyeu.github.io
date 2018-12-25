using System;
using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class Message
    {
        public Message() { }

        public virtual int VkSenderId { get; set; }
        public virtual int VkTargetUserId { get; set; }
        public virtual int VkTargetGroupId { get; set; }
        public virtual DateTime SentDate { get; set; }
    }

    public class MessageMap : ClassMap<Message>
    {
        public MessageMap()
        {
            Table("Messages");
            Not.LazyLoad();
            Id(x => x.VkTargetUserId).GeneratedBy.Assigned();
            Map(x => x.VkTargetGroupId);
            Map(x => x.VkSenderId);
            Map(x => x.SentDate);
        }
    }
}