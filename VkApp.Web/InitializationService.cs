using System;
using System.Collections.Generic;
using System.Linq;
using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web
{
    public interface IInitializationService
    {
        UserSettings InitUser(InitUserRequest user);
        void InitGroup(GroupInfo group);
        void InitMessagesLegacy(int senderId, int targetGroupId, IEnumerable<ConversationInfo> conversations);
    }

    internal class InitializationService : IInitializationService
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

        private User CreateNewUser(InitUserRequest userRequest)
        {
            return new User
            {
                VkUserId = userRequest.Id,
                FirstName = userRequest.FirstName,
                LastName = userRequest.LastName,
                SendInterval = 30,
                SaveLastMessage = true
            };
        }

        public UserSettings InitUser(InitUserRequest userRequest)
        {
            _userProvider.AddUserSafe(CreateNewUser(userRequest));

            var user = _userProvider.GetUser(userRequest.Id);

            return new UserSettings
            {
                MessagesInitialized = _messagesProvider.IsUserMessagesInitialized(user.VkUserId),
                PreferredGroup = _groupProvider.GetPreferredGroup(user.VkUserId),
                SaveLastMessage = user.SaveLastMessage,
                SendInterval = user.SendInterval
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

        public void InitMessagesLegacy(int senderId, int targetGroupId, IEnumerable<ConversationInfo> conversations)
        {
            var messages = conversations.Select(x => new Message
            {
                VkSenderId = senderId,
                VkTargetGroupId = targetGroupId,
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