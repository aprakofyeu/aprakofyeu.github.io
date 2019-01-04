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
        public int SendInterval { get; set; }
        public bool SaveLastMessage { get; set; }
    }

    public class GroupInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class ConversationInfo
    {
        public int TargetUserId { get; set; }
        public long Date { get; set; }
    }

    public class InitConversationsRequest
    {
        public int SenderId { get; set; }
        public int TargetGroupId { get; set; }
        public ConversationInfo[] Conversations { get; set; }
    }

    public class UserSettings
    {
        public bool MessagesInitialized { get; set; }
        public int PreferredGroup { get; set; }
        public int SendInterval { get; set; }
        public bool SaveLastMessage { get; set; }
    }
}