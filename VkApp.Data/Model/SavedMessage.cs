using FluentNHibernate.Mapping;

namespace VkApp.Data.Model
{
    public class SavedMessage
    {
        public virtual int UserId { get; set; }
        public virtual int GroupId { get; set; }
        public virtual string Message { get; set; }
        public virtual string Attachments { get; set; }
    }

    public class SavedMessageMap : ClassMap<SavedMessage>
    {
        public SavedMessageMap()
        {
            Table("UserSavedMessages");
            Not.LazyLoad();
            Id(x => x.UserId, "VkUserId").GeneratedBy.Assigned();
            Map(x => x.GroupId, "TargetGroupId");
            Map(x => x.Message);
            Map(x => x.Attachments);
        }
    }
}
