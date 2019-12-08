using System.Collections.Generic;
using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IUserProvider
    {
        void AddUserSafe(User user);
        User GetUser(int userId);
        void Save(User user);
        IEnumerable<User> GetUsersByGroup(int targetGroupId);
        IEnumerable<User> GetUsersByStatisticsGroup(int statisticsGroupId);
    }

    internal class UserProvider: IUserProvider
    {
        private readonly ISession _session;

        public UserProvider(ISession session)
        {
            _session = session;
        }

        public void AddUserSafe(User user)
        {
            _session
                .CreateSQLQuery(@"IF NOT EXISTS (SELECT * FROM [dbo].[User] WHERE VkUserId = :vkUserId) 
                                  BEGIN
                                    INSERT INTO [dbo].[User] (VkUserId, FirstName, LastName) VALUES (:vkUserId, :firstName, :lastName)
                                  END")
                .SetParameter("vkUserId", user.VkUserId)
                .SetParameter("firstName", user.FirstName)
                .SetParameter("lastName", user.LastName)
                .ExecuteUpdate();
        }

        public User GetUser(int userId)
        {
            return _session.Get<User>(userId);
        }

        public void Save(User user)
        {
            _session.Update(user);
        }

        public IEnumerable<User> GetUsersByGroup(int targetGroupId)
        {
            var userIds = _session
                .CreateSQLQuery(@"SELECT DISTINCT VkSenderId
                                FROM Messages
                                WHERE VkTargetGroupId=:targetGroupId")
                .SetParameter("targetGroupId", targetGroupId)
                .List<int>();

            return LoadUsers(userIds);
        }

        public IEnumerable<User> GetUsersByStatisticsGroup(int statisticsGroupId)
        {
            var userIds = _session
                .CreateSQLQuery(@"SELECT DISTINCT UserId
                                FROM StatisticsGroupUsers
                                WHERE StatisticsGroupId=:statisticsGroupId")
                .SetParameter("statisticsGroupId", statisticsGroupId)
                .List<int>();

            return LoadUsers(userIds);
        }

        private IEnumerable<User> LoadUsers(IList<int> userIds)
        {
            return _session
                .QueryOver<User>()
                .WhereRestrictionOn(x => x.VkUserId).IsInG(userIds)
                .List();
        }
    }
}