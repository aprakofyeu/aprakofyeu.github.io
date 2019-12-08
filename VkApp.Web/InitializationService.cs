using VkApp.Data.DataProviders;
using VkApp.Data.Model;
using VkApp.Web.Models;

namespace VkApp.Web
{
    public interface IInitializationService
    {
        UserSettings InitUser(InitUserRequest user);
        void InitGroup(GroupInfo group);
    }

    internal class InitializationService : IInitializationService
    {
        private readonly IUserProvider _userProvider;
        private readonly IGroupProvider _groupProvider;

        public InitializationService(
            IUserProvider userProvider,
            IGroupProvider groupProvider)
        {
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
                MessagesInitialized = true,
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
    }
}