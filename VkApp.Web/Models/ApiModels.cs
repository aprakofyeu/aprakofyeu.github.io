namespace VkApp.Web.Models
{
    public class SentMessageRequest
    {
        public int SenderUserId { get; set; }
        public int TargetGroupId { get; set; }
        public int TargetUserId { get; set; }
        public int ApplicationId { get; set; }
    }

    public class InitUserRequest
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class UserSettingsRequest
    {
        public int UserId { get; set; }
        public int InvitesInterval { get; set; }
    }

    public class GroupInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class UserSettings
    {
        public bool MessagesInitialized { get; set; }
        public int PreferredGroup { get; set; }
        public int InvitesInterval { get; set; }
    }

    public class UserMessageRequest
    {
        public string Message { get; set; }
        public string Attachments { get; set; }
    }
}