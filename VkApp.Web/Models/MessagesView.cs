using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VkApp.Web.Models
{
    public class SentMessageRequest
    {
        public int SenderUserId { get; set; }
        public int TargetGroupId { get; set; }
        public int TargetUserId { get; set; }
        public int ApplicationId { get; set; }
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
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
        public UserInfo User { get; set; }
        public GroupInfo Group { get; set; }
        public ConversationInfo[] Conversations { get; set; }
    }
}