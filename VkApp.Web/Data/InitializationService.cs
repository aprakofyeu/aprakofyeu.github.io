using System;
using System.Collections.Generic;
using System.Linq;
using VkApp.Web.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web.Data
{
    public interface IInitializationService
    {
        UserInitializationInfo InitUser(UserInfo user);
        void InitGroup(GroupInfo group);
        void InitMessagesLegacy(UserInfo user, GroupInfo group, IEnumerable<ConversationInfo> conversations);
    }

    public class UserInitializationInfo
    {
        public bool MessagesInitialized { get; set; }
        public int PreferredGroup { get; set; }
    }

    public class InitializationService : IInitializationService
    {
        private readonly IMessagesProvider _messagesProvider;
        private readonly IUserProvider _userProvider;
        private readonly IGroupProvider _groupProvider;

        public InitializationService(
            IMessagesProvider messagesProvider, 
            IUserProvider userProvider,
            IGroupProvider groupProvider)
        {
            _messagesProvider = messagesProvider;
            _userProvider = userProvider;
            _groupProvider = groupProvider;
        }

        public UserInitializationInfo InitUser(UserInfo user)
        {
            var dbUser = new User
            {
                VkUserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            _userProvider.AddUserSafe(dbUser);
            return new UserInitializationInfo
            {
                MessagesInitialized = _messagesProvider.IsUserMessagesInitialized(user.Id),
                PreferredGroup = _groupProvider.GetPreferredGroup(user.Id)
            };

        }

        public void InitGroup(GroupInfo group)
        {
            var dbGroup = new Group
            {
                VkGroupId = group.Id,
                Name = group.Name
            };

            _groupProvider.AddGroupSafe(dbGroup);
        }

        public void InitMessagesLegacy(UserInfo user, GroupInfo group, IEnumerable<ConversationInfo> conversations)
        {
            var messages = conversations.Select(x => new Message
            {
                VkSenderId = user.Id,
                VkTargetGroupId = group.Id,
                VkTargetUserId = x.TargetUserId,
                SentDate = ParseDate(x.Date)
            }).ToList();
            _messagesProvider.AddMessages(messages);
        }

        private DateTime ParseDate(long jsTime)
        {
            return new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                .AddMilliseconds(jsTime * 1000);
        }
    }
}